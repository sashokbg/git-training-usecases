import React, {useEffect, useRef, useState} from 'react';
import './app.css';
import exercises from './exercises.db.json';
import {ShellLoginService} from './services/shellinabox.service';
import HintsComponent from './hints.component';
import ToolboxDrawer from './toolbox_drawer.component';
import Footer from './footer.component';

function App() {
  const [output, setOutput] = useState('');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [editor, setEditor] = useState('vim');
  const [pendingEditor, setPendingEditor] = useState(null);
  const [showEditorConfirm, setShowEditorConfirm] = useState(false);

  const iframeRef = useRef(null);
  const outputRef = useRef(null);
  const loginServiceRef = useRef(null);

  const url = "http://localhost:5173/shell";
  const currentExercise = exercises[currentExerciseIndex];

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

  useEffect(() => {
    if (isLoggedIn && exerciseStarted) {
      if (iframeRef.current && currentExercise) {
        setTimeout(() => {
          loadExercise(currentExercise);
        }, 500);
      }
    }
  }, [isLoggedIn, exerciseStarted]);

  const sendMessage = (type, data = null) => {
    const message = JSON.stringify({type, data});
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, url);
    }
  };

  const loadExercise = (exercise) => {
    // Clear previous output
    setOutput('');

    // Apply editor preference in the shell
    if (editor === 'nano') {
      sendMessage('input', 'git config --global core.editor nano\n')
    } else {
      sendMessage('input', 'git config --global core.editor vim\n')
    }

    // Send command to load the exercise script
    sendMessage('input', `source ${exercise.script}\n`);
  };

  const handleExerciseSelect = (index) => {
    setCurrentExerciseIndex(index);
    setExerciseStarted(false);

    // Reset login status when changing exercises
    setIsLoggedIn(false);
    setLoginInProgress(false);

    // Reset login service state
    if (loginServiceRef.current) {
      loginServiceRef.current.reset();
    }
  };

  const handleStartExercise = () => {
    setExerciseStarted(true);
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
    console.log('Submitting exercise:', currentExercise.exercise_title);
  };

  const handleEditorSelect = (e) => {
    const newEditor = e.target.value;
    if (exerciseStarted && isLoggedIn) {
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

      <div className="sidebar">
        <h3 className="sidebar-title">Git Exercises</h3>
        {exercises.map((exercise, index) => (
          <div
            key={index}
            className={`sidebar-item ${index === currentExerciseIndex ? 'active' : ''}`}
            onClick={() => handleExerciseSelect(index)}
          >
            <span className="exercise-number">{index + 1}.</span>
            <span className="exercise-title-short">{exercise.exercise_title}</span>
          </div>
        ))}
      </div>
      <div className="main">
        <header className="content-header">
          <h1>Git Exercise</h1>
          <p className="exercise-subtitle">Practice your Git skills with interactive exercises</p>
        </header>

        <div className="exercise-content">
          <h2 className="exercise-title">{currentExercise.exercise_title}</h2>

          <div className="exercise-description">
            <p>{currentExercise.exercise_description}</p>

            {currentExercise.command_history && currentExercise.command_history.length > 0 && (
              <div className="command-history">
                <h4>Command History:</h4>
                <ul>
                  {currentExercise.command_history.map((command, index) => (
                    <li key={index}><code>{command}</code></li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {!exerciseStarted && (
            <div className="exercise-start">
              <button className="start-button" onClick={handleStartExercise}>
                Start
              </button>
            </div>
          )}

          {exerciseStarted && (
            <div className="exercise-content-workspace">
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

          <HintsComponent
            exerciseTitle={currentExercise.exercise_title}
            hints={currentExercise.hints}
          />

          {exerciseStarted && (
            <div className="exercise-actions">
              <button className="submit-button" onClick={handleSubmit}>
                Submit Solution
              </button>

              {currentExercise.expected.explanations && (
                <div className="expected-outcome">
                  <h4>Expected Outcome:</h4>
                  <p>{currentExercise.expected.explanations}</p>
                </div>
              )}
            </div>
          )}

          <Footer/>
        </div>
      </div>
      <ToolboxDrawer
        isLoggedIn={isLoggedIn}
        loginInProgress={loginInProgress}
        editor={editor}
        onEditorSelect={handleEditorSelect}
      />
    </div>
  );
}

export default App;
