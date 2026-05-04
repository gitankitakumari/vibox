// ==================== STATE ====================
const App = { playlists: [], allSongs: [], currentSongs: [], currentIndex: 0, audio: new Audio(), activeId: null };

const artists = [
    { folder: "alka-yagnik", name: "Alka Yagnik" }, { folder: "ar-rahman", name: "A.R. Rahman" },
    { folder: "arijit-singh", name: "Arijit Singh" }, { folder: "atif-aslam", name: "Atif Aslam" },
    { folder: "honey-singh", name: "Honey Singh" }, { folder: "jubin-nautiyal", name: "Jubin Nautiyal" },
    { folder: "kk", name: "K.K." }, { folder: "shreya-ghoshal", name: "Shreya Ghoshal" }, { folder: "subh", name: "Subh" }
];
const covers = [
    '../assets/images/2.jpg',
    '../assets/images/3.jpg',
    '../assets/images/4.jpg',
    '../assets/images/5.jpg',
    '../assets/images/6.jpg',
    '../assets/images/7.jpg',
    '../assets/images/8.jpg'
];

function getRandomCover() {
    return covers[Math.floor(Math.random() * covers.length)];
}
// ==================== LOAD SONGS ====================
async function loadSongs() {
    for (const a of artists) {
        try {
            const res = await fetch(`../assets/songs/${a.folder}/songs.json`);
            if (!res.ok) continue;
            const data = await res.json();
            data.songs?.forEach((s, i) => App.allSongs.push({
                id: `${a.folder}_${i}`,
                title: s.title, artist: data.artist || a.name,
                cover: `../assets/songs/${a.folder}/${a.folder}.jpg`,
                src: `../assets/songs/${a.folder}/${s.file}`
            }));
        } catch(e) { console.warn(e); }
    }
    console.log(`✅ ${App.allSongs.length} songs loaded`);
}

// ==================== STORAGE ====================
const save = () => localStorage.setItem('playlists', JSON.stringify(App.playlists));

function loadPlaylists() {
    const saved = localStorage.getItem('playlists');
    if (saved) {
        App.playlists = JSON.parse(saved);
    } else {
        App.playlists = [
            { id: Date.now(), name: "❤️ Romantic", image: getRandomCover(), songs: [] },
            { id: Date.now()+1, name: "💪 Workout", image: getRandomCover(), songs: [] }
        ];
        save();
    }
    updateStats();
}

// ==================== RENDER ====================
const $ = (id) => document.getElementById(id);

function renderPlaylists() {
    const term = $('searchPlaylists')?.value.toLowerCase() || '';
    const filtered = term ? App.playlists.filter(p => p.name.toLowerCase().includes(term)) : App.playlists;
    const grid = $('playlistsGrid');
    if (!grid) return;
    if (!filtered.length) return grid.innerHTML = `<div class="empty"><i class="fas fa-folder-open"></i><p>No playlists</p></div>`;
    
    grid.innerHTML = filtered.map(p => `
        <div class="card" onclick="openPlaylist(${p.id})">
            <img class="cover" src="${p.image || '../assets/images/default.jpg'}" onerror="this.onerror=null; this.src='../assets/images/default.jpg'" >
            <h3>${escape(p.name)}</h3>
            <p><i class="fas fa-headphones"></i> ${p.songs.length} songs</p>
            <button class="delete" onclick="event.stopPropagation(); deletePlaylist(${p.id})"><i class="fas fa-trash"></i> Delete</button>
        </div>
    `).join('');
}

