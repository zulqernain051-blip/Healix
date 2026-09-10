import { io, Socket } from 'socket.io-client';
import { getApiUrl } from '../api/client';

let socket: Socket | null = null;

export const initSocket = (token: string) => {
  if (socket) {
    if (socket.connected) return socket;
    socket.disconnect();
  }

  const baseUrl = getApiUrl().split('/api')[0];

  socket = io(baseUrl, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connect_error:', err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
