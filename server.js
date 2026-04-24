import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

let accessToken = "";

// 🔑 получаем токен Spotify
async function getToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  accessToken = data.access_token;
}

// 🎵 получаем случайный трек
async function getTrack() {
  const res = await fetch(
    "https://api.spotify.com/v1/search?q=pop&type=track&limit=50",
    {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );

  const data = await res.json();

  if (!data.tracks || !data.tracks.items) {
    throw new Error("Spotify не вернул треки");
  }

  const tracks = data.tracks.items;

  // фильтр только с превью
  const valid = tracks.filter((t) => t.preview_url);

  if (valid.length === 0) {
    throw new Error("Нет треков с preview");
  }

  const random = valid[Math.floor(Math.random() * valid.length)];

  return {
    preview: random.preview_url,
    answer: random.name?.toLowerCase() || "unknown",
    artist: random.artists?.[0]?.name || "unknown",
  };
}

// 🌐 API
app.get("/song", async (req, res) => {
  try {
    if (!accessToken) await getToken();

    const track = await getTrack();
    res.json(track);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка получения трека" });
  }
});

// 🚀 запуск
app.listen(3000, () => {
  console.log("🔥 Server running on http://localhost:3000");
});
