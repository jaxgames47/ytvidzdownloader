const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets from the current directory
app.use(express.static(path.join(__dirname)));

// Fallback homepage route to ensure Render sees the server as active
app.get('/', (req, res) => {
    res.send('Server is up and running smoothly!');
});

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('Missing video URL');
    }

    try {
        // We use a high-reliability conversion portal designed for application pipelines
        const cleanUrl = encodeURIComponent(videoUrl);
        const processingRedirection = `https://api.cobalt.tools/api/json`;
        
        // Fetch the streaming path asynchronously from the endpoint
        const response = await fetch(processingRedirection, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                url: videoUrl,
                vQuality: '720',
                filenamePattern: 'classic'
            })
        });

        const data = await response.json();

        if (data && data.url) {
            console.log("Redirecting secure pipeline request directly to stream file");
            return res.redirect(data.url);
        } else {
            return res.status(500).send('Downloader portal is temporarily full. Retrying shortly.');
        }

    } catch (error) {
        console.error("Redirection pipeline hitch:", error.message);
        res.status(500).send('Streaming hub busy. Please try your click again!');
    }
});

app.listen(PORT, () => {
    console.log(`Server successfully listening on port ${PORT}`);
});
