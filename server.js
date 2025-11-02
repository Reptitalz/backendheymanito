const { spawn } = require('child_process');
const path = require('path');

// Start the Next.js server
const nextServer = spawn('node', [path.join(__dirname, 'server.js')], {
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.PORT || 3000 }
});

nextServer.on('close', (code) => {
  console.log(`Next.js server exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});

// Start the Baileys gateway
const waGateway = spawn('node', [path.join(__dirname, 'whatsapp-gateway', 'index.js')], {
  stdio: 'inherit',
  env: process.env
});

waGateway.on('close', (code) => {
  console.log(`WhatsApp gateway exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});

process.on('SIGINT', () => {
  console.log('Caught interrupt signal, shutting down...');
  nextServer.kill('SIGINT');
  waGateway.kill('SIGINT');
  process.exit();
});
