const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('Missing video URL');
    }

    console.log(`Processing direct stream for: ${videoUrl}`);

    try {
        // Using the ultra-stable official cobalt production API
        const apiUrl = `https://api.cobalt.tools/api/json`;
        
        const response = await axios.post(apiUrl, {
            url: videoUrl,
            vQuality: '720', // Clean 720p HD resolution
            filenamePattern: 'classic'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // The API returns a direct file URL under response.data.url or response.data.text
        if (response.data && response.data.url) {
            console.log("Success! Sending download link to user.");
            return res.redirect(response.data.url);
        } else if (response.data && response.data.text) {
            return res.status(400).send(`API Message: ${response.data.text}`);
        } else {
            throw new Error('Streaming server returned an unparseable response structure.');
        }

    } catch (error) {
        console.error("Download pipeline error:", error.message);
        // Fallback error message instead of crashing the whole server process
        res.status(500).send('Download server is currently busy. Please try again in a few moments!');
    }
});

// Catch any stray unhandled exceptions globally to force the server to stay alive
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
});

app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});
