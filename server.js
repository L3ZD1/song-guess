const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// 🔥 кеш треков
let cache = [];
let currentTrack = null;

// 🎵 загрузка пачки треков
async function loadTracks() {
    const random = Math.floor(Math.random() * 100);
    const url = `https://api.deezer.com/search?q=pop&index=${random}`;

    const response = await fetch(url);
    const data = await response.json();

    cache = data.data
        .filter(t => t.preview) // только с аудио
        .map(track => ({
            title: track.title.toLowerCase(),
            artist: track.artist.name.toLowerCase(),
            preview: track.preview
        }));
}

// 🎧 получить трек
app.get("/api/track", async (req, res) => {
    try {
        if (cache.length === 0) {
            await loadTracks();
        }

        currentTrack = cache.pop();

        res.json({
            preview: currentTrack.preview
        });

    } catch (err) {
        res.status(500).send("Error loading track");
    }
});

// 🧠 проверка ответа
app.get("/api/guess", (req, res) => {
    if (!currentTrack) {
        return res.json({ error: "No track loaded" });
    }

    const guess = (req.query.q || "").toLowerCase();

    let score = 0;

    if (guess.includes(currentTrack.title)) score += 700;
    if (guess.includes(currentTrack.artist)) score += 300;

    res.json({
        correct: score > 0,
        score,
        answer: currentTrack
    });
});

// 🚀 запуск
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
