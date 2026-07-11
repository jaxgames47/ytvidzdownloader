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

    console.log(`Processing direct stream token for: ${videoUrl}`);

    try {
        // Extract the 11-character video ID from the YouTube URL
        const match = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        const videoId = match ? match[1] : null;

        if (!videoId) {
            return res.status(400).send('Could not extract YouTube Video ID');
        }

        // Request a direct secure MP4 conversion stream
        const apiUrl = `https://co.wuk.sh/api/json`;
        
        const response = await axios.post(apiUrl, {
            url: `https://www.youtube.com/watch?v=${videoId}`,
            vQuality: '720', // Clean HD download
            filenamePattern: 'classic'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.url) {
            console.log("Success! Redirecting user straight to the file stream.");
            // Send the high-speed file straight to the browser download manager
            return res.redirect(response.data.url);
        } else {
            throw new Error('Streaming server returned empty data path');
        }

    } catch (error) {
        console.error("Pipeline breakdown:", error.message);
        res.status(500).send('Server busy. Please try another video link!');
    }
});

app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});