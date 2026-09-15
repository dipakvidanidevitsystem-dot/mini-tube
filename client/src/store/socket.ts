import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

function resolveWsUrl(): string {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const apiUrl: string = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(resolveWsUrl(), { autoConnect: false, withCredentials: true });
  }
  return socket;
}

export function connectSocket() {
  const instance = getSocket();
  // Auth travels via the httpOnly access_token cookie, sent automatically
  // on the handshake request because `withCredentials: true` is set above.
  if (!instance.connected) instance.connect();
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
