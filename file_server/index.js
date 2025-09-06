const express = require('express');
const {glob} = require('glob');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

// Base directory to restrict file browsing
const BASE_DIR = "/home/learn-git/";

/**
 * GET /list?glob=<pattern>
 * Returns list of files matching glob pattern
 */
app.get('/list', async (req, res) => {
    console.log('Request for file list:', req.query);
    const userGlob = req.query.glob || '*';

    const fullGlob = path.join(BASE_DIR, userGlob);

    try {
        const files = await glob(fullGlob, {nodir: false});
        res.json(files);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

/**
 * GET /file?path=<filepath>
 * Returns file content if text, or "not supported type" if binary
 */
app.get('/file', async (req, res) => {
    console.log('Request for file:', req.query);
    const filePath = req.query.path;

    if (!filePath) {
        return res.status(400).json({error: 'path parameter is required'});
    }

    // Security check: ensure the resolved path is still within BASE_DIR
    if (!filePath.startsWith(path.resolve(BASE_DIR))) {
        return res.status(403).json({error: 'Access denied: path outside allowed directory'});
    }

    try {
        // Check if file exists and is a file (not directory)
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) {
            return res.status(400).json({error: 'Path is not a file'});
        }

        // Read first few bytes to detect if binary
        const buffer = await fs.readFile(filePath);

        // Simple binary detection: check for null bytes in first 1024 bytes
        const sampleSize = Math.min(buffer.length, 1024);
        const sample = buffer.subarray(0, sampleSize);
        const isBinary = sample.includes(0);

        if (isBinary) {
            return res.status(415).json({error: 'not supported type'});
        }

        // Return text content
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send(buffer.toString('utf8'));

    } catch (err) {
        if (err.code === 'ENOENT') {
            return res.status(404).json({error: 'File not found'});
        }
        return res.status(500).json({error: err.message});
    }
});

app.listen(PORT, () => {
    console.log(`File server running at http://localhost:${PORT}`);
});
