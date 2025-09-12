import {ShellOperation} from "./shell.operation";
import {delay, from, Observable, Subject, Subscription} from "rxjs";
import {messageChannel$} from "../message_channel";
import {SHELL_URL} from "../configs";

export class LoginOperation extends ShellOperation {

  /**
   *
   * @param iframe {IframeWrapper}
   */
  constructor(iframe) {
    super(iframe);
    this.isDone$ = new Subject();
    this.subscriptions = new Subscription()

    super._commands = [
      "learn-git\n",
      "learn-git\n"
    ]

    this.loginSuccessPatterns = [
      /learn-git@.*\s+%\s*$/,  // zsh prompt with % (learn-git@099690487 /git %)
      /learn-git@.*\s+\$\s*$/,  // bash prompt with $
      /learn-git@.*\s+#\s*$/,   // root prompt with #
      /learn-git@[^\s]*.*%/,    // More flexible zsh pattern
      /learn-git@[^\s]*.*\$/,   // More flexible bash pattern
    ];

    this.loginFailurePatterns = [
      /login incorrect/i,
      /authentication failed/i,
      /access denied/i,
      /permission denied/i,
      /login failed/i,
    ];

  }

  /**
   * Check if login was successful or failed based on output patterns
   */
  _checkLoginStatus() {
    // Check for login success
    for (const pattern of this.loginSuccessPatterns) {
      if (pattern.test(this.outputBuffer)) {
        this.isDone$.next(true);
        this.subscriptions.unsubscribe();
        return;
      }
    }

    // Check for login failure
    for (const pattern of this.loginFailurePatterns) {
      if (pattern.test(this.outputBuffer)) {
        this.isDone$.error(false);
        this.subscriptions.unsubscribe();
        return;
      }
    }
  }

  /**
   * @returns {Observable<boolean>}
   */
  execute() {
    const readySub = this.iframe.getIframe().subscribe(() => {
      this.subscriptions.add(messageChannel$.subscribe(message => this._handleMessage(message)));

      this.subscriptions.add(from(this._commands).pipe(delay(100))
        .subscribe(command => {
          const message = JSON.stringify({type: 'input', data: command});
          this.iframe.iframeRef.current.contentWindow.postMessage(message, SHELL_URL);
        }));
    });

    this.subscriptions.add(readySub);

    return this.isDone$;
  }

  _onOutput(output) {
    super.outputBuffer += output;

    // Keep only the last 500 characters to prevent memory issues
    if (this.outputBuffer.length > 500) {
      this.outputBuffer = this.outputBuffer.slice(-500);
    }

    this._checkLoginStatus();
  }
}
