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
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            const random = Math.floor(Math.random() * 1000);
            const url = `https://api.deezer.com/search?q=pop&index=${random}`;

            const response = await fetch(url);
            const data = await response.json();

            const tracks = data.data
                ?.filter(t => t.preview)
                ?.map(t => ({
                    title: t.title.toLowerCase(),
                    artist: t.artist.name.toLowerCase(),
                    preview: t.preview
                }));

            if (tracks && tracks.length > 0) {
                cache = tracks;
                return;
            }

        } catch (e) {
            console.log("Ошибка попытки", attempt + 1);
        }
    }

    throw new Error("Не удалось загрузить треки");
}

// 🎧 получить трек
app.get("/api/track", async (req, res) => {
    try {
        if (cache.length === 0) {
            await loadTracks();
        }

        currentTrack = cache.pop();

        if (!currentTrack?.preview) {
            throw new Error("Нет preview");
        }

        res.json({
            preview: currentTrack.preview
        });

    } catch (err) {
        console.error("TRACK FAIL:", err.message);

        // 🔥 ВАЖНО: пробуем ещё раз сразу
        try {
            await loadTracks();
            currentTrack = cache.pop();

            res.json({
                preview: currentTrack.preview
            });
        } catch {
            // 👉 только если вообще всё умерло
            res.json({
                preview: null
            });
        }
    }
});

// 🔥 ПРОКСИ АУДИО (ГЛАВНОЕ)
app.get("/api/audio", async (req, res) => {
    try {
        const url = req.query.url;

        if (!url) {
            return res.status(400).send("No URL");
        }

        const response = await fetch(url);

        if (!response.ok) {
            return res.status(500).send("Audio fetch failed");
        }

        const buffer = await response.buffer();

        res.set("Content-Type", "audio/mpeg");
        res.send(buffer);

    } catch (err) {
        console.error("Audio proxy error:", err.message);
        res.status(500).send("Audio error");
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
