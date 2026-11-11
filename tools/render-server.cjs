const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'assets', 'backdrops');
fs.mkdirSync(outDir, { recursive: true });

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'POST' && url.pathname === '/save') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const name = (url.searchParams.get('name') || '').replace(/[^a-z0-9_-]/gi, '');
      const match = /^data:image\/jpeg;base64,(.+)$/.exec(body);
      if (!name || !match) {
        res.writeHead(400);
        res.end('bad payload');
        return;
      }
      fs.writeFileSync(path.join(outDir, `${name}.jpg`), Buffer.from(match[1], 'base64'));
      res.writeHead(200);
      res.end('ok');
    });
    return;
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/tools/render-backdrops.html';
  const file = path.join(root, pathname);
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(Number(process.env.PORT || 8776), '127.0.0.1', () => {
  console.log(`render server http://127.0.0.1:${process.env.PORT || 8776}/`);
});
