import express from "express";
import cors from "cors";
import { YandexMusicClient } from "yandex-music-client";

const app = express();
app.use(cors());
app.use(express.static("public"));

const client = new YandexMusicClient();

// ❗ можно оставить без токена (иногда работает)
await client.init({
  token: process.env.YANDEX_TOKEN
});

// 🎵 получаем трек
async function getTrack() {
  const chart = await client.chart("world");

  const tracks = chart.tracks;

  const random = tracks[Math.floor(Math.random() * tracks.length)];

  const downloadInfo = await random.getDownloadInfo();

  const url = downloadInfo[0].directLink;

  return {
    preview: url,
    answer: random.title.toLowerCase(),
    artist: random.artists[0].name,
  };
}

app.get("/song", async (req, res) => {
  try {
    const track = await getTrack();
    res.json(track);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Ошибка" });
  }
});

app.listen(3000, () => console.log("Server running"));
