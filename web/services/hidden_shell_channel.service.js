/**
 * HiddenShellChannel
 * Creates an invisible ShellInABox iframe, performs login, and exposes
 * a secondary channel (ShellService + ShellLoginService) for background tasks.
 */
import ShellService from './shell.service';

class HiddenShellChannel {
  constructor(url, maxRetries = 2) {
    this.url = url;
    this.maxRetries = maxRetries;
    this.iframe = null;
    this.ref = null;
    this.shell = null;
    this.loginService = null;
    this._listeners = [];
  }

  /**
   * Initialize the hidden shell channel and complete login.
   * @returns {Promise<void>}
   */
  async init() {
    this._createIframe();
    this.ref = { current: this.iframe };
    this.shell = new ShellService(this.ref, this.url);
    this.loginService = new ShellLoginService(this.shell, this.url, this.maxRetries);

    await new Promise((resolve) => {
      const offReady = this.shell.onReady(() => this.loginService.startLogin(() => resolve(true)));
      const offOutput = this.shell.onOutput((data) => this.loginService.processOutput(data));
      this._listeners.push(offReady, offOutput);
    });

    // Cleanup initial listeners (we keep shell operational)
    this._drainListeners();
  }

  /**
   * Wait for a specific output to appear.
   * @param {string|RegExp|function(string):boolean} expect
   * @param {number} timeoutMs
   * @returns {Promise<boolean>} true if matched, false on timeout
   */
  async waitForOutput(expect, timeoutMs = 5000) {
    if (!this.shell) return false;
    let predicate;
    if (typeof expect === 'string') {
      predicate = (data) => data && data.includes(expect);
    } else if (expect instanceof RegExp) {
      predicate = (data) => expect.test(data || '');
    } else if (typeof expect === 'function') {
      predicate = expect;
    } else {
      return false;
    }

    return new Promise((resolve) => {
      const onData = (data) => {
        try {
          if (predicate(data)) {
            off();
            clearTimeout(timer);
            resolve(true);
          }
        } catch (_) {}
      };
      const off = this.shell.onOutput(onData);
      const timer = setTimeout(() => { off(); resolve(false); }, timeoutMs);
    });
  }

  /**
   * Send raw input to the shell.
   * @param {string} input
   */
  send(input) {
    if (this.shell) this.shell.sendInput(input);
  }

  /**
   * Cleanup iframe and services.
   */
  cleanup() {
    this._drainListeners();
    try { this.shell && this.shell.cleanup && this.shell.cleanup(); } catch (_) {}
    try { this.iframe && this.iframe.remove && this.iframe.remove(); } catch (_) {}
    this.iframe = null;
    this.shell = null;
    this.loginService = null;
  }

  _createIframe() {
    const el = document.createElement('iframe');
    el.src = this.url;
    el.setAttribute('aria-hidden', 'true');
    el.style.position = 'absolute';
    el.style.width = '0';
    el.style.height = '0';
    el.style.border = '0';
    el.style.opacity = '0';
    document.body.appendChild(el);
    this.iframe = el;
  }

  _drainListeners() {
    try {
      while (this._listeners.length) {
        const off = this._listeners.pop();
        if (typeof off === 'function') off();
      }
    } catch (_) {}
  }
}

export default HiddenShellChannel;

