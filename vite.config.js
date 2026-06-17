import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { Server } from 'socket.io'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'websocket-server',
      configureServer(server) {
        if (!server.httpServer) return;
        
        const io = new Server(server.httpServer, {
          cors: {
            origin: '*',
            methods: ['GET', 'POST']
          }
        });

        io.on('connection', (socket) => {
          socket.on('chat-event', (data) => {
            // Relay to all other connected sockets
            socket.broadcast.emit('chat-event', data);
          });
        });

        console.log('--- Socket.io server integrated successfully ---');
      }
    }
  ],
})
