const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 8094;

// Path to your build folder
const buildPath = path.join(__dirname, 'front-end/dist');

// SSL certificate paths
const options = {
  key: fs.readFileSync(path.resolve(__dirname, 'certs/chimay.science.uva.nl.key')),
  cert: fs.readFileSync(path.resolve(__dirname, 'certs/chimay_science_uva_nl.pem'))
};

// Serve static files
app.use(express.static(buildPath));

// Set up proxy for API requests
app.use('/api', createProxyMiddleware({
  target: 'http://145.100.134.14:8094',
  changeOrigin: true,
  pathRewrite: {'^/api': ''}
}));

// For SPA routing - serve index.html for any unmatched routes
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Create HTTPS server with proper error handling
const server = https.createServer(options, app);

// Create HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`Server running at https://chimay.science.uva.nl:${port}`);
  console.log(`Serving content from: ${buildPath}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});
