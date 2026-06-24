// ── shared.js — state model, sync channel, defaults ───────────────────────

export const ROUND_LABELS = [
  "Warm-Up",
  "Music & Sound",
  "Screens & Streaming",
  "Picture Round",
  "Around the World",
  "Brain Stretch",
];

// Each question: { round, q, a, img? }
// img is an optional image URL shown big on the beamer (picture round).
export const DEFAULT_QUESTIONS = [
  // ── Round 1 · Warm-Up (still the easiest, but adult pub level) ──
  { round: 0, q: "Which element has the chemical symbol 'Fe'?", a: "Iron" },
  { round: 0, q: "How many time zones does the contiguous USA span?", a: "Four" },
  { round: 0, q: "What is the capital of Canada?", a: "Ottawa" },
  { round: 0, q: "Which planet is the hottest in our solar system?", a: "Venus" },
  { round: 0, q: "In which country were the first modern Olympics (1896) held?", a: "Greece" },
  { round: 0, q: "What's the largest internal organ in the human body?", a: "Liver" },
  { round: 0, q: "Which currency is used in Switzerland?", a: "Franc" },
  { round: 0, q: "What does the 'S' stand for in the SIM of a SIM card?", a: "Subscriber" },

  // ── Round 2 · Music & Sound (medium-hard) ──
  { round: 1, q: "Which composer wrote 'The Four Seasons'?", a: "Vivaldi" },
  { round: 1, q: "What was Queen's first UK number-one single?", a: "Bohemian Rhapsody" },
  { round: 1, q: "Which 90s band's frontman was Liam Gallagher?", a: "Oasis" },
  { round: 1, q: "Daft Punk came from which country?", a: "France" },
  { round: 1, q: "Which instrument does cellist Yo-Yo Ma play?", a: "Cello" },
  { round: 1, q: "What note do orchestras tune to before a concert?", a: "A" },
  { round: 1, q: "Which artist holds the record for most Grammy wins?", a: "Beyoncé" },
  { round: 1, q: "'The Wall' is a 1979 album by which band?", a: "Pink Floyd" },

  // ── Round 3 · Screens & Streaming (hard) ──
  { round: 2, q: "Which director made 'Inception' and 'Oppenheimer'?", a: "Nolan" },
  { round: 2, q: "What is the highest-grossing film of all time?", a: "Avatar" },
  { round: 2, q: "In 'Breaking Bad', what is Walter White's street name?", a: "Heisenberg" },
  { round: 2, q: "Which streaming service produced 'The Crown'?", a: "Netflix" },
  { round: 2, q: "Who directed 'Pulp Fiction'?", a: "Tarantino" },
  { round: 2, q: "Which fictional country is the home of Black Panther?", a: "Wakanda" },
  { round: 2, q: "What was the first feature-length animated film by Disney (1937)?", a: "Snow White" },
  { round: 2, q: "Which actor played the Joker in 2019's 'Joker'?", a: "Phoenix" },

  // ── Round 4 · Picture Round (flags + country outlines; images on beamer) ──
  { round: 3, q: "Which country's flag is this?", a: "Nepal",
    img: "https://flagcdn.com/w1280/np.png" },
  { round: 3, q: "Which country is this outline?", a: "Italy",
    img: "https://raw.githubusercontent.com/djaiss/mapsicon/master/all/it/512.png" },
  { round: 3, q: "Which country's flag is this?", a: "Bhutan",
    img: "https://flagcdn.com/w1280/bt.png" },
  { round: 3, q: "Which country is this outline?", a: "Japan",
    img: "https://raw.githubusercontent.com/djaiss/mapsicon/master/all/jp/512.png" },
  { round: 3, q: "Which country's flag is this?", a: "Kazakhstan",
    img: "https://flagcdn.com/w1280/kz.png" },
  { round: 3, q: "Which country is this outline?", a: "Chile",
    img: "https://raw.githubusercontent.com/djaiss/mapsicon/master/all/cl/512.png" },
  { round: 3, q: "Which country's flag is this?", a: "Mozambique",
    img: "https://flagcdn.com/w1280/mz.png" },
  { round: 3, q: "Which country is this outline?", a: "India",
    img: "https://raw.githubusercontent.com/djaiss/mapsicon/master/all/in/512.png" },

  // ── Round 5 · Around the World (hard) ──
  { round: 4, q: "What is the only country that is also a continent?", a: "Australia" },
  { round: 4, q: "Which African country was never colonised by Europeans?", a: "Ethiopia" },
  { round: 4, q: "What is the capital of New Zealand?", a: "Wellington" },
  { round: 4, q: "Which strait separates Europe and Africa at their closest?", a: "Gibraltar" },
  { round: 4, q: "Lake Baikal, the deepest lake, is in which country?", a: "Russia" },
  { round: 4, q: "Which two countries share the longest land border?", a: "USA Canada" },
  { round: 4, q: "What is the most spoken native language in the world?", a: "Mandarin" },
  { round: 4, q: "The Atacama, the driest desert, is mainly in which country?", a: "Chile" },

  // ── Round 6 · Brain Stretch (hardest before the final) ──
  { round: 5, q: "What is the most abundant element in the universe?", a: "Hydrogen" },
  { round: 5, q: "In which year did the Chernobyl disaster occur?", a: "1986" },
  { round: 5, q: "What 'P' is the powerhouse of the cell?", a: "Mitochondria" },
  { round: 5, q: "Who painted 'The Starry Night'?", a: "Van Gogh" },
  { round: 5, q: "How many hearts does an octopus have?", a: "Three" },
  { round: 5, q: "What's the only even prime number?", a: "Two" },
  { round: 5, q: "Which scientist proposed the three laws of motion?", a: "Newton" },
  { round: 5, q: "The 'Mona Lisa' hangs in which museum?", a: "Louvre" },
];

// ── Final round (buzzer, spoken answers, fast — harder set) ──
export const FINAL_QUESTIONS = [
  { q: "What is the smallest prime number greater than 50?", a: "53" },
  { q: "Which planet has the most moons?", a: "Saturn" },
  { q: "In what year did the Titanic sink?", a: "1912" },
  { q: "Which country has the most pyramids?", a: "Sudan" },
  { q: "What is the chemical symbol for potassium?", a: "K" },
  { q: "Who wrote 'War and Peace'?", a: "Tolstoy" },
  { q: "Which gas makes up about 21% of Earth's atmosphere?", a: "Oxygen" },
  { q: "What is the longest bone in the human body?", a: "Femur" },
  { q: "Which artist cut off part of his own ear?", a: "Van Gogh" },
  { q: "What is the capital of Iceland?", a: "Reykjavik" },
  { q: "How many players are on a basketball court per team?", a: "Five" },
  { q: "Which empire built Machu Picchu?", a: "Inca" },
  { q: "What is the hardest known natural material?", a: "Diamond" },
  { q: "Which sea separates Saudi Arabia and Egypt?", a: "Red Sea" },
  { q: "Who developed the polio vaccine?", a: "Salk" },
  { q: "What is the currency of Poland?", a: "Zloty" },
  { q: "Which mountain range separates Europe from Asia?", a: "Urals" },
  { q: "In computing, what does 'CPU' stand for? (first word)", a: "Central" },
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
    { id: uid(), name: "Team 1", score: 0 },
    { id: uid(), name: "Team 2", score: 0 },
    { id: uid(), name: "Team 3", score: 0 },
    { id: uid(), name: "Team 4", score: 0 },
    { id: uid(), name: "Team 5", score: 0 },
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
