const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname)));

app.get('/download', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('Missing video URL');
    }

    // Tell the browser to treat this stream as an attachment download named video.mp4
    res.header('Content-Disposition', 'attachment; filename="video.mp4"');
    res.header('Content-Type', 'video/mp4');

    // FIX: Force it to grab a single, pre-merged format ('b') that has both video and audio built in
    const ytdlp = spawn(path.join(__dirname, 'yt-dlp.exe'), [
        '-f', 'b[ext=mp4]', 
        '-o', '-', 
        videoUrl
    ]);

    // Send the stream straight to the browser response window
    ytdlp.stdout.pipe(res);

    ytdlp.stderr.on('data', (data) => {
        console.error(`yt-dlp log: ${data}`);
    });

    ytdlp.on('close', (code) => {
        if (code !== 0) {
            console.log(`yt-dlp process exited with code ${code}`);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});