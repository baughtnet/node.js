const express = require('express');
const fileUpload = require('express-fileupload');
const cv = require('opencv4nodejs');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(fileUpload());
app.use(express.static('public'));

app.post('/convert', (req, res) => {
    if (!req.files || !req.files.image) {
        return res.status(400).send('No image uploaded');
    }

    const image = req.files.image;
    const outputVideoPath = 'public/output_video.mp4';
    const frameRate = 30;

    const imagesFolder = 'public/images';
    const tempImagePath = `${imagesFolder}/${image.name}`;

    image.mv(tempImagePath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        const images = fs.readdirSync(imagesFolder)
            .filter(file => file.endsWith('.png') || file.endsWith('.jpg'))
            .sort();

        if (!images.length) {
            return res.status(400).send('No images found in the specified folder.');
        }

        const firstImage = cv.imread(`${imagesFolder}/${images[0]}`);
        const { rows, cols } = firstImage.sizes;
        const videoWriter = new cv.VideoWriter(outputVideoPath, cv.VideoWriter.fourcc('mp4v'), frameRate, new cv.Size(cols, rows));

        images.forEach(imageName => {
            const img = cv.imread(`${imagesFolder}/${imageName}`);
            videoWriter.write(img);
        });

        videoWriter.release();

        res.download(outputVideoPath, 'output_video.mp4', () => {
            fs.unlinkSync(outputVideoPath); // Delete the video after it's downloaded
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
