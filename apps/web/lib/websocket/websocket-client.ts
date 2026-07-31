import { tokenStorage } from '../storage/token.storage';
import { authService } from '@/services/auth.service';

type WebSocketMessage = {
  event: string;
  data?: unknown;
};

type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private refreshing = false;

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private reconnectAttempts = 0;

  private listeners = new Set<MessageHandler>();

  private url: string | null = null;

  private manuallyDisconnected = false;

  connect(url: string) {
    console.log('[WebSocket] connect');

    if (
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    this.url = url;

    // Quan trọng
    this.manuallyDisconnected = false;

    const accessToken = tokenStorage.getAccessToken();

    if (!accessToken) {
      console.warn('[WebSocket] No access token');

      return;
    }

    const wsUrl = new URL(url);

    wsUrl.searchParams.set('token', accessToken);

    this.socket = new WebSocket(wsUrl.toString());

    this.socket.onopen = () => {
      console.log('[WebSocket] Connected');

      this.reconnectAttempts = 0;
    };

    this.socket.onclose = async (event) => {
      const socket = new WebSocket(wsUrl.toString());

      this.socket = socket;

      socket.onopen = () => {
        console.log('[WebSocket] Connected');

        this.reconnectAttempts = 0;
      };

      socket.onclose = async (event) => {
        console.log('[WebSocket] Disconnected', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });

        // Chỉ clear nếu đây vẫn là socket hiện tại
        if (this.socket === socket) {
          this.socket = null;
        }

        if (this.manuallyDisconnected) {
          console.log('[WebSocket] Manual disconnect. Stop reconnect.');

          return;
        }

        if (event.code === 1008 || event.code === 4401 || event.code === 1006) {
          console.log('[WebSocket] Unauthorized. Refreshing access token...');
          const ok = await this.refreshAccessToken();

          if (!ok) {
            authService.logout();
            return;
          }
        }

        this.reconnect();
      };
    };
  }

  private reconnect() {
    if (!this.url) {
      return;
    }

    if (this.reconnectTimer) {
      return;
    }

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);

    console.log(`[WebSocket] Reconnecting in ${delay}ms`);

    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;

      if (!this.url) {
        return;
      }

      this.connect(this.url);
    }, delay);
  }

  subscribe(handler: MessageHandler) {
    this.listeners.add(handler);

    return () => {
      this.listeners.delete(handler);
    };
  }

  send(data: unknown) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send message. Not connected.');

      return;
    }

    this.socket.send(JSON.stringify(data));
  }

  disconnect() {
    console.trace('[WebSocket] Manual disconnect');

    this.manuallyDisconnected = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const socket = this.socket;

    this.socket = null;
    this.url = null;
    this.reconnectAttempts = 0;

    if (socket) {
      socket.close();
    }
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private async refreshAccessToken() {
    if (this.refreshing) {
      return false;
    }

    this.refreshing = true;

    try {
      await authService.refresh();

      return true;
    } catch {
      return false;
    } finally {
      this.refreshing = false;
    }
  }
}

export const websocketClient = new WebSocketClient();
