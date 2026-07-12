const express = require('express');
const path = require('path');
const ytdl = require('@distube/ytdl-core');

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
        res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
        res.setHeader('Content-Type', 'video/mp4');

        // Streams standard MP4 video containing both video and audio directly
        ytdl(videoUrl, { 
            filter: 'audioandvideo',
            quality: 'highestvideo'
        }).pipe(res);

    } catch (error) {
        console.error("Download error:", error.message);
        if (!res.headersSent) {
            res.status(500).send('Could not fetch video data.');
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});
