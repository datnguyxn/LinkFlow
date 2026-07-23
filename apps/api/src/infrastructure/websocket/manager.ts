import type { WebSocket } from 'ws';

export class WebSocketManager {
  private readonly connections = new Map<string, Set<WebSocket>>();

  add(userId: string, socket: WebSocket) {
    let sockets = this.connections.get(userId);

    if (!sockets) {
      sockets = new Set<WebSocket>();

      this.connections.set(userId, sockets);
    }

    sockets.add(socket);
  }

  remove(userId: string, socket: WebSocket) {
    const sockets = this.connections.get(userId);

    if (!sockets) {
      return;
    }

    sockets.delete(socket);

    if (sockets.size === 0) {
      this.connections.delete(userId);
    }
  }

  sendToUser(userId: string, message: unknown) {
    const sockets = this.connections.get(userId);

    console.log('SEND TO USER:', userId, 'SOCKETS:', sockets?.size);

    if (!sockets) {
      console.log('❌ No active socket for user:', userId);
      return;
    }

    const payload = JSON.stringify(message);
    for (const socket of sockets) {
      if (socket.readyState === socket.OPEN) {
        socket.send(payload);
      }
    }
  }
}

export const websocketManager = new WebSocketManager();
