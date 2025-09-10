import React, { useState } from 'react';
import useAppStore from './app.store';

const ToolboxDrawer = ({
    isLoggedIn,
    loginInProgress,
    editor,
    onEditorSelect,
    exerciseStarted = false,
    onImportAliases,
}) => {
    const [open, setOpen] = useState(true);
    const hiddenOps = useAppStore((s) => s.hiddenChannelOps);
    const hiddenBusy = hiddenOps > 0;
    const statusIcon = isLoggedIn ? '✅' : loginInProgress ? '🔄' : '❌';

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
                    {hiddenBusy && (
                        <span className="small-loader" title="Background tasks running"/>
                    )}
                </div>
                <div className="editor-select-container">
                    <label htmlFor="editor-select" className="editor-select-label">
                        Switch editor:
                    </label>
                    <select
                        id="editor-select"
                        className="editor-select"
                        value={editor}
                        onChange={(e) => onEditorSelect(e)}
                    >
                        <option value="vim">Vim</option>
                        <option value="nano">Nano</option>
                    </select>
                </div>
                <div className="drawer-actions" style={{ marginTop: '12px' }}>
                    <button
                        className="drawer-action"
                        onClick={() => onImportAliases && onImportAliases()}
                        title={'Import your git aliases'}
                    >
                        Import Aliases
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToolboxDrawer;
