import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io('http://localhost:3000', {
            withCredentials: true,
            autoConnect: false,
        });
    }
    return socket;
};

export const connectSocket = () => {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    }
    return s;
};

export const disconnectSocket = () => {
    if (socket?.connected) {
        socket.disconnect();
    }
};

export const joinRoom = (roomId: string) => {
    const s = getSocket();
    s.emit('join-room', roomId);
};

export const leaveRoom = (roomId: string) => {
    const s = getSocket();
    s.emit('leave-room', roomId);
};

export const sendMessage = (data: {
    eventId: string;
    channelId?: string;
    content: string;
    user: { id: string; name: string; image?: string };
}) => {
    const s = getSocket();
    s.emit('send-message', data);
};

export const emitTyping = (roomId: string, user: { name: string }) => {
    const s = getSocket();
    s.emit('typing', { roomId, user });
};

export const emitStopTyping = (roomId: string, user: { name: string }) => {
    const s = getSocket();
    s.emit('stop-typing', { roomId, user });
};
