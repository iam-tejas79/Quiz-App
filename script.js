// ---------- Questions ----------
const QUESTIONS = {
  html: [
    { q: "What does HTML stand for?", opts: ["Hyper Text Markup Language","HighText Machine Language","Hyper Tool Multi Language","None"], a: "Hyper Text Markup Language" },
    { q: "Which tag inserts a line break?", opts: ["<lb>","<br>","<break>","<line>"], a: "<br>" },
    { q: "Tag used to create a hyperlink:", opts: ["<a>","<link>","<href>","<hyper>"], a: "<a>" },
    { q: "Attribute for image source:", opts: ["src","href","link","alt"], a: "src" },
    { q: "Tag for a table row:", opts: ["<tr>","<td>","<th>","<row>"], a: "<tr>" }
  ],
  css: [
    { q: "Property to change text color:", opts: ["color","text-color","font-color","background"], a: "color" },
    { q: "Property for text size:", opts: ["font-size","text-style","text-size","size"], a: "font-size" },
    { q: "Symbol used for IDs:", opts: [".","#","*","&"], a: "#" },
    { q: "Property to make text bold:", opts: ["font-weight","text-bold","weight","bold"], a: "font-weight" },
    { q: "Property to change background color:", opts: ["color","background-color","bgcolor","background-style"], a: "background-color" }
  ],
  js: [
    { q: "Keyword(s) to declare a variable:", opts: ["var","let","const","All of the above"], a: "All of the above" },
    { q: "Single-line comment symbol:", opts: ["//","/*","<!--","#"], a: "//" },
    { q: "Print to console:", opts: ["console.log()","print()","echo()","log.console()"], a: "console.log()" },
    { q: "Strict equality operator:", opts: ["==","===","!=", "="], a: "===" },
    { q: "Convert string to integer:", opts: ["parseInt()","toInt()","Number()","convert()"], a: "parseInt()" }
  ]
};

// ---------- State ----------
let selectedSubject = null;
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let answered = false;
let timerId = null;
let timeLeft = 15;

// ---------- DOM ----------
const subjectScreen = document.getElementById("subject-screen");
const quizScreen     = document.getElementById("quiz-screen");
const scoreScreen    = document.getElementById("score-screen");

const quizTitle   = document.getElementById("quiz-title");
const questionEl  = document.getElementById("question-text");
const optionsEl   = document.getElementById("options");
const nextBtn     = document.getElementById("next-btn");
const timeSpan    = document.getElementById("time");

const scoreEl     = document.getElementById("score");
const usernameInp = document.getElementById("username");
const saveBtn     = document.getElementById("save-score-btn");
const restartBtn  = document.getElementById("restart-btn");

// ---------- Subject selection ----------
document.querySelectorAll(".subject-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedSubject = btn.dataset.subject; // 'html' | 'css' | 'js'
    currentQuestions = [...QUESTIONS[selectedSubject]]; // clone
    // Optional: shuffle questions & options for freshness
    shuffle(currentQuestions);
    currentQuestions = currentQuestions.slice(0, 5);
    currentQuestions.forEach(q => shuffle(q.opts));

    startQuiz();
  });
});

// ---------- Quiz flow ----------
function startQuiz(){
  subjectScreen.classList.remove("active");
  quizScreen.classList.add("active");

  currentIndex = 0;
  score = 0;
  nextBtn.disabled = true;
  showQuestion();
}

function showQuestion(){
  clearTimer();
  answered = false;
  nextBtn.disabled = true;
  timeLeft = 15;
  timeSpan.textContent = timeLeft;

  const q = currentQuestions[currentIndex];
  quizTitle.textContent = `Quiz • ${subjectLabel(selectedSubject)} (${currentIndex+1}/${currentQuestions.length})`;
  questionEl.textContent = q.q;

  optionsEl.innerHTML = "";
  q.opts.forEach(opt => {
    const b = document.createElement("button");
    b.className = "option-btn";
    b.textContent = opt;
    b.addEventListener("click", () => handleAnswer(b, opt, q.a));
    optionsEl.appendChild(b);
  });

  startTimer();
}

function handleAnswer(btn, selected, correct){
  if (answered) return; // prevent double
  answered = true;

  // mark correct/wrong
  const optionButtons = [...optionsEl.querySelectorAll(".option-btn")];
  optionButtons.forEach(ob => {
    ob.disabled = true;
    if (ob.textContent === correct) ob.classList.add("correct");
  });
  if (selected !== correct) btn.classList.add("wrong");

  if (selected === correct) score++;

  // allow next
  nextBtn.disabled = false;
  clearTimer();
}

nextBtn.addEventListener("click", () => {
  // If user hit Next without answering and timer still running, reveal first:
  if (!answered && timerId){
    revealCorrect();
    nextBtn.disabled = false;
    answered = true;
    clearTimer();
    return;
  }

  currentIndex++;
  if (currentIndex < currentQuestions.length){
    showQuestion();
  } else {
    endQuiz();
  }
});

// ---------- Timer ----------
function startTimer(){
  timerId = setInterval(() => {
    timeLeft--;
    timeSpan.textContent = timeLeft;
    if (timeLeft <= 0){
      clearTimer();
      revealCorrect();
      answered = true;
      nextBtn.disabled = false;
    }
  }, 1000);
}
function clearTimer(){
  if (timerId){ clearInterval(timerId); timerId = null; }
}
function revealCorrect(){
  const q = currentQuestions[currentIndex];
  const optionButtons = [...optionsEl.querySelectorAll(".option-btn")];
  optionButtons.forEach(ob => {
    ob.disabled = true;
    if (ob.textContent === q.a) ob.classList.add("correct");
  });
}

// ---------- End / Save / Restart ----------
function endQuiz(){
  quizScreen.classList.remove("active");
  scoreScreen.classList.add("active");
  scoreEl.textContent = `${score}/${currentQuestions.length}`;
}

saveBtn.addEventListener("click", () => {
  const name = (usernameInp.value || "").trim();
  if (!name) { usernameInp.focus(); return; }

  const entry = {
    name,
    subject: selectedSubject,
    score,
    total: currentQuestions.length,
    ts: Date.now()
  };

  const key = "quizLeaderboard";
  const list = JSON.parse(localStorage.getItem(key)) || [];
  list.push(entry);
  // Sort by score desc, then most recent
  list.sort((a,b) => (b.score - a.score) || (b.ts - a.ts));
  localStorage.setItem(key, JSON.stringify(list));

  // go to leaderboard
  window.location.href = "leaderboard.html";
});

restartBtn.addEventListener("click", () => {
  scoreScreen.classList.remove("active");
  subjectScreen.classList.add("active");
  // reset inputs
  usernameInp.value = "";
});

// ---------- Helpers ----------
function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function subjectLabel(s){
  if (s === "html") return "HTML";
  if (s === "css") return "CSS";
  return "JavaScript";
}
