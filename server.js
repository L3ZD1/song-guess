const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

let currentTrack = null;

// 🎵 пул треков
let tracks = [
    "https://soundcloud.com/forss/flickermood",
    "https://soundcloud.com/odesza/say-my-name",
    "https://soundcloud.com/rlgrime/core",
    "https://soundcloud.com/porter-robinson/shelter",
    "https://soundcloud.com/flume/never-be-like-you",
    "https://soundcloud.com/kygo/firestone",
    "https://soundcloud.com/illenium/awake",
    "https://soundcloud.com/alanwalker/faded",
    "https://soundcloud.com/avicii/levels",
    "https://soundcloud.com/disclosure/latch"
];

let usedTracks = [];

// 🎯 рандом без повторов
function getRandomTrack() {
    if (tracks.length === 0) {
        tracks = [...usedTracks];
        usedTracks = [];
    }

    const index = Math.floor(Math.random() * tracks.length);
    const track = tracks.splice(index, 1)[0];
    usedTracks.push(track);

    return track;
}

// 🎧 получить трек
app.get("/api/track", async (req, res) => {
    try {
        const trackUrl = getRandomTrack();

        const oembed = await fetch(
            `https://soundcloud.com/oembed?format=json&url=${trackUrl}&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=true`
        );

        const data = await oembed.json();

        if (!data.html) throw new Error("No embed");

        currentTrack = {
            title: data.title.toLowerCase()
        };

        res.json({
            embed: data.html
        });

    } catch (err) {
        console.log("Retry...");

        try {
            const trackUrl = getRandomTrack();

            const oembed = await fetch(
                `https://soundcloud.com/oembed?format=json&url=${trackUrl}`
            );

            const data = await oembed.json();

            currentTrack = {
                title: data.title.toLowerCase()
            };

            res.json({ embed: data.html });

        } catch {
            res.json({ embed: null });
        }
    }
});

// 🧠 проверка ответа
app.get("/api/guess", (req, res) => {
    if (!currentTrack) {
        return res.json({ error: "No track" });
    }

    const guess = (req.query.q || "").toLowerCase();

    const correct = guess.includes(currentTrack.title);

    res.json({
        correct,
        answer: currentTrack.title
    });
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
