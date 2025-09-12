import {ShellOperation} from "./shell.operation";

export class RunExerciseScriptOperation extends ShellOperation {

  /**
   * @param script {string} The script to load into the shell
   * @param iframe {IframeWrapper}
   */
  constructor(iframe, script) {
    const _commands = [
      `source ${script}\n`
    ]
    super(iframe, _commands);
    this.script = script;
  }

  _onOutput(output) {
    this.outputBuffer += output || '';
    if (this.outputBuffer.length > 500) {
      this.outputBuffer = this.outputBuffer.slice(-500);
    }
    if (this.outputBuffer.includes(`source ${this.script}`)) {
      this.isDone$.next(true);
      this.subscriptions.unsubscribe();
    }

    this.isDone$.next(true);
  }
}
