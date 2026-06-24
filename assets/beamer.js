// ── beamer.js — render-only surface, driven by the control window ─────────
import { ROUND_LABELS, HOST_LINES, AMBIENT_FACTS, mmss, makeChannel, escapeHtml } from "./shared.js";

const chan = makeChannel();
let _scoreVisible = false; // tracks whether scoreboard is currently shown (for bar animation)
let _lastScreen = null;    // tracks screen changes so one-liners only reroll on entry
let _ambientTimer = null;  // rotates ambient facts

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const el = {
  body: document.body,
  roundtag: document.getElementById("b-roundtag"),
  roundpill: document.getElementById("b-roundpill"),
  roundname: document.getElementById("b-roundname"),
  startview: document.getElementById("b-startview"),
  roundintroview: document.getElementById("b-roundintroview"),
  roundintroNum: document.getElementById("b-roundintro-num"),
  roundintroTitle: document.getElementById("b-roundintro-title"),
  winnerview: document.getElementById("b-winnerview"),
  winnerName: document.getElementById("b-winner-name"),
  winnerScore: document.getElementById("b-winner-score"),
  winnerRunnerup: document.getElementById("b-winner-runnerup"),
  ambientview: document.getElementById("b-ambientview"),
  ambientFact: document.getElementById("b-ambient-fact"),
  bubbleStart: document.getElementById("b-bubble-start"),
  bubbleRound: document.getElementById("b-bubble-round"),
  bubbleWinner: document.getElementById("b-bubble-winner"),
  qview: document.getElementById("b-qview"),
  scoreview: document.getElementById("b-scoreview"),
  timer: document.getElementById("b-timer"),
  question: document.getElementById("b-question"),
  imageWrap: document.getElementById("b-image-wrap"),
  image: document.getElementById("b-image"),
  answer: document.getElementById("b-answer"),
  answerText: document.getElementById("b-answer-text"),
  scorelist: document.getElementById("b-scorelist"),
  // final view
  finalview: document.getElementById("b-finalview"),
  finalNameA: document.getElementById("b-final-name-a"),
  finalNameB: document.getElementById("b-final-name-b"),
  finalScoreA: document.getElementById("b-final-score-a"),
  finalScoreB: document.getElementById("b-final-score-b"),
  finalCounter: document.getElementById("b-final-counter"),
  finalQuestion: document.getElementById("b-final-question"),
  finalIntroNote: document.getElementById("b-final-intro-note"),
  finalAnswer: document.getElementById("b-final-answer"),
  finalAnswerText: document.getElementById("b-final-answer-text"),
};

