import {ShellOperation} from "./shell.operation";

export class LoginOperation extends ShellOperation {

  /**
   *
   * @param iframe {IframeWrapper}
   */
  constructor(iframe) {
    const _commands = [
      "learn-git\n",
      "learn-git\n"
    ]
    super(iframe, _commands);


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


  _onOutput(output) {
    super.outputBuffer += output;

    // Keep only the last 500 characters to prevent memory issues
    if (this.outputBuffer.length > 500) {
      this.outputBuffer = this.outputBuffer.slice(-500);
    }

    this._checkLoginStatus();
  }
}
