// ── control.js — moderator surface ────────────────────────────────────────
import {
  ROUND_LABELS, FINAL_QUESTIONS, POINTS_PER_CORRECT, uid, mmss, makeChannel,
  loadQuestions, saveQuestions, loadTeams, saveTeams, escapeHtml,
} from "./shared.js";

const chan = makeChannel();

// ── state ──
let questions = loadQuestions();
let teams = loadTeams();
let qIndex = 0;
let roundIndex = questions[0] ? questions[0].round : 0;
const DEFAULT_TIMER = 45; // seconds per question
let timer = DEFAULT_TIMER;
let timerId = null;
let running = false;
let revealed = false;
let screen = "question"; // "question" | "scoreboard" | "final"
let mainStage = "start"; // "start" | "round-intro" | "question" — within the non-final flow
let introRound = 0; // which round the round-intro is showing
let overrideQ = "";
let overrideA = "";

// ── final-round state ──
let finalIndex = -1; // -1 = intro screen (no question yet)
let finalRevealed = false;
let finalTeams = [null, null]; // ids of the two finalists
let finalScores = [0, 0];      // independent final scores (the final is its own showdown, 0:0 start)

// ── guess-the-song state (songs are normal questions with an `audio` field) ──
let songPlaying = false;

// ── dom ──
const $ = (id) => document.getElementById(id);
const cur = () => questions[qIndex] || { q: "", a: "", round: 0 };
const activeQ = () => (overrideQ.trim() ? overrideQ : cur().q);
const activeA = () => (overrideQ.trim() ? overrideA : cur().a);
const activeImg = () => (overrideQ.trim() ? "" : (cur().img || ""));
const finalTeamName = (i) => {
  const t = teams.find((x) => x.id === finalTeams[i]);
  return t ? t.name : `Team ${i + 1}`;
};

function snapshot() {
  if (screen === "final") {
    const intro = finalIndex < 0;
    const fq = intro ? { q: "", a: "" } : (FINAL_QUESTIONS[finalIndex] || { q: "", a: "" });
    return {
      screen: "final", timer, finalIntro: intro,
      finalQuestion: fq.q, finalAnswer: fq.a, finalRevealed,
      finalIndex, finalTotal: FINAL_QUESTIONS.length,
      finalTeamA: finalTeamName(0), finalTeamB: finalTeamName(1),
      finalScoreA: finalScores[0], finalScoreB: finalScores[1],
    };
  }
  if (screen === "scoreboard") {
    return { screen: "scoreboard", teams, timer, roundIndex };
  }
  if (screen === "winner") {
    // if a final was played (someone scored), the winner is decided by the final showdown
    const finalPlayed = finalScores[0] > 0 || finalScores[1] > 0;
    return {
      screen: "winner", teams, timer,
      finalPlayed,
      finalTeamA: finalTeamName(0), finalTeamB: finalTeamName(1),
      finalScoreA: finalScores[0], finalScoreB: finalScores[1],
    };
  }
  if (screen === "ambient") {
    return { screen: "ambient", timer };
  }
  // question flow: start / round-intro / question
  if (mainStage === "start") {
    return { screen: "start", timer };
  }
  if (mainStage === "round-intro") {
    return { screen: "round-intro", timer, roundIndex: introRound };
  }
  const cq = cur();
  return {
    screen: "question", teams, question: activeQ(), answer: activeA(), img: activeImg(),
    roundIndex, timer, revealed,
    isSong: !!cq.audio,          // this question is a "guess the song" item
    songPlaying,                  // whether audio is currently playing
    songLink: cq.trackUrl || "",  // apple music link, shown on reveal
  };
}
function broadcast() { chan.post({ type: "state", state: snapshot() }); }

