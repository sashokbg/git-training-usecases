import React, {useEffect, useRef, useState} from 'react';
import './app.css';
import exercises from './exercises.db.json';
import HintsComponent from './hints.component';
import ToolboxDrawer from './toolbox_drawer.component';
import Footer from './footer.component';
import useAppStore from './app.store';
import ImportAliasesModal from './import_aliases_modal.component';
import AliasImportService from './services/alias_import.service';
import {IframeWrapper} from "./model/iframe_wrapper";
import {LoginOperation} from "./model/operations/login.operation";
import {RunExerciseScriptOperation} from "./model/operations/run_exercise_script.operation";
import {EditorOperation} from "./model/operations/editor.operation";
import {delay, mergeMap, of} from "rxjs";

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
  const [showAliasModal, setShowAliasModal] = useState(false);
  const [aliasImportBusy, setAliasImportBusy] = useState(false);
  const [aliasImportResult, setAliasImportResult] = useState(null);

  const shellIframeRef = useRef(null);

  const [iframeWrapper, setIframeWrapper] = useState(new IframeWrapper(shellIframeRef));

  const url = "http://localhost:5173/shell";
  const currentExercise = exercises[currentExerciseIndex];

  useEffect(() => {
    const saved = localStorage.getItem('editor');
    if (saved === 'nano' || saved === 'vim') {
      setEditor(saved);
    }
  }, [url]);

  useEffect(() => {
    if (isLoggedIn && exerciseStarted) {
      new RunExerciseScriptOperation(iframeWrapper, currentExercise.script).execute().subscribe()
    }
  }, [isLoggedIn, exerciseStarted]);

  const handleExerciseSelect = (index) => {
    setCurrentExerciseIndex(index);
    setExerciseStarted(false);
    setIsLoggedIn(false);
    setLoginInProgress(false);
  };

  const handleStartExercise = () => {
    setExerciseStarted(true);
    setIsLoggedIn(false);
    setLoginInProgress(false);

    // Ensure a fresh iframe session so subscribers don't receive stale values
    if (iframeWrapper) {
      iframeWrapper.newSession();
    }

    if (shellIframeRef.current) {
      shellIframeRef.current.contentWindow.location.reload();
    }
    new LoginOperation(iframeWrapper).execute().subscribe(() => {
      setLoginInProgress(false);
      setIsLoggedIn(true);
    });
  }

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
    startHiddenChannelOp();

    try {
      const svc = new AliasImportService();
      const parsed = svc.parseAliasesFromGitConfig(text);
      setAliasImportResult({aliases: parsed.aliases, errors: parsed.errors});

      if (Object.keys(parsed.aliases).length === 0) {
        return; // Nothing to import
      }

      setShowAliasModal(false);
    } catch (e) {
      setAliasImportResult({aliases: {}, errors: [String(e && e.message ? e.message : e)]});
    } finally {
      setAliasImportBusy(false);
      endHiddenChannelOp();
    }
  };

  const handleEditorSelect = (newEditor) => {
    IframeWrapper.executeInBackground((iframe) => {
      return of(null).pipe(
        delay(100),
        mergeMap(() => {
          return new LoginOperation(iframe).execute()
        }),
        delay(100),
        mergeMap(() => {
          return new EditorOperation(iframe, newEditor).execute()
        }));
    }).subscribe(() => {
      setEditor(newEditor);
      localStorage.setItem('editor', newEditor);
    });
  };

  return (
    <div className="app">
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
              <button className="submit-button">
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
