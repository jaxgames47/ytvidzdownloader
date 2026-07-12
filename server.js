const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

// This line fixes Render's health check so it goes green
app.get('/', (req, res) => {
    res.send('Server active');
});

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send('Missing video URL');

    try {
        const response = await fetch('https://api.cobalt.tools/api/json', {
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
            return res.redirect(data.url);
        } else {
            return res.status(500).send('API busy, try again.');
        }
    } catch (error) {
        res.status(500).send('Error connecting to download portal.');
    }
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
