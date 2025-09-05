import React, {useEffect, useRef, useState} from 'react';
import './app.css';

function App() {
    const [sessionStatus, setSessionStatus] = useState('???');
    const [inputValue, setInputValue] = useState('');
    const [output, setOutput] = useState('');

    const iframeRef = useRef(null);
    const outputRef = useRef(null);

    // Shellinabox URL
    const url = "http://localhost:5173/shell";

    useEffect(() => {
        // Message event listener
        const handleMessage = (message) => {
            // Allow messages only from shellinabox
            // console.log("handleMessage", message);
            // if (new URL(message.origin).host !== new URL(url).host) {
            //     console.error("Message origin not allowed:", message.origin);
            //     return;
            // }

            // Handle response according to response type
            const decoded = JSON.parse(message.data);
            switch (decoded.type) {
                case "ready":
                    // Shellinabox is ready to communicate and we will enable console output
                    // by default.
                    const readyMessage = JSON.stringify({
                        type: 'output',
                        data: 'enable'
                    });
                    iframeRef.current.contentWindow.postMessage(readyMessage, url);
                    break;
                case "output":
                    // Append new output
                    setOutput(prev => prev + decoded.data);
                    break;
                case "session":
                    // Reload session status
                    setSessionStatus(decoded.data);
                    break;
            }
        };

        console.log("Adding event listener");
        window.addEventListener("message", handleMessage);

        return () => {
            console.log("Removed event listener");
            window.removeEventListener("message", handleMessage);
        };
    }, [url]);

    // Auto-scroll output to bottom when new content is added
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    const sendMessage = (type, data = null) => {
        const message = JSON.stringify({type, data});
        if (iframeRef.current && iframeRef.current.contentWindow) {
            console.log("sendMessage", message);
            iframeRef.current.contentWindow.postMessage(message, url);
        }
    };

    const handleExecute = () => {
        console.log("handleExecute");
        sendMessage('input', inputValue + '\n');
        setInputValue(''); // Clear input after execution
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleExecute();
        }
    };

    const handleOutputEnable = () => {
        sendMessage('output', 'enable');
    };

    const handleOutputDisable = () => {
        sendMessage('output', 'disable');
        setOutput(''); // Clear output window
    };

    const handleSessionReload = () => {
        sendMessage('session');
    };

    const handleSessionToggle = () => {
        sendMessage('onsessionchange', 'toggle');
    };

    const handleReconnect = () => {
        sendMessage('reconnect');
    };

    return (
        <div className="app">
            <h3>Embedded Shell In A Box example page.</h3>

            <div className="controls">
                <p>Controls:</p>
                <div className="control-buttons">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter command..."
                    />
                    <button onClick={handleExecute}>Execute</button>
                    <button onClick={handleOutputEnable}>Output Enable</button>
                    <button onClick={handleOutputDisable}>Output Disable</button>
                    <button onClick={handleReconnect}>Reconnect</button>
                    <button onClick={handleSessionReload}>Session Status</button>
                    <button onClick={handleSessionToggle}>Session Status Toggle</button>
                </div>
            </div>

            <p className="session-status">Session status: {sessionStatus}</p>

            <iframe
                ref={iframeRef}
                id="shell"
                src={url}
                className="shell-iframe"
                title="Shell In A Box Terminal"
            />

            <div className="output-section">
                <p>Terminal output:</p>
                <pre ref={outputRef} className="output">{output}</pre>
            </div>
        </div>
    );
}

export default App;