// ── render control UI ──
function renderRoundChips() {
  $("round-chips").innerHTML = ROUND_LABELS
    .map((r, i) => `<button class="chip ${i === roundIndex ? "on" : ""}" data-round="${i}" title="${escapeHtml(r)}">${i + 1}</button>`)
    .join("");
  $("round-name").textContent = ROUND_LABELS[roundIndex] || "Round";
}
function renderPresets() {
  $("presets").innerHTML = [30, 45, 60, 90, 120]
    .map((s) => `<button class="preset" data-sec="${s}">${s}s</button>`)
    .join("");
}
function renderCurrent() {
  const btn = $("btn-reveal");
  const playBtn = $("song-play");
  if (screen === "question" && mainStage === "start") {
    $("q-count").textContent = "Start";
    $("cur-q").textContent = "— start screen — press Next › to begin";
    $("cur-a").textContent = "—";
    btn.disabled = true; btn.style.opacity = "0.4";
    if (playBtn) playBtn.style.display = "none";
    return;
  }
  if (screen === "question" && mainStage === "round-intro") {
    $("q-count").textContent = `Intro · R${introRound + 1}`;
    $("cur-q").textContent = `— round intro: ${ROUND_LABELS[introRound] || "Round"} — press Next › for Q1`;
    $("cur-a").textContent = "—";
    btn.disabled = true; btn.style.opacity = "0.4";
    if (playBtn) playBtn.style.display = "none";
    return;
  }
  btn.disabled = false; btn.style.opacity = "1";
  $("q-count").textContent = `${qIndex + 1} / ${questions.length}`;
  const cq = cur();
  const img = activeImg();
  const isSong = !!cq.audio;
  $("cur-q").textContent = (isSong ? "🎵 " : img ? "🖼 " : "") + (activeQ() || "—");
  $("cur-a").textContent = activeA() || "—";
  btn.textContent = revealed ? "Hide answer" : "Reveal answer on screen";
  btn.classList.toggle("on", revealed);
  // song play button: show only on song questions
  if (playBtn) {
    playBtn.style.display = isSong ? "block" : "none";
    playBtn.textContent = songPlaying ? "■ Stop song" : "▶ Play song";
  }
}
function renderTimer() {
  const d = $("timer-display");
  d.textContent = mmss(timer);
  d.classList.toggle("low", timer <= 10 && timer > 0);
  $("timer-toggle").textContent = running ? "Pause" : "Start";
}
function renderScreenSeg() {
  document.querySelectorAll("#seg-screen button").forEach((b) =>
    b.classList.toggle("on", b.dataset.screen === screen));
  // show the final control panel only when in final mode
  $("final-section").style.display = screen === "final" ? "" : "none";
  if (screen === "final") renderFinal();
}

