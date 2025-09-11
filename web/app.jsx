import React, {useEffect, useRef, useState} from 'react';
import './app.css';
import exercises from './exercises.db.json';
import ShellService from './services/shell.service';
import HintsComponent from './hints.component';
import ToolboxDrawer from './toolbox_drawer.component';
import Footer from './footer.component';
import useAppStore from './app.store';
import ImportAliasesModal from './import_aliases_modal.component';
import AliasImportService from './services/alias_import.service';
import HiddenShellChannel from './services/hidden_shell_channel.service';
import {LoginOperation} from "./model/login.operation";
import {ShellService2} from "./model/shell.service2";

function App() {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const {
    isLoggedIn,
    loginInProgress,
    setIsLoggedIn,
    setLoginInProgress,
    startHiddenChannelOp,
    endHiddenChannelOp,
  } = useAppStore();
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [editor, setEditor] = useState('vim');
  const [pendingEditor, setPendingEditor] = useState(null);
  const [showEditorConfirm, setShowEditorConfirm] = useState(false);
  const [showAliasModal, setShowAliasModal] = useState(false);
  const [aliasImportBusy, setAliasImportBusy] = useState(false);
  const [aliasImportResult, setAliasImportResult] = useState(null);

  const shellIframeRef = useRef(null);
  const loginServiceRef = useRef(null);
  const shellServiceRef = useRef(null);

  const url = "http://localhost:5173/shell";
  const currentExercise = exercises[currentExerciseIndex];

  // Initialize shell comms + login service
  useEffect(() => {
    shellServiceRef.current = new ShellService(shellIframeRef, url);

    // Load editor preference
    const saved = localStorage.getItem('editor');
    if (saved === 'nano' || saved === 'vim') {
      setEditor(saved);
    }

    return () => {
      shellServiceRef.current && shellServiceRef.current.cleanup();
      if (loginServiceRef.current) {
        loginServiceRef.current.cleanup();
      }
    };
  }, [url]);

  useEffect(() => {
    if (isLoggedIn && exerciseStarted) {
      if (shellIframeRef.current && currentExercise) {
        setTimeout(() => {
          loadExercise(currentExercise);
        }, 500);
      }
    }
  }, [isLoggedIn, exerciseStarted]);

  const sendMessage = (type, data = null) => {
    shellServiceRef.current && shellServiceRef.current.post(type, data);
  };

  const loadExercise = (exercise) => {

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

    if (shellIframeRef.current) {
      shellIframeRef.current.contentWindow.location.reload();
    }

    setTimeout(() => {
      let loginOperation = new LoginOperation();
      new ShellService2(shellIframeRef, null, "http://localhost:5173/shell").execute(loginOperation);
    }, 1000)
  }

  const handleSubmit = () => {
    console.log('Submitting exercise:', currentExercise.exercise_title);
  };

  const handleOpenAliasModal = () => {
    setAliasImportResult(null);
    setShowAliasModal(true);
  };

  const handleCloseAliasModal = () => {
    setShowAliasModal(false);
    setAliasImportBusy(false);
    setAliasImportResult(null);
  };

  const handleImportAliases = async (text) => {
    setAliasImportBusy(true);
    const channel = new HiddenShellChannel(url, 2);
    startHiddenChannelOp();

    try {
      await channel.init();

      const svc = new AliasImportService();
      const parsed = svc.parseAliasesFromGitConfig(text);
      setAliasImportResult({ aliases: parsed.aliases, errors: parsed.errors });

      if (Object.keys(parsed.aliases).length === 0) {
        return; // Nothing to import
      }

      await svc.setAliasesInShell(parsed.aliases, channel.shell, channel.loginService);
      await channel.waitForOutput('ALIASES_IMPORTED', 5000);
      setShowAliasModal(false);
    } catch (e) {
      setAliasImportResult({ aliases: {}, errors: [String(e && e.message ? e.message : e)] });
    } finally {
      channel.cleanup();
      setAliasImportBusy(false);
      endHiddenChannelOp();
    }
  };

  const applyEditorPreference = async (newEditor) => {
    const channel = new HiddenShellChannel(url, 2);
    startHiddenChannelOp();
    try {
      await channel.init();
      const cmd = newEditor === 'nano'
        ? "git config --global core.editor nano\n echo 'EDITOR_SET'\n"
        : "git config --global core.editor vim\n echo 'EDITOR_SET'\n";
      channel.send(cmd);
      await channel.waitForOutput('EDITOR_SET', 4000);
    } catch (_) {
      // Swallow errors for now; we can surface a toast in later iteration
    } finally {
      channel.cleanup();
      endHiddenChannelOp();
    }
  };

  const handleEditorSelect = (e) => {
    const newEditor = e.target.value;
    if (exerciseStarted && isLoggedIn) {
      setPendingEditor(newEditor);
      setShowEditorConfirm(true);
    } else {
      setEditor(newEditor);
      localStorage.setItem('editor', newEditor);
      applyEditorPreference(newEditor);
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
      // Apply editor preference using hidden channel (no restart)
      applyEditorPreference(pendingEditor);
    }
  };

  return (
    <div className="app">
      {showEditorConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-panel">
            <p>Changing the editor to {pendingEditor} will update your global Git editor. Continue?</p>
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
            {Array.isArray(currentExercise.exercise_description)
              ? currentExercise.exercise_description.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))
              : (
                <p>{currentExercise.exercise_description}</p>
              )}

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
                ref={shellIframeRef}
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

              {currentExercise.expected && currentExercise.expected.explanations && (
                <div className="expected-outcome">
                  <h4>Expected Outcome:</h4>
                  {Array.isArray(currentExercise.expected.explanations)
                    ? (
                      <ul>
                        {currentExercise.expected.explanations.map((exp, idx) => (
                          <li key={idx}>{exp}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{currentExercise.expected.explanations}</p>
                    )}
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
        exerciseStarted={exerciseStarted}
        onImportAliases={handleOpenAliasModal}
      />

      <ImportAliasesModal
        open={showAliasModal}
        onClose={handleCloseAliasModal}
        onImport={handleImportAliases}
        busy={aliasImportBusy}
        result={aliasImportResult}
      />
    </div>
  );
}

export default App;
