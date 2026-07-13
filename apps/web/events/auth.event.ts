type AuthEvent = 'logout';

type Listener = () => void;

class AuthEvents {
  private listeners: Record<AuthEvent, Listener[]> = {
    logout: [],
  };

  on(event: AuthEvent, listener: Listener) {
    this.listeners[event].push(listener);

    return () => {
      this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
    };
  }

  emit(event: AuthEvent) {
    this.listeners[event].forEach((listener) => listener());
  }
}

export const authEvents = new AuthEvents();
