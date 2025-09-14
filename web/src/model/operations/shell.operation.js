import {SHELL_URL} from "../configs";
import {delay, from, Subject, Subscription, tap} from "rxjs";
import {messageChannel$} from "../message_channel";
import useAppStore from "../../model/app.store";

const COMMAND_TIMEOUT = 5000;

export class ShellOperation {
  /**
   *
   * @param iframe {IframeWrapper}
   * @param commands {string[]}
   */
  constructor(iframe, commands) {
    this.iframe = iframe;
    /**
     * @type {Subject<any>}
     */
    this.isDone$ = new Subject();
    this.subscriptions = new Subscription();
    this._commands = commands;
    this.timeoutId = 0;
    this.outputBuffer = '';
  }

  /**
   * @returns {Observable<boolean>}
   */
  execute() {
    this.timeoutId = setTimeout(() => {
      this.isDone$.error(new Error(`Command timed out`))
    }, COMMAND_TIMEOUT)

    useAppStore.getState().setBackgroundOpInProgress(true)

    console.log('execute', this._commands);
    const readySub = this.iframe.getIframe().subscribe(() => {
      this.subscriptions.add(messageChannel$.subscribe(message => this._handleMessage(message)));

      this.subscriptions.add(from(this._commands).pipe(delay(100))
        .subscribe(command => {
          const message = JSON.stringify({type: 'input', data: command});
          this.iframe.iframeRef.current.contentWindow.postMessage(message, SHELL_URL);
        }));
    });

    this.subscriptions.add(readySub);

    return this.isDone$.pipe(tap(() => {
      useAppStore.getState().setBackgroundOpInProgress(false)
    }));
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

  _complete(value = true) {
    this.isDone$.next(value);
    this.isDone$.complete();
    this.subscriptions.unsubscribe();
    clearTimeout(this.timeoutId);
  }

  _onOutput(output) {
  }
}
