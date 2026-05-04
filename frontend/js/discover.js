// ==================== DISCOVER PAGE JS ====================
// Load songs from songs.json files

const artistsData = [
    { name: "Arijit Singh", folder: "arijit-singh", songs: [] },
    { name: "Shreya Ghoshal", folder: "shreya-ghoshal", songs: [] },
    { name: "Atif Aslam", folder: "atif-aslam", songs: [] },
    { name: "Yo Yo Honey Singh", folder: "honey-singh", songs: [] },
    { name: "Jubin Nautiyal", folder: "jubin-nautiyal", songs: [] },
    { name: "A.R. Rahman", folder: "ar-rahman", songs: [] },
    { name: "K.K.", folder: "kk", songs: [] },
    { name: "Alka Yagnik", folder: "alka-yagnik", songs: [] },
    { name: "SUBH", folder: "subh", songs: [] }
];

let allSongs = [];
let currentPlaylist = [];
let currentIndex = 0;
let audio = new Audio();

// Playlists data
const playlists = [
    { name: "Bollywood Hits", songs: [], icon: "fa-fire" },
    { name: "Romantic Classics", songs: [], icon: "fa-heart" },
    { name: "Party Mix", songs: [], icon: "fa-music" },
    { name: "Chill Vibes", songs: [], icon: "fa-cloud-moon" }
];

// DOM Elements
const trendingGrid = document.getElementById('trendingGrid');
const recommendedGrid = document.getElementById('recommendedGrid');
const searchInput = document.getElementById('searchInput');
const categoryTabs = document.querySelectorAll('.category-tab');
const npCover = document.getElementById('npCover');
const npTitle = document.getElementById('npTitle');
const npArtist = document.getElementById('npArtist');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Load songs from all artists
async function loadAllSongs() {
    for (const artist of artistsData) {
        try {
            const response = await fetch(`../assets/songs/${artist.folder}/songs.json`);
            const data = await response.json();
            
            artist.songs = data.songs.map(song => ({
                id: `${artist.folder}_${song.id}`,
                title: song.title,
                artist: artist.name,
                cover: `../assets/songs/${artist.folder}/${artist.folder}.jpg`,
                src: `../assets/songs/${artist.folder}/${song.file}`
            }));
            
            allSongs.push(...artist.songs);
        } catch(e) {
            console.warn(`Failed to load ${artist.name}:`, e);
        }
    }
    
    // Populate playlists with random songs
    playlists.forEach(playlist => {
        const shuffled = [...allSongs].sort(() => 0.5 - Math.random());
        playlist.songs = shuffled.slice(0, 8);
    });
    
    renderTrending();
    renderRecommended();
}

// Render trending section (random 6 songs)
function renderTrending() {
    const trending = [...allSongs].sort(() => 0.5 - Math.random()).slice(0, 6);
    trendingGrid.innerHTML = trending.map(song => `
        <div class="song-card" onclick="playSong('${song.id}')">
            <div class="song-cover">
                <img src="${song.cover}" alt="${song.title}" onerror="this.src='https://picsum.photos/180/150'">
                <div class="play-overlay"><i class="fas fa-play"></i></div>
            </div>
            <div class="song-info">
                <h4>${escapeHtml(song.title)}</h4>
                <p>${escapeHtml(song.artist)}</p>
            </div>
        </div>
    `).join('');
}

// Render recommended section (artists + playlists)
function renderRecommended() {
    const artists = artistsData.slice(0, 4);
    const randomPlaylists = [...playlists].sort(() => 0.5 - Math.random()).slice(0, 2);
    
    const artistsHtml = artists.map(artist => `
        <div class="artist-card" onclick="filterByArtist('${artist.name}')">
            <img src="../assets/songs/${artist.folder}/${artist.folder}.jpg" alt="${artist.name}" onerror="this.src='https://picsum.photos/100/100'">
            <h3>${escapeHtml(artist.name)}</h3>
            <p>${artist.songs.length} songs</p>
        </div>
    `).join('');
    
    const playlistsHtml = randomPlaylists.map(playlist => `
        <div class="playlist-card" onclick="showPlaylist('${playlist.name}')">
            <div class="playlist-cover">
                <i class="fas ${playlist.icon}"></i>
            </div>
            <div class="playlist-info">
                <h4>${escapeHtml(playlist.name)}</h4>
                <p>${playlist.songs.length} songs</p>
            </div>
        </div>
    `).join('');
    
    recommendedGrid.innerHTML = artistsHtml + playlistsHtml;
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (!query) {
        renderTrending();
        renderRecommended();
        return;
    }
    
    const filtered = allSongs.filter(song => 
        song.title.toLowerCase().includes(query) || 
        song.artist.toLowerCase().includes(query)
    ).slice(0, 8);
    
    trendingGrid.innerHTML = filtered.map(song => `
        <div class="song-card" onclick="playSong('${song.id}')">
            <div class="song-cover">
                <img src="${song.cover}" alt="${song.title}">
                <div class="play-overlay"><i class="fas fa-play"></i></div>
            </div>
            <div class="song-info">
                <h4>${escapeHtml(song.title)}</h4>
                <p>${escapeHtml(song.artist)}</p>
            </div>
        </div>
    `).join('');
    
    recommendedGrid.innerHTML = '';
});

