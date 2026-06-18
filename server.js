import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Serve static assets from 'dist' directory
const server = http.createServer((req, res) => {
  // Safe URL path parsing
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);

  // Simple Content-Type mapper
  const ext = path.extname(filePath);
  let contentType = 'text/html';
  switch (ext) {
    case '.js': contentType = 'text/javascript'; break;
    case '.css': contentType = 'text/css'; break;
    case '.json': contentType = 'application/json'; break;
    case '.svg': contentType = 'image/svg+xml'; break;
    case '.png': contentType = 'image/png'; break;
    case '.jpg': contentType = 'image/jpeg'; break;
    case '.ico': contentType = 'image/x-icon'; break;
    case '.webmanifest': contentType = 'application/manifest+json'; break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for SPA routing
        fs.readFile(path.join(__dirname, 'dist', 'index.html'), (err2, content2) => {
          if (err2) {
            res.writeHead(500);
            res.end('Error loading index.html');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content2, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Configure Socket.io server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  socket.on('chat-event', (data) => {
    // Relay event to other connected clients
    socket.broadcast.emit('chat-event', data);
  });
});

server.listen(PORT, () => {
  console.log(`=== Production server running at http://localhost:${PORT} ===`);
});
