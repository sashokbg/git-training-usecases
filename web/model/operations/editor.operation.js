import {ShellOperation} from "./shell.operation";
import useAppStore from "../../app.store";

export class EditorOperation extends ShellOperation {
  constructor(editor) {
    // Always background for editor changes
    super(5, true, 0);
    this.editor = editor === 'nano' ? 'nano' : 'vim';
    this._done = false;

    // Send config and echo completion marker
    let editorCommand = this.editor === 'nano'
      ? "git config --global core.editor nano; echo 'EDITOR_SET'\n"
      : "git config --global core.editor vim; echo 'EDITOR_SET'\n";

    this._commands = [
      editorCommand
    ];
  }

  onStart() {
    useAppStore.getState().startHiddenChannelOp();
  }

  onSuccess() {
    this._done = true;
    useAppStore.getState().endHiddenChannelOp();
  }

  onFailure() {
    useAppStore.getState().endHiddenChannelOp();
  }

  _onOutput(output) {
    this.outputBuffer += output || '';
    if (this.outputBuffer.length > 500) {
      this.outputBuffer = this.outputBuffer.slice(-500);
    }
    if (this.outputBuffer.includes('EDITOR_SET')) {
      this.onSuccess();
    }
  }
}

