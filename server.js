const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('/download', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('Missing video URL');
    }

    const outputFilename = `video_${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, outputFilename);

    console.log(`Starting download for: ${videoUrl}`);

    // On Render (Linux), we use the pre-compiled binary provided by the package
    // We point to the node_modules folder where ytdlp-nodejs puts the Linux binary
    const isWindows = process.platform === 'win32';
    
    let command;
    if (isWindows) {
        command = path.join(__dirname, 'yt-dlp.exe');
    } else {
        // Path to the downloaded linux binary inside the npm package
        command = path.join(__dirname, 'node_modules', 'ytdlp-nodejs', 'bin', 'yt-dlp');
        // Fallback to global if it fails
        if (!fs.existsSync(command)) {
            command = 'yt-dlp';
        }
    }

    // Use lower quality basic mp4 format directly so it doesn't require ffmpeg on Render
    const args = [
        '-f', 'mp4',
        '-o', outputPath,
        videoUrl
    ];

    const ytdlp = spawn(command, args);

    ytdlp.stderr.on('data', (data) => {
        console.log(`yt-dlp: ${data}`);
    });

    ytdlp.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputPath)) {
            res.download(outputPath, 'video.mp4', (err) => {
                if (err) console.error("Error sending file:", err);
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                }
            });
        } else {
            console.error(`yt-dlp failed with exit code ${code}`);
            res.status(500).send('Download failed.');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
