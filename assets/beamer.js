// ── beamer.js — render-only surface, driven by the control window ─────────
import { ROUND_LABELS, mmss, makeChannel, escapeHtml } from "./shared.js";

const chan = makeChannel();

const el = {
  body: document.body,
  roundtag: document.getElementById("b-roundtag"),
  roundpill: document.getElementById("b-roundpill"),
  roundname: document.getElementById("b-roundname"),
  qview: document.getElementById("b-qview"),
  scoreview: document.getElementById("b-scoreview"),
  timer: document.getElementById("b-timer"),
  question: document.getElementById("b-question"),
  answer: document.getElementById("b-answer"),
  answerText: document.getElementById("b-answer-text"),
  scorelist: document.getElementById("b-scorelist"),
};

function render(s) {
  el.body.classList.add("connected");

  // timer
  el.timer.textContent = mmss(s.timer);
  el.timer.classList.toggle("low", s.timer <= 10 && s.timer > 0);

  if (s.screen === "scoreboard") {
    el.qview.style.display = "none";
    el.scoreview.classList.add("show");
    el.roundtag.style.visibility = "hidden";
    renderScores(s.teams);
  } else {
    el.qview.style.display = "grid";
    el.scoreview.classList.remove("show");
    el.roundtag.style.visibility = "visible";
    el.roundpill.textContent = "Round " + (s.roundIndex + 1);
    el.roundname.textContent = ROUND_LABELS[s.roundIndex] || "Round";
    el.question.textContent = s.question || "Get ready…";
    el.answer.classList.toggle("show", !!s.revealed);
    el.answerText.textContent = s.answer || "";
  }
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
