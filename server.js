const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

let cache = [];
let currentTrack = null;

// 🎵 загрузка треков
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

    if (!data.data || data.data.length === 0) {
        throw new Error("No tracks found");
    }

    cache = data.data
        .filter(t => t.preview) // только с аудио
        .map(t => ({
            title: t.title.toLowerCase(),
            artist: t.artist.name.toLowerCase(),
            preview: t.preview
        }));

    if (cache.length === 0) {
        throw new Error("No preview tracks");
    }
}

// 🎧 получить трек (с retry)
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
        console.log("Ошибка, пробуем ещё раз:", err.message);

        try {
            // 🔥 retry
            await loadTracks();
            currentTrack = cache.pop();

            if (!currentTrack || !currentTrack.preview) {
                throw new Error("Retry failed");
            }

            res.json({
                preview: currentTrack.preview
            });

        } catch (err2) {
            console.error("Полный провал:", err2.message);
            res.status(500).json({ error: "No tracks available" });
        }
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
    console.log("Server running on port", PORT);
});
