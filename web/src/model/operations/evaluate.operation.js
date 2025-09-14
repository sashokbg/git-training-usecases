import {ShellOperation} from "./shell.operation";

// Evaluates a list of shell commands and reports pass/fail per command.
// Each command is executed and followed by printing a sentinel with the return code.
export class EvaluateOperation extends ShellOperation {
  /**
   * @param iframe {IframeWrapper}
   * @param repoDir {string} relative directory of the repo (e.g., workspace/abort_a_merge)
   * @param commands {string[]} shell commands to evaluate (0 exit code means pass)
   */
  constructor(iframe, repoDir, commands) {
    // Build a single compound command that runs each check sequentially and prints a sentinel per check
    const lines = [];
    lines.push(`cd ${repoDir}`);
    (commands || []).forEach((c, idx) => {
      // Run the check in a subshell to avoid affecting the next check; capture rc explicitly
      // Do not short-circuit on failure; always print a result line
      lines.push(`( ${c} ) >/dev/null 2>&1; rc=$?; echo 'LG_EVAL_RC:${idx}:'$rc`);
    });
    const wrapped = [lines.join('\n') + '\n'];

    super(iframe, wrapped);
    this.total = (commands || []).length;
    this.results = Array(this.total).fill(null); // true/false per command
    this._seen = new Set();
  }

  _onOutput(output) {
    this.outputBuffer += output || '';
    if (this.outputBuffer.length > 20000) {
      this.outputBuffer = this.outputBuffer.slice(-20000);
    }

    // Robustly parse markers from accumulated buffer (handles chunk boundaries)
    const re = /LG_EVAL_RC:(\d+):(\d+)/g;
    let m;
    while ((m = re.exec(this.outputBuffer)) !== null) {
      const idx = Number(m[1]);
      const code = Number(m[2]);
      if (!Number.isNaN(idx) && idx >= 0 && idx < this.results.length) {
        this.results[idx] = code === 0;
        this._seen.add(idx);
      }
    }

    if (this.results.length > 0 && this.results.every(v => v === true || v === false)) {
      const passed = this.results.filter(Boolean).length;
      this._complete({ passed, total: this.total, results: this.results.slice() });
    }
  }
}
