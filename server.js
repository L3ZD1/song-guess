const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

const JAMENDO_ID = "758b1d9d"; // 👈 вставь сюда

let cache = [];
let currentTrack = null;

// 🎵 загрузка треков
async function loadTracks() {
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_ID}&format=json&limit=20`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("No tracks");
    }

    cache = data.results.map(t => ({
        title: t.name.toLowerCase(),
        artist: t.artist_name.toLowerCase(),
        preview: t.audio // 🔥 прямой mp3
    }));
}

// 🎧 получить трек
app.get("/api/track", async (req, res) => {
    try {
        if (cache.length === 0) {
            await loadTracks();
        }

        const randomIndex = Math.floor(Math.random() * cache.length);
        currentTrack = cache.splice(randomIndex, 1)[0];

        res.json({
            preview: currentTrack.preview
        });

    } catch (err) {
        console.error(err);
        res.json({ preview: null });
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

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
