// ── beamer.js — render-only surface, driven by the control window ─────────
import { ROUND_LABELS, mmss, makeChannel, escapeHtml } from "./shared.js";

const chan = makeChannel();

const el = {
  body: document.body,
  roundtag: document.getElementById("b-roundtag"),
  roundpill: document.getElementById("b-roundpill"),
  roundname: document.getElementById("b-roundname"),
  startview: document.getElementById("b-startview"),
  roundintroview: document.getElementById("b-roundintroview"),
  roundintroNum: document.getElementById("b-roundintro-num"),
  roundintroTitle: document.getElementById("b-roundintro-title"),
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
  const isFinal = sc === "final";
  const isScore = sc === "scoreboard";
  const isQuestion = sc === "question";

  // toggle all views
  el.startview.classList.toggle("show", isStart);
  el.roundintroview.classList.toggle("show", isRoundIntro);
  el.finalview.classList.toggle("show", isFinal);
  el.scoreview.classList.toggle("show", isScore);
  el.qview.style.display = isQuestion ? "grid" : "none";
  el.roundtag.style.visibility = isQuestion ? "visible" : "hidden";

  if (isStart) return;

  if (isRoundIntro) {
    el.roundintroNum.textContent = "Round " + (s.roundIndex + 1);
    el.roundintroTitle.textContent = ROUND_LABELS[s.roundIndex] || "Round";
    return;
  }

  if (isFinal) {
    const intro = !!s.finalIntro;
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
    renderScores(s.teams);
    return;
  }

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

function renderScores(teams) {
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
      const first = i === 0;
      return `
        <div class="b-scorerow">
          <span class="b-rank ${first ? "first" : ""}">${i + 1}</span>
          <div class="b-barcol">
            <div class="b-bartop">
              <span class="b-teamname">${escapeHtml(t.name)}</span>
              <span class="b-scoreval ${first ? "lead" : ""}">${t.score}</span>
            </div>
            <div class="b-bartrack">
              <div class="b-barfill" style="width:${pct}%;opacity:${first ? 1 : 0.4}"></div>
            </div>
          </div>
        </div>`;
    })
    .join("");
}

chan.on((msg) => {
  if (msg.type === "state") render(msg.state);
});

// ask control to send current state (in case beamer opened after control)
chan.post({ type: "request" });