function renderFinalSelects() {
  const opts = teams.map((t) => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join("");
  ["final-pick-a", "final-pick-b"].forEach((id, i) => {
    const sel = $(id);
    sel.innerHTML = opts;
    if (finalTeams[i]) sel.value = finalTeams[i];
    else if (teams[i]) { finalTeams[i] = teams[i].id; sel.value = teams[i].id; }
  });
}
function renderFinal() {
  const intro = finalIndex < 0;
  const fq = intro ? { q: "", a: "" } : (FINAL_QUESTIONS[finalIndex] || { q: "", a: "" });
  $("final-count").textContent = intro ? `Intro` : `${finalIndex + 1} / ${FINAL_QUESTIONS.length}`;
  $("final-cur-q").textContent = intro ? "— intro screen (no question yet) —" : (fq.q || "—");
  $("final-cur-a").textContent = intro ? "—" : (fq.a || "—");
  const rb = $("final-reveal");
  rb.textContent = finalRevealed ? "Hide answer" : "Reveal answer on screen";
  rb.classList.toggle("on", finalRevealed);
  rb.disabled = intro;
  rb.style.opacity = intro ? "0.4" : "1";
  $("final-award-a").textContent = `+1 ◀ ${finalTeamName(0)}`;
  $("final-award-b").textContent = `${finalTeamName(1)} ▶ +1`;
}
function renderTeams() {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const list = $("team-list");
  if (!sorted.length) { list.innerHTML = '<p class="muted">No teams yet.</p>'; return; }
  list.innerHTML = sorted
    .map((t, i) => {
      const lead = i === 0 && t.score > 0;
      return `
      <div class="team-row ${lead ? "lead" : ""}" data-teamrow="${t.id}">
        <span class="team-score">${t.score}</span>
        <input class="team-name-input" data-rename="${t.id}" value="${escapeHtml(t.name)}" />
        <div class="team-actions">
          <button class="btn-plus" data-award="${t.id}">+${POINTS_PER_CORRECT}</button>
          <button class="btn-minus" data-deduct="${t.id}">−</button>
          <button class="btn-x" data-remove="${t.id}">✕</button>
        </div>
      </div>`;
    })
    .join("");
}
function renderAll() {
  renderRoundChips(); renderCurrent(); renderTimer();
  renderScreenSeg(); renderTeams();
  saveTeams(teams);
  broadcast();
}

// ── actions ──
// Stage-aware navigation through: start → round-intro → questions → next round-intro → …
function setQuestion(i) {
  qIndex = Math.max(0, Math.min(i, questions.length - 1));
  roundIndex = questions[qIndex] ? questions[qIndex].round : roundIndex;
  revealed = false; overrideQ = ""; overrideA = "";
  const oq = $("override-q"), oa = $("override-a");
  if (oq) oq.value = ""; if (oa) oa.value = "";
  // moving to a new question always stops any song audio from the previous one
  stopSongAudio();
  const isSong = !!cur().audio;
  // reset the timer to default if auto-reset is enabled
  const autoReset = $("timer-autoreset") ? $("timer-autoreset").checked : true;
  if (autoReset) { stopTimer(); timer = DEFAULT_TIMER; }
  // auto-start the timer on normal questions, but NOT on song questions
  // (on songs you play the clip first, then start timing by hand)
  if (!isSong) startTimer();
}

function goNext() {
  if (screen !== "question") return; // scoreboard/final have their own nav
  if (mainStage === "start") {
    // start → intro of first round
    mainStage = "round-intro";
    introRound = questions[0] ? questions[0].round : 0;
    qIndex = 0;
    renderAll(); return;
  }
  if (mainStage === "round-intro") {
    // intro → first question of that round
    mainStage = "question";
    const first = questions.findIndex((q) => q.round === introRound);
    setQuestion(first >= 0 ? first : 0);
    renderAll(); return;
  }
  // in questions: advance; if next question is a new round, show its intro first
  if (qIndex >= questions.length - 1) { renderAll(); return; } // last question, stay
  const nextRound = questions[qIndex + 1].round;
  if (nextRound !== roundIndex) {
    mainStage = "round-intro";
    introRound = nextRound;
    qIndex = qIndex + 1; // park at first question of new round (shown after intro)
    revealed = false; if ($("timer-autoreset") && $("timer-autoreset").checked) { stopTimer(); timer = DEFAULT_TIMER; }
    renderAll(); return;
  }
  setQuestion(qIndex + 1);
  renderAll();
}

function goPrev() {
  if (screen !== "question") return;
  if (mainStage === "start") return;
  if (mainStage === "round-intro") {
    // intro → back to start, or to last question of previous round
    if (introRound === (questions[0] ? questions[0].round : 0)) {
      mainStage = "start";
    } else {
      mainStage = "question";
      // jump to last question before this round's first question
      const firstOfIntro = questions.findIndex((q) => q.round === introRound);
      setQuestion(Math.max(0, firstOfIntro - 1));
    }
    renderAll(); return;
  }
  // in questions
  if (qIndex <= 0) {
    mainStage = "round-intro";
    introRound = questions[0] ? questions[0].round : 0;
    renderAll(); return;
  }
  const prevRound = questions[qIndex - 1].round;
  if (prevRound !== roundIndex) {
    // going back across a round boundary → show current round's intro
    mainStage = "round-intro";
    introRound = roundIndex;
    revealed = false; if ($("timer-autoreset") && $("timer-autoreset").checked) { stopTimer(); timer = DEFAULT_TIMER; }
    renderAll(); return;
  }
  setQuestion(qIndex - 1);
  renderAll();
}

// kept for the editor (jump straight to a question index)
function jump(i) {
  mainStage = "question";
  setQuestion(i);
  renderAll();
}
function startTimer() {
  if (running) return;
  if (timer <= 0) return; // nothing to count down
  running = true;
  timerId = setInterval(() => {
    timer -= 1;
    if (timer <= 0) { timer = 0; stopTimer(); }
    renderTimer(); broadcast();
  }, 1000);
  renderTimer();
}
function stopTimer() {
  running = false;
  if (timerId) { clearInterval(timerId); timerId = null; }
  renderTimer();
}

// ── events ──
$("seg-screen").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-screen]");
  if (!b) return;
  screen = b.dataset.screen;
  // leaving the quiz view → stop any playing song audio
  if (screen !== "question") stopSongAudio();
  if (screen === "final") {
    // auto-pick the two highest-scoring teams as finalists, final starts 0:0
    const ranked = [...teams].sort((a, b2) => b2.score - a.score);
    finalTeams = [ranked[0] ? ranked[0].id : null, ranked[1] ? ranked[1].id : null];
    finalScores = [0, 0];
    finalIndex = -1; finalRevealed = false;
    renderFinalSelects(); stopTimer();
  }
  renderScreenSeg(); broadcast();
});

