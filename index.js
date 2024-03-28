const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const Movie = require('./models/movies.model')

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())

require('./database')  
app.use(express.json());

app.get('/api/movies', async (req,res)=>{
    const movies = await Movie.find();
    res.send(movies);
})


app.post('/api/addMovie', async (req, res) => {
    try {
        const newMovie = new Movie(req.body);
        await newMovie.save();
        res.status(201).send(newMovie);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


app.get('/api/movie/:id', async (req, res) => {
    try {
        const thatMovie = await Movie.findById(req.params.id);
        if (!thatMovie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        res.json(thatMovie);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/movie/stream/:id', async (req, res) => {
    try {
        const streamMovie = await Movie.findById(req.params.id);
        if (!streamMovie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        const filePath = path.join(__dirname, streamMovie.location);
        fs.stat(filePath, (err, data) => {
            if (err) {
                console.error('Error accessing the video file:', err);
                return res.status(404).send(err);
            }

            const range = req.headers.range;
            if (!range) {
                return res.status(416).send('Please provide the Range header value');
            }

            const positions = range.replace(/bytes=/, "").split("-");
            const start = parseInt(positions[0], 10);
            const total = data.size;
            const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
            const chunksize = (end - start) + 1;

            res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${total}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": "video/mp4"
            });

            const stream = fs.createReadStream(filePath, { start, end })
                .on("open", function () {
                    stream.pipe(res);
                }).on("error", function (err) {
                    res.end(err);
                });
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});






app.listen(port, ()=>{
    console.log(`sever is running on Port ${port}`);
})