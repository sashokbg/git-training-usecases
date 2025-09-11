export class ShellService2 {

  /**
   * This service handles all communication with the shell in a box via iframe messages.
   * It operates on ShellOperation objects.
   *
   * @param visibleIframe
   * @param hiddenIframe
   * @param url the shell in a box url to connect to
   */
  constructor(visibleIframe, hiddenIframe, url) {
    this.visibleIframe = visibleIframe;
    this.hiddenIframe = hiddenIframe;
    this.url = url;

    this._outputListeners = [];

    this._handler = (evt) => this._handleMessage(evt);
    window.addEventListener('message', this._handler);
  }

  /**
   *  Execute an operation on the shell
   * @param operation {ShellOperation}
   */
  execute(operation) {
    operation.onStart();

    for (const command of operation._commands) {
      const message = JSON.stringify({type: 'input', data: command});

      let iframe = null;
      if (operation.isBackground) {
        iframe = this.hiddenIframe.current;
      } else {
        iframe = this.visibleIframe.current;
      }

      if (iframe && iframe.contentWindow) {
        setTimeout(() => {
          iframe.contentWindow.postMessage(message, this.url);
        }, 250)
      }

      this._outputListeners.push((input) => operation._onInput(input));
    }
  }

  /**
   * Reload the iframe. Sometimes it is necessary to apply configuration changes.
   */
  reload() {
    if (this.visibleIframe.current) {
      this.visibleIframe.current.contentWindow.location.reload();
    }
  }


  _handleMessage(messageEvent) {
    try {
      if (!this.visibleIframe.current || messageEvent.source !== this.visibleIframe.current.contentWindow || new URL(messageEvent.origin).host !== new URL(this.url).host) {
        return;
      }
    } catch (err) {
      return;
    }

    let decoded;
    try {
      decoded = JSON.parse(messageEvent.data);
    } catch (err) {
      return;
    }

    switch (decoded.type) {
      case 'output':
        this._outputListeners.forEach((fn) => fn(decoded.data));
        break;
      default:
        break;
    }
  }
}
