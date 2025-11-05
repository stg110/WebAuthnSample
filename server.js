const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Simple HTTPS server for WebAuthn testing
// For production, use a proper web server like IIS, Apache, or nginx

const PORT = process.env.PORT || 8443;
const HTTP_PORT = 8080;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

function serveFile(req, res) {
    const parsedUrl = url.parse(req.url);
    let pathname = `.${parsedUrl.pathname}`;
    
    // Default to index.html
    if (pathname === './') {
        pathname = './index.html';
    }
    
    const ext = path.parse(pathname).ext;
    const exist = fs.existsSync(pathname);
    
    if (!exist) {
        res.statusCode = 404;
        res.end(`File ${pathname} not found!`);
        return;
    }
    
    if (fs.statSync(pathname).isDirectory()) {
        pathname += '/index.html';
    }
    
    fs.readFile(pathname, function(err, data) {
        if (err) {
            res.statusCode = 500;
            res.end(`Error getting the file: ${err}.`);
        } else {
            const mimeType = mimeTypes[ext] || 'text/plain';
            res.setHeader('Content-type', mimeType);
            
            // Add security headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            
            res.end(data);
        }
    });
}

// HTTP Server (redirects to HTTPS)
const httpServer = http.createServer((req, res) => {
    const host = req.headers.host.split(':')[0];
    const httpsUrl = `https://${host}:${PORT}${req.url}`;
    
    res.writeHead(301, { 'Location': httpsUrl });
    res.end();
});

// Try to create HTTPS server with self-signed certificate
let httpsServer;

try {
    // Try to use existing certificate files
    const privateKey = fs.readFileSync('key.pem', 'utf8');
    const certificate = fs.readFileSync('cert.pem', 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    
    httpsServer = https.createServer(credentials, serveFile);
    
    httpsServer.listen(PORT, () => {
        console.log(`HTTPS Server running at https://localhost:${PORT}/`);
        console.log(`HTTP Server running at http://localhost:${HTTP_PORT}/ (redirects to HTTPS)`);
        console.log('\nTo generate self-signed certificates for testing:');
        console.log('openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes');
    });
    
    httpServer.listen(HTTP_PORT);
    
} catch (error) {
    console.log('HTTPS certificates not found. Starting HTTP server for localhost testing...');
    console.log('Note: WebAuthn requires HTTPS in production, but localhost HTTP is allowed for testing.\n');
    
    const httpOnlyServer = http.createServer(serveFile);
    httpOnlyServer.listen(HTTP_PORT, () => {
        console.log(`HTTP Server running at http://localhost:${HTTP_PORT}/`);
        console.log('\nFor HTTPS testing, generate certificates with:');
        console.log('openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes');
        console.log('Then restart the server.');
    });
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
    console.log('\nShutting down server...');
    if (httpsServer) httpsServer.close();
    httpServer.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    if (httpsServer) httpsServer.close();
    httpServer.close();
    process.exit(0);
});