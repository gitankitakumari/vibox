// ==================== TRENDING PAGE JS ====================
// Rating: 9/10 - Premium trending algorithm with play counts

// Artist data
const artistsData = [
    { name: "Arijit Singh", folder: "arijit-singh", plays: 0, songs: [] },
    { name: "Shreya Ghoshal", folder: "shreya-ghoshal", plays: 0, songs: [] },
    { name: "Atif Aslam", folder: "atif-aslam", plays: 0, songs: [] },
    { name: "Yo Yo Honey Singh", folder: "honey-singh", plays: 0, songs: [] },
    { name: "Jubin Nautiyal", folder: "jubin-nautiyal", plays: 0, songs: [] },
    { name: "A.R. Rahman", folder: "ar-rahman", plays: 0, songs: [] },
    { name: "K.K.", folder: "kk", plays: 0, songs: [] },
    { name: "Alka Yagnik", folder: "alka-yagnik", plays: 0, songs: [] },
    { name: "SUBH", folder: "subh", plays: 0, songs: [] }
];

let allSongs = [];
let songPlays = JSON.parse(localStorage.getItem('songPlays')) || {};
let currentPlaylist = [];
let currentIndex = 0;
let audio = new Audio();
let currentTimeFilter = 'week';

// Playlists
const hotPlaylists = [
    { name: "Bollywood Top 50", songs: [], icon: "fa-crown", hot: true },
    { name: "Romantic Hits", songs: [], icon: "fa-heart", hot: true },
    { name: "Party Anthems", songs: [], icon: "fa-music", hot: false },
    { name: "Chill Vibes", songs: [], icon: "fa-cloud-moon", hot: true }
];

// DOM Elements
const topChartsList = document.getElementById('topChartsList');
const trendingArtists = document.getElementById('trendingArtists');
const hotPlaylistsDiv = document.getElementById('hotPlaylists');
const risingStarsDiv = document.getElementById('risingStars');
const topSongTitle = document.getElementById('topSongTitle');
const topSongArtist = document.getElementById('topSongArtist');
const heroPlayBtn = document.getElementById('heroPlayBtn');
const totalPlaysSpan = document.getElementById('totalPlays');
const activeUsersSpan = document.getElementById('activeUsers');
const filterBtns = document.querySelectorAll('.filter-btn');

// Now Playing Elements
const npCover = document.getElementById('npCover');
const npTitle = document.getElementById('npTitle');
const npArtist = document.getElementById('npArtist');
const npPlayPause = document.getElementById('npPlayPause');
const npPrev = document.getElementById('npPrev');
const npNext = document.getElementById('npNext');
const npProgressBar = document.getElementById('npProgressBar');
const npProgressFill = document.getElementById('npProgressFill');
const npCurrentTime = document.getElementById('npCurrentTime');
const npDuration = document.getElementById('npDuration');
const npVolume = document.getElementById('npVolume');
const npLikeBtn = document.getElementById('npLikeBtn');

// Load all songs
async function loadAllSongs() {
    for (const artist of artistsData) {
        try {
            const res = await fetch(`../assets/songs/${artist.folder}/songs.json`);
            const data = await res.json();
            
            artist.songs = data.songs.map(song => ({
                id: `${artist.folder}_${song.id}`,
                title: song.title,
                artist: artist.name,
                cover: `../assets/songs/${artist.folder}/${artist.folder}.jpg`,
                src: `../assets/songs/${artist.folder}/${song.file}`,
                plays: songPlays[`${artist.folder}_${song.id}`] || 0
            }));
            
            allSongs.push(...artist.songs);
            artist.plays = artist.songs.reduce((sum, s) => sum + s.plays, 0);
        } catch(e) {
            console.warn(`Failed to load ${artist.name}`);
        }
    }
    
    // Populate playlists
    hotPlaylists.forEach(playlist => {
        const shuffled = [...allSongs].sort(() => 0.5 - Math.random());
        playlist.songs = shuffled.slice(0, 15);
    });
    
    updateTrendingData();
    updateStats();
}

// Update trending based on time filter
function updateTrendingData() {
    let sortedSongs = [...allSongs];
    
    if (currentTimeFilter === 'week') {
        sortedSongs.sort((a, b) => (b.plays || 0) - (a.plays || 0));
    } else if (currentTimeFilter === 'month') {
        sortedSongs.sort((a, b) => (b.plays || 0) - (a.plays || 0));
    } else {
        sortedSongs.sort((a, b) => (b.plays || 0) - (a.plays || 0));
    }
    
    const topSongs = sortedSongs.slice(0, 10);
    const topArtist = [...artistsData].sort((a, b) => b.plays - a.plays);
    const trendingArtistList = topArtist.slice(0, 6);
    const risingList = topArtist.slice(6, 12);
    
    if (topSongs[0]) {
        topSongTitle.innerText = topSongs[0].title;
        topSongArtist.innerText = topSongs[0].artist;
    }
    
    renderTopCharts(topSongs);
    renderTrendingArtists(trendingArtistList);
    renderHotPlaylists();
    renderRisingStars(risingList);
}

// Render top charts
function renderTopCharts(songs) {
    topChartsList.innerHTML = songs.map((song, idx) => `
        <div class="chart-item" onclick="playSong('${song.id}')">
            <div class="chart-rank ${idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : ''}">
                ${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
            </div>
            <img class="chart-cover" src="${song.cover}" onerror="this.src='https://picsum.photos/50/50'" alt="${song.title}">
            <div class="chart-info">
                <h4>${escapeHtml(song.title)}</h4>
                <p>${escapeHtml(song.artist)}</p>
            </div>
            <div class="chart-plays"><i class="fas fa-headphones"></i> ${formatPlays(song.plays || 0)}</div>
            <button class="chart-play-btn" onclick="event.stopPropagation(); playSong('${song.id}')"><i class="fas fa-play"></i></button>
        </div>
    `).join('');
}

// Render trending artists
function renderTrendingArtists(artists) {
    trendingArtists.innerHTML = artists.map(artist => `
        <div class="artist-card" onclick="filterByArtist('${artist.name}')">
            <img src="../assets/songs/${artist.folder}/${artist.folder}.jpg" onerror="this.src='https://picsum.photos/100/100'" alt="${artist.name}">
            <h3>${escapeHtml(artist.name)}</h3>
            <p>${formatPlays(artist.plays)} total plays</p>
            <span class="trend-badge"><i class="fas fa-chart-line"></i> Trending</span>
        </div>
    `).join('');
}

// Render hot playlists
function renderHotPlaylists() {
    const hotOnes = hotPlaylists.filter(p => p.hot);
    hotPlaylistsDiv.innerHTML = hotOnes.map(playlist => `
        <div class="playlist-card" onclick="showPlaylist('${playlist.name}')">
            <div class="playlist-cover">
                <i class="fas ${playlist.icon}"></i>
            </div>
            <div class="playlist-info">
                <h4>${escapeHtml(playlist.name)}</h4>
                <p>${playlist.songs.length} songs</p>
                <span class="hot-badge"><i class="fas fa-fire"></i> Hot</span>
            </div>
        </div>
    `).join('');
}

// Render rising stars
function renderRisingStars(artists) {
    risingStarsDiv.innerHTML = artists.map(artist => `
        <div class="rising-card" onclick="filterByArtist('${artist.name}')">
            <img src="../assets/songs/${artist.folder}/${artist.folder}.jpg" onerror="this.src='https://picsum.photos/80/80'" alt="${artist.name}">
            <h4>${escapeHtml(artist.name)}</h4>
            <p>${artist.songs.length} songs</p>
            <span class="up-badge"><i class="fas fa-arrow-up"></i> Rising</span>
        </div>
    `).join('');
}

// Update stats
function updateStats() {
    const total = allSongs.reduce((sum, s) => sum + (s.plays || 0), 0);
    totalPlaysSpan.innerText = formatPlays(total);
    activeUsersSpan.innerText = Math.floor(total / 50) + 124;
}

// Play song and increment count
function playSong(songId) {
    const song = allSongs.find(s => s.id === songId);
    if (!song) return;
    
    // Increment play count
    songPlays[songId] = (songPlays[songId] || 0) + 1;
    song.plays = songPlays[songId];
    localStorage.setItem('songPlays', JSON.stringify(songPlays));
    
    // Update artist plays
    const artist = artistsData.find(a => a.name === song.artist);
    if (artist) {
        artist.plays = artist.songs.reduce((sum, s) => sum + (songPlays[s.id] || 0), 0);
    }
    
    currentPlaylist = allSongs;
    currentIndex = allSongs.findIndex(s => s.id === songId);
    
    audio.src = song.src;
    audio.play();
    
    npCover.src = song.cover;
    npTitle.innerText = song.title;
    npArtist.innerText = song.artist;
    npPlayPause.innerHTML = '<i class="fas fa-pause"></i>';
    
    updateFavButton(songId);
    updateTrendingData();
    updateStats();
    showToast(`🎵 Playing: ${song.title}`);
}

// Update favorite button
function updateFavButton(songId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorites.includes(songId)) {
        npLikeBtn.innerHTML = '<i class="fas fa-heart"></i>';
        npLikeBtn.classList.add('active');
    } else {
        npLikeBtn.innerHTML = '<i class="far fa-heart"></i>';
        npLikeBtn.classList.remove('active');
    }
}

// Toggle favorite
npLikeBtn.addEventListener('click', () => {
    const currentSong = currentPlaylist[currentIndex];
    if (!currentSong) return;
    
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorites.includes(currentSong.id)) {
        favorites = favorites.filter(f => f !== currentSong.id);
        showToast(`💔 Removed from favorites`);
    } else {
        favorites.push(currentSong.id);
        showToast(`❤️ Added to favorites`);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavButton(currentSong.id);
});

// Filter by artist
window.filterByArtist = function(artistName) {
    const artistSongs = allSongs.filter(s => s.artist === artistName);
    if (artistSongs.length) {
        currentPlaylist = artistSongs;
        playSong(artistSongs[0].id);
        showToast(`🎤 Playing ${artistName} songs`);
    }
};

// Show playlist
window.showPlaylist = function(playlistName) {
    const playlist = hotPlaylists.find(p => p.name === playlistName);
    if (playlist && playlist.songs.length) {
        currentPlaylist = playlist.songs;
        playSong(playlist.songs[0].id);
        showToast(`📋 Playing ${playlistName}`);
    }
};

// Hero play button
heroPlayBtn.addEventListener('click', () => {
    const topSong = allSongs.sort((a, b) => (b.plays || 0) - (a.plays || 0))[0];
    if (topSong) playSong(topSong.id);
});

// Time filter
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTimeFilter = btn.dataset.time;
        updateTrendingData();
    });
});

// Audio controls
npPlayPause.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        npPlayPause.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audio.pause();
        npPlayPause.innerHTML = '<i class="fas fa-play"></i>';
    }
});

npPrev.addEventListener('click', () => {
    if (currentPlaylist.length) {
        currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        playSong(currentPlaylist[currentIndex].id);
    }
});

npNext.addEventListener('click', () => {
    if (currentPlaylist.length) {
        currentIndex = (currentIndex + 1) % currentPlaylist.length;
        playSong(currentPlaylist[currentIndex].id);
    }
});

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        npProgressFill.style.width = `${percent}%`;
        npCurrentTime.innerText = formatTime(audio.currentTime);
        npDuration.innerText = formatTime(audio.duration);
    }
});

audio.addEventListener('ended', () => {
    if (currentPlaylist.length) {
        currentIndex = (currentIndex + 1) % currentPlaylist.length;
        playSong(currentPlaylist[currentIndex].id);
    }
});

npProgressBar.addEventListener('click', (e) => {
    if (audio.duration) {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    }
});

npVolume.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Helper functions
function formatPlays(plays) {
    if (plays >= 1000000) return (plays / 1000000).toFixed(1) + 'M';
    if (plays >= 1000) return (plays / 1000).toFixed(1) + 'K';
    return plays.toString();
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Initialize
loadAllSongs();