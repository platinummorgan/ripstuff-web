const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const server = spawn('powershell.exe', ['-NoProfile', '-Command', 'pnpm next start --hostname 127.0.0.1 --port 4000'], {
  cwd: path.resolve(__dirname),
  stdio: ['ignore', 'pipe', 'pipe']
});

let ready = false;
server.stdout.on('data', (data) => {
  process.stdout.write(`[next] ${data}`);
  const text = data.toString();
  if (!ready && text.includes('started server on')) {
    ready = true;
    setTimeout(() => {
      http.get('http://127.0.0.1:4000/my-graveyard', (res) => {
        let body = '';
        res.on('data', chunk => body += chunk.toString());
        res.on('end', () => {
          console.log('STATUS', res.statusCode);
          console.log('HEADERS', res.headers['content-type']);
          console.log('BODY_START');
          console.log(body.substring(0, 500));
          console.log('BODY_END');
          server.kill('SIGTERM');
        });
      }).on('error', (err) => {
        console.error('HTTP error', err);
        server.kill('SIGTERM');
      });
    }, 2000);
  }
});

server.stderr.on('data', (data) => {
  process.stderr.write(`[next-err] ${data}`);
});

server.on('close', (code) => {
  console.log('server exited', code);
});
