import React, {useState} from 'react';

const ImportAliasesModal = ({open, onClose, onImport, busy = false, result = null}) => {
  const [text, setText] = useState('');

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <h3>Import Git Aliases</h3>
        <p>
          Paste your entire <code>.gitconfig</code> or just the <code>[alias]</code> section below.
          Only the alias entries will be imported.
        </p>
        <textarea
          className="modal-textarea"
          placeholder={"[alias]\nlg = log --oneline --decorate\ns = status -sb"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
        />

        {result && (
          <div className="modal-result">
            {result.aliases && (
              <p>
                Imported {Object.keys(result.aliases).length} alias(es).
              </p>
            )}
            {result.errors && result.errors.length > 0 && (
              <div>
                <p>Parsing issues:</p>
                <ul>
                  {result.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button className="cancel" onClick={onClose} disabled={busy}>Cancel</button>
          <button
            className="confirm"
            onClick={() => onImport && onImport(text)}
            disabled={busy || !text.trim()}
          >
            {busy ? 'Importing…' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportAliasesModal;

