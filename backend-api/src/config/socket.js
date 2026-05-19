const { Server } = require('socket.io');

let io;

/**
 * Inisialisasi Socket.io server
 * @param {Object} server - Instance HTTP server
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Fase development
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client terhubung: ${socket.id}`);

    // Logika join room streamer
    socket.on('join-streamer', (streamerId) => {
      if (streamerId) {
        socket.join(streamerId);
        console.log(`[Socket] Client ${socket.id} bergabung ke room: ${streamerId}`);
      }
    });

    socket.on('join-room', (roomName) => {
      if (roomName) {
        socket.join(roomName);
        console.log(`[Socket] Client ${socket.id} bergabung ke room: ${roomName}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client terputus: ${socket.id}`);
    });
  });

  console.log('⚙️ Socket.io Initialized');
  return io;
};

/**
 * Utility untuk mendapatkan instance IO di modul lain
 */
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io belum diinisialisasi!");
  }
  return io;
};

module.exports = { initSocket, getIO };