function render(s) {
  el.body.classList.add("connected");

  // timer
  el.timer.textContent = mmss(s.timer);
  el.timer.classList.toggle("low", s.timer <= 10 && s.timer > 0);

  const sc = s.screen;
  const isStart = sc === "start";
  const isRoundIntro = sc === "round-intro";
  const isWinner = sc === "winner";
  const isFinal = sc === "final";
  const isScore = sc === "scoreboard";
  const isQuestion = sc === "question";
  const isAmbient = sc === "ambient";

  // detect a fresh screen entry (so one-liners/facts only change on entry)
  const screenChanged = sc !== _lastScreen;
  _lastScreen = sc;

  // toggle all views
  el.startview.classList.toggle("show", isStart);
  el.roundintroview.classList.toggle("show", isRoundIntro);
  el.winnerview.classList.toggle("show", isWinner);
  el.finalview.classList.toggle("show", isFinal);
  el.scoreview.classList.toggle("show", isScore);
  el.ambientview.classList.toggle("show", isAmbient);
  el.qview.style.display = isQuestion ? "grid" : "none";
  el.roundtag.style.visibility = isQuestion ? "visible" : "hidden";

  // ambient fact rotation: start when entering, stop when leaving
  if (isAmbient) {
    if (screenChanged) {
      el.ambientFact.textContent = pick(AMBIENT_FACTS);
      if (_ambientTimer) clearInterval(_ambientTimer);
      _ambientTimer = setInterval(() => {
        el.ambientFact.style.animation = "none";
        void el.ambientFact.offsetWidth; // reflow to restart animation
        el.ambientFact.textContent = pick(AMBIENT_FACTS);
        el.ambientFact.style.animation = "";
      }, 8000);
    }
    return;
  } else if (_ambientTimer) {
    clearInterval(_ambientTimer); _ambientTimer = null;
  }

  // host one-liners — reroll only when the screen is freshly entered
  if (screenChanged) {
    if (isStart) el.bubbleStart.textContent = pick(HOST_LINES.start);
    if (isRoundIntro) el.bubbleRound.textContent = pick(HOST_LINES.round);
  }

  if (isStart) return;

  if (isRoundIntro) {
    el.roundintroNum.textContent = "Round " + (s.roundIndex + 1);
    el.roundintroTitle.textContent = ROUND_LABELS[s.roundIndex] || "Round";
    return;
  }

  if (isWinner) {
    const sorted = [...(s.teams || [])].sort((a, b) => b.score - a.score);
    const top = sorted[0];
    const tied = sorted.filter((t) => top && t.score === top.score);
    if (!top) {
      el.winnerName.textContent = "—";
      el.winnerScore.textContent = "No scores yet";
      el.winnerRunnerup.textContent = "";
    } else if (tied.length > 1) {
      el.winnerName.innerHTML = `<span class="b-winner-name-grad">${tied.map((t) => escapeHtml(t.name)).join(" & ")}</span>`;
      el.winnerScore.textContent = `It's a tie at ${top.score} points!`;
      el.winnerRunnerup.textContent = "";
      if (screenChanged) el.bubbleWinner.textContent = pick(HOST_LINES.winnerTie);
    } else {
      el.winnerName.innerHTML = `<span class="b-winner-name-grad">${escapeHtml(top.name)}</span>`;
      el.winnerScore.textContent = `${top.score} points`;
      const second = sorted[1];
      el.winnerRunnerup.textContent = second ? `Runner-up: ${second.name} (${second.score})` : "";
      if (screenChanged) el.bubbleWinner.textContent = pick(HOST_LINES.winnerSolo);
    }
    return;
  }

  if (isFinal) {
    const intro = !!s.finalIntro;
    const fhost = document.getElementById("b-final-host");
    if (fhost) fhost.style.display = intro ? "block" : "none";
    el.finalNameA.textContent = s.finalTeamA || "Team A";
    el.finalNameB.textContent = s.finalTeamB || "Team B";
    el.finalScoreA.textContent = s.finalScoreA ?? 0;
    el.finalScoreB.textContent = s.finalScoreB ?? 0;
    el.finalCounter.textContent = intro ? "Get ready" : `${(s.finalIndex ?? 0) + 1} / ${s.finalTotal ?? 0}`;
    el.finalIntroNote.style.display = intro ? "block" : "none";
    el.finalQuestion.style.display = intro ? "none" : "block";
    el.finalQuestion.textContent = s.finalQuestion || "";
    el.finalAnswer.classList.toggle("show", !intro && !!s.finalRevealed);
    el.finalAnswerText.textContent = s.finalAnswer || "";
    return;
  }

  if (isScore) {
    // animate bars only when the scoreboard first appears, not on every tick
    const justOpened = !_scoreVisible;
    _scoreVisible = true;
    renderScores(s.teams, justOpened);
    return;
  }
  _scoreVisible = false;

  // question
  el.roundpill.textContent = "Round " + (s.roundIndex + 1);
  el.roundname.textContent = ROUND_LABELS[s.roundIndex] || "Round";
  el.question.textContent = s.question || "Get ready…";
  if (s.img) {
    if (el.image.getAttribute("src") !== s.img) el.image.src = s.img;
    el.qview.classList.add("has-image");
  } else {
    el.image.removeAttribute("src");
    el.qview.classList.remove("has-image");
  }
  el.answer.classList.toggle("show", !!s.revealed);
  el.answerText.textContent = s.answer || "";
}

function renderScores(teams, animate) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const lead = sorted.length ? sorted[0].score : 0;
  if (!sorted.length) {
    el.scorelist.innerHTML =
      '<p class="b-empty">Add teams in the control panel to begin.</p>';
    return;
  }
  el.scorelist.innerHTML = sorted
    .map((t, i) => {
      const pct = lead > 0 ? (t.score / lead) * 100 : 0;
      // "leading" = sharing the top score, not just rank 1 → ties look identical
      const leading = t.score > 0 && t.score === lead;
      // standard competition ranking: tied teams share the same rank number
      let rank = i + 1;
      if (i > 0 && sorted[i - 1].score === t.score) {
        rank = sorted.findIndex((x) => x.score === t.score) + 1;
      }
      const opacity = lead > 0 ? (0.45 + 0.55 * (t.score / lead)) : 0.3;
      // when animating, start at width 0 then grow to target on next frame
      const startW = animate ? 0 : pct;
      return `
        <div class="b-scorerow" style="${animate ? `animation: scoreRowIn .4s ease ${i * 0.08}s both;` : ""}">
          <span class="b-rank ${leading ? "first" : ""}">${rank}</span>
          <div class="b-barcol">
            <div class="b-bartop">
              <span class="b-teamname">${escapeHtml(t.name)}</span>
              <span class="b-scoreval ${leading ? "lead" : ""}">${t.score}</span>
            </div>
            <div class="b-bartrack">
              <div class="b-barfill" data-target="${pct}" style="width:${startW}%;opacity:${opacity}"></div>
            </div>
          </div>
        </div>`;
    })
    .join("");
  if (animate) {
    // grow bars to target width after a frame so the transition kicks in
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.scorelist.querySelectorAll(".b-barfill").forEach((bar) => {
        bar.style.width = bar.dataset.target + "%";
      });
    }));
  }
}

chan.on((msg) => {
  if (msg.type === "state") render(msg.state);
});

// ask control to send current state (in case beamer opened after control)
chan.post({ type: "request" });
