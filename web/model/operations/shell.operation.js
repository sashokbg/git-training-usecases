import {SHELL_URL} from "../configs";

export class ShellOperation {
  /**
   *
   * @param iframe {IframeWrapper}
   */
  constructor(iframe) {
    this.iframe = iframe;
  }

  _handleMessage(messageEvent) {
    const messageForUs = messageEvent.source === this.iframe.iframeRef.current.contentWindow
      && new URL(messageEvent.origin).host === new URL(SHELL_URL).host;
    if (!messageForUs) {
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
        this._onOutput(decoded.data);
        break;
      default:
        break;
    }
  }

  _onOutput(output) {
  }
}
