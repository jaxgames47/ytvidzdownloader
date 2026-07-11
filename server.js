const express = require('express');
const path = require('path');
const fs = require('fs');
const youtubedl = require('youtube-dl-exec');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('Missing video URL');
    }

    const outputFilename = `video_${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, outputFilename);

    console.log(`Starting download for: ${videoUrl}`);

    try {
        // Automatically fetches the right binary for Windows or Linux and downloads the video
        await youtubedl(videoUrl, {
            format: 'mp4',
            output: outputPath
        });

        console.log("Download successful! Sending file to browser...");

        res.download(outputPath, 'video.mp4', (err) => {
            if (err) console.error("Error sending file:", err);
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
        });

    } catch (error) {
        console.error("Download failed:", error);
        res.status(500).send('Download failed. Please try a different link.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});