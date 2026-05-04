  
        // ========== USER DATA MANAGEMENT ==========
        let userData = JSON.parse(localStorage.getItem('vibox_user_data')) || {
            fullName: "VI-BOX User",
            username: "vibox_user",
            email: "user@vibox.com",
            phone: "",
            bio: "Music lover enjoying the best tunes on VI-BOX!",
            location: "India",
            favoriteGenre: "Bollywood",
            memberSince: new Date().getFullYear().toString(),
            avatar: "https://picsum.photos/120/120?random=1",
            stats: {
                songsPlayed: 2847,
                listeningTime: 342, // in minutes
                favorites: 128,
                playlists: 8
            },
            activity: [
                { action: "Created playlist 'Romantic Hits'", time: "2 hours ago", icon: "fa-list" },
                { action: "Liked song 'Kesariya'", time: "5 hours ago", icon: "fa-heart" },
                { action: "Played album 'Midnight Dreams'", time: "1 day ago", icon: "fa-play" },
                { action: "Added song to favorites", time: "2 days ago", icon: "fa-heart" },
                { action: "Created new playlist 'Workout Mix'", time: "3 days ago", icon: "fa-list" }
            ]
        };

        // Initialize user data
        function initUserData() {
            if (!localStorage.getItem('vibox_user_data')) {
                localStorage.setItem('vibox_user_data', JSON.stringify(userData));
            }
            loadUserData();
        }

        function loadUserData() {
            const data = JSON.parse(localStorage.getItem('vibox_user_data'));
            if (data) {
                userData = data;
                
                // Update profile display
                document.getElementById('profileDisplayName').innerText = data.fullName;
                document.getElementById('sidebarName').innerText = data.fullName.split(' ')[0];
                document.getElementById('memberSince').innerText = data.memberSince;
                
                // Update form fields
                document.getElementById('fullName').value = data.fullName;
                document.getElementById('username').value = data.username;
                document.getElementById('email').value = data.email;
                document.getElementById('phone').value = data.phone || '';
                document.getElementById('bio').value = data.bio || '';
                document.getElementById('location').value = data.location || '';
                document.getElementById('favoriteGenre').value = data.favoriteGenre || 'Bollywood';
                
                // Update avatar
                if (data.avatar) {
                    document.getElementById('profileAvatar').src = data.avatar;
                    document.getElementById('sidebarAvatar').src = data.avatar;
                }
                
                // Update stats
                document.getElementById('totalSongsPlayed').innerText = data.stats.songsPlayed.toLocaleString();
                const hours = Math.floor(data.stats.listeningTime / 60);
                const mins = data.stats.listeningTime % 60;
                document.getElementById('totalListeningTime').innerText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                document.getElementById('totalFavorites').innerText = data.stats.favorites;
                document.getElementById('totalPlaylists').innerText = data.stats.playlists;
                
                // Update sidebar stats
                document.getElementById('sidebarSongs').innerText = data.stats.songsPlayed.toLocaleString();
                document.getElementById('sidebarTime').innerText = hours > 0 ? `${hours}h` : `${mins}m`;
                
                // Update activity list
                renderActivity();
            }
        }

        function renderActivity() {
            const container = document.getElementById('activityList');
            if (userData.activity && userData.activity.length > 0) {
                container.innerHTML = userData.activity.map(activity => `
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas ${activity.icon}"></i>
                        </div>
                        <div class="activity-details">
                            <h4>${escapeHtml(activity.action)}</h4>
                            <p>${escapeHtml(activity.time)}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div style="text-align:center; padding:2rem;">No recent activity</div>';
            }
        }

        function saveUserData() {
            localStorage.setItem('vibox_user_data', JSON.stringify(userData));
            loadUserData();
            showToast('Profile updated successfully!', '#10b981');
        }

        // Save profile info
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            userData.fullName = document.getElementById('fullName').value;
            userData.username = document.getElementById('username').value;
            userData.email = document.getElementById('email').value;
            userData.phone = document.getElementById('phone').value;
            userData.bio = document.getElementById('bio').value;
            userData.location = document.getElementById('location').value;
            saveUserData();
        });

        // Save preferences
        function savePreferences() {
            userData.favoriteGenre = document.getElementById('favoriteGenre').value;
            saveUserData();
        }

        // Update password
        document.getElementById('passwordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const currentPwd = document.getElementById('currentPassword').value;
            const newPwd = document.getElementById('newPassword').value;
            const confirmPwd = document.getElementById('confirmPassword').value;
            
            if (!currentPwd || !newPwd || !confirmPwd) {
                showToast('Please fill all password fields', '#dc2626');
                return;
            }
            
            if (newPwd !== confirmPwd) {
                showToast('New passwords do not match', '#dc2626');
                return;
            }
            
            if (newPwd.length < 6) {
                showToast('Password must be at least 6 characters', '#dc2626');
                return;
            }
            
            showToast('Password updated successfully!', '#10b981');
            document.getElementById('passwordForm').reset();
        });

        // Avatar upload
        document.getElementById('avatarInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    userData.avatar = event.target.result;
                    saveUserData();
                    showToast('Profile picture updated!', '#10b981');
                };
                reader.readAsDataURL(file);
            }
        });

        // Tab switching
        function switchTab(tabName) {
            // Update tab buttons
            document.querySelectorAll('.section-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelector(`.section-tab[data-tab="${tabName}"]`).classList.add('active');
            
            // Update panes
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            document.getElementById(`${tabName}Tab`).classList.add('active');
        }

        // Tab click handlers
        document.querySelectorAll('.section-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                switchTab(tab.dataset.tab);
            });
        });

        // Logout
        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                showToast('Logged out successfully', '#7c3aed');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        }

        function showToast(message, color) {
            const existingToast = document.querySelector('.toast');
            if (existingToast) existingToast.remove();
            
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            toast.style.background = color;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }

        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
        }

        // Initialize
        initUserData();

        // Make functions global
        window.switchTab = switchTab;
        window.savePreferences = savePreferences;
        window.logout = logout;
    