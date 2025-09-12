import {ReplaySubject} from "rxjs";
import {messageChannel$} from "./message_channel";
import {SHELL_URL} from "./configs";

export class IframeWrapper {
  constructor(iframeRef) {
    this.iframeRef = iframeRef;
    this._iframeSubject$ = new ReplaySubject(1);

    // if (this.isHidden) {
    //   const el = document.createElement('iframe');
    //   el.src = this.url;
    //   el.setAttribute('aria-hidden', 'true');
    //   // el.style.position = 'absolute';
    //   // el.style.width = '0';
    //   // el.style.height = '0';
    //   // el.style.border = '0';
    //   // el.style.opacity = '0';
    //   document.body.appendChild(el);
    //   this.hiddenFrame = el;
    // }
    messageChannel$.subscribe(message => this._handleMessage(message));
  }

  getIframe() {
    return this._iframeSubject$.asObservable()
  }

  newSession() {
    this._iframeSubject$ = new ReplaySubject(1);
  }

  _handleMessage(messageEvent) {
    let messageForUs = this.iframeRef.current &&
      messageEvent.source === this.iframeRef.current.contentWindow &&
      new URL(messageEvent.origin).host === new URL(SHELL_URL).host;

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
      case 'ready':
        if (!(this.iframeRef && this.iframeRef.current && this.iframeRef.current.contentWindow)) {
          return;
        }
        this.iframeRef.current.contentWindow.postMessage(JSON.stringify({
          type: 'output',
          data: 'enable'
        }), SHELL_URL);

        this._iframeSubject$.next(this.iframeRef.current);
        break;
      default:
        break;
    }
  }
}
