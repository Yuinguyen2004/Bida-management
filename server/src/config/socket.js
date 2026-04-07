const { Server } = require('socket.io');
const Table = require('../models/Table');

let io;

const initSocket = (server) => {
  const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000',
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.join('tables');

    socket.on('table:getAll', async () => {
      try {
        const tables = await Table.find();
        socket.emit('table:getAll', tables);
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch tables' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };
