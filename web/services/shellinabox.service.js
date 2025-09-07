/**
 * Service to handle Shell in a Box login detection and retry logic
 */
import ShellService from './shell.service';

export class ShellLoginService {
    constructor(iframeRefOrShell, url, maxRetries = 1) {
        // Support both legacy (iframeRef + url) and new (ShellService instance) usage.
        if (iframeRefOrShell && typeof iframeRefOrShell.post === 'function') {
            this.shell = iframeRefOrShell;
            this.iframeRef = this.shell.iframeRef;
            this.url = this.shell.url;
        } else {
            this.iframeRef = iframeRefOrShell;
            this.url = url;
            this.shell = new ShellService(this.iframeRef, this.url);
        }
        this.maxRetries = maxRetries;
        this.retryCount = 0;
        this.isLoggedIn = false;
        this.loginAttemptInProgress = false;
        this.loginCallback = null;
        this.outputBuffer = '';
        this.loginTimeout = null;

        // Login detection patterns
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
     * Start the login process
     * @param {Function} callback - Callback function called when login succeeds or fails after all retries
     */
    startLogin(callback) {
        this.loginCallback = callback;
        this.retryCount = 0;
        this.isLoggedIn = false;
        this.outputBuffer = '';
        this.attemptLogin();
    }

    /**
     * Process shell output to detect login status
     * @param {string} output - Output from the shell
     */
    processOutput(output) {
        this.outputBuffer += output;

        // Keep only the last 500 characters to prevent memory issues
        if (this.outputBuffer.length > 500) {
            this.outputBuffer = this.outputBuffer.slice(-500);
        }

        if (this.loginAttemptInProgress) {
            this.checkLoginStatus();
        }
    }

    /**
     * Check if login was successful or failed based on output patterns
     */
    checkLoginStatus() {
        // Check for login success
        for (const pattern of this.loginSuccessPatterns) {
            if (pattern.test(this.outputBuffer)) {
                this.handleLoginSuccess();
                return;
            }
        }

        // Check for login failure
        for (const pattern of this.loginFailurePatterns) {
            if (pattern.test(this.outputBuffer)) {
                this.handleLoginFailure();
                return;
            }
        }
    }

    /**
     * Handle successful login
     */
    handleLoginSuccess() {
        console.log('Login successful detected');
        this.isLoggedIn = true;
        this.loginAttemptInProgress = false;
        this.clearLoginTimeout();

        if (this.loginCallback) {
            this.loginCallback(true);
        }
    }

    /**
     * Handle login failure
     */
    handleLoginFailure() {
        console.log('Login failure detected');
        this.loginAttemptInProgress = false;
        this.clearLoginTimeout();
        this.retryLogin();
    }

    /**
     * Handle login timeout
     */
    handleLoginTimeout() {
        console.log('Login timeout - assuming failure');
        this.loginAttemptInProgress = false;
        this.retryLogin();
    }

    /**
     * Retry login if retries are available
     */
    retryLogin() {
        if (this.retryCount < this.maxRetries) {
            console.log(`Retrying login (attempt ${this.retryCount + 1}/${this.maxRetries + 1})`);
            this.retryCount++;
            this.reloadAndAttemptLogin();
        } else {
            console.log('Max retries reached, login failed');
            this.isLoggedIn = false;
            if (this.loginCallback) {
                this.loginCallback(false);
            }
        }
    }

    /**
     * Reload the iframe and attempt login
     */
    reloadAndAttemptLogin() {
        if (this.iframeRef.current) {
            this.outputBuffer = '';
            this.shell.reload();
            setTimeout(() => {
                this.attemptLogin();
            }, 2000);
        }
    }

    /**
     * Attempt to log in to the shell
     */
    attemptLogin() {
        console.log('Attempting login...');
        this.loginAttemptInProgress = true;
        this.outputBuffer = '';

        // Set a timeout for login attempt (10 seconds)
        this.loginTimeout = setTimeout(() => {
            this.handleLoginTimeout();
        }, 10000);

        if (this.iframeRef.current) {
            setTimeout(() => {
                this.shell.sendInput("learn-git\n");
                setTimeout(() => {
                    this.shell.sendInput("learn-git\n");
                }, 500);
            }, 1000);
        }
    }

    /**
     * Send message to shell iframe
     * @param {string} type - Message type
     * @param {string} data - Message data
     */
    sendMessage(type, data = null) {
        this.shell.post(type, data);
    }

    /**
     * Clear login timeout
     */
    clearLoginTimeout() {
        if (this.loginTimeout) {
            clearTimeout(this.loginTimeout);
            this.loginTimeout = null;
        }
    }

    /**
     * Get current login status
     */
    getLoginStatus() {
        return this.isLoggedIn;
    }

    /**
     * Reset the service state
     */
    reset() {
        this.isLoggedIn = false;
        this.loginAttemptInProgress = false;
        this.retryCount = 0;
        this.outputBuffer = '';
        this.clearLoginTimeout();
    }

    /**
     * Cleanup method
     */
    cleanup() {
        this.clearLoginTimeout();
        this.loginCallback = null;
    }
}
