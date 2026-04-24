let score = 0;
let streak = 0;

// 🎵 загрузка трека
async function startGame() {
    try {
        const res = await fetch("/api/track");
        const data = await res.json();

        if (!data.embed) {
            document.getElementById("result").innerText =
                "⏳ Пробуем другой трек...";
            setTimeout(startGame, 1000);
            return;
        }

        document.getElementById("player").innerHTML = data.embed;
        document.getElementById("guess").value = "";

    } catch (err) {
        console.error(err);
    }
}

// 🎯 угадывание
async function submitGuess() {
    const guess = document.getElementById("guess").value;

    if (!guess) return;

    const res = await fetch(`/api/guess?q=${encodeURIComponent(guess)}`);
    const data = await res.json();

    if (data.correct) {
        score += 1000;
        streak++;
        document.getElementById("result").innerText =
            `✅ ${data.answer}`;
    } else {
        streak = 0;
        document.getElementById("result").innerText =
            `❌ ${data.answer}`;
    }

    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("streak").innerText = "Streak: " + streak;

    setTimeout(startGame, 1500);
}

// Enter = Guess
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitGuess();
});

// старт
startGame();
