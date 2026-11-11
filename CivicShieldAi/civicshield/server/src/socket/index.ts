import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { verifyToken } from "../utils/jwt";

export function createSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Client sends its JWT after connecting so we can place it in a
    // per-user room (used for targeted notifications) and role rooms
    // (used for role-wide broadcasts like admin alerts).
    socket.on("auth", (token: string) => {
      try {
        const payload = verifyToken(token);
        socket.join(`user:${payload.id}`);
        socket.join(`role:${payload.role}`);
      } catch {
        // ignore invalid token, socket just won't receive targeted events
      }
    });

    socket.on("disconnect", () => {
      // no-op, room membership is cleaned up automatically
    });
  });

  return io;
}