// Category filtering
categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const category = tab.dataset.category;
        
        if (category === 'artist') {
            trendingGrid.innerHTML = artistsData.map(artist => `
                <div class="artist-card" onclick="filterByArtist('${artist.name}')">
                    <img src="../assets/songs/${artist.folder}/${artist.folder}.jpg" alt="${artist.name}">
                    <h3>${escapeHtml(artist.name)}</h3>
                    <p>${artist.songs.length} songs</p>
                </div>
            `).join('');
            recommendedGrid.innerHTML = '';
        } 
        else if (category === 'playlist') {
            trendingGrid.innerHTML = playlists.map(playlist => `
                <div class="playlist-card" onclick="showPlaylist('${playlist.name}')">
                    <div class="playlist-cover">
                        <i class="fas ${playlist.icon}"></i>
                    </div>
                    <div class="playlist-info">
                        <h4>${escapeHtml(playlist.name)}</h4>
                        <p>${playlist.songs.length} songs</p>
                    </div>
                </div>
            `).join('');
            recommendedGrid.innerHTML = '';
        }
        else {
            renderTrending();
            renderRecommended();
        }
    });
});

// Filter by artist
window.filterByArtist = function(artistName) {
    const artist = artistsData.find(a => a.name === artistName);
    if (!artist) return;
    
    trendingGrid.innerHTML = artist.songs.map(song => `
        <div class="song-card" onclick="playSong('${song.id}')">
            <div class="song-cover">
                <img src="${song.cover}" alt="${song.title}">
                <div class="play-overlay"><i class="fas fa-play"></i></div>
            </div>
            <div class="song-info">
                <h4>${escapeHtml(song.title)}</h4>
                <p>${escapeHtml(song.artist)}</p>
            </div>
        </div>
    `).join('');
    recommendedGrid.innerHTML = '';
    showToast(`🎵 ${artistName} songs`);
};

// Show playlist
window.showPlaylist = function(playlistName) {
    const playlist = playlists.find(p => p.name === playlistName);
    if (!playlist) return;
    
    trendingGrid.innerHTML = playlist.songs.map(song => `
        <div class="song-card" onclick="playSong('${song.id}')">
            <div class="song-cover">
                <img src="${song.cover}" alt="${song.title}">
                <div class="play-overlay"><i class="fas fa-play"></i></div>
            </div>
            <div class="song-info">
                <h4>${escapeHtml(song.title)}</h4>
                <p>${escapeHtml(song.artist)}</p>
            </div>
        </div>
    `).join('');
    recommendedGrid.innerHTML = '';
    showToast(`📋 ${playlistName} playlist`);
};

// Play song
window.playSong = function(songId) {
    const song = allSongs.find(s => s.id === songId);
    if (!song) return;
    
    currentPlaylist = allSongs;
    currentIndex = allSongs.findIndex(s => s.id === songId);
    
    audio.src = song.src;
    audio.play();
    
    npCover.src = song.cover;
    npTitle.innerText = song.title;
    npArtist.innerText = song.artist;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    
    showToast(`🎵 Now playing: ${song.title}`);
};

// Playback controls
function updatePlayer() {
    const song = currentPlaylist[currentIndex];
    if (!song) return;
    
    audio.src = song.src;

    
    npCover.src = song.cover;
    npTitle.innerText = song.title;
    npArtist.innerText = song.artist;
}

playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audio.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
});

nextBtn.addEventListener('click', () => {
    if (currentPlaylist.length) {
        currentIndex = (currentIndex + 1) % currentPlaylist.length;
        updatePlayer();
    }
});

prevBtn.addEventListener('click', () => {
    if (currentPlaylist.length) {
        currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        updatePlayer();
    }
});

audio.addEventListener('ended', () => {
    if (currentPlaylist.length) {
        currentIndex = (currentIndex + 1) % currentPlaylist.length;
        updatePlayer();
    }
});

// Helper functions
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