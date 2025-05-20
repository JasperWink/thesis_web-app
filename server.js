const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8094;

// Path to your build folder - update this path to where your build is located
const buildPath = 'build';

// SSL certificate paths - update these with your actual certificate paths
const options = {
  key: fs.readFileSync('mykey.key'),
  cert: fs.readFileSync('mycert.pem')
};

// Serve static files
app.use(express.static(buildPath));

// For SPA routing - serve index.html for any unmatched routes
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Create HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`Server running at https://localhost:${port}`);
  console.log(`Serving content from: ${buildPath}`);
});


// // ----------------- ROB -----------------
// const express = require('express');
// const cors = require('cors');
// const https = require('https');
// const fs = require('fs');
// const app = express();

// require('dotenv').config();

// const HOST = process.env.REACT_APP_PROXY_HOST || 'localhost'; // host for proxy server, default to localhost
// const PORT = process.env.REACT_APP_PROXY_PORT || 3002; // port for proxy server, default to 3002
// const USE_SSL = process.env.USE_SSL === 'true'; // Check if SSL should be enabled

// app.use(cors({
//   origin: '*', // TODO: Replace '*' with specific frontend domain in production
// }));

// // DEBUG:
// app.use((req, res, next) => {
//   console.log(`Request for: ${req.url}`);
//   next();
// });

// // app.use(express.static('./src/dataset'));
// app.use(express.static('./src/dataset', { fallthrough: false }));


// if (USE_SSL) {
//   // Load SSL certificate and private key
//   const sslOptions = {
//     key: fs.readFileSync('./certs/key.pem'), // Path to private key
//     cert: fs.readFileSync('./certs/cert.pem'), // Path to certificate
//   };

//   // Create HTTPS server
//   https.createServer(sslOptions, app).listen(PORT, HOST, () => {
//     console.log(`Proxy server listening on https://${HOST}:${PORT}`);
//   });
// } else {
//   // Create HTTP server
//   app.listen(PORT, HOST, () => {
//     console.log(`Proxy server listening on http://${HOST}:${PORT}`);
//   });
// }
