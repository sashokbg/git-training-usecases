import React, {useEffect, useRef, useState} from 'react';
import './app.css';
import {questions} from './questions.db';
import { ShellLoginService } from './services/shellinabox.service';
import HintsComponent from './hints.component';

// Import the questions database

function App() {
    const [output, setOutput] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [sessionStatus, setSessionStatus] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [questionStarted, setQuestionStarted] = useState(false);
    const [loginInProgress, setLoginInProgress] = useState(false);
    const [editor, setEditor] = useState('vim');
    const [pendingEditor, setPendingEditor] = useState(null);
    const [showEditorConfirm, setShowEditorConfirm] = useState(false);

    const iframeRef = useRef(null);
    const outputRef = useRef(null);
    const loginServiceRef = useRef(null);

    const url = "http://localhost:5173/shell";
    const currentQuestion = questions[currentQuestionIndex];

    // Initialize login service
    useEffect(() => {
        loginServiceRef.current = new ShellLoginService(iframeRef, url, 1); // 1 retry

        // Load editor preference
        const saved = localStorage.getItem('editor');
        if (saved === 'nano' || saved === 'vim') {
            setEditor(saved);
        }

        return () => {
            if (loginServiceRef.current) {
                loginServiceRef.current.cleanup();
            }
        };
    }, [url]);

    function handleLoginResult(success) {
        setLoginInProgress(false);
        setIsLoggedIn(success);

        if (!success) {
            console.error('Login failed after all retry attempts');
            // You might want to show an error message to the user here
        }
    }

    function startLoginProcess() {
        setLoginInProgress(true);
        setIsLoggedIn(false);
        if (loginServiceRef.current) {
            loginServiceRef.current.startLogin(handleLoginResult);
        }
    }

    useEffect(() => {
        const handleMessage = (message) => {
            if (new URL(message.origin).host !== new URL(url).host) {
                return;
            }

            // Handle response according to response type
            const decoded = JSON.parse(message.data);
            switch (decoded.type) {
                case "ready":
                    // Shellinabox is ready to communicate and we will enable console output
                    // by default.
                    const readyMessage = JSON.stringify({
                        type: 'output',
                        data: 'enable'
                    });
                    iframeRef.current.contentWindow.postMessage(readyMessage, url);
                    // Start login process after shell is ready
                    startLoginProcess();
                    break;
                case "output":
                    // Append new output
                    setOutput(prev => prev + decoded.data);

                    // Process output through login service for login detection
                    if (loginServiceRef.current) {
                        loginServiceRef.current.processOutput(decoded.data);
                    }
                    break;
                case "session":
                    // Reload session status
                    setSessionStatus(decoded.data);
                    break;
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            console.log("Removed event listener");
            window.removeEventListener("message", handleMessage);
        };
    }, [url]);

    // Auto-scroll output to bottom when new content is added
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    // Load question only when started
    useEffect(() => {
        if (isLoggedIn && questionStarted) {
            if (iframeRef.current && currentQuestion) {
                setTimeout(() => {
                    loadQuestion(currentQuestion);
                }, 500);
            }
        }
    }, [isLoggedIn, questionStarted]);

    const sendMessage = (type, data = null) => {
        const message = JSON.stringify({type, data});
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(message, url);
        }
    };

    const loadQuestion = (question) => {
        // Clear previous output
        setOutput('');

        // Apply editor preference in the shell
        if (editor === 'nano') {
            sendMessage('input', 'git config --global core.editor nano\n')
        } else {
            sendMessage('input', 'git config --global core.editor vim\n')
        }

        // Send command to load the question script
        sendMessage('input', `source ${question.script}\n`);
    };

    const handleQuestionSelect = (index) => {
        setCurrentQuestionIndex(index);
        setQuestionStarted(false);

        // Reset login status when changing exercises
        setIsLoggedIn(false);
        setLoginInProgress(false);

        // Reset login service state
        if (loginServiceRef.current) {
            loginServiceRef.current.reset();
        }
    };

    const handleStartQuestion = () => {
        setQuestionStarted(true);
        setIsLoggedIn(false);
        setLoginInProgress(false);

        // Reset login service state
        if (loginServiceRef.current) {
            loginServiceRef.current.reset();
        }

        if (iframeRef.current) {
            iframeRef.current.contentWindow.location.reload();
        }
    }

    const handleSubmit = () => {
        // Here you could implement submission logic
        // For now, just log the current question
        console.log('Submitting question:', currentQuestion.title);

        // You might want to validate the solution or move to next question
        alert('Solution submitted! Check the terminal output to verify your answer.');
    };

    const handleEditorSelect = (e) => {
        const newEditor = e.target.value;
        if (questionStarted && isLoggedIn) {
            setPendingEditor(newEditor);
            setShowEditorConfirm(true);
        } else {
            setEditor(newEditor);
            localStorage.setItem('editor', newEditor);
        }
    };

    const cancelEditorToggle = () => {
        setPendingEditor(null);
        setShowEditorConfirm(false);
    };

    const confirmEditorToggle = () => {
        if (pendingEditor) {
            setEditor(pendingEditor);
            localStorage.setItem('editor', pendingEditor);
            setShowEditorConfirm(false);
            setPendingEditor(null);
            // Restart shell to apply editor change
            setOutput('');
            if (loginServiceRef.current) {
                loginServiceRef.current.reset();
            }
            if (iframeRef.current) {
                iframeRef.current.contentWindow.location.reload();
            }
        }
    };

    return (
        <div className="app">
            {showEditorConfirm && (
                <div className="confirm-overlay">
                    <div className="confirm-panel">
                        <p>Changing the editor to {pendingEditor} will restart your shell. Continue?</p>
                        <div className="confirm-buttons">
                            <button className="cancel" onClick={cancelEditorToggle}>Cancel</button>
                            <button className="confirm" onClick={confirmEditorToggle}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Login Status Indicator */}
            <div className={`login-status-indicator ${isLoggedIn ? 'logged-in' : loginInProgress ? 'logging-in' : 'logged-out'}`}>
                <span className="status-icon">
                    {isLoggedIn ? '✅' : loginInProgress ? '🔄' : '❌'}
                </span>
                <span className="status-text">
                    {isLoggedIn ? 'Shell Initialized' : loginInProgress ? 'Shell Initializing...' : 'Shell not Initialized'}
                </span>
            </div>

            <div className="sidebar">
                <h3 className="sidebar-title">Git Exercises</h3>
                {questions.map((question, index) => (
                    <div
                        key={index}
                        className={`sidebar-item ${index === currentQuestionIndex ? 'active' : ''}`}
                        onClick={() => handleQuestionSelect(index)}
                    >
                        <span className="question-number">{index + 1}.</span>
                        <span className="question-title-short">{question.title}</span>
                    </div>
                ))}
            </div>
            <div className="question-content">
                <header className="content-header">
                    <h1>Git Exercise</h1>
                    <p className="exercise-subtitle">Practice your Git skills with interactive exercises</p>
                    <div className="editor-select-container">
                        <label htmlFor="editor-select" className="editor-select-label">Switch editor:</label>
                        <select
                            id="editor-select"
                            className="editor-select"
                            value={editor}
                            onChange={handleEditorSelect}
                        >
                            <option value="vim">Vim</option>
                            <option value="nano">Nano</option>
                        </select>
                    </div>
                </header>

                <h2 className="question-title">{currentQuestion.title}</h2>

                <div className="question-description">
                    <p>{currentQuestion.description}</p>

                    {currentQuestion.command_history && currentQuestion.command_history.length > 0 && (
                        <div className="command-history">
                            <h4>Command History:</h4>
                            <ul>
                                {currentQuestion.command_history.map((command, index) => (
                                    <li key={index}><code>{command}</code></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {!questionStarted && (
                    <div className="question-start">
                        <button className="start-button" onClick={handleStartQuestion}>
                            Start
                        </button>
                    </div>
                )}

                {questionStarted && (
                    <div className="question-content-workspace">
                        {loginInProgress && (
                            <div className="login-status">
                                <p>🔄 Logging in to shell...</p>
                            </div>
                        )}

                        {!isLoggedIn && !loginInProgress && (
                            <div className="login-status error">
                                <p>❌ Failed to login to shell after retries. Please try restarting the exercise.</p>
                            </div>
                        )}

                        <iframe
                            ref={iframeRef}
                            id="shell"
                            src={url}
                            className="shell-iframe"
                            title="Shell In A Box Terminal"
                        />
                    </div>
                )}

                {/* Use the new HintsComponent */}
                <HintsComponent
                    questionTitle={currentQuestion.title}
                    hints={currentQuestion.hints}
                />

                {questionStarted && (
                    <div className="question-actions">
                        <button className="submit-button" onClick={handleSubmit}>
                            Submit Solution
                        </button>

                        {currentQuestion.expected && (
                            <div className="expected-outcome">
                                <h4>Expected Outcome:</h4>
                                <p>{currentQuestion.expected}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
