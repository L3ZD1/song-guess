import express from "express";
import cors from "cors";
import { YandexMusicClient } from "yandex-music-client";

const app = express();
app.use(cors());
app.use(express.static("public"));

const client = new YandexMusicClient();

// ❗ можно оставить без токена (иногда работает)
await client.init({
  token: "3:1777032952.5.0.1777032948021:bKOXWQ:620d.1.2:1|1762460045.-1.20002.2:4.3:1777032952.6:2131964624.7:1777032952|3:11860514.959770.zkiMOzde4WbGlQHm1vFee5_f9lY"
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
