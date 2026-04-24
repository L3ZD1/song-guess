let score = 0;
let streak = 0;

// 🎵 загрузка нового трека
async function startGame() {
    try {
        const res = await fetch("/api/track");
        const data = await res.json();

        if (!data.embed) {
            document.getElementById("result").innerText =
                "⚠️ Ошибка загрузки трека";
            return;
        }

        // вставляем iframe SoundCloud
        document.getElementById("player").innerHTML = data.embed;

        // очищаем поле
        document.getElementById("guess").value = "";

    } catch (err) {
        console.error(err);
        document.getElementById("result").innerText =
            "❌ Ошибка сервера";
    }
}

// 🎯 угадывание
async function submitGuess() {
    const guess = document.getElementById("guess").value;

    if (!guess) return;

    try {
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

        // новый раунд
        setTimeout(startGame, 1500);

    } catch (err) {
        console.error(err);
    }
}

// Enter = Guess
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        submitGuess();
    }
});

// автостарт
startGame();
