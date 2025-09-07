import React from 'react';

const ToolboxDrawer = ({isLoggedIn, loginInProgress, editor, onEditorSelect}) => {
    const statusIcon = isLoggedIn ? '✅' : loginInProgress ? '🔄' : '❌';

    return (
        <div className={`drawer ${open ? 'open' : 'closed'}`}>
            <div className="drawer-content">
                <button className="drawer-toggle" onClick={() => setOpen(false)}>
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
                        onChange={(e) => onEditorSelect(e.target.value)}
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
