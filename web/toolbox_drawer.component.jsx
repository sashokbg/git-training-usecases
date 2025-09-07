import React, { useState } from 'react';

const ToolboxDrawer = ({isLoggedIn, loginInProgress, editor, onEditorSelect}) => {
    const [open, setOpen] = useState(true);
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
            </div>
        </div>
    );
};

export default ToolboxDrawer;