function renderSongs(playlist) {
    const container = $('playlistSongsList');
    if (!container) return;
    const songs = playlist.songs.map(id => App.allSongs.find(s => s.id === id)).filter(s => s);
    App.currentSongs = songs;
    
    const addBtn = `<div class="add-bar"><button id="addBtn" class="add-btn"><i class="fas fa-plus"></i> Add Songs</button></div>`;
    
    if (!songs.length) {
        container.innerHTML = addBtn + `<div class="empty"><i class="fas fa-music"></i><p>No songs. Add some!</p></div>`;
    } else {
        container.innerHTML = addBtn + songs.map((s, i) => `
            <div class="song ${i === App.currentIndex && App.activeId === playlist.id ? 'active' : ''}" onclick="play(${i})">
                <div class="info">
                    <div><i class="fas fa-music"></i> ${escape(s.title)}</div>
                    <div class="artist">${escape(s.artist)}</div>
                </div>
                <div class="actions">
                    <button class="play-btn" onclick="event.stopPropagation(); play(${i})"><i class="fas fa-play"></i></button>
                    <button class="remove" onclick="event.stopPropagation(); removeSong(${playlist.id}, '${s.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }
    $('addBtn')?.addEventListener('click', () => openModal(playlist.id));
}

// ==================== MODAL ====================
function openModal(playlistId = null) {
    const modal = $('createModal');
    const title = document.querySelector('#createModal .modal-header h3');
    const nameInput = $('playlistNameInput');
    const coverInput = $('playlistCoverInput');
    const label = document.querySelector('#createModal .modal-label');
    const selector = $('songSelectorList');
    
    if (playlistId) {
        const p = App.playlists.find(p => p.id === playlistId);
        title.innerText = `Add to "${p.name}"`;
        nameInput.style.display = coverInput.style.display = label.style.display = 'none';
        window.tempId = playlistId;
        selector.innerHTML = App.allSongs.map(s => `
            <label><input type="checkbox" value="${s.id}" ${p.songs.includes(s.id) ? 'checked' : ''}> ${escape(s.title)} - ${escape(s.artist)}</label>
        `).join('');
    } else {
        title.innerText = 'Create Playlist';
        nameInput.style.display = coverInput.style.display = label.style.display = 'block';
        nameInput.value = '';
        coverInput.value = '';
        window.tempId = null;
        selector.innerHTML = App.allSongs.map(s => `
            <label><input type="checkbox" value="${s.id}"> ${escape(s.title)} - ${escape(s.artist)}</label>
        `).join('');
    }
    modal.classList.add('show');
}

const closeModal = () => $('createModal')?.classList.remove('show');

function savePlaylist() {
    const selected = [...document.querySelectorAll('#songSelectorList input:checked')].map(cb => cb.value);
    
    if (window.tempId) {
        const p = App.playlists.find(p => p.id === window.tempId);
        if (p) { p.songs = selected; save(); renderSongs(p); }
    } else {
        const name = $('playlistNameInput')?.value.trim();
        if (!name) return toast('Enter name');
        const file = $('playlistCoverInput')?.files[0];
        const image = file ? URL.createObjectURL(file) : getRandomCover();
        App.playlists.push({ id: Date.now(), name, image, songs: selected });
        save();
        toast(`"${name}" created!`);
    }
    renderPlaylists();
    updateStats();
    closeModal();
}

// ==================== CRUD ====================
const deletePlaylist = (id) => {
    if (confirm('Delete?')) {
        App.playlists = App.playlists.filter(p => p.id !== id);
        save();
        renderPlaylists();
        updateStats();
        if (App.activeId === id) backHome();
        toast('Deleted');
    }
};

const openPlaylist = (id) => {
    const p = App.playlists.find(p => p.id === id);
    if (!p) return;
    App.activeId = id;
    $('detailPlaylistTitle').innerText = p.name;
    renderSongs(p);
    $('homeView').classList.remove('active');
    $('detailView').classList.add('active');
};

const backHome = () => {
    $('detailView').classList.remove('active');
    $('homeView').classList.add('active');
    App.activeId = null;
    renderPlaylists();
};

const removeSong = (pid, sid) => {
    const p = App.playlists.find(p => p.id === pid);
    if (p) {
        p.songs = p.songs.filter(id => id !== sid);
        save();
        if (App.activeId === pid) renderSongs(p);
        renderPlaylists();
        updateStats();
        toast('Song removed');
    }
};

// ==================== PLAYER ====================
function play(index) {
    if (!App.currentSongs.length) return;
    const song = App.currentSongs[index];
    if (!song) return;
    
    App.currentIndex = index;
    App.audio.src = song.src;
    App.audio.play();
    
    // Update player bar
    $('currentTitle').innerText = song.title;
    $('currentArtist').innerText = song.artist;
    $('currentCover').src = song.cover;
    $('currentCover').onerror = () => $('currentCover').src = '../assets/images/default.jpg';
    $('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
    
    // Highlight active
    document.querySelectorAll('.song').forEach((el, i) => {
        i === index ? el.classList.add('active') : el.classList.remove('active');
    });
}

const togglePlay = () => {
    if (App.audio.paused) {
        App.audio.play();
        $('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        App.audio.pause();
        $('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
    }
};

const next = () => App.currentSongs.length && play((App.currentIndex + 1) % App.currentSongs.length);
const prev = () => App.currentSongs.length && play((App.currentIndex - 1 + App.currentSongs.length) % App.currentSongs.length);

// ==================== UTILITIES ====================
const escape = (s) => s ? s.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])) : '';
const formatTime = (s) => isNaN(s) ? '0:00' : `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

function updateStats() {
    $('totalPlaylists').innerText = App.playlists.length;
    $('totalSongsCount').innerText = App.playlists.reduce((sum, p) => sum + p.songs.length, 0);
}

const toast = (msg) => {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
};

// ==================== EVENTS ====================
function bindEvents() {
    $('createPlaylistBtn')?.addEventListener('click', () => openModal());
    $('closeModalBtn')?.addEventListener('click', closeModal);
    $('backToHomeBtn')?.addEventListener('click', backHome);
    $('playPauseBtn')?.addEventListener('click', togglePlay);
    $('nextBtn')?.addEventListener('click', next);
    $('prevBtn')?.addEventListener('click', prev);
    $('searchPlaylists')?.addEventListener('input', renderPlaylists);
    
    document.querySelector('.modal-footer .btn-secondary')?.addEventListener('click', closeModal);
    document.querySelector('.modal-footer .btn-primary')?.addEventListener('click', savePlaylist);
    
    App.audio.addEventListener('timeupdate', () => {
        if (App.audio.duration) {
            $('progressFill').style.width = (App.audio.currentTime / App.audio.duration * 100) + '%';
            $('currentTime').innerText = formatTime(App.audio.currentTime);
            $('duration').innerText = formatTime(App.audio.duration);
        }
    });
    App.audio.addEventListener('ended', next);
    App.audio.addEventListener('play', () => $('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>');
    App.audio.addEventListener('pause', () => $('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>');
    
    document.querySelector('.progress-bar')?.addEventListener('click', (e) => {
        if (App.audio.duration) {
            const rect = e.currentTarget.getBoundingClientRect();
            App.audio.currentTime = ((e.clientX - rect.left) / rect.width) * App.audio.duration;
        }
    });
    $('createModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeModal(); });
}

// ==================== INIT ====================
async function init() {
    await loadSongs();
    loadPlaylists();
    bindEvents();
    renderPlaylists();
}

// Global exports
window.openPlaylist = openPlaylist;
window.play = play;
window.removeSong = removeSong;
window.backHome = backHome;
window.deletePlaylist = deletePlaylist;
window.togglePlay = togglePlay;
window.next = next;
window.prev = prev;

document.addEventListener('DOMContentLoaded', init);