export class ShellOperation {
  /**
   * The commands to be executed
   * @type {[string]}
   */
  _commands = [];

  /**
   *
   * @param timeout {number} in seconds
   * @param isBackground {boolean} if true, the operation will be executed in the background. Default is false
   * @param retries {number} in case of failure. Default is 0
   */
  constructor(timeout, isBackground = false, retries = 0) {
    this.isBackground = isBackground;
    this.outputBuffer = '';
  }

  /**
   * Start executing the operation and send input to the shell
   * @private
   */
  start() {

  }

  onStart() {

  }

  onSuccess() {

  }

  onFailure() {

  }

  /**
   * This callback is called whenever the shel in a box sends input to the shell.
   * @param input
   * @private
   */
  _onInput(input) {

  }
}
