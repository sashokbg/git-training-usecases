import React, { useState } from 'react';
import useAppStore from './app.store';

const ToolboxDrawer = ({
    isLoggedIn,
    loginInProgress,
    onEditorSelect,
    onImportAliases,
}) => {
    const [open, setOpen] = useState(true);
    const backgroundOperation = useAppStore((s) => s.backgroundOpInProgress);
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
