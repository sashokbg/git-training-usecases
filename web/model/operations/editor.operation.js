import {ShellOperation} from "./shell.operation";

export class EditorOperation extends ShellOperation {
  /**
   *
   * @param iframe {IframeWrapper}
   * @param editor {string}
   */
  constructor(iframe, editor) {
    let editorCommand = [editor === 'nano'
      ? "git config --global core.editor nano; echo 'EDITOR_SET'\n"
      : "git config --global core.editor vim; echo 'EDITOR_SET'\n"];

    super(iframe, editorCommand);
    this.editor = editor === 'nano' ? 'nano' : 'vim';
  }


  _onOutput(output) {
    this.outputBuffer += output || '';
    if (this.outputBuffer.length > 500) {
      this.outputBuffer = this.outputBuffer.slice(-500);
    }
    if (this.outputBuffer.includes('EDITOR_SET')) {
      this.isDone$.next(true);
      this.subscriptions.unsubscribe();
    }
  }
}

