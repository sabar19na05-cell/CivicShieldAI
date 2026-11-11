import { Server as SocketServer } from "socket.io";

let ioRef: SocketServer | null = null;

export function setIO(io: SocketServer) {
  ioRef = io;
}

export function getIO(): SocketServer | null {
  return ioRef;
}
