// 🔥 LOAD ALL SONGS FROM JSON

const folders = [
  "alka-yagnik",
  "ar-rahman",
  "arijit-singh",
  "atif-aslam",
  "honey-singh",
  "jubin-nautiyal",
  "kk",
  "shreya-ghoshal",
  "subh"
];

let allSongs = [];
let displayedSongs = [];
let currentIndex = 0;

const audio = document.getElementById("song");
const titleEl = document.getElementById("currentSongTitle");
const artistEl = document.getElementById("currentArtist");
const coverEl = document.getElementById("rotatingImage");
const progress = document.getElementById("progress");

const playBtn = document.getElementById("playBtn");
const icon = document.getElementById("controlIcon");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

// 🎯 Load songs
async function loadAllSongs() {
  const data = await Promise.all(
    folders.map(async (folder) => {
      try {
        const res = await fetch(`/frontend/assets/songs/${folder}/songs.json`);
        
        const json = await res.json(); // ✅ YE LINE MISSING THI

return json.songs.map(song => ({
  id: song.id,
  title: song.title,
  artist: json.artist,
  cover: `../assets/songs/${folder}/${folder}.jpg`,
  src: `../assets/songs/${folder}/${song.file}`
}));
      } catch (err) {
        console.error("Error loading:", folder, err);
        return [];
      }
    })
  );

  return data.flat();
}

// 🎨 Render UI
function renderSongs(list) {
  const container = document.getElementById("dynamicSongList");

  container.innerHTML = list.map(song => `
    <div class="song" data-id="${song.id}">
      
      <img src="${song.cover}" />

      <div class="song-info">
        <h3>${song.title}</h3>
        <p>${song.artist}</p>
      </div>

      <button class="fav-btn" data-id="${song.id}">
        ❤️
      </button>

    </div>
  `).join("");
}
function applyFavoritesUI() {
  document.querySelectorAll(".fav-btn").forEach(btn => {
    if (favorites.includes(btn.dataset.id)) {
      btn.classList.add("active");
      btn.innerText = "❤️";
    } else {
      btn.innerText = "🤍";
    }
  });
}
// ▶️ Play song
function playSong(index) {
  const song = displayedSongs[index]; // 🔥 important
  if (!song) return;

  currentIndex = index;

  audio.src = song.src;
  audio.load();

  titleEl.innerText = song.title;
  artistEl.innerText = song.artist;
  coverEl.src = song.cover;

  audio.play();
  highlightCurrent(); 
}
// ⏯️ Play/Pause toggle
playBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    icon.classList.replace("fa-play", "fa-pause");
  } else {
    audio.pause();
    icon.classList.replace("fa-pause", "fa-play");
  }
});

// ⏭️ Next
nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % displayedSongs.length;
  playSong(currentIndex);
});

prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + displayedSongs.length) % displayedSongs.length;
  playSong(currentIndex);
});

// 📊 Progress update
audio.addEventListener("timeupdate", () => {
  progress.value = audio.currentTime;
  progress.max = audio.duration || 0;
    
});

// ⏩ Seek
progress.addEventListener("input", () => {
  audio.currentTime = progress.value;
});

// 🖱️ Click song
document.addEventListener("click", (e) => {

  // ❤️ FAVORITE CLICK
  if (e.target.classList.contains("fav-btn")) {
  e.stopPropagation();

  const id = e.target.dataset.id;

  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);

    e.target.classList.remove("active");
    e.target.innerText = "🤍"; // ❌ remove
  } else {
    favorites.push(id);

    e.target.classList.add("active");
    e.target.innerText = "❤️"; // ✅ add
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  return;
}

  // 🎵 SONG CLICK
  const card = e.target.closest(".song");
  if (!card) return;

  const id = card.dataset.id;
  const index = displayedSongs.findIndex(s => s.id === id);

  if (index !== -1) playSong(index);
});
// 🚀 Init
(async function init() {
  allSongs = await loadAllSongs();

  displayedSongs = [...allSongs]
    .sort(() => 0.5 - Math.random())
    .slice(0, 25);

  renderSongs(displayedSongs);
  applyFavoritesUI();
if (displayedSongs.length) {
  const song = displayedSongs[0];

  // only UI update, no play
  titleEl.innerText = song.title;
  artistEl.innerText = song.artist;
  coverEl.src = song.cover;

  audio.src = song.src; // preload only
}
})();

function highlightCurrent() {
  document.querySelectorAll(".song").forEach(el => {
    el.classList.remove("active");
  });

  const activeCard = document.querySelector(`[data-id="${displayedSongs[currentIndex].id}"]`);
  if (activeCard) activeCard.classList.add("active");
}
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];