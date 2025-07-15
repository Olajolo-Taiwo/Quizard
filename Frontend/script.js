const quizContent = document.getElementById("quiz-content");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const currentQuestionElem = document.getElementById("current-question");
const totalQuestionsElem = document.getElementById("total-questions");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");

let questions = [];
let currentQuestionIndex = 0;
let selectedAnswer = null;
let userAnswers = [];
let timeLeft = 900;
let timerInterval;


const BASE_URL = "https://quizard-backend-s9l2.onrender.com";

startBtn.addEventListener("click", startQuiz);

function startQuiz() {
  document.getElementById("start-screen").classList.add("hidden");
  quizContent.classList.remove("hidden");
  fetchQuestions();
  startTimer();
}

function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitQuiz("⏰ Time's up!");
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

function fetchQuestions() {
  questionText.textContent = "⏳ Loading questions...";
  fetch(`${BASE_URL}/api/questions`)
    .then((res) => res.json())
    .then((data) => {
      questions = data;
      totalQuestionsElem.textContent = questions.length;
      loadQuestion();
    })
    .catch(() => {
      questionText.innerHTML = `
        <span class="text-red-500 font-semibold">❌ Failed to load questions.</span><br>
        <span class="text-sm text-gray-500">Please check your connection or try again.</span>
      `;
    });
}

function loadQuestion() {
  const q = questions[currentQuestionIndex];
  currentQuestionElem.textContent = currentQuestionIndex + 1;
  questionText.textContent = q.question;
  optionsContainer.innerHTML = "";
  selectedAnswer = null;
  nextBtn.classList.add("hidden");

  q.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.className =
      "w-full border border-gray-300 rounded-lg py-3 px-4 text-left hover:bg-indigo-50 transition";
    btn.onclick = () => {
      selectedAnswer = option;
      highlightSelected(btn);
      nextBtn.classList.remove("hidden");
    };
    optionsContainer.appendChild(btn);
  });

  if (currentQuestionIndex === questions.length - 1) {
    nextBtn.classList.add("hidden");
    submitBtn.classList.remove("hidden");
  } else {
    submitBtn.classList.add("hidden");
  }
}

function highlightSelected(selectedBtn) {
  const buttons = optionsContainer.querySelectorAll("button");
  buttons.forEach((btn) =>
    btn.classList.remove("bg-indigo-100", "font-semibold")
  );
  selectedBtn.classList.add("bg-indigo-100", "font-semibold");
}

nextBtn.addEventListener("click", () => {
  if (selectedAnswer) {
    userAnswers.push(selectedAnswer);
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      loadQuestion();
    } else {
      submitQuiz("✅ Quiz Submitted!");
    }
  }
});

submitBtn.addEventListener("click", () => {
  if (selectedAnswer) userAnswers.push(selectedAnswer);
  submitBtn.disabled = true;
  submitQuiz("✅ Quiz Submitted!");
});

function submitQuiz(message) {
  clearInterval(timerInterval);

  document.querySelector(".grid").innerHTML = `
    <div class="text-center w-full">
      <p class="text-indigo-600 text-lg font-semibold mb-4">Submitting your quiz...</p>
    </div>
  `;

  fetch(`${BASE_URL}/api/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: userAnswers }),
  })
    .then((res) => res.json())
    .then((result) => {
      document.querySelector(".grid").innerHTML = `
        <div class="text-center w-full">
          <h2 class="text-2xl font-bold text-indigo-700 mb-4">${message}</h2>
          <p class="text-lg text-gray-700">You scored ${result.score} out of ${result.total}</p>
          <button onclick="location.reload()" class="mt-6 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition">
            🔁 Restart Quiz
          </button>
        </div>
      `;
    })
    .catch(() => {
      document.querySelector(".grid").innerHTML = `
        <div class="text-center w-full">
          <p class="text-red-600 font-semibold">❌ Failed to submit quiz. Try again later.</p>
        </div>
      `;
    });
}
