import {ShellOperation} from "./shell.operation";

export class ReadEditorOperation extends ShellOperation {
  /**
   *
   * @param iframe {IframeWrapper}
   * @param editor {string}
   */
  constructor(iframe, editor) {
    super(iframe, [
      "echo \"EDITOR: $(git config --global --get core.editor)\"\n"
    ]);
    this.editor = editor === 'nano' ? 'nano' : 'vim';
  }


  _onOutput(output) {
    this.outputBuffer += output || '';
    if (this.outputBuffer.length > 500) {
      this.outputBuffer = this.outputBuffer.slice(-500);
    }
    let regExpMatchArray = this.outputBuffer.match(/\nEDITOR: (.*)/);
    if (regExpMatchArray && regExpMatchArray[1]) {
      this._complete(regExpMatchArray[1])
    }
  }
}

