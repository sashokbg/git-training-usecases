import {catchError, delay, ReplaySubject, tap} from "rxjs";
import {messageChannel$} from "./message_channel";
import {SHELL_URL} from "./configs";
import React from "react";

const BACKGROUND_IFRAME_TIMEOUT = 5000;

export class IframeWrapper {
  constructor(iframeRef) {
    this.iframeRef = iframeRef;
    this._iframeSubject$ = new ReplaySubject(1);

    messageChannel$.subscribe(message => this._handleMessage(message));
  }

  getIframe() {
    return this._iframeSubject$.asObservable().pipe(delay(200));
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

  static executeInBackground(callback) {
    const el = document.createElement('iframe');
    el.src = SHELL_URL;
    el.setAttribute('aria-hidden', 'true');
    // el.style.position = 'absolute';
    // el.style.width = '0';
    // el.style.height = '0';
    // el.style.border = '0';
    // el.style.opacity = '0';
    document.body.appendChild(el);

    const ref = React.createRef()
    ref.current = el;
    const wrapper = new IframeWrapper(ref);

    const autoClose = setTimeout(() => {
      document.body.removeChild(el);
      el.remove();
    }, BACKGROUND_IFRAME_TIMEOUT)

    return callback(wrapper).pipe(
      tap(() => {
        clearTimeout(autoClose)
        document.body.removeChild(el);
        el.remove();
      }),
      catchError((err) => {
        clearTimeout(autoClose)
        console.error('Error executing in background:', err);
        if (document.body.contains(el)) {
          document.body.removeChild(el);
          el.remove();
        }
      })
    );
  }
}
