import React, { useState, useEffect } from 'react';
import './hints.component.css';

const HintsComponent = ({ exerciseTitle, hints }) => {
    const [hintsExpanded, setHintsExpanded] = useState(false);
    const [seenHints, setSeenHints] = useState(new Set());
    const [nextHintIndex, setNextHintIndex] = useState(0);

    useEffect(() => {
        if (!exerciseTitle || !hints || hints.length === 0) return;

        const seenHintsSet = new Set();
        let nextIndex = 0;

        for (let i = 0; i < hints.length; i++) {
            const key = `${exerciseTitle}.hint[${i}].seen`;
            if (localStorage.getItem(key) === 'true') {
                seenHintsSet.add(i);
                nextIndex = i + 1;
            } else {
                break; // Stop at first unseen hint
            }
        }

        setSeenHints(seenHintsSet);
        setNextHintIndex(Math.min(nextIndex, hints.length));
    }, [exerciseTitle, hints]);

    const toggleHints = () => {
        setHintsExpanded(!hintsExpanded);
    };

    const showNextHint = () => {
        if (nextHintIndex < hints.length) {
            const hintIndex = nextHintIndex;
            const key = `${exerciseTitle}.hint[${hintIndex}].seen`;

            // Mark hint as seen in localStorage
            localStorage.setItem(key, 'true');

            // Update state
            setSeenHints(prev => new Set([...prev, hintIndex]));
            setNextHintIndex(prev => prev + 1);
        }
    };

    const resetHints = () => {
        if (!exerciseTitle || !hints) return;

        for (let i = 0; i < hints.length; i++) {
            const key = `${exerciseTitle}.hint[${i}].seen`;
            localStorage.removeItem(key);
        }

        // Reset state
        setSeenHints(new Set());
        setNextHintIndex(0);
    };

    const hasMoreHints = nextHintIndex < hints.length;
    const hasSeenHints = seenHints.size > 0;

    if (!hints || hints.length === 0) {
        return null;
    }

    return (
        <div className="toggle-box-container">
            <div className="toggle-box-header">
                <button
                    className="toggle-box-button"
                    onClick={toggleHints}
                >
                    <span className="toggle-icon">{hintsExpanded ? '▼' : '▶'}</span>
                    <span className="hints-title">Hints</span>
                    <span className="toggle-box-counter">({seenHints.size}/{hints.length})</span>
                </button>

                {hasSeenHints && (
                    <button className="reset-hints-btn" onClick={resetHints}>
                        Reset Hints
                    </button>
                )}
            </div>

            {hintsExpanded && (
                <div className="hints-content">
                    {hasSeenHints && (
                        <div className="seen-hints">
                            {Array.from(seenHints).sort((a, b) => a - b).map((hintIndex) => (
                                <div key={hintIndex} className="hint hint-seen">
                                    <div className="hint-header">
                                        <span className="hint-number">{hintIndex + 1}</span>
                                        <span className="hint-badge">Seen</span>
                                    </div>
                                    <div className="hint-text">{hints[hintIndex]}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="hints-actions">
                        {hasMoreHints ? (
                            <button className="show-hint-btn" onClick={showNextHint}>
                                <span className="btn-icon">💡</span>
                                Show Next Hint ({nextHintIndex + 1}/{hints.length})
                            </button>
                        ) : (
                            <div className="all-hints-seen">
                                <span className="completion-icon">✅</span>
                                All hints revealed
                            </div>
                        )}
                    </div>

                    {!hasSeenHints && (
                        <div className="hints-intro">
                            <p>Click "Show Next Hint" to reveal hints one by one. Your progress will be saved!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HintsComponent;
