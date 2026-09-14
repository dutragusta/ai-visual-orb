export const STATES = Object.freeze({
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  SPEAKING: 'speaking',
});

export class OrbState {
  constructor() {
    this.current = STATES.IDLE;
    this.listeners = new Set();
  }

  set(next) {
    if (!Object.values(STATES).includes(next) || next === this.current) return;
    this.current = next;
    this.listeners.forEach((listener) => listener(next));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.current);
    return () => this.listeners.delete(listener);
  }
}
