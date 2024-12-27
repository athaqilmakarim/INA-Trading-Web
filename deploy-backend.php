<?php
$webhook_secret = getenv('GITHUB_WEBHOOK_SECRET');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

if (!$signature) {
    die('No signature');
}

$payload = file_get_contents('php://input');
$calculated_signature = 'sha256=' . hash_hmac('sha256', $payload, $webhook_secret);

if (!hash_equals($signature, $calculated_signature)) {
    die('Invalid signature');
}

$data = json_decode($payload, true);

// Only deploy on push to main branch
if ($data['ref'] !== 'refs/heads/main') {
    die('Not main branch');
}

// Check if backend files were changed
$changed = false;
foreach ($data['commits'] as $commit) {
    foreach ($commit['modified'] as $file) {
        if (strpos($file, 'backend/') === 0) {
            $changed = true;
            break 2;
        }
    }
}

if (!$changed) {
    die('No backend changes');
}

// Deploy backend
$output = shell_exec('cd /home/YOUR_CPANEL_USERNAME/repositories/INA-Trading-Web && git pull origin main 2>&1');
$output .= shell_exec('cd /home/YOUR_CPANEL_USERNAME/repositories/INA-Trading-Web/backend && npm install 2>&1');

// Restart PM2 process
$output .= shell_exec('pm2 restart ina-trading-backend 2>&1');

echo "Deployment completed:\n" . $output; 