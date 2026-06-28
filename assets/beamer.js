// ── beamer.js — render-only surface, driven by the control window ─────────
import { ROUND_LABELS, HOST_LINES, AMBIENT_FACTS, mmss, makeChannel, escapeHtml } from "./shared.js";

const chan = makeChannel();
let _scoreVisible = false; // tracks whether scoreboard is currently shown (for bar animation)
let _lastScreen = null;    // tracks screen changes so one-liners only reroll on entry
let _winnerMode = null;    // 'tie' | 'solo' — so the winner line matches the actual result
let _ambientTimer = null;  // rotates ambient facts

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── confetti engine (canvas, no dependencies) ─────────────────────────────
const confetti = (() => {
  const cv = document.getElementById("b-confetti");
  const ctx = cv ? cv.getContext("2d") : null;
  let parts = [], raf = null, stopAt = 0;
  const COLORS = ["#F7A823", "#FF6B4A", "#F0464B", "#FFD15C", "#fff", "#1a1a1a"];
  function resize() { if (!cv) return; cv.width = window.innerWidth; cv.height = window.innerHeight; }
  window.addEventListener("resize", resize);
  function spawn(n) {
    for (let i = 0; i < n; i++) {
      parts.push({
        x: Math.random() * cv.width,
        y: -20 - Math.random() * cv.height * 0.3,
        r: 5 + Math.random() * 7,
        c: pick(COLORS),
        vx: -2 + Math.random() * 4,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI,
        vr: -0.2 + Math.random() * 0.4,
        shape: Math.random() > 0.5 ? "rect" : "circ",
      });
    }
  }
  function frame() {
    if (!ctx) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
      if (p.shape === "rect") ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
      else { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    });
    parts = parts.filter((p) => p.y < cv.height + 30);
    // keep topping up until stopAt, then let the rest fall out
    if (Date.now() < stopAt && parts.length < 240) spawn(6);
    if (parts.length > 0 || Date.now() < stopAt) raf = requestAnimationFrame(frame);
    else { cv.classList.remove("show"); raf = null; }
  }
  return {
    burst() {
      if (!cv) return;
      resize(); cv.classList.add("show");
      stopAt = Date.now() + 3500; // emit for 3.5s, then fall out
      spawn(120);
      if (!raf) raf = requestAnimationFrame(frame);
    },
    stop() { if (cv) { stopAt = 0; parts = []; ctx && ctx.clearRect(0, 0, cv.width, cv.height); cv.classList.remove("show"); } },
  };
})();

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
  songview: document.getElementById("b-songview"),
  equalizer: document.getElementById("b-equalizer"),
  songCounter: document.getElementById("b-song-counter"),
  songReveal: document.getElementById("b-song-reveal"),
  songTitle: document.getElementById("b-song-title"),
  songArtist: document.getElementById("b-song-artist"),
  songLink: document.getElementById("b-song-link"),
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

  // a question can be a "guess the song" item (has audio)
  const isSong = isQuestion && !!s.isSong;

  // toggle all views
  el.startview.classList.toggle("show", isStart);
  el.roundintroview.classList.toggle("show", isRoundIntro);
  el.winnerview.classList.toggle("show", isWinner);
  el.finalview.classList.toggle("show", isFinal);
  el.scoreview.classList.toggle("show", isScore);
  el.ambientview.classList.toggle("show", isAmbient);
  el.songview.classList.toggle("show", isSong);
  el.qview.style.display = (isQuestion && !isSong) ? "grid" : "none";
  el.roundtag.style.visibility = (isQuestion && !isSong) ? "visible" : "hidden";

  // guess the song (a question with audio) → show equalizer view
  if (isSong) {
    el.songCounter.textContent = s.songPlaying ? "♪ Now playing…" : "Listen carefully";
    el.equalizer.classList.toggle("playing", !!s.songPlaying);
    el.songReveal.classList.toggle("show", !!s.revealed);
    const parts = (s.answer || "").split(" — ");
    el.songTitle.textContent = parts[0] || "";
    el.songArtist.textContent = parts[1] || "";
    if (s.songLink) { el.songLink.textContent = "▸ Listen on Apple Music"; el.songLink.href = s.songLink; }
    else el.songLink.textContent = "";
    return;
  }

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

  // confetti on winner entry (only when there's an actual winner)
  if (isWinner && screenChanged) {
    const hasWinner = s.finalPlayed || (s.teams || []).some((t) => t.score > 0);
    if (hasWinner) confetti.burst();
  }
  if (!isWinner) confetti.stop();

  if (isWinner) {
    if (s.finalPlayed) {
      // winner decided by the final showdown (independent 0:0 scoring)
      const a = { name: s.finalTeamA || "Team A", score: s.finalScoreA || 0 };
      const bb = { name: s.finalTeamB || "Team B", score: s.finalScoreB || 0 };
      const hi = a.score >= bb.score ? a : bb;
      const lo = a.score >= bb.score ? bb : a;
      if (a.score === bb.score) {
        el.winnerName.innerHTML = `<span class="b-winner-name-grad">${escapeHtml(a.name)} & ${escapeHtml(bb.name)}</span>`;
        el.winnerScore.textContent = `It's a tie at ${a.score} in the final!`;
        el.winnerRunnerup.textContent = "";
        if (_winnerMode !== "tie") { el.bubbleWinner.textContent = pick(HOST_LINES.winnerTie); _winnerMode = "tie"; }
      } else {
        el.winnerName.innerHTML = `<span class="b-winner-name-grad">${escapeHtml(hi.name)}</span>`;
        el.winnerScore.textContent = `Final won ${hi.score}–${lo.score}`;
        el.winnerRunnerup.textContent = `Runner-up: ${lo.name}`;
        if (_winnerMode !== "solo") { el.bubbleWinner.textContent = pick(HOST_LINES.winnerSolo); _winnerMode = "solo"; }
      }
      return;
    }
    // fallback: no final played → overall points decide
    const sorted = [...(s.teams || [])].sort((a, b) => b.score - a.score);
    const top = sorted[0];
    const tiedTeams = top && top.score > 0 ? sorted.filter((t) => t.score === top.score) : [];
    const isTie = tiedTeams.length > 1;
    if (!top || top.score === 0) {
      el.winnerName.textContent = "—";
      el.winnerScore.textContent = "No scores yet";
      el.winnerRunnerup.textContent = "";
      el.bubbleWinner.textContent = "";
    } else if (isTie) {
      el.winnerName.innerHTML = `<span class="b-winner-name-grad">${tiedTeams.map((t) => escapeHtml(t.name)).join(" & ")}</span>`;
      el.winnerScore.textContent = `It's a tie at ${top.score} points!`;
      el.winnerRunnerup.textContent = "";
      if (_winnerMode !== "tie") { el.bubbleWinner.textContent = pick(HOST_LINES.winnerTie); _winnerMode = "tie"; }
    } else {
      el.winnerName.innerHTML = `<span class="b-winner-name-grad">${escapeHtml(top.name)}</span>`;
      el.winnerScore.textContent = `${top.score} points`;
      const second = sorted[1];
      el.winnerRunnerup.textContent = second ? `Runner-up: ${second.name} (${second.score})` : "";
      if (_winnerMode !== "solo") { el.bubbleWinner.textContent = pick(HOST_LINES.winnerSolo); _winnerMode = "solo"; }
    }
    return;
  }
  if (sc !== "winner") _winnerMode = null;

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

  // FLIP: record current positions of existing rows (by team id) before re-render
  const firstPos = {};
  if (!animate) {
    el.scorelist.querySelectorAll(".b-scorerow[data-id]").forEach((row) => {
      firstPos[row.dataset.id] = row.getBoundingClientRect().top;
    });
  }

  el.scorelist.innerHTML = sorted
    .map((t, i) => {
      const pct = lead > 0 ? (t.score / lead) * 100 : 0;
      const leading = t.score > 0 && t.score === lead;
      let rank = i + 1;
      if (i > 0 && sorted[i - 1].score === t.score) {
        rank = sorted.findIndex((x) => x.score === t.score) + 1;
      }
      const opacity = lead > 0 ? (0.45 + 0.55 * (t.score / lead)) : 0.3;
      const startW = animate ? 0 : pct;
      return `
        <div class="b-scorerow" data-id="${t.id}" style="${animate ? `animation: scoreRowIn .4s ease ${i * 0.08}s both;` : ""}">
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
    // first open: grow bars from 0 to target
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.scorelist.querySelectorAll(".b-barfill").forEach((bar) => {
        bar.style.width = bar.dataset.target + "%";
      });
    }));
  } else {
    // FLIP: animate rows sliding from their old position to the new one
    el.scorelist.querySelectorAll(".b-scorerow[data-id]").forEach((row) => {
      const last = row.getBoundingClientRect().top;
      const first = firstPos[row.dataset.id];
      if (first !== undefined && Math.abs(first - last) > 1) {
        const dy = first - last;
        row.style.transform = `translateY(${dy}px)`;
        row.style.transition = "none";
        requestAnimationFrame(() => requestAnimationFrame(() => {
          row.style.transition = "transform .55s cubic-bezier(.2,.8,.25,1)";
          row.style.transform = "";
        }));
      }
    });
  }
}

chan.on((msg) => {
  if (msg.type === "state") render(msg.state);
});

// ask control to send current state (in case beamer opened after control)
chan.post({ type: "request" });
