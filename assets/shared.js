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
// img is an optional image URL shown big on the beamer (picture round etc.)
export const DEFAULT_QUESTIONS = [
  // ── Round 1 · Warm-Up (easy, everyone scores) ──
  { round: 0, q: "What does the 'www' in a web address stand for? (first word)", a: "World" },
  { round: 0, q: "Which company makes the iPhone?", a: "Apple" },
  { round: 0, q: "What colour do you get mixing blue and yellow?", a: "Green" },
  { round: 0, q: "How many minutes are in a full day? (hint: 60 × 24)", a: "1440" },
  { round: 0, q: "Which planet do we live on?", a: "Earth" },
  { round: 0, q: "What's the most populated country in the world today?", a: "India" },
  { round: 0, q: "Which social app is known for short looping videos and a 'For You' page?", a: "TikTok" },
  { round: 0, q: "What's the chemical symbol for water?", a: "H2O" },

  // ── Round 2 · Music & Sound (medium) ──
  { round: 1, q: "Which artist released the album 'Midnights' in 2022?", a: "Taylor Swift" },
  { round: 1, q: "What instrument has 88 keys?", a: "Piano" },
  { round: 1, q: "Which Puerto Rican artist was the most-streamed on Spotify in the early 2020s?", a: "Bad Bunny" },
  { round: 1, q: "'Smells Like Teen Spirit' was the breakout song of which band?", a: "Nirvana" },
  { round: 1, q: "Which streaming platform has the green logo and yearly 'Wrapped'?", a: "Spotify" },
  { round: 1, q: "Which Korean act broke YouTube records and sang 'Dynamite'?", a: "BTS" },
  { round: 1, q: "Billie Eilish's brother and producer is named what? (first name)", a: "Finneas" },
  { round: 1, q: "What German city was Beethoven born in?", a: "Bonn" },

  // ── Round 3 · Screens & Streaming (medium-hard) ──
  { round: 2, q: "Which series features the 'Upside Down'?", a: "Stranger Things" },
  { round: 2, q: "What colour pill does Neo take in 'The Matrix'?", a: "Red" },
  { round: 2, q: "Which Korean survival series became Netflix's biggest launch ever?", a: "Squid Game" },
  { round: 2, q: "Who plays the lead in the 'John Wick' films? (surname)", a: "Reeves" },
  { round: 2, q: "Which animated studio made 'Toy Story'?", a: "Pixar" },
  { round: 2, q: "What's the name of the coffee shop in 'Friends'?", a: "Central Perk" },
  { round: 2, q: "Which 2023 film about a doll became a billion-dollar hit?", a: "Barbie" },
  { round: 2, q: "What platform is known for streamers playing games live, purple logo?", a: "Twitch" },

  // ── Round 4 · Picture Round (mixed; images on the beamer) ──
  { round: 3, q: "Guess that Pokémon!", a: "Pikachu",
    img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" },
  { round: 3, q: "Which country's flag is this?", a: "Brazil",
    img: "https://flagcdn.com/w1280/br.png" },
  { round: 3, q: "Name this landmark.", a: "Colosseum",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1280px-Colosseo_2020.jpg" },
  { round: 3, q: "Guess that Pokémon!", a: "Charizard",
    img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png" },
  { round: 3, q: "Which country's flag is this?", a: "South Korea",
    img: "https://flagcdn.com/w1280/kr.png" },
  { round: 3, q: "Name this landmark.", a: "Taj Mahal",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg/1280px-Taj_Mahal%2C_Agra%2C_India_edit3.jpg" },
  { round: 3, q: "Guess that Pokémon!", a: "Snorlax",
    img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png" },
  { round: 3, q: "Which city's skyline is this?", a: "Dubai",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Dubai_skyline_2015_%28crop%29.jpg/1280px-Dubai_skyline_2015_%28crop%29.jpg" },

  // ── Round 5 · Around the World (hard) ──
  { round: 4, q: "What is the smallest country in the world?", a: "Vatican" },
  { round: 4, q: "Which country has the most time zones?", a: "France" },
  { round: 4, q: "Mount Kilimanjaro is in which country?", a: "Tanzania" },
  { round: 4, q: "What is the capital of Australia?", a: "Canberra" },
  { round: 4, q: "Which sea is so salty you float easily?", a: "Dead Sea" },
  { round: 4, q: "How many countries border Germany?", a: "Nine" },
  { round: 4, q: "Which country has the most natural lakes?", a: "Canada" },
  { round: 4, q: "The currency 'yen' belongs to which country?", a: "Japan" },

  // ── Round 6 · Brain Stretch (hardest before the final) ──
  { round: 5, q: "What is the hardest natural substance on Earth?", a: "Diamond" },
  { round: 5, q: "In which year did the Berlin Wall fall?", a: "1989" },
  { round: 5, q: "How many bones are in the adult human body?", a: "206" },
  { round: 5, q: "What's the most abundant gas in Earth's atmosphere?", a: "Nitrogen" },
  { round: 5, q: "Which tech company was founded by Jeff Bezos?", a: "Amazon" },
  { round: 5, q: "What does the 'A' in 'AI' stand for?", a: "Artificial" },
  { round: 5, q: "Roughly how many km per second does light travel? (round number)", a: "300000" },
  { round: 5, q: "Who developed the theory of relativity?", a: "Einstein" },
];

// ── Final round (buzzer, spoken answers, fast) ──
// Used as a separate moderator list; not part of the team-board scoring set.
export const FINAL_QUESTIONS = [
  { q: "What is the largest planet in our solar system?", a: "Jupiter" },
  { q: "Which element has the symbol 'O'?", a: "Oxygen" },
  { q: "How many strings does a standard guitar have?", a: "Six" },
  { q: "In what year did World War II end?", a: "1945" },
  { q: "Which country is credited with inventing pizza?", a: "Italy" },
  { q: "What is the longest river in the world?", a: "Nile" },
  { q: "Who wrote 'Romeo and Juliet'?", a: "Shakespeare" },
  { q: "What is H2O more commonly known as?", a: "Water" },
  { q: "Which planet is known as the Red Planet?", a: "Mars" },
  { q: "What's the capital of France?", a: "Paris" },
  { q: "Which app uses a white ghost on a yellow background?", a: "Snapchat" },
  { q: "How many continents are there?", a: "Seven" },
  { q: "What gas do humans breathe out?", a: "CO2" },
  { q: "Which company owns Instagram and WhatsApp?", a: "Meta" },
  { q: "What's the tallest mountain on Earth?", a: "Everest" },
  { q: "Which ocean is the largest?", a: "Pacific" },
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
