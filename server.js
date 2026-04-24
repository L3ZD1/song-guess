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
    try {
        const random = Math.floor(Math.random() * 100);
        const url = `https://api.deezer.com/search?q=pop&index=${random}`;

        const response = await fetch(url);

        // 🔥 сначала текст, потом парсим
        const text = await response.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Deezer вернул не JSON:", text);
            throw new Error("Invalid JSON from Deezer");
        }

        if (!data.data || data.data.length === 0) {
            throw new Error("No tracks found");
        }

        cache = data.data
            .filter(track => track.preview)
            .map(track => ({
                title: track.title.toLowerCase(),
                artist: track.artist.name.toLowerCase(),
                preview: track.preview
            }));

        if (cache.length === 0) {
            throw new Error("No preview tracks");
        }

    } catch (err) {
        console.error("Ошибка loadTracks:", err.message);
        cache = []; // сброс
        throw err;
    }
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
