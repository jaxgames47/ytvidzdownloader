const express = require('express');
const path = require('path');
const ytdl = require('ytdl-core-muxer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('Missing video URL');
    }

    console.log(`Streaming directly from source: ${videoUrl}`);

    try {
        // Set header options to tell the browser a file download is coming
        res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
        res.setHeader('Content-Type', 'video/mp4');

        // Stream the video directly down to the user's browser pipeline
        const videoStream = ytdl(videoUrl, { format: 'mp4' });
        
        videoStream.pipe(res);

        videoStream.on('error', (err) => {
            console.error('Streaming error:', err.message);
            if (!res.headersSent) {
                res.status(500).send('Playback or conversion error.');
            }
        });

    } catch (error) {
        console.error("Download pipeline error:", error.message);
        if (!res.headersSent) {
            res.status(500).send('Could not fetch video data. Please try another link!');
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});