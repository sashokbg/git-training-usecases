import React, { useMemo, useState } from 'react';
import './checks.component.css';

// Renders exercise checks in a collapsible panel styled similar to Hints
const ChecksComponent = ({ checks, evaluationResult, evaluating, onEvaluate }) => {
  const [expanded, setExpanded] = useState(false);

  const { total, passed, results, names } = useMemo(() => {
    if (!evaluationResult) return { total: (checks || []).length, passed: 0, results: [], names: [] };
    const t = Number(evaluationResult.total || 0);
    const p = Number(evaluationResult.passed || 0);
    return {
      total: t,
      passed: p,
      results: Array.isArray(evaluationResult.results) ? evaluationResult.results : [],
      names: Array.isArray(evaluationResult.names) ? evaluationResult.names : []
    };
  }, [evaluationResult, checks]);

  if (!checks || checks.length === 0) {
    return null;
  }

  return (
    <div className="toggle-box-container">
      <div className="toggle-box-header">
        <button className="toggle-box-button" onClick={() => setExpanded(!expanded)}>
          <span className="toggle-icon">{expanded ? '▼' : '▶'}</span>
          <span className="checks-title">Checks</span>
          <span className="toggle-box-counter">({passed}/{total})</span>
        </button>

        <button className="run-checks-btn" onClick={() => { if (!expanded) setExpanded(true); onEvaluate && onEvaluate(); }} disabled={evaluating}>
          {evaluating ? 'Evaluating…' : 'Run Checks'}
        </button>
      </div>

      {expanded && (
        <div className="checks-content">
          {total === 0 ? (
            <div className="checks-empty">ℹ️ No automated checks defined for this exercise.</div>
          ) : (
            <div className="checks-list">
              {checks.map((check, idx) => {
                const ok = results && typeof results[idx] === 'boolean' ? results[idx] : null;
                const title = names && names[idx] ? names[idx] : (check.name || `Check ${idx + 1}`);
                return (
                  <div key={idx} className={`check ${ok === true ? 'check-pass' : ok === false ? 'check-fail' : 'check-pending'}`}>
                    <div className="check-header">
                      <span className="check-number">{idx + 1}</span>
                      <span className="check-title">{title}</span>
                      {ok === true && <span className="check-badge pass">Passed</span>}
                      {ok === false && <span className="check-badge fail">Failed</span>}
                      {ok == null && <span className="check-badge pending">Pending</span>}
                    </div>
                    {Array.isArray(check.explanation) && check.explanation.length > 0 && (
                      <div className="check-explanation">
                        {check.explanation.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChecksComponent;