// ── final-round events ──
$("final-pick-a").addEventListener("change", (e) => { finalTeams[0] = e.target.value; renderFinal(); broadcast(); });
$("final-pick-b").addEventListener("change", (e) => { finalTeams[1] = e.target.value; renderFinal(); broadcast(); });
$("final-prev").addEventListener("click", () => { finalIndex = Math.max(-1, finalIndex - 1); finalRevealed = false; renderFinal(); broadcast(); });
$("final-next").addEventListener("click", () => { finalIndex = Math.min(FINAL_QUESTIONS.length - 1, finalIndex + 1); finalRevealed = false; renderFinal(); broadcast(); });
$("final-reveal").addEventListener("click", () => { finalRevealed = !finalRevealed; renderFinal(); broadcast(); });
$("final-award-a").addEventListener("click", () => {
  finalScores[0] += POINTS_PER_CORRECT; renderFinal(); broadcast();
});
$("final-award-b").addEventListener("click", () => {
  finalScores[1] += POINTS_PER_CORRECT; renderFinal(); broadcast();
});

// ── guess-the-song: audio plays in THIS control window, tied to the current question ──
const songAudio = $("song-audio");
function stopSongAudio() {
  const a = document.getElementById("song-audio");
  if (a) a.pause();
  songPlaying = false;
}
$("song-play").addEventListener("click", () => {
  const sg = cur();
  if (!sg || !sg.audio) return;
  if (songPlaying) { stopSongAudio(); renderCurrent(); broadcast(); return; }
  if (songAudio.src !== sg.audio) songAudio.src = sg.audio;
  songAudio.currentTime = 0;
  songAudio.play().then(() => {
    songPlaying = true; renderCurrent(); broadcast();
  }).catch(() => {
    $("song-play").textContent = "▶ Click again to play";
  });
});
songAudio.addEventListener("ended", () => { songPlaying = false; renderCurrent(); broadcast(); });
$("round-chips").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-round]");
  if (!b) return;
  roundIndex = +b.dataset.round; renderRoundChips(); broadcast();
});
$("q-prev").addEventListener("click", goPrev);
$("q-next").addEventListener("click", goNext);
$("override-q").addEventListener("input", (e) => { overrideQ = e.target.value; renderCurrent(); broadcast(); });
$("override-a").addEventListener("input", (e) => { overrideA = e.target.value; renderCurrent(); broadcast(); });
$("btn-reveal").addEventListener("click", () => { revealed = !revealed; renderCurrent(); broadcast(); });

$("timer-toggle").addEventListener("click", () => running ? stopTimer() : startTimer());
$("timer-reset").addEventListener("click", () => { stopTimer(); timer = DEFAULT_TIMER; renderTimer(); broadcast(); });
$("presets").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-sec]");
  if (!b) return;
  stopTimer(); timer = +b.dataset.sec; renderTimer(); broadcast();
});

$("add-team").addEventListener("click", addTeam);
$("new-team").addEventListener("keydown", (e) => { if (e.key === "Enter") addTeam(); });
function addTeam() {
  const v = $("new-team").value.trim();
  if (!v) return;
  teams.push({ id: uid(), name: v, score: 0 });
  $("new-team").value = "";
  renderTeams(); saveTeams(teams); broadcast();
}
$("team-list").addEventListener("click", (e) => {
  const a = e.target.closest("button");
  if (!a) return;
  let flashId = null;
  if (a.dataset.award) { teams = teams.map((t) => t.id === a.dataset.award ? { ...t, score: t.score + POINTS_PER_CORRECT } : t); flashId = a.dataset.award; }
  if (a.dataset.deduct) { teams = teams.map((t) => t.id === a.dataset.deduct ? { ...t, score: Math.max(0, t.score - POINTS_PER_CORRECT) } : t); flashId = a.dataset.deduct; }
  if (a.dataset.remove) teams = teams.filter((t) => t.id !== a.dataset.remove);
  renderTeams(); saveTeams(teams); broadcast();
  // flash the team's score so it's obvious the click landed (buttons re-render, so flash the number)
  if (flashId) {
    const row = document.querySelector(`[data-teamrow="${flashId}"] .team-score`);
    if (row) { row.classList.remove("flash-score"); void row.offsetWidth; row.classList.add("flash-score"); }
  }
});
// inline rename — save on blur or Enter, so typing isn't interrupted by re-renders
$("team-list").addEventListener("change", (e) => {
  const inp = e.target.closest("[data-rename]");
  if (!inp) return;
  const id = inp.dataset.rename;
  const name = inp.value.trim() || "Team";
  teams = teams.map((t) => t.id === id ? { ...t, name } : t);
  saveTeams(teams); renderTeams(); broadcast();
});
$("team-list").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.closest("[data-rename]")) e.target.blur();
});

