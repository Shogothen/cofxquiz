// ── shared.js — state model, sync channel, defaults ───────────────────────

export const ROUND_LABELS = [
  "General Knowledge",
  "Music Round",
  "Movies & Series",
  "Cofinity-X Fun Facts",
  "Picture Round",
];

export const DEFAULT_QUESTIONS = [
  { round: 0, q: "Which planet in our solar system has the most moons?", a: "Saturn" },
  { round: 0, q: "What is the only metal that is liquid at room temperature?", a: "Mercury" },
  { round: 0, q: "In what year did euro banknotes and coins enter circulation?", a: "2002" },
  { round: 1, q: "Which band released the album 'Rumours' in 1977?", a: "Fleetwood Mac" },
  { round: 1, q: "Who wrote and sang lead on Queen's 'Bohemian Rhapsody'?", a: "Freddie Mercury" },
  { round: 2, q: "Which film won Best Picture at the 2020 Oscars?", a: "Parasite" },
  { round: 2, q: "In 'The Office' (US), what is the paper company called?", a: "Dunder Mifflin" },
  { round: 3, q: "Which automotive data ecosystem does Cofinity-X operate?", a: "Catena-X" },
  { round: 4, q: "Picture round — identify the landmark on screen.", a: "(reveal your slide)" },
];

export const POINTS_PER_CORRECT = 1;

const LS_QUESTIONS = "cxquiz.questions";
const LS_TEAMS = "cxquiz.teams";

export const uid = () => Math.random().toString(36).slice(2, 9);
export const mmss = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ── persistence (localStorage works on a real URL, e.g. GitHub Pages) ──────
export function loadQuestions() {
  try {
    const raw = localStorage.getItem(LS_QUESTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_QUESTIONS.map((q) => ({ ...q }));
}
export function saveQuestions(qs) {
  try { localStorage.setItem(LS_QUESTIONS, JSON.stringify(qs)); } catch (e) {}
}
export function loadTeams() {
  try {
    const raw = localStorage.getItem(LS_TEAMS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    { id: uid(), name: "The Quizinators", score: 0 },
    { id: uid(), name: "Catena-Xperts", score: 0 },
  ];
}
export function saveTeams(teams) {
  try { localStorage.setItem(LS_TEAMS, JSON.stringify(teams)); } catch (e) {}
}

// ── sync channel between control and beamer windows ────────────────────────
export function makeChannel() {
  let chan = null;
  try { chan = new BroadcastChannel("cx-pub-quiz"); } catch (e) {}
  return {
    post: (msg) => chan && chan.postMessage(msg),
    on: (handler) => {
      if (!chan) return () => {};
      const fn = (e) => handler(e.data);
      chan.addEventListener("message", fn);
      return () => chan.removeEventListener("message", fn);
    },
  };
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
