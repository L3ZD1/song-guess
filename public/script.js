let audio = new Audio();
let score = 0;
let streak = 0;
let isPlaying = false;

// 🎵 старт игры
async function startGame() {
    const res = await fetch("/api/track");
    const data = await res.json();

    if (!data.preview) {
        document.getElementById("result").innerText =
            "⚠️ Нет трека (попробуй ещё раз)";
        return;
    }

    audio.src = data.preview;
    audio.pause();
    isPlaying = false;
    updateButton();
}

// ▶ / ⏸
function togglePlay() {
    if (!audio.src) {
        startGame();
        return;
    }

    if (isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }

    isPlaying = !isPlaying;
    updateButton();
}

function updateButton() {
    document.getElementById("playBtn").innerText =
        isPlaying ? "⏸" : "▶";
}

// 🎯 угадывание
async function submitGuess() {
    const guess = document.getElementById("guess").value;

    const res = await fetch(`/api/guess?q=${encodeURIComponent(guess)}`);
    const data = await res.json();

    if (data.correct) {
        score += data.score;
        streak++;
        document.getElementById("result").innerText =
            `✅ ${data.answer.title}\n— ${data.answer.artist}`;
    } else {
        streak = 0;
        document.getElementById("result").innerText =
            `❌ ${data.answer.title}\n— ${data.answer.artist}`;
    }

    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("streak").innerText = "Streak: " + streak;

    startGame();
}
