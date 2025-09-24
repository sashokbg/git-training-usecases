export default class ExerciseTimerService {
  constructor(durationSeconds = 60, onTick = () => {}, onComplete = () => {}) {
    this.initial = Math.max(0, Number(durationSeconds) || 60);
    this.remaining = this.initial;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this._intervalId = 0;
    this._running = false;
    this._paused = false;
  }

  start() {
    this.stop();
    this.remaining = this.initial;
    this._paused = false;
    this._running = true;
    this._intervalId = setInterval(() => this._tick(), 1000);
    this.onTick(this.remaining);
  }

  _tick() {
    if (!this._running || this._paused) return;
    this.remaining = Math.max(0, this.remaining - 1);
    try { this.onTick(this.remaining); } catch (e) { console.error('Timer onTick error:', e); }
    if (this.remaining <= 0) {
      this.stop();
      try { this.onComplete(); } catch (e) { console.error('Timer onComplete error:', e); }
    }
  }

  pause() {
    this._paused = true;
  }

  resume() {
    if (!this._running) return;
    this._paused = false;
  }

  reset(durationSeconds = this.initial) {
    this.stop();
    this.initial = Math.max(0, Number(durationSeconds) || 60);
    this.remaining = this.initial;
    this._paused = false;
  }

  stop() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = 0;
    }
    this._running = false;
    this._paused = false;
  }

  getRemaining() { return this.remaining; }
  isRunning() { return this._running; }
  isPaused() { return this._paused; }
}