// ── preview / beamer ──
$("btn-preview").addEventListener("click", (e) => {
  const grid = $("grid"), pane = $("preview-pane");
  const hidden = pane.style.display === "none";
  pane.style.display = hidden ? "" : "none";
  grid.classList.toggle("no-preview", !hidden);
  e.target.textContent = hidden ? "Hide preview" : "Show preview";
});
$("btn-beamer").addEventListener("click", () => {
  const w = window.open("beamer.html", "cx-beamer");
  setTimeout(broadcast, 600);
  if (!w) alert("The browser blocked the pop-up. Allow pop-ups for this page, then try again.");
});

// respond to a beamer (or preview iframe) asking for current state
chan.on((msg) => { if (msg.type === "request") broadcast(); });

// ── editor modal ──
let draft = [];
function openEditor() {
  draft = questions.map((q) => ({ ...q }));
  renderEditor();
  $("editor-modal").classList.add("open");
}
function closeEditor() { $("editor-modal").classList.remove("open"); }
function renderEditor() {
  const opts = ROUND_LABELS.map((r, i) => `<option value="${i}">R${i + 1}</option>`).join("");
  $("editor-body").innerHTML =
    draft.map((q, i) => `
      <div class="q-editor-row" data-i="${i}">
        <select data-field="round">${opts}</select>
        <textarea data-field="q" placeholder="Question">${escapeHtml(q.q)}</textarea>
        <textarea data-field="a" placeholder="Answer">${escapeHtml(q.a)}</textarea>
        <button class="btn-x" data-del="${i}">✕</button>
        <input type="text" data-field="img" class="q-editor-img" placeholder="Image URL (optional — shown on beamer)" value="${escapeHtml(q.img || "")}" />
      </div>`).join("") +
    `<button class="editor-add" id="editor-add">+ Add question</button>`;
  draft.forEach((q, i) => {
    const row = $("editor-body").querySelector(`[data-i="${i}"] select`);
    if (row) row.value = String(q.round);
  });
}
$("btn-editor").addEventListener("click", openEditor);
$("editor-close").addEventListener("click", closeEditor);
$("editor-cancel").addEventListener("click", closeEditor);
$("editor-modal").addEventListener("click", (e) => { if (e.target.id === "editor-modal") closeEditor(); });
$("editor-body").addEventListener("input", (e) => {
  const row = e.target.closest(".q-editor-row");
  if (!row) return;
  const i = +row.dataset.i, f = e.target.dataset.field;
  if (f === "round") draft[i].round = +e.target.value;
  else draft[i][f] = e.target.value;
});
$("editor-body").addEventListener("click", (e) => {
  if (e.target.id === "editor-add") { draft.push({ round: roundIndex, q: "", a: "" }); renderEditor(); }
  const del = e.target.closest("button[data-del]");
  if (del) { draft.splice(+del.dataset.del, 1); renderEditor(); }
});
$("editor-save").addEventListener("click", () => {
  questions = draft
    .filter((q) => q.q.trim() || q.a.trim() || (q.img && q.img.trim()))
    .map((q) => {
      const out = { round: q.round, q: q.q, a: q.a };
      if (q.img && q.img.trim()) out.img = q.img.trim();
      return out;
    });
  if (!questions.length) questions = [{ round: 0, q: "", a: "" }];
  saveQuestions(questions);
  if (qIndex >= questions.length) qIndex = questions.length - 1;
  closeEditor(); jump(qIndex);
});
$("editor-reset").addEventListener("click", () => {
  localStorage.removeItem("cxquiz.questions");
  questions = loadQuestions(); draft = questions.map((q) => ({ ...q }));
  renderEditor();
});

// keyboard shortcuts (control window)
document.addEventListener("keydown", (e) => {
  if ($("editor-modal").classList.contains("open")) return;
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea") return;
  if (e.code === "Space") { e.preventDefault(); running ? stopTimer() : startTimer(); }
  if (e.code === "ArrowRight") goNext();
  if (e.code === "ArrowLeft") goPrev();
  if (e.key.toLowerCase() === "a") { revealed = !revealed; renderCurrent(); broadcast(); }
  if (e.key.toLowerCase() === "s") { screen = screen === "scoreboard" ? "question" : "scoreboard"; renderScreenSeg(); broadcast(); }
});

// ── visual click feedback: flash key action buttons so it's obvious the click landed ──
document.addEventListener("click", (e) => {
  // note: team +/− buttons re-render, so they flash the SCORE instead (handled in team-list handler)
  const btn = e.target.closest(
    "#btn-reveal, #final-reveal, #final-award-a, #final-award-b, #song-play, .reveal-btn"
  );
  if (!btn) return;
  btn.classList.remove("flash");
  void btn.offsetWidth; // restart animation
  btn.classList.add("flash");
});

// ── init ──
renderPresets();
renderAll();
