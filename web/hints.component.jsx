import React, { useState, useEffect } from 'react';
import './hints.component.css';

const HintsComponent = ({ questionTitle, hints }) => {
    const [hintsExpanded, setHintsExpanded] = useState(false);
    const [seenHints, setSeenHints] = useState(new Set());
    const [nextHintIndex, setNextHintIndex] = useState(0);

    // Load seen hints from localStorage on mount and when question changes
    useEffect(() => {
        if (!questionTitle || !hints || hints.length === 0) return;

        const seenHintsSet = new Set();
        let nextIndex = 0;

        for (let i = 0; i < hints.length; i++) {
            const key = `${questionTitle}.hint[${i}].seen`;
            if (localStorage.getItem(key) === 'true') {
                seenHintsSet.add(i);
                nextIndex = i + 1;
            } else {
                break; // Stop at first unseen hint
            }
        }

        setSeenHints(seenHintsSet);
        setNextHintIndex(Math.min(nextIndex, hints.length));
    }, [questionTitle, hints]);

    const toggleHints = () => {
        setHintsExpanded(!hintsExpanded);
    };

    const showNextHint = () => {
        if (nextHintIndex < hints.length) {
            const hintIndex = nextHintIndex;
            const key = `${questionTitle}.hint[${hintIndex}].seen`;

            // Mark hint as seen in localStorage
            localStorage.setItem(key, 'true');

            // Update state
            setSeenHints(prev => new Set([...prev, hintIndex]));
            setNextHintIndex(prev => prev + 1);
        }
    };

    const resetHints = () => {
        if (!questionTitle || !hints) return;

        // Clear all hint-related localStorage entries for this question
        for (let i = 0; i < hints.length; i++) {
            const key = `${questionTitle}.hint[${i}].seen`;
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
        <div className="hints-component">
            <div className="hints-header">
                <button
                    className="hints-toggle"
                    onClick={toggleHints}
                >
                    <span className="toggle-icon">{hintsExpanded ? '▼' : '▶'}</span>
                    <span className="hints-title">Hints</span>
                    <span className="hints-counter">({seenHints.size}/{hints.length})</span>
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
