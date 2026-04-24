const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

let currentTrack = null;

// получить случайный трек
app.get("/api/track", async (req, res) => {
    try {
        const random = Math.floor(Math.random() * 100);
        const url = `https://api.deezer.com/search?q=pop&index=${random}`;

        const response = await fetch(url);
        const data = await response.json();

        const track = data.data[Math.floor(Math.random() * data.data.length)];

        currentTrack = {
            title: track.title.toLowerCase(),
            artist: track.artist.name.toLowerCase(),
            preview: track.preview
        };

        res.json({
            preview: track.preview
        });

    } catch (err) {
        res.status(500).send("Error");
    }
});

// проверка ответа
app.get("/api/guess", (req, res) => {
    const guess = req.query.q.toLowerCase();

    let score = 0;

    if (guess.includes(currentTrack.title)) score += 700;
    if (guess.includes(currentTrack.artist)) score += 300;

    res.json({
        correct: score > 0,
        score,
        answer: currentTrack
    });
});

app.listen(3000, () => console.log("Server running on 3000"));
