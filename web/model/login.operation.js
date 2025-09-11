import {ShellOperation} from "./shell.operation";
import appStore, {useAppStore} from "../app.store";

export class LoginOperation extends ShellOperation{
  constructor() {
    super(10, false, 1);


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
        this.onSuccess();
        return;
      }
    }

    // Check for login failure
    for (const pattern of this.loginFailurePatterns) {
      if (pattern.test(this.outputBuffer)) {
        this.onFailure();
        return;
      }
    }
  }

  onSuccess() {
    useAppStore.getState().setLoginInProgress(false);
    useAppStore.getState().setIsLoggedIn(true);
  }


  onStart() {
    useAppStore.getState().setLoginInProgress(true);
  }

  _onInput(output) {
    super.outputBuffer += output;

    // Keep only the last 500 characters to prevent memory issues
    if (this.outputBuffer.length > 500) {
      this.outputBuffer = this.outputBuffer.slice(-500);
    }

    this._checkLoginStatus();
  }
}
