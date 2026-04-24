const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

let currentTrack = null;

// 🔥 список треков (можешь расширить)
const tracks = [
    "https://soundcloud.com/forss/flickermood",
    "https://soundcloud.com/odesza/say-my-name",
    "https://soundcloud.com/rlgrime/core",
    "https://soundcloud.com/porter-robinson/shelter",
    "https://soundcloud.com/flume/never-be-like-you"
];

// 🎧 получить трек
app.get("/api/track", async (req, res) => {
    try {
        const random = Math.floor(Math.random() * tracks.length);
        const trackUrl = tracks[random];

        const oembed = await fetch(
            `https://soundcloud.com/oembed?format=json&url=${trackUrl}`
        );

        const data = await oembed.json();

        currentTrack = {
            title: data.title.toLowerCase()
        };

        res.json({
            embed: data.html,
            answer: data.title
        });

    } catch (err) {
        console.error(err);
        res.json({ embed: null });
    }
});

// 🧠 проверка
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
    console.log("Server running");
});
