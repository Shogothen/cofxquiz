// ── shared.js — state model, sync channel, defaults ───────────────────────

export const ROUND_LABELS = [
  "Warm-Up",
  "Music & Sound",
  "Screens & Streaming",
  "Picture Round",
  "Around the World",
  "Guess the Song",
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

  // ── Round 5 · Around the World (pop-culture mix, medium) ──
  { round: 4, q: "Which company owns Instagram and WhatsApp?", a: "Meta" },
  { round: 4, q: "Which video game is the best-selling of all time?", a: "Minecraft" },
  { round: 4, q: "What is the highest-grossing animated film of all time?", a: "Inside Out 2" },
  { round: 4, q: "Which rapper founded the fashion brand 'Yeezy'?", a: "Kanye" },
  { round: 4, q: "In the 'Barbie' movie, who played Ken alongside Margot Robbie?", a: "Gosling" },
  { round: 4, q: "What Japanese word describes the cute aesthetic in pop culture?", a: "Kawaii" },
  { round: 4, q: "Which platform popularised the 'For You Page' (FYP)?", a: "TikTok" },
  { round: 4, q: "Which 2016 mobile game had people walking around catching creatures?", a: "Pokémon Go" },

  // ── Round 6 · Guess the Song (audio questions; play preview, then reveal) ──
  { round: 5, q: "Guess the song", a: "Blinding Lights — The Weeknd",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/17/b4/8f/17b48f9a-0b93-6bb8-fe1d-3a16623c2cfb/mzaf_9560252727299052414.plus.aac.p.m4a",
    trackUrl: "https://music.apple.com/us/album/blinding-lights/1488408555?i=1488408568&uo=4" },
  { round: 5, q: "Guess the song", a: "Don't Stop Me Now — Queen",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6a/ec/92/6aec920f-5a05-d93b-ceaa-7de19cdbae88/mzaf_6658285650704260274.plus.aac.p.m4a",
    trackUrl: "https://music.apple.com/us/album/dont-stop-me-now/1440650428?i=1440650733&uo=4" },
  { round: 5, q: "Guess the song", a: "Dancing Queen — ABBA",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1a/47/93/1a4793fc-1586-87bc-00d2-dc4916a61c7c/mzaf_13920610926910283055.plus.aac.p.m4a",
    trackUrl: "https://music.apple.com/us/album/dancing-queen/1422648512?i=1422648513&uo=4" },
  { round: 5, q: "Guess the song", a: "Eye of the Tiger — Survivor",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/fe/fa/9e/fefa9edd-c023-4d1c-1012-08bfb0ec69e6/mzaf_4651653238471209843.plus.aac.p.m4a",
    trackUrl: "https://music.apple.com/us/album/eye-of-the-tiger/254685010?i=254685026&uo=4" },

  // ── Round 7 · Brain Stretch (hardest before the final) ──
  { round: 6, q: "What is the most abundant element in the universe?", a: "Hydrogen" },
  { round: 6, q: "In which year did the Chernobyl disaster occur?", a: "1986" },
  { round: 6, q: "What 'P' is the powerhouse of the cell?", a: "Mitochondria" },
  { round: 6, q: "Who painted 'The Starry Night'?", a: "Van Gogh" },
  { round: 6, q: "How many hearts does an octopus have?", a: "Three" },
  { round: 6, q: "What's the only even prime number?", a: "Two" },
  { round: 6, q: "Which scientist proposed the three laws of motion?", a: "Newton" },
  { round: 6, q: "The 'Mona Lisa' hangs in which museum?", a: "Louvre" },
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

// ── Guess the Song round (Apple Music 30s previews) ───────────────────────
// previewUrl: paste the iTunes preview URL (ends in .m4a). Leave "" to disable a slot.
// trackUrl: optional Apple Music link shown on the beamer (keeps it close to a store badge).
export const SONGS = [
  { title: "Blinding Lights", artist: "The Weeknd",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/17/b4/8f/17b48f9a-0b93-6bb8-fe1d-3a16623c2cfb/mzaf_9560252727299052414.plus.aac.p.m4a",
    trackUrl: "https://music.apple.com/us/album/blinding-lights/1488408555?i=1488408568&uo=4" },
  { title: "Don't Stop Me Now", artist: "Queen",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6a/ec/92/6aec920f-5a05-d93b-ceaa-7de19cdbae88/mzaf_6658285650704260274.plus.aac.p.m4a",
    trackUrl: "https://music.apple.com/us/album/dont-stop-me-now/1440650428?i=1440650733&uo=4" },
  { title: "Dancing Queen", artist: "ABBA",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1a/47/93/1a4793fc-1586-87bc-00d2-dc4916a61c7c/mzaf_13920610926910283055.plus.aac.p.m4a",
    trackUrl: "https://music.apple.com/us/album/dancing-queen/1422648512?i=1422648513&uo=4" },
  { title: "Eye of the Tiger", artist: "Survivor",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/fe/fa/9e/fefa9edd-c023-4d1c-1012-08bfb0ec69e6/mzaf_4651653238471209843.plus.aac.p.m4a",
    trackUrl: "https://music.apple.com/us/album/eye-of-the-tiger/254685010?i=254685026&uo=4" },
];

// ── Host one-liners (sassy quizmaster) shown in a speech bubble ────────────
export const HOST_LINES = {
  start: [
    "No phones. I have eyes everywhere.",
    "Confidence won't earn points. Correct answers will.",
    "Some of you peaked in school trivia. Tonight we find out.",
    "Teamwork makes the dream work. Blame makes it interesting.",
    "I already know who's losing. Prove me wrong.",
  ],
  round: [
    "New round, new chances to embarrass yourselves.",
    "Whisper your answers. The next team has ears.",
    "If you're guessing, guess boldly.",
    "This is where the smug ones get humbled.",
    "Half of you know this. The other half will nod along.",
    "Eyes on your own answer sheet, legends.",
  ],
  final: [
    "Two teams left. One leaves smug, one leaves quiet.",
    "Buzz first, panic later.",
    "This is the part you'll argue about for weeks.",
    "Hands on buzzers. Friendships on hold.",
    "Fastest finger, not loudest voice.",
  ],
  winnerSolo: [
    "Champions tonight. Unbearable tomorrow.",
    "Enjoy it. The trophy's imaginary.",
    "Well earned. Don't let it go to your head. Too late.",
    "Victory tastes great. Almost as great as the free drinks.",
  ],
  winnerTie: [
    "A tie? You really couldn't settle this yourselves?",
    "Two winners means two teams to blame next time.",
    "Sharing first place. How suspiciously polite.",
  ],
};

// ── Ambient 'Did you know?' facts for the break screen ────────────────────
export const AMBIENT_FACTS = [
  "Honey found in ancient Egyptian tombs was still edible after 3,000 years.",
  "An octopus has three hearts and nine brains.",
  "A group of flamingos is called a 'flamboyance'.",
  "Bananas are berries, but strawberries are not.",
  "There are more possible chess games than atoms in the observable universe.",
  "Wombats produce cube-shaped poop.",
  "Lightning is roughly five times hotter than the surface of the sun.",
  "Sharks are older than trees by about 50 million years.",
  "The shortest war in history lasted under 40 minutes.",
  "Scotland's official national animal is the unicorn.",
  "Cleopatra lived closer in time to the Moon landing than to the building of the pyramids.",
  "A day on Venus is longer than its year.",
  "The inventor of the frisbee was turned into a frisbee after he died.",
  "Bubble wrap was originally invented as wallpaper.",
];

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
