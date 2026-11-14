const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const root = path.join(__dirname, 'dist');
const url = 'http://127.0.0.1:5173/';
const open = () => spawn('explorer.exe', [url], { detached: true, stdio: 'ignore' }).unref();
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error('Missing dist build. Build the game before starting.');
  process.exit(1);
}
const server = http.createServer((req, res) => {
  let file;
  try {
    const pathname = decodeURIComponent(new URL(req.url, url).pathname);
    file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  } catch { res.writeHead(400).end(); return; }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Content-Length': stat.size, 'Cache-Control': 'no-cache' });
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
  });
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? 'Port 5173 is already in use. Open ' + url + ' or stop the other server.' : error.message);
  process.exit(1);
});
server.listen(5173, '127.0.0.1', () => {
  console.log('DINO: EVOLUTION is running at ' + url);
  console.log('Keep this process running while playing. Press Ctrl+C to stop.');
  if (process.argv.includes('--open')) open();
});
