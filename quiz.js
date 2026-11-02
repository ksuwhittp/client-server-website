"use strict";
// Quiz answers and explanations are stored here instead of scattered across the code.
const questions = [
  { type: "text", answers: ["client"], explanation: "Client" },
  { type: "radio", answers: ["HTTP"], explanation: "HTTP" },
  { type: "radio", answers: ["Presentation tier"], explanation: "Presentation tier" },
  { type: "check", answers: ["It uses TLS to protect data in transit.", "It provides encryption for web traffic.", "It is commonly used for secure web connections."], explanation: "HTTPS uses TLS to encrypt web traffic, but does not guarantee a harmless website." },
  { type: "text", answers: ["dns"], explanation: "DNS (Domain Name System)" },
  { type: "radio", answers: ["404"], explanation: "404 Not Found" },
  { type: "radio", answers: ["Data"], explanation: "Data tier" },
  { type: "radio", answers: ["Send a request for a resource"], explanation: "Send a request for a resource" },
  { type: "text", answers: ["get"], explanation: "GET" },
  { type: "radio", answers: ["A system that responds to client requests"], explanation: "A system that responds to client requests" }
];
const durationSeconds = 600;
const quizForm = document.getElementById("quiz-form");
const timerElement = document.getElementById("timer");
const results = document.getElementById("results");
const submitButton = document.getElementById("submit-quiz");
let startTime;
let timerInterval;
let finished = false;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return String(minutes).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
}

// Performance.now is monotonic, so moving the clock on the computer does not affect timing.
function elapsedSeconds() {
  return Math.min(durationSeconds, Math.floor((performance.now() - startTime) / 1000));
}
function updateTimer() {
  if (finished) return;
  const remaining = Math.max(0, durationSeconds - elapsedSeconds());
  timerElement.textContent = formatTime(remaining);
  timerElement.classList.toggle("timer-warning", remaining <= 60);
  if (remaining === 0) gradeQuiz(true);
}
function startQuiz() {
  clearInterval(timerInterval);
  startTime = performance.now();
  finished = false;
  timerElement.classList.remove("timer-warning");
  updateTimer();
  timerInterval = setInterval(updateTimer, 250);
}

function getResponse(index, type) {
  const name = "q" + (index + 1);
  if (type === "text") return [document.getElementById(name).value.trim().toLowerCase().replace(/\s+/g, " ")];
  return Array.from(quizForm.querySelectorAll('input[name="' + name + '"]:checked')).map(input => input.value);
}
function isCorrect(response, question) {
  return response.length === question.answers.length && question.answers.every(answer => response.includes(question.type === "text" ? answer.toLowerCase() : answer));
}
function gradeQuiz(timedOut = false) {
  if (finished) return;
  const timeSpent = elapsedSeconds();
  finished = true;
  clearInterval(timerInterval);
  timerElement.textContent = formatTime(Math.max(0, durationSeconds - timeSpent));
  let score = 0;
  questions.forEach((question, index) => {
    const response = getResponse(index, question.type);
    const correct = isCorrect(response, question);
    if (correct) score += 1;
    const fieldset = document.getElementById("question-" + (index + 1));
    const feedback = document.getElementById("feedback-" + (index + 1));
    fieldset.classList.add(correct ? "answer-correct" : "answer-incorrect");
    feedback.hidden = false;
    feedback.textContent = (correct ? "Correct! " : "Incorrect. ") + "Answer: " + question.explanation;
  });
  quizForm.querySelectorAll("input").forEach(input => input.disabled = true);
  submitButton.disabled = true;
  const passed = score >= 7;
  results.hidden = false;
  results.classList.toggle("result-pass", passed);
  results.classList.toggle("result-fail", !passed);
  document.getElementById("result-title").textContent = (passed ? "PASS" : "FAIL") + (timedOut ? " — Time is up!" : " — Quiz complete!");
  document.getElementById("result-score").textContent = "Total score: " + score + "/10 (" + (score * 10) + "%). " + (passed ? "You passed!" : "You need 7 correct answers to pass.");
  document.getElementById("result-time").textContent = "Time spent: " + formatTime(timeSpent) + " / 10:00";
  results.focus();
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}
quizForm.addEventListener("submit", event => {
  event.preventDefault();
  updateTimer();
  if (!finished) gradeQuiz(false);
});
document.getElementById("reset-quiz").addEventListener("click", () => {
  quizForm.reset();
  quizForm.querySelectorAll("input").forEach(input => input.disabled = false);
  submitButton.disabled = false;
  results.hidden = true;
  results.classList.remove("result-pass", "result-fail");
  questions.forEach((question, index) => {
    document.getElementById("question-" + (index + 1)).classList.remove("answer-correct", "answer-incorrect");
    const feedback = document.getElementById("feedback-" + (index + 1));
    feedback.hidden = true;
    feedback.textContent = "";
  });
  startQuiz();
  document.querySelector(".quiz-toolbar").scrollIntoView({ behavior: "smooth" });
});
startQuiz();
