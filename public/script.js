let audio = new Audio();
let score = 0;
let streak = 0;

async function startGame() {
    const res = await fetch("/api/track");
    const data = await res.json();

    if (!data.preview) {
        document.getElementById("result").innerText =
            "⚠️ Нет трека (попробуй ещё раз)";
        return;
    }

    audio.src = "/api/audio?url=" + encodeURIComponent(data.preview);
}

function play() {
    audio.currentTime = 0;
    audio.play();
}

async function submitGuess() {
    const guess = document.getElementById("guess").value;

    const res = await fetch(`/api/guess?q=${encodeURIComponent(guess)}`);
    const data = await res.json();

    if (data.correct) {
        score += data.score;
        streak++;
        document.getElementById("result").innerText =
            `✅ ${data.answer.title} - ${data.answer.artist}`;
    } else {
        streak = 0;
        document.getElementById("result").innerText =
            `❌ ${data.answer.title} - ${data.answer.artist}`;
    }

    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("streak").innerText = "Streak: " + streak;

    startGame();
}
