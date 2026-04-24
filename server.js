import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors());
app.use(express.static("public"));

const CLIENT_ID = "0871521a6b39443ab4a6a96587f8ac8f";
const CLIENT_SECRET = "ec4810ef2060429a85bd695f48d3fb69";

let accessToken = "";

async function getToken() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization":
        "Basic " +
        Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  accessToken = data.access_token;
}

async function getTrack() {
  const res = await fetch(
    "https://api.spotify.com/v1/search?q=year:2020&type=track&limit=50",
    {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );

  const data = await res.json();
  const tracks = data.tracks.items;

  // фильтр чтобы был preview
  const valid = tracks.filter((t) => t.preview_url);

  const random = valid[Math.floor(Math.random() * valid.length)];

  return {
    preview: random.preview_url,
    answer: random.name.toLowerCase(),
    artist: random.artists[0].name,
  };
}

app.get("/song", async (req, res) => {
  if (!accessToken) await getToken();

  const track = await getTrack();
  res.json(track);
});

app.listen(3000, () => console.log("🔥 Server running on http://localhost:3000"));