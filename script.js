const quizContainer = document.querySelector(".quiz-container");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const scoreEl = document.getElementById("score");
const progressEl = document.getElementById("progress");
const timerProgress = document.getElementById("timerProgress");
const nextBtn = document.getElementById("nextBtn");
const leaderboardList = document.getElementById("leaderboardList");
const themeToggle = document.getElementById("themeToggle");

let questions = [];
let current = 0;
let score = 0;
let timeLeft = 10;
let timer;

/* 🌙 Theme Toggle */
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") document.body.classList.add("dark");

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
};

/* 🧠 Fetch Questions */
async function fetchQuestions() {
  const res = await fetch("https://opentdb.com/api.php?amount=5&type=multiple");
  const data = await res.json();
  questions = data.results.map(q => ({
    question: q.question,
    options: shuffle([...q.incorrect_answers, q.correct_answer]),
    answer: q.correct_answer
  }));
  loadQuestion();
}

/* ⏱ Timer */
function startTimer() {
  timeLeft = 10;
  timerProgress.style.width = "100%";

  timer = setInterval(() => {
    timeLeft--;
    timerProgress.style.width = `${(timeLeft / 10) * 100}%`;
    if (timeLeft === 0) {
      clearInterval(timer);
      lockOptions();
      nextBtn.disabled = false;
    }
  }, 1000);
}

/* 📄 Load Question */
function loadQuestion() {
  clearInterval(timer);
  optionsEl.innerHTML = "";
  nextBtn.disabled = true;

  const q = questions[current];
  questionEl.innerHTML = q.question;
  progressEl.textContent = `${current + 1} / ${questions.length}`;

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerHTML = opt;
    btn.onclick = () => selectAnswer(btn, opt);
    optionsEl.appendChild(btn);
  });

  startTimer();
}

/* ✅ Answer */
function selectAnswer(btn, opt) {
  clearInterval(timer);
  lockOptions();

  if (opt === questions[current].answer) {
    btn.classList.add("correct");
    score++;
  } else {
    btn.classList.add("wrong");
    [...optionsEl.children].find(b => b.innerHTML === questions[current].answer)
      .classList.add("correct");
  }

  scoreEl.textContent = `Score: ${score}`;
  nextBtn.disabled = false;
}

function lockOptions() {
  [...optionsEl.children].forEach(b => b.disabled = true);
}

nextBtn.onclick = () => {
  current++;
  current < questions.length ? loadQuestion() : endQuiz();
};

/* 🏆 Leaderboard */
function endQuiz() {
  saveScore(score);
  renderLeaderboard();

  quizContainer.innerHTML = `
    <h2>Finished 🎉</h2>
    <p>Score: ${score}/${questions.length}</p>
    <button onclick="location.reload()">Restart</button>
  `;
}

function saveScore(score) {
  const scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  scores.push(score);
  scores.sort((a,b) => b - a);
  localStorage.setItem("leaderboard", JSON.stringify(scores.slice(0,5)));
}

function renderLeaderboard() {
  leaderboardList.innerHTML = "";
  const scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  scores.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s} pts`;
    leaderboardList.appendChild(li);
  });
}

/* 🔀 Shuffle */
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

renderLeaderboard();
fetchQuestions();

