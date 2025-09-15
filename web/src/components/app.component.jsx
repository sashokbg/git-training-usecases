import React, {useEffect, useRef, useState} from 'react';
import './app.component.css';
import exercises from '../../resources/exercises.db.json';
import HintsComponent from './hints.component';
import ToolboxDrawer from './toolbox_drawer.component';
import Footer from './footer.component';
import useAppStore from '../model/app.store';
import ImportAliasesModal from './import_aliases_modal.component';
import AliasImportService from '../services/alias_parse.service';
import {IframeWrapper} from "../model/iframe_wrapper";
import {LoginOperation} from "../model/operations/login.operation";
import {RunExerciseScriptOperation} from "../model/operations/run_exercise_script.operation";
import {delay, mergeMap, of} from "rxjs";
import {EditorOperation} from "../model/operations/editor.operation";
import {EvaluateOperation} from "../model/operations/evaluate.operation";
import {AliasImportOperation} from "../model/operations/alias_import.operation";
import ChecksComponent from './checks.component';

function App() {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const {isLoggedIn, loginInProgress, setIsLoggedIn, setLoginInProgress} = useAppStore();
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [showAliasModal, setShowAliasModal] = useState(false);
  const [aliasImportBusy, setAliasImportBusy] = useState(false);
  const [aliasImportResult, setAliasImportResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [evaluationError, setEvaluationError] = useState(null);

  const shellIframeRef = useRef(null);
  const [iframeWrapper, setIframeWrapper] = useState(new IframeWrapper(shellIframeRef));

  const url = "http://localhost:5173/shell";
  const currentExercise = exercises[currentExerciseIndex];

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

  const handleRestartExercise = () => {
    // Clear hint progress for current exercise
    const title = String(currentExercise.exercise_title || "");
    const hints = Array.isArray(currentExercise.hints) ? currentExercise.hints : [];
    for (let i = 0; i < hints.length; i++) {
      const key = `${title}.hint[${i}].seen`;
      localStorage.removeItem(key);
    }

    // Reset evaluation state
    setEvaluationResult(null);
    setEvaluationError(null);
    setEvaluating(false);

    // Start the exercise as if the Start button was pressed
    handleStartExercise();
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

    try {
      const svc = new AliasImportService();
      const parsed = svc.parseAliasesFromGitConfig(text);
      setAliasImportResult({aliases: parsed.aliases, errors: parsed.errors});

      const hasAliases = Object.keys(parsed.aliases).length > 0;
      if (!hasAliases) {
        setAliasImportBusy(false);
        return; // Nothing to import
      }

      // Run login + alias import in a background iframe session
      setShowAliasModal(false);
      IframeWrapper.executeInBackground((iframe) => {
        return of(null).pipe(
          delay(100),
          mergeMap(() => new LoginOperation(iframe).execute()),
          delay(100),
          mergeMap(() => new AliasImportOperation(iframe, parsed.aliases).execute()),
        );
      }).subscribe({
        next: () => {
        },
        error: (err) => {
          console.error('An error occurred while importing aliases:', err);
          setAliasImportBusy(false);
          setAliasImportResult({aliases: {}, errors: [String(err && err.message ? err.message : err)]});
        },
        complete: () => {
          setAliasImportBusy(false);
        }
      });
    } catch (e) {
      setAliasImportBusy(false);
      setAliasImportResult({aliases: {}, errors: [String(e && e.message ? e.message : e)]});
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
      console.log('Editor set to', newEditor);
      document.dispatchEvent(new CustomEvent('editor-set', {detail: newEditor}));
      localStorage.setItem('editor', newEditor);
    });
  };

  const handleEvaluate = () => {
    setEvaluationError(null);
    setEvaluationResult(null);

    const checks = Array.isArray(currentExercise.checks) ? currentExercise.checks : [];
    const runnableChecks = checks.filter(c => c && typeof c.command === 'string' && c.command.trim());
    const commands = runnableChecks.map(c => c.command);
    const names = runnableChecks.map((c, idx) => c.name && c.name.trim() ? c.name : `Check ${idx + 1}`);

    if (!commands.length) {
      setEvaluationResult({ passed: 0, total: 0, results: [] });
      return;
    }

    const script = String(currentExercise.script || '');
    const repoName = script.replace(/\.sh$/, '');
    const repoDir = `workspace/${repoName}`;

    setEvaluating(true);
    IframeWrapper.executeInBackground((iframe) => {
      return of(null).pipe(
        delay(100),
        mergeMap(() => new LoginOperation(iframe).execute()),
        delay(100),
        mergeMap(() => new EvaluateOperation(iframe, repoDir, commands).execute()),
      );
    }).subscribe({
      next: (res) => {
        setEvaluationResult({ ...res, names });
      },
      error: (err) => {
        setEvaluationError(String(err && err.message ? err.message : err));
        setEvaluating(false);
      },
      complete: () => {
        setEvaluating(false);
      }
    });
  };

  const allChecks = Array.isArray(currentExercise.checks) ? currentExercise.checks : [];
  const runnableChecks = allChecks.filter(c => c && typeof c.command === 'string' && c.command.trim());

  return (
    <div className="app">
      <div className="sidebar">
        <h3 className="sidebar-title">Exercises</h3>
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
              <div className="workspace-toolbar">
                <button
                  className="restart-button"
                  id="restart-exercise-btn"
                  title="Restart the exercise"
                  onClick={handleRestartExercise}
                >
                  Restart
                </button>
              </div>
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
              {evaluationError && (
                <div className="evaluation-result" style={{ marginBottom: '0.75rem', color: '#b00020' }}>
                  ❌ Evaluation error: {evaluationError}
                </div>
              )}

              <ChecksComponent
                checks={runnableChecks}
                evaluationResult={evaluationResult}
                evaluating={evaluating}
                onEvaluate={handleEvaluate}
              />
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
