// ========= CONFIG =========
const STORAGE_KEY = "favorites";

// ========= STATE =========
let allSongs = [];
let favorites = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

let state = {
  tab: "liked",
  sort: "recent",
  search: ""
};

let currentAudio = new Audio();
let currentPlayingId = null;

// ========= LOAD SONGS =========
async function loadSongs() {
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

  const data = await Promise.all(
    folders.map(async (folder) => {
      const res = await fetch(`../assets/songs/${folder}/songs.json`);
      const json = await res.json();

      return json.songs.map(song => ({
        id: song.id,
        title: song.title,
        artist: json.artist,
        cover: `../assets/songs/${folder}/${folder}.jpg`,
        src: `../assets/songs/${folder}/${song.file}`
      }));
    })
  );

  return data.flat();
}

// ========= FAVORITES =========
function saveFavorites() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

function toggleLike(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }
  saveFavorites();
  render();
}

function isLiked(id) {
  return favorites.includes(id);
}

// ========= FILTER =========
function getSongs() {
  let list = state.tab === "liked"
    ? allSongs.filter(s => favorites.includes(s.id))
    : [...allSongs];

  if (state.search) {
    list = list.filter(s =>
      s.title.toLowerCase().includes(state.search.toLowerCase())
    );
  }

  if (state.sort === "az") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  return list;
}

// ========= AUDIO =========
function playSong(id) {
  const song = allSongs.find(s => s.id === id);
  if (!song) return;

  // toggle pause
  if (currentPlayingId === id && !currentAudio.paused) {
    currentAudio.pause();
    updatePlayingUI(null);
    currentPlayingId = null;
      npPlayBtn.textContent = "▶";

    return;
  }
  npPlayBtn.onclick = () => {
  if (currentAudio.paused) {
    currentAudio.play();
    npPlayBtn.textContent = "⏸";
  } else {
    currentAudio.pause();
    npPlayBtn.textContent = "▶";
  }
};
currentAudio.src = song.src;
currentAudio.play();
currentPlayingId = id;

// 🎧 SHOW NOW PLAYING
npBar.classList.remove("hidden");
npTitle.innerText = song.title;
npArtist.innerText = song.artist;
npCover.src = song.cover;

npPlayBtn.textContent = "⏸";

updatePlayingUI(id);
 

  currentAudio.onended = () => {
    updatePlayingUI(null);
    currentPlayingId = null;
  };
}

// ========= PLAY ALL =========
document.getElementById("playAllBtn").addEventListener("click", () => {
  const list = getSongs();
  if (!list.length) return;

  let index = 0;

  function playNext() {
    if (index >= list.length) return;

    playSong(list[index].id);

    currentAudio.onended = () => {
      index++;
      playNext();
    };
  }

  playNext();
});

// ========= UI =========
function updatePlayingUI(id) {
  // remove all
  document.querySelectorAll(".song-row").forEach(row => {
    row.classList.remove("playing");
  });

  document.querySelectorAll(".play-btn").forEach(btn => {
    btn.textContent = "▶";
  });

  if (!id) return;

  const row = document.querySelector(`.song-row[data-id="${id}"]`);
  const btn = document.querySelector(`.play-btn[data-id="${id}"]`);

  if (row) row.classList.add("playing");
  if (btn) btn.textContent = "⏸";
}

// ========= RENDER =========
function renderTable(list, containerId) {
  const container = document.getElementById(containerId);

  if (!list.length) {
    container.innerHTML = `<p>No songs</p>`;
    return;
  }

  container.innerHTML = `
    <table class="songs-table">
      <tbody>
        ${list.map((song, i) => `
          <tr class="song-row ${currentPlayingId === song.id ? "playing" : ""}" data-id="${song.id}">
            <td>${i + 1}</td>

            <td>
              <img src="${song.cover}" width="40">
              ${song.title}
            </td>

            <td>
              <button class="play-btn" data-id="${song.id}">
                ${currentPlayingId === song.id ? "⏸" : "▶"}
              </button>

              <button class="like-btn" data-id="${song.id}">
                ${isLiked(song.id) ? "❤️" : "🤍"}
              </button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  // play
  container.querySelectorAll(".play-btn").forEach(btn => {
    btn.onclick = () => playSong(btn.dataset.id);
  });

  // like
  container.querySelectorAll(".like-btn").forEach(btn => {
    btn.onclick = () => toggleLike(btn.dataset.id);
  });
}

// ========= MAIN =========
function render() {
  const list = getSongs();

  if (state.tab === "liked") {
    renderTable(list, "songsTableContainer");
  } else {
    renderTable(list, "allSongsTableContainer");
  }

  document.getElementById("likedSongsCount").innerText = favorites.length;
}

// ========= SEARCH =========
document.getElementById("searchInput").addEventListener("input", (e) => {
  state.search = e.target.value;
  render();
});

// ========= SORT =========
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    state.sort = btn.dataset.sort;
    render();
  };
});

// ========= TAB =========
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.onclick = () => {
    state.tab = btn.dataset.tab;

    document.getElementById("likedSongsTab").classList.toggle("hidden", state.tab !== "liked");
    document.getElementById("allSongsTab").classList.toggle("hidden", state.tab !== "all");

    render();
  };
});

// ========= INIT =========
(async function init() {
  allSongs = await loadSongs();
  render();
})();
const npBar = document.getElementById("nowPlayingBar");
const npTitle = document.getElementById("npTitle");
const npArtist = document.getElementById("npArtist");
const npCover = document.getElementById("npCover");
const npPlayBtn = document.getElementById("npPlayBtn");