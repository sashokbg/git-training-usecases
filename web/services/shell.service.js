/**
 * ShellService
 * A lightweight, reusable service to communicate with ShellInABox via postMessage.
 * Provides helpers to post messages, send input, enable output, reload iframe,
 * and subscribe to shell events (ready/output/session).
 */
export class ShellService {
  constructor(iframeRef, url) {
    this.iframeRef = iframeRef;
    this.url = url;
    this._onReady = [];
    this._onOutput = [];
    this._onSession = [];
    this._boundHandler = (evt) => this._handleMessage(evt);
    window.addEventListener('message', this._boundHandler);
  }

  // Subscribe APIs
  onReady(listener) {
    this._onReady.push(listener);
    return () => this._unsubscribe(this._onReady, listener);
  }

  onOutput(listener) {
    this._onOutput.push(listener);
    return () => this._unsubscribe(this._onOutput, listener);
  }

  post(type, data = null) {
    const message = JSON.stringify({ type, data });
    if (this.iframeRef.current && this.iframeRef.current.contentWindow) {
      this.iframeRef.current.contentWindow.postMessage(message, this.url);
    }
  }

  sendInput(input) {
    this.post('input', input);
  }

  enableOutput() {
    this.post('output', 'enable');
  }

  requestSession() {
    this.post('session');
  }

  reload() {
    if (this.iframeRef.current) {
      this.iframeRef.current.contentWindow.location.reload();
    }
  }

  cleanup() {
    window.removeEventListener('message', this._boundHandler);
    this._onReady = [];
    this._onOutput = [];
    this._onSession = [];
  }

  // Internal methods
  _unsubscribe(list, listener) {
    const idx = list.indexOf(listener);
    if (idx >= 0) list.splice(idx, 1);
  }

  _handleMessage(messageEvent) {
    // Filter by origin and source to ensure we only handle our iframe events.
    try {
      if (!this.iframeRef.current || messageEvent.source !== this.iframeRef.current.contentWindow) return;
      if (new URL(messageEvent.origin).host !== new URL(this.url).host) return;
    } catch (err) {
      // Intentionally ignore malformed events (e.g., different origin); not actionable here.
      return;
    }

    let decoded;
    try {
      decoded = JSON.parse(messageEvent.data);
    } catch (err) {
      // Ignore non-JSON messages coming from the iframe.
      return;
    }

    switch (decoded.type) {
      case 'ready':
        // Auto-enable output when ready, then notify listeners.
        this.enableOutput();
        this._onReady.forEach((fn) => fn());
        break;
      case 'output':
        this._onOutput.forEach((fn) => fn(decoded.data));
        break;
      case 'session':
        this._onSession.forEach((fn) => fn(decoded.data));
        break;
      default:
        break;
    }
  }
}

export default ShellService;

