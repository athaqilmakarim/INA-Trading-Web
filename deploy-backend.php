<?php
$webhook_secret = getenv('GITHUB_WEBHOOK_SECRET');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

if (!$signature) {
    http_response_code(401);
    die('No signature provided');
}

$payload = file_get_contents('php://input');
$calculated_signature = 'sha256=' . hash_hmac('sha256', $payload, $webhook_secret);

if (!hash_equals($signature, $calculated_signature)) {
    http_response_code(401);
    die('Invalid signature');
}

$data = json_decode($payload, true);

// Only deploy on push to main branch
if ($data['ref'] !== 'refs/heads/main') {
    http_response_code(200);
    die('Not main branch - no deployment needed');
}

// Check if backend files were changed
$changed = false;
foreach ($data['commits'] as $commit) {
    foreach (['added', 'modified', 'removed'] as $changeType) {
        foreach ($commit[$changeType] as $file) {
            if (strpos($file, 'backend/') === 0) {
                $changed = true;
                break 3;
            }
        }
    }
}

if (!$changed) {
    http_response_code(200);
    die('No backend changes - no deployment needed');
}

// Log deployment start
error_log('Starting backend deployment: ' . date('Y-m-d H:i:s'));

// Deploy backend
$repo_path = getenv('REPO_PATH') ?: '/home/' . get_current_user() . '/repositories/INA-Trading-Web';
$output = [];
$return_var = 0;

// Pull latest changes
exec("cd {$repo_path} && git pull origin main 2>&1", $output, $return_var);
if ($return_var !== 0) {
    http_response_code(500);
    die('Git pull failed: ' . implode("\n", $output));
}

// Install dependencies
exec("cd {$repo_path}/backend && npm install --production 2>&1", $output, $return_var);
if ($return_var !== 0) {
    http_response_code(500);
    die('npm install failed: ' . implode("\n", $output));
}

// Restart PM2 process
exec('pm2 restart ina-trading-backend 2>&1', $output, $return_var);
if ($return_var !== 0) {
    http_response_code(500);
    die('PM2 restart failed: ' . implode("\n", $output));
}

// Log deployment completion
error_log('Backend deployment completed: ' . date('Y-m-d H:i:s'));

// Return success response
http_response_code(200);
echo json_encode([
    'status' => 'success',
    'message' => 'Backend deployment completed successfully',
    'timestamp' => date('c'),
    'output' => $output
]); 