// ESTE ARCHIVO YA NO ES NECESARIO SI EL GATEWAY SE DESPLIEGA POR SEPARADO.
// Lo mantendré por si decides volver a la arquitectura monolítica.
// Puedes eliminarlo de forma segura si te quedas con Cloud Run para el gateway.

const { spawn } = require('child_process');
const path = require('path');

// === PATHS ===
const nextServerPath = path.join(__dirname, 'server.js');
const waGatewayPath = path.join(__dirname, 'whatsapp-gateway', 'index.js');

// === START NEXT.JS SERVER ===
console.log('🚀 Starting Next.js server...');
const nextServer = spawn('node', [nextServerPath], {
  stdio: 'inherit',
  env: { ...process.env }
});

nextServer.on('error', (err) => {
  console.error('❌ Failed to start Next.js server:', err);
  process.exit(1);
});

nextServer.on('close', (code) => {
  console.log(`Next.js server exited with code ${code}`);
  if (code !== 0) process.exit(code);
});

// === GRACEFUL SHUTDOWN ===
const shutdown = (signal) => {
  console.log(`Caught ${signal}, shutting down gracefully...`);
  nextServer.kill(signal);
  setTimeout(() => process.exit(), 500);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
