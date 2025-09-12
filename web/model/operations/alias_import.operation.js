import {ShellOperation} from "./shell.operation";

export class AliasImportOperation extends ShellOperation {
  /**
   *
   * @param iframe {IframeWrapper}
   * @param aliases {Record<string,string>}
   */
  constructor(iframe, aliases) {
    const lines = [];
    for (const [name, value] of Object.entries(aliases || {})) {
      const escaped = String(value).replace(/'/g, `'"'"'`);
      lines.push(`git config --global alias.${name} '${escaped}'`);
    }
    lines.push("echo 'ALIASES_IMPORTED'\n");

    super(iframe, [lines.join('\n')]);
    this.outputBuffer = '';
  }

  _onOutput(output) {
    this.outputBuffer += output || '';
    if (this.outputBuffer.length > 500) {
      this.outputBuffer = this.outputBuffer.slice(-500);
    }
    if (this.outputBuffer.includes('ALIASES_IMPORTED')) {
      this._complete()
    }
  }
}

