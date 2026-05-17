let score = 0;
let gameMode = "pause";
let scoreElement = document.getElementById("score");
let highScoreElement = document.getElementById("hi-score");
let timerElement = document.getElementById("timer");
let basket = document.getElementById("basket");
let gameContainer = document.querySelector(".game-container");
let gameOverScreen = document.getElementById("game-over");
let finalScore = document.getElementById("final-score");
let finalHigh = document.getElementById("final-high");
let slider = document.getElementById("slider");
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = "High Score: " + highScore;

/* CONTROL FLAGS */
let timerStarted = false;
let spawnStarted = false;
let timeLeft = 30;

/* SYNC BASKET + SLIDER TO CONTAINER WIDTH */
function initBasket() {
    let containerWidth = gameContainer.offsetWidth;
    let basketWidth = basket.offsetWidth;
    let maxLeft = containerWidth - basketWidth;
    slider.max = maxLeft;
    slider.value = Math.floor(maxLeft / 2);
    basket.style.left = slider.value + "px";
}
initBasket();
window.addEventListener("resize", initBasket);

/* START GAME */
document.getElementById("start-btn").onclick = function () {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("actions").disabled = false;
    gameMode = "play";
    startTimer();
    startSpawning();
};

/* PAUSE — disabled until game starts */
let actionsBtn = document.getElementById("actions");
actionsBtn.disabled = true;
actionsBtn.onclick = function () {
    if (gameMode === "play") {
        gameMode = "pause";
        this.innerText = "Play";
    } else if (gameMode === "pause") {
        gameMode = "play";
        this.innerText = "Pause";
    }
};

/* SLIDER */
slider.oninput = function () {
    basket.style.left = this.value + "px";
};

/* MOUSE MOVEMENT */
gameContainer.addEventListener("mousemove", function (e) {
    if (gameMode !== "play") return;
    let rect = gameContainer.getBoundingClientRect();
    let basketWidth = basket.offsetWidth;
    let containerWidth = gameContainer.offsetWidth;
    let x = e.clientX - rect.left - basketWidth / 2;
    x = Math.max(0, Math.min(x, containerWidth - basketWidth));
    basket.style.left = x + "px";
    slider.value = x;
});

/* TIMER (ONLY START ONCE) */
function startTimer() {
    if (timerStarted) return;
    timerStarted = true;
    let timer = setInterval(() => {
        if (gameMode === "pause") return;
        timeLeft--;
        timerElement.innerText = "Time: " + timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

/* SPAWN (ONLY START ONCE) */
function startSpawning() {
    if (spawnStarted) return;
    spawnStarted = true;
    setInterval(() => {
        if (gameMode === "play") {
            createObject();
        }
    }, 1000);
}

/* GAME OVER */
function endGame() {
    gameMode = "over";
    actionsBtn.disabled = true;
    finalScore.innerText = "Score: " + score;
    finalHigh.innerText = "High Score: " + highScore;
    gameOverScreen.classList.remove("hidden");
}

/* BASKET ANIMATION */
function animateBasket(type) {
    basket.style.transform = type === "good" ? "scale(1.35)" : "scale(0.75)";
    setTimeout(() => {
        basket.style.transform = "scale(1)";
    }, 200);
}

/* CREATE OBJECT */
function createObject() {
    let object = document.createElement("div");
    object.classList.add("falling-object");
    let items = [
        "img/m1.png",
        "img/m2.png",
        "img/c2.png",
        "img/h1.png"
    ];
    let isBad = Math.random() < 0.3;
    let index = isBad ? 3 : Math.floor(Math.random() * 3);
    object.dataset.type = isBad ? "bad" : "good";
    object.style.backgroundImage = `url("${items[index]}")`;

    let objectWidth = 60;
    let containerWidth = gameContainer.offsetWidth;
    object.style.left = Math.random() * (containerWidth - objectWidth) + "px";
    object.style.top = "0px";
    gameContainer.appendChild(object);

    let fall = 0;
    let containerHeight = gameContainer.offsetHeight;
    let interval = setInterval(() => {
        if (gameMode === "pause") return;
        fall += 4;
        object.style.top = fall + "px";

        let obj = object.getBoundingClientRect();
        let player = basket.getBoundingClientRect();

        if (
            obj.left < player.right &&
            obj.right > player.left &&
            obj.bottom > player.top &&
            obj.top < player.bottom
        ) {
            if (object.dataset.type === "bad") {
                score = Math.max(0, score - 1);
                animateBasket("bad");
            } else {
                score++;
                animateBasket("good");
            }
            scoreElement.innerText = "Score: " + score;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("high-score", highScore);
                highScoreElement.innerText = "High Score: " + highScore;
            }
            object.remove();
            clearInterval(interval);
        }

        if (fall > containerHeight) {
            object.remove();
            clearInterval(interval);
        }
    }, 20);
}