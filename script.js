let current = 0;
let responses = [];
let timer;
let time = 60;
let mediaRecorder;
let recordedChunks = [];

const video = document.getElementById("video");
const questionList = document.getElementById("questionList");
const answerInput = document.getElementById("answer");
const timerDisplay = document.getElementById("timer");
const submitBtn = document.getElementById("submitAnswer");

// Initialize video and microphone
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true })
  .then(stream => {
    video.srcObject = stream;
    video.play(); // Show user's face live

    // Setup MediaRecorder
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function (event) {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = saveRecording;

    // Start recording
    mediaRecorder.start();
  })
  .catch(err => {
    console.error("Camera/Mic access is required:", err);
    alert("Camera and microphone access is required to proceed.");
  });

// Display current question
function showQuestion() {
  if (current < questionBank.length) {
    questionList.innerHTML = `<li class="p-2 bg-indigo-50 rounded">${questionBank[current]}</li>`;
    startTimer();
  } else {
    finishInterview();
  }
}

// Start countdown timer
function startTimer() {
  time = 60;
  timerDisplay.textContent = `Time Left: ${time}s`;
  timer = setInterval(() => {
    time--;
    timerDisplay.textContent = `Time Left: ${time}s`;
    if (time <= 0) {
      clearInterval(timer);
      autoNext();
    }
  }, 1000);
}

// Go to next question
function autoNext() {
  responses.push(answerInput.value.trim());
  answerInput.value = '';
  current++;
  showQuestion();
}

submitBtn.addEventListener("click", () => {
  clearInterval(timer);
  autoNext();
});

// Save answers and stop video recording
function finishInterview() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop(); // triggers saveRecording()
  }

  localStorage.setItem("interviewAnswers", JSON.stringify(responses));
  localStorage.setItem("interviewQuestions", JSON.stringify(questionBank));
}

// Save recording to disk
function saveRecording() {
  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);

  // Download recording
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "interview_recording.webm";
  document.body.appendChild(a);
  a.click();

  // Cleanup
  URL.revokeObjectURL(url);

  // Redirect after download
  window.location.href = "results.html";
}

document.addEventListener("DOMContentLoaded", showQuestion);
