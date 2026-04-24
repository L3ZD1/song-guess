import express from "express";
import cors from "cors";
import { YMApi } from "ym-api-meowed";

const app = express();
app.use(cors());
app.use(express.static("public"));

const api = new YMApi();

await api.init({
  access_token: process.env.YANDEX_TOKEN,
  uid: 0
});

// 🎵 получаем трек
async function getTrack() {
  const chart = await api.getChart("world");

  const tracks = chart.tracks.results;

  const random = tracks[Math.floor(Math.random() * tracks.length)];

  const download = await api.getMp3DownloadUrl(random.id);

  if (!download) {
    throw new Error("Нет mp3");
  }

  return {
    preview: download,
    answer: random.title.toLowerCase(),
    artist: random.artists[0].name
  };
}

app.get("/song", async (req, res) => {
  try {
    const track = await getTrack();
    res.json(track);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Ошибка получения трека" });
  }
});

app.listen(3000, () => console.log("Server running"));
