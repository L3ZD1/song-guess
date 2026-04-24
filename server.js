const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

let cache = [];
let currentTrack = null;

// 🔥 надёжная загрузка
async function loadTracks() {
    const random = Math.floor(Math.random() * 1000);

    const url = `https://api.deezer.com/search?q=pop&index=${random}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Deezer request failed");
    }

    const text = await response.text();

    let data;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error("Invalid JSON from Deezer");
    }

    if (!data.data) {
        throw new Error("No data field");
    }

    cache = data.data
        .filter(t => t.preview)
        .map(t => ({
            title: t.title.toLowerCase(),
            artist: t.artist.name.toLowerCase(),
            preview: t.preview
        }));

    if (cache.length === 0) {
        throw new Error("No preview tracks");
    }
}

// 🎵 получить трек
app.get("/api/track", async (req, res) => {
    try {
        if (cache.length === 0) {
            await loadTracks();
        }

        currentTrack = cache.pop();

        if (!currentTrack || !currentTrack.preview) {
            throw new Error("Invalid track");
        }

        res.json({
            preview: currentTrack.preview
        });

    } catch (err) {
        console.error("TRACK ERROR:", err.message);

        // 🔥 fallback (чтобы игра не ломалась)
        res.json({
            preview: "https://cdns-preview-1.dzcdn.net/stream/c-1.mp3"
        });
    }
});

// 🧠 проверка
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
