const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3086;

const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

app.post('/upload', upload.array('images'), (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).send('No files uploaded!');
    }

    const outputVideo = path.join(__dirname, 'output', 'output.mp4');
    const frameRate = 30;

    const images = files.map(file => path.join(file.destination, file.filename));
    images.sort

    ffmpeg()
        .input(images[0])
        .inputFPS(frameRate)
        .outputFPS(frameRate)
        .output(outputVideo)
        .on('end', () => {
            res.send({ message: 'Video created successfully!', videoPath: `/output/output.mp4` });
        })
        .on('error', (err) => {
            console.log(err);
            res.status(500).send('An error occurred while creating the video.');
        })
        .run();
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
