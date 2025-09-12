import {ShellOperation} from "./shell.operation";
import {delay, from, Observable, Subscription} from "rxjs";
import {messageChannel$} from "../message_channel";
import {SHELL_URL} from "../configs";

export class RunExerciseScriptOperation extends ShellOperation {

  /**
   * @param script {string} The script to load into the shell
   * @param iframe {IframeWrapper}
   */
  constructor(iframe, script) {
    super(iframe);
    this.isDone$ = new Observable();
    this.subscriptions = new Subscription()

    super._commands = [
      `source ${script}\n`
    ]
  }

  /**
   * @returns {Observable<boolean>}
   */
  execute() {
    const readySub = this.iframe.getIframe().subscribe(() => {
      this.subscriptions.add(
        messageChannel$.subscribe(message => this._handleMessage(message))
      );

      this.subscriptions.add(from(this._commands).pipe(delay(100))
        .subscribe(command => {
          const message = JSON.stringify({type: 'input', data: command});
          this.iframe.iframeRef.current.contentWindow.postMessage(message, SHELL_URL);

          this.subscriptions.unsubscribe();
        }));
    });

    this.subscriptions.add(readySub);

    return this.isDone$;
  }


  _onOutput(output) {
  }
}
