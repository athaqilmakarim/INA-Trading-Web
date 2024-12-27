const pm2 = require('pm2');

pm2.connect(function(err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }
  
  pm2.start({
    script: 'server.js',
    name: 'ina-trading-backend',
    exec_mode: 'cluster',
    instances: 1
  }, function(err, apps) {
    pm2.disconnect();
    if (err) throw err;
  });
}); 