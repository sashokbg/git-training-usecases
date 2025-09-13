import React, {useState} from 'react';
import useAppStore from './app.store';
import {IframeWrapper} from './model/iframe_wrapper';
import {LoginOperation} from './model/operations/login.operation';
import {ReadEditorOperation} from './model/operations/read_editor.operation';
import {delay, mergeMap, of} from 'rxjs';

const ToolboxDrawer = ({
                         isLoggedIn,
                         loginInProgress,
                         onEditorSelect,
                         onImportAliases,
                       }) => {
  const [open, setOpen] = useState(true);
  const {currentEditor, setCurrentEditor} = useAppStore()
  const backgroundOperation = useAppStore((s) => s.backgroundOpInProgress);
  const statusIcon = isLoggedIn ? '✅' : loginInProgress ? '🔄' : '❌';

  const getEditor = () => {
    IframeWrapper.executeInBackground((iframe) => {
      return of(null).pipe(
        delay(100),
        mergeMap(() => new LoginOperation(iframe).execute()),
        delay(100),
        mergeMap(() => new ReadEditorOperation(iframe).execute()),
      );
    }).subscribe((result) => {
      setCurrentEditor(result);
    });
  };

  return (
    <div className={`drawer ${open ? 'open' : 'closed'}`} onClick={() => setOpen(true)}>
      <div className="drawer-content">
        <button className="drawer-toggle" onClick={() => setOpen((v) => !v)}>
          🔧
        </button>
        <div className="status-indicator">
          <span className="status-icon">{statusIcon}</span>
          <span className="status-text">
              {isLoggedIn
                ? 'Shell Initialized'
                : loginInProgress
                  ? 'Shell Initializing...'
                  : 'Shell not Initialized'}
                    </span>
          {backgroundOperation && (
            <span className="small-loader" title="Background tasks running"/>
          )}
        </div>
        <div className="editor-select-container">
          <label htmlFor="editor-select" className="editor-select-label">
            Set Git Editor:
          </label>
          <button onClick={() => onEditorSelect('vim')}>Vim</button>
          <button onClick={() => onEditorSelect('nano')}>Nano</button>
        </div>
        <div className="editor-select-container">
          <label htmlFor="editor-select" className="editor-select-label">
            Read Editor:
          </label>
          <button
            onClick={getEditor}
            id={"read-editor-btn"}
            title="Read current git editor"
            style={{marginLeft: '8px'}}
          >
            Read
          </button>
          {currentEditor && (
            <span className="editor-value">{currentEditor}</span>
          )}
        </div>
        <div className="editor-select-container" style={{marginTop: '12px'}}>
          <label htmlFor="editor-select" className="editor-select-label">
            Import Git Aliases:
          </label>
          <button
            onClick={() => onImportAliases && onImportAliases()}
            title={'Import your git aliases'}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolboxDrawer;
