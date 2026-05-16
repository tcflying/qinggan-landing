import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const LANDING_DIR = path.join(__dirname);

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

function serveStatic(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

function writeJSON(filePath, newData) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        let arr = [];
        if (!err && data.trim()) {
            try {
                arr = JSON.parse(data);
            } catch (e) {}
        }
        arr.push(newData);
        fs.writeFile(filePath, JSON.stringify(arr, null, 2), (err) => {
            if (err) console.error('Error writing to', filePath, err);
        });
    });
}

const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    const ext = path.extname(url);
    const baseName = path.basename(url);

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            if (url === '/waitlist.json') {
                try {
                    const data = JSON.parse(body);
                    writeJSON(path.join(LANDING_DIR, 'waitlist.json'), data);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            } else if (url === '/analytics.json') {
                try {
                    const data = JSON.parse(body);
                    writeJSON(path.join(LANDING_DIR, 'analytics.json'), data);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON' }));
                }
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not Found' }));
            }
        });
        return;
    }

    if (url === '/' || url === '/index.html') {
        serveStatic(res, path.join(LANDING_DIR, 'index.html'), 'text/html');
    } else if (ext && MIME_TYPES[ext]) {
        serveStatic(res, path.join(LANDING_DIR, baseName), MIME_TYPES[ext]);
    } else {
        const filePath = path.join(LANDING_DIR, url);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }
            res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
            res.end(data);
        });
    }
});

server.listen(PORT, () => {
    console.log(`情感输入法 Landing Page running at http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop`);
});
