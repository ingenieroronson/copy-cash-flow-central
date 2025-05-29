
const { execSync } = require('child_process');
const path = require('path');

// Set production environment
process.env.NODE_ENV = 'production';

// Get port from environment or default to 3000
const port = process.env.PORT || 3000;

// Serve the dist directory with SPA fallback
const serveCommand = `npx serve -s dist -l ${port} --single`;

console.log(`Starting server on port ${port}...`);
console.log(`Serving from: ${path.join(__dirname, 'dist')}`);
console.log('SPA mode enabled for React Router compatibility');

try {
  execSync(serveCommand, { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}
