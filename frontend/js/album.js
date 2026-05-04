  
        // ========== COMPLETE BOLLYWOOD SONGS LIBRARY ==========
        const allSongs = [
            { id: 1, title: "Deewani Mastani", artist: "Shreya Ghoshal", duration: "3:45", cover: "https://picsum.photos/id/100/200/200" },
            { id: 2, title: "Teri Meri", artist: "Shreya Ghoshal", duration: "3:30", cover: "https://picsum.photos/id/102/200/200" },
            { id: 3, title: "Chikni Chameli", artist: "Shreya Ghoshal", duration: "4:12", cover: "https://picsum.photos/id/103/200/200" },
            { id: 4, title: "Sun Raha Hai", artist: "Arijit Singh", duration: "4:49", cover: "https://picsum.photos/id/104/200/200" },
            { id: 5, title: "Radha", artist: "Shreya Ghoshal", duration: "3:58", cover: "https://picsum.photos/id/105/200/200" },
            { id: 6, title: "Kesariya", artist: "Arijit Singh", duration: "4:28", cover: "https://picsum.photos/id/116/200/200" },
            { id: 7, title: "Tum Hi Ho", artist: "Arijit Singh", duration: "4:22", cover: "https://picsum.photos/id/117/200/200" },
            { id: 8, title: "Apna Bana Le", artist: "Arijit Singh", duration: "4:22", cover: "https://picsum.photos/id/115/200/200" },
            { id: 9, title: "Gerua", artist: "Arijit Singh", duration: "5:45", cover: "https://picsum.photos/id/118/200/200" },
            { id: 10, title: "Kabira", artist: "Arijit Singh", duration: "3:43", cover: "https://picsum.photos/id/119/200/200" },
            { id: 11, title: "Channa Mereya", artist: "Arijit Singh", duration: "4:49", cover: "https://picsum.photos/id/104/200/200" },
            { id: 12, title: "Enna Sona", artist: "Arijit Singh", duration: "3:54", cover: "https://picsum.photos/id/111/200/200" },
            { id: 13, title: "Aabaad Barbaad", artist: "Arijit Singh", duration: "3:52", cover: "https://picsum.photos/id/114/200/200" },
            { id: 14, title: "Agar Tum Saath Ho", artist: "Arijit Singh", duration: "4:22", cover: "https://picsum.photos/id/115/200/200" }
        ];

        // Albums Storage
        let albums = JSON.parse(localStorage.getItem('vibox_albums') || '[]');
        let currentEditId = null;
        let currentView = 'grid';
        let currentFilter = 'all';
        let currentSort = 'recent';
        let searchQuery = '';
        let currentPage = 1;
        let currentAlbumSongs = [];
        let currentAlbumId = null;
        const itemsPerPage = 8;

        function saveAlbums() {
            localStorage.setItem('vibox_albums', JSON.stringify(albums));
            updateStats();
        }

        function updateStats() {
            const totalSongs = albums.reduce((sum, a) => sum + (a.songIds?.length || 0), 0);
            document.getElementById('totalAlbums').innerText = albums.length;
            document.getElementById('totalSongs').innerText = totalSongs;
        }

        function getFilteredAlbums() {
            let filtered = [...albums];
            
            if (searchQuery) {
                filtered = filtered.filter(a => 
                    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.artist.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
            
            if (currentFilter === 'az') {
                filtered.sort((a, b) => a.name.localeCompare(b.name));
            } else if (currentFilter === 'recent') {
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else {
                if (currentSort === 'az') filtered.sort((a, b) => a.name.localeCompare(b.name));
                else if (currentSort === 'songs') filtered.sort((a, b) => (b.songIds?.length || 0) - (a.songIds?.length || 0));
                else filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
            
            return filtered;
        }

        function renderAlbums() {
            const filtered = getFilteredAlbums();
            const totalPages = Math.ceil(filtered.length / itemsPerPage);
            const start = (currentPage - 1) * itemsPerPage;
            const paginated = filtered.slice(start, start + itemsPerPage);
            
            const container = document.getElementById('albumsContainer');
            
            if (paginated.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding:3rem;"><i class="fas fa-folder-open" style="font-size:3rem; opacity:0.5;"></i><p>No albums yet. Click "Create Album" to start!</p></div>`;
                document.getElementById('pagination').innerHTML = '';
                return;
            }
            
            if (currentView === 'grid') {
                container.className = 'albums-grid';
                container.innerHTML = paginated.map(album => `
                    <div class="album-card" onclick="showAlbumDetail(${album.id})">
                        <div class="album-cover">
                            <img src="${album.cover || 'https://picsum.photos/300/300?random=' + album.id}" alt="${album.name}">
                            <div class="album-overlay">
                                <button class="play-btn" onclick="event.stopPropagation(); playAlbum(${album.id})"><i class="fas fa-play"></i></button>
                            </div>
                            <span class="album-year">${album.year || '2024'}</span>
                        </div>
                        <div class="album-info">
                            <h3>${escapeHtml(album.name)}</h3>
                            <p class="artist">${escapeHtml(album.artist)}</p>
                            <div class="album-meta">
                                <span><i class="fas fa-music"></i> ${album.songIds?.length || 0} tracks</span>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                container.className = 'albums-list';
                container.innerHTML = paginated.map(album => `
                    <div class="album-list-item" onclick="showAlbumDetail(${album.id})">
                        <div class="album-cover-small">
                            <img src="${album.cover || 'https://picsum.photos/50/50?random=' + album.id}" alt="${album.name}">
                        </div>
                        <div class="album-list-info">
                            <h4>${escapeHtml(album.name)}</h4>
                            <p>${escapeHtml(album.artist)} • ${album.songIds?.length || 0} songs</p>
                        </div>
                        <button class="play-btn" style="width:35px; height:35px;" onclick="event.stopPropagation(); playAlbum(${album.id})"><i class="fas fa-play"></i></button>
                    </div>
                `).join('');
            }
            
            renderPagination(totalPages);
        }

        function renderPagination(totalPages) {
            const container = document.getElementById('pagination');
            if (totalPages <= 1) {
                container.innerHTML = '';
                return;
            }
            
            let html = `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
            for (let i = 1; i <= Math.min(totalPages, 5); i++) {
                html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
            }
            if (totalPages > 5) html += `<span>...</span><button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
            html += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
            container.innerHTML = html;
        }

        function changePage(page) {
            currentPage = page;
            renderAlbums();
        }

        function showAlbumDetail(albumId) {
            const album = albums.find(a => a.id === albumId);
            if (!album) return;
            
            currentAlbumId = albumId;
            currentAlbumSongs = (album.songIds || []).map(id => allSongs.find(s => s.id === id)).filter(s => s);
            
            document.getElementById('homeView').classList.add('hidden');
            document.getElementById('detailView').classList.remove('hidden');
            
            const detailContainer = document.getElementById('albumDetailView');
            detailContainer.innerHTML = `
                <div class="album-detail-header">
                    <div class="album-detail-cover">
                        <img src="${album.cover || 'https://picsum.photos/150/150?random=' + album.id}" alt="${album.name}">
                    </div>
                    <div class="album-detail-info">
                        <h2>${escapeHtml(album.name)}</h2>
                        <p>${escapeHtml(album.artist)} • ${album.year || '2024'}</p>
                        <p>${album.songIds?.length || 0} songs</p>
                        <button class="play-all-btn" onclick="playAlbumSongs()"><i class="fas fa-play"></i> Play All</button>
                        <button class="close-detail-btn" onclick="backToHome()">Back</button>
                    </div>
                </div>
                <table class="songs-table">
                    <thead>
                        <tr><th>#</th><th>Title</th><th>Artist</th><th>Duration</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        ${currentAlbumSongs.map((song, idx) => `
                            <tr class="song-row" onclick="playSongFromAlbum(${idx})">
                                <td>${String(idx+1).padStart(2,'0')}</td>
                                <td><strong>${escapeHtml(song.title)}</strong></td>
                                <td>${escapeHtml(song.artist)}</td>
                                <td>${song.duration}</td>
                                <td><button class="remove-song-btn" onclick="event.stopPropagation(); removeSongFromAlbum(${album.id}, ${song.id})"><i class="fas fa-trash"></i></button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
function playAlbumSongs() {
    if (AlbumPlayer.songs.length > 0) {
        playSongFromAlbum(0);
    }
}
       

       function playSongFromAlbum(index) {
    if (!AlbumPlayer.songs.length) return;

    const song = AlbumPlayer.songs[index];
    if (!song || !song.src) {
        showToast("Audio file missing ❌", "#dc2626");
        return;
    }

    AlbumPlayer.index = index;
    AlbumPlayer.audio.src = song.src;
    AlbumPlayer.audio.play();

    showToast(`🎵 Playing: ${song.title}`, '#7c3aed');
}

        function removeSongFromAlbum(albumId, songId) {
            const album = albums.find(a => a.id === albumId);
            if (album) {
                album.songIds = album.songIds.filter(id => id !== songId);
                saveAlbums();
                showAlbumDetail(albumId);
                showToast('Song removed from album', '#ff6a3d');
            }
        }

        function playAlbum(albumId) {
            const album = albums.find(a => a.id === albumId);
            if (album && album.songIds?.length > 0) {
                showToast(`🎵 Playing album: ${album.name}`, '#10b981');
            } else if (album) {
                showToast(`Album "${album.name}" has no songs yet`, '#ff6a3d');
            }
        }

        function backToHome() {
            document.getElementById('homeView').classList.remove('hidden');
            document.getElementById('detailView').classList.add('hidden');
            renderAlbums();
        }

        function openCreateModal(editId = null) {
            currentEditId = editId;
            const modal = document.getElementById('albumModal');
            const modalTitle = document.getElementById('modalTitle');
            const saveBtn = document.getElementById('saveAlbumBtn');
            
            if (editId) {
                const album = albums.find(a => a.id === editId);
                if (album) {
                    modalTitle.innerText = 'Edit Album';
                    saveBtn.innerText = 'Update Album';
                    document.getElementById('albumName').value = album.name;
                    document.getElementById('albumArtist').value = album.artist;
                    document.getElementById('albumYear').value = album.year || '';
                    document.getElementById('albumCover').value = album.cover || '';
                    renderSongListInModal(album.songIds || []);
                }
            } else {
                modalTitle.innerText = 'Create New Album';
                saveBtn.innerText = 'Create Album';
                document.getElementById('albumName').value = '';
                document.getElementById('albumArtist').value = '';
                document.getElementById('albumYear').value = '';
                document.getElementById('albumCover').value = '';
                renderSongListInModal([]);
            }
            modal.style.display = 'flex';
        }

        function renderSongListInModal(selectedIds = []) {
            const container = document.getElementById('songChecklist');
            container.innerHTML = allSongs.map(song => `
                <label class="song-check-item">
                    <input type="checkbox" value="${song.id}" ${selectedIds.includes(song.id) ? 'checked' : ''}>
                    <div class="song-info">
                        <strong>${escapeHtml(song.title)}</strong> - ${escapeHtml(song.artist)}
                    </div>
                </label>
            `).join('');
        }

        function closeModal() {
            document.getElementById('albumModal').style.display = 'none';
            currentEditId = null;
        }

        function saveAlbum() {
            const name = document.getElementById('albumName').value.trim();
            const artist = document.getElementById('albumArtist').value.trim();
            const year = document.getElementById('albumYear').value.trim();
            const cover = document.getElementById('albumCover').value.trim();
            const checkboxes = document.querySelectorAll('#songChecklist input:checked');
            const songIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
            
            if (!name || !artist) {
                showToast('Please enter album name and artist', '#dc2626');
                return;
            }
            
            if (currentEditId) {
                const album = albums.find(a => a.id === currentEditId);
                if (album) {
                    album.name = name;
                    album.artist = artist;
                    album.year = year;
                    album.cover = cover;
                    album.songIds = songIds;
                }
                showToast(`✅ "${name}" updated!`, '#10b981');
            } else {
                const newId = Date.now();
                albums.push({
                    id: newId,
                    name: name,
                    artist: artist,
                    year: year,
                    cover: cover,
                    songIds: songIds,
                    createdAt: new Date().toISOString()
                });
                showToast(`✅ "${name}" created with ${songIds.length} songs!`, '#10b981');
            }
            saveAlbums();
            renderAlbums();
            closeModal();
        }

        function showToast(msg, color) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerText = msg;
            toast.style.background = color;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }

        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
        }

        // Event Listeners
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            currentPage = 1;
            renderAlbums();
        });

        document.querySelectorAll('.filter-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                currentPage = 1;
                renderAlbums();
            });
        });

        document.getElementById('sortSelect')?.addEventListener('change', (e) => {
            currentSort = e.target.value;
            currentPage = 1;
            renderAlbums();
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentView = btn.dataset.view;
                renderAlbums();
            });
        });

        // Initialize default albums if empty
        if (albums.length === 0) {
            albums = [
                { id: 1, name: "Romantic Hits", artist: "Arijit Singh", year: "2024", cover: "https://picsum.photos/300/300?random=2", songIds: [4,7,8,11,14], createdAt: new Date().toISOString() },
                { id: 2, name: "Party Anthems", artist: "Shreya Ghoshal", year: "2023", cover: "https://picsum.photos/300/300?random=3", songIds: [1,2,3,5], createdAt: new Date().toISOString() },
                { id: 3, name: "Soulful Melodies", artist: "Various Artists", year: "2024", cover: "https://picsum.photos/300/300?random=4", songIds: [6,9,10,12,13], createdAt: new Date().toISOString() }
            ];
            saveAlbums();
        }

        updateStats();
        renderAlbums();

        window.openCreateModal = openCreateModal;
        window.closeModal = closeModal;
        window.saveAlbum = saveAlbum;
        window.playAlbum = playAlbum;
        window.showAlbumDetail = showAlbumDetail;
        window.backToHome = backToHome;
        window.changePage = changePage;
        window.playAlbumSongs = playAlbumSongs;
        window.playSongFromAlbum = playSongFromAlbum;
        window.removeSongFromAlbum = removeSongFromAlbum;
    