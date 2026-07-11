const express = require('express');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('Missing video URL');
    }

    // Ensure the link is valid before processing
    if (!ytdl.validateURL(videoUrl)) {
        return res.status(400).send('Invalid YouTube URL');
    }

    const outputFilename = `video_${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, outputFilename);

    console.log(`Downloading video via native node streamer: ${videoUrl}`);

    try {
        // Stream the video directly from YouTube to a local file
        const videoStream = ytdl(videoUrl, { quality: 'highestvideo' });
        const fileStream = fs.createWriteStream(outputPath);

        videoStream.pipe(fileStream);

        fileStream.on('finish', () => {
            console.log("Download finished! Sending to user...");
            
            res.download(outputPath, 'video.mp4', (err) => {
                if (err) console.error("Error sending file:", err);
                
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                }
            });
        });

        fileStream.on('error', (err) => {
            console.error("File stream error:", err);
            res.status(500).send('Error saving file data.');
        });

    } catch (error) {
        console.error("Stream failed:", error);
        res.status(500).send('Error processing download link.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});