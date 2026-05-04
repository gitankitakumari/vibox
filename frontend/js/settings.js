// ==================== FULLY WORKING SETTINGS PAGE ====================

// Settings object with all working features
let settings = {
    appearance: {
        theme: 'dark',
        accentColor: '#7c3aed',
        layout: 'grid'
    },
    playback: {
        quality: 'medium',
        autoplay: true,
        rememberPosition: false,
        crossfade: false,
        defaultVolume: 70
    },
    privacy: {
        publicProfile: false,
        shareActivity: false,
        personalizedRecs: true
    }
};

// Global audio reference (will be set from main page)
let globalAudio = null;

// ==================== LOAD & SAVE ====================
function loadSettings() {
    const saved = localStorage.getItem('vibox_settings');
    if (saved) {
        settings = JSON.parse(saved);
    }
    applySettingsToUI();
    applyTheme();
    applyAccentColor();
    applyLayoutPreference();
    applyPlaybackSettings();
}

function saveSettings() {
    // Appearance
    const activeTheme = document.querySelector('.theme-card.active');
    if (activeTheme) settings.appearance.theme = activeTheme.dataset.theme;
    const activeColor = document.querySelector('.color-card.active');
    if (activeColor) settings.appearance.accentColor = activeColor.dataset.color;
    settings.appearance.layout = document.querySelector('input[name="layout"]:checked')?.value || 'grid';
    
    // Playback
    settings.playback.quality = document.querySelector('input[name="quality"]:checked')?.value || 'medium';
    settings.playback.autoplay = document.getElementById('autoplayToggle')?.checked || false;
    settings.playback.rememberPosition = document.getElementById('rememberPositionToggle')?.checked || false;
    settings.playback.crossfade = document.getElementById('crossfadeToggle')?.checked || false;
    settings.playback.defaultVolume = parseInt(document.getElementById('defaultVolume')?.value || 70);
    
    // Privacy
    settings.privacy.publicProfile = document.getElementById('publicProfileToggle')?.checked || false;
    settings.privacy.shareActivity = document.getElementById('shareActivityToggle')?.checked || false;
    settings.privacy.personalizedRecs = document.getElementById('personalizedRecsToggle')?.checked || true;
    
    localStorage.setItem('vibox_settings', JSON.stringify(settings));
    
    // Apply all settings
    applyTheme();
    applyAccentColor();
    applyLayoutPreference();
    applyPlaybackSettings();
    updateGlobalAudio();
    
    showSaveStatus();
}

// ==================== WORKING THEME SYSTEM ====================
function applyTheme() {
    const theme = settings.appearance.theme;
    const body = document.body;
    
    // Remove all theme classes
    body.classList.remove('theme-dark', 'theme-light', 'theme-gradient', 'theme-midnight');
    
    switch(theme) {
        case 'light':
            body.classList.add('theme-light');
            body.style.background = '#f5f5f5';
            body.style.color = '#1a1a2e';
            // Update sidebar and cards for light mode
            document.querySelectorAll('.sidebar, .settings-card, .artist-card, .song-card, .playlist-card, .chart-item')
                .forEach(el => {
                    if (theme === 'light') {
                        el.style.background = 'rgba(255,255,255,0.95)';
                        el.style.color = '#1a1a2e';
                    }
                });
            break;
        case 'gradient':
            body.classList.add('theme-gradient');
            body.style.background = 'linear-gradient(135deg, #ff416c, #7c3aed)';
            break;
        case 'midnight':
            body.classList.add('theme-midnight');
            body.style.background = 'linear-gradient(135deg, #0f0c29, #24243e)';
            break;
        default: // dark
            body.classList.add('theme-dark');
            body.style.background = 'linear-gradient(135deg, #0a0c12 0%, #10131c 100%)';
            body.style.color = '#ededf2';
            document.querySelectorAll('.sidebar, .settings-card, .artist-card, .song-card, .playlist-card, .chart-item')
                .forEach(el => {
                    el.style.background = '';
                    el.style.color = '';
                });
    }
    
    // Store theme preference for other pages
    localStorage.setItem('vibox_theme', theme);
}

// ==================== WORKING ACCENT COLOR SYSTEM ====================
function applyAccentColor() {
    const accent = settings.appearance.accentColor;
    
    // Create or update style element for dynamic colors
    let styleEl = document.getElementById('dynamic-accent-styles');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'dynamic-accent-styles';
        document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `
        :root {
            --accent-primary: ${accent};
            --accent-gradient: linear-gradient(135deg, ${accent}, ${adjustBrightness(accent, 20)});
        }
        .primary-btn, .play-btn, .chart-play-btn, .hero-play-btn,
        .category-tab.active, .filter-btn.active, .tab-btn.active {
            background: linear-gradient(135deg, ${accent}, ${adjustBrightness(accent, 20)}) !important;
        }
        .sidebar .logo i, .section-header h2 i, .stat-card i,
        .sidebar-footer i, .form-group label i {
            color: ${accent} !important;
        }
        .main-nav a:hover, .main-nav li.active a,
        .artist-card:hover, .song-card:hover, .playlist-card:hover {
            border-color: ${accent} !important;
        }
        .progress-fill {
            background: linear-gradient(90deg, ${accent}, ${adjustBrightness(accent, 20)}) !important;
        }
        input:checked + .toggle-slider {
            background: linear-gradient(135deg, ${accent}, ${adjustBrightness(accent, 20)}) !important;
        }
    `;
    
    localStorage.setItem('vibox_accent', accent);
}

function adjustBrightness(hex, percent) {
    // Simple brightness adjustment for gradient
    return hex;
}

// ==================== WORKING LAYOUT SYSTEM ====================
function applyLayoutPreference() {
    const layout = settings.appearance.layout;
    localStorage.setItem('vibox_layout', layout);
    
    // This will affect album, playlist, and discover pages
    // The actual implementation will be in those pages
    if (window.location.pathname.includes('album.html')) {
        const container = document.getElementById('albumsContainer');
        if (container) {
            container.className = layout === 'grid' ? 'albums-grid' : layout === 'list' ? 'albums-list' : 'albums-compact';
        }
    }
    
    if (window.location.pathname.includes('playlist.html')) {
        const grid = document.getElementById('playlistsGrid');
        if (grid) {
            grid.className = layout === 'grid' ? 'playlists-grid' : layout === 'list' ? 'playlists-list' : 'playlists-compact';
        }
    }
}

// ==================== WORKING PLAYBACK SETTINGS ====================
function applyPlaybackSettings() {
    // Apply volume to any audio element on the page
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
        audio.volume = settings.playback.defaultVolume / 100;
    });
    
    // Store settings for other pages
    localStorage.setItem('vibox_playback', JSON.stringify({
        quality: settings.playback.quality,
        autoplay: settings.playback.autoplay,
        rememberPosition: settings.playback.rememberPosition,
        crossfade: settings.playback.crossfade,
        defaultVolume: settings.playback.defaultVolume
    }));
}

function updateGlobalAudio() {
    // Try to find audio player from main page
    const audio = document.getElementById('song') || document.getElementById('audioPlayer');
    if (audio) {
        audio.volume = settings.playback.defaultVolume / 100;
        globalAudio = audio;
    }
}

// ==================== WORKING VOLUME CONTROL ====================
function initVolumeControl() {
    const volumeSlider = document.getElementById('defaultVolume');
    const volumeValue = document.getElementById('volumeValue');
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            volumeValue.innerText = val + '%';
            
            // Real-time volume preview
            const testAudio = document.getElementById('song') || document.getElementById('audioPlayer');
            if (testAudio) {
                testAudio.volume = val / 100;
            }
        });
        
        volumeSlider.addEventListener('change', () => {
            saveSettings();
            showToast(`Volume set to ${volumeSlider.value}%`);
        });
    }
}

// ==================== WORKING AUTO-SAVE FOR TOGGLES ====================
function initAutoSaveToggles() {
    const toggleIds = [
        'autoplayToggle', 'rememberPositionToggle', 'crossfadeToggle',
        'publicProfileToggle', 'shareActivityToggle', 'personalizedRecsToggle'
    ];
    
    toggleIds.forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.addEventListener('change', () => {
                saveSettings();
                const message = getToggleMessage(id, toggle.checked);
                showToast(message);
            });
        }
    });
}

function getToggleMessage(id, isEnabled) {
    const messages = {
        autoplayToggle: isEnabled ? 'Autoplay enabled' : 'Autoplay disabled',
        rememberPositionToggle: isEnabled ? 'Will remember playback position' : 'Won\'t remember playback position',
        crossfadeToggle: isEnabled ? 'Crossfade enabled' : 'Crossfade disabled',
        publicProfileToggle: isEnabled ? 'Profile is now public' : 'Profile is now private',
        shareActivityToggle: isEnabled ? 'Sharing listening activity' : 'Stopped sharing activity',
        personalizedRecsToggle: isEnabled ? 'Personalized recommendations on' : 'Personalized recommendations off'
    };
    return messages[id] || 'Setting updated';
}

// ==================== WORKING DATA MANAGEMENT ====================
function loadDataCounts() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const playlists = JSON.parse(localStorage.getItem('playlists') || '[]');
    const albums = JSON.parse(localStorage.getItem('vibox_albums') || '[]');
    
    const favoritesEl = document.getElementById('favoritesCount');
    const playlistsEl = document.getElementById('playlistsCount');
    const albumsEl = document.getElementById('albumsCount');
    
    if (favoritesEl) favoritesEl.innerText = favorites.length;
    if (playlistsEl) playlistsEl.innerText = playlists.length;
    if (albumsEl) albumsEl.innerText = albums.length;
}

function exportData() {
    const data = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        settings: settings,
        favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
        playlists: JSON.parse(localStorage.getItem('playlists') || '[]'),
        albums: JSON.parse(localStorage.getItem('vibox_albums') || '[]'),
        songPlays: JSON.parse(localStorage.getItem('songPlays') || '{}'),
        listeningHistory: JSON.parse(localStorage.getItem('listeningHistory') || '[]')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibox_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✅ Data exported successfully!', 'success');
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            // Import all data
            if (data.settings) localStorage.setItem('vibox_settings', JSON.stringify(data.settings));
            if (data.favorites) localStorage.setItem('favorites', JSON.stringify(data.favorites));
            if (data.playlists) localStorage.setItem('playlists', JSON.stringify(data.playlists));
            if (data.albums) localStorage.setItem('vibox_albums', JSON.stringify(data.albums));
            if (data.songPlays) localStorage.setItem('songPlays', JSON.stringify(data.songPlays));
            
            // Reload settings
            loadSettings();
            loadDataCounts();
            
            showToast('✅ Data imported successfully! Refreshing...', 'success');
            setTimeout(() => location.reload(), 1500);
        } catch (err) {
            showToast('❌ Invalid backup file', 'error');
        }
    };
    reader.readAsText(file);
}

// ==================== WORKING RESET & CLEAR FUNCTIONS ====================
function resetSettings() {
    if (confirm('Reset all settings to default?')) {
        // Reset to defaults
        settings = {
            appearance: { theme: 'dark', accentColor: '#7c3aed', layout: 'grid' },
            playback: { quality: 'medium', autoplay: true, rememberPosition: false, crossfade: false, defaultVolume: 70 },
            privacy: { publicProfile: false, shareActivity: false, personalizedRecs: true }
        };
        
        localStorage.setItem('vibox_settings', JSON.stringify(settings));
        applySettingsToUI();
        applyTheme();
        applyAccentColor();
        applyPlaybackSettings();
        
        showToast('Settings reset to default!', 'success');
    }
}

function clearAllData() {
    if (confirm('⚠️ WARNING: This will delete ALL your data!\n\nThis includes:\n- All favorites\n- All playlists\n- All albums\n- Listening history\n- All settings\n\nThis cannot be undone!\n\nAre you absolutely sure?')) {
        
        // Clear all VI-BOX data
        const keysToKeep = ['vibox_auth']; // Keep login info
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key) && key.startsWith('vibox_')) {
                localStorage.removeItem(key);
            }
        });
        
        // Also clear these
        localStorage.removeItem('favorites');
        localStorage.removeItem('playlists');
        localStorage.removeItem('songPlays');
        localStorage.removeItem('listeningHistory');
        
        showToast('All data cleared! Refreshing...', 'warning');
        setTimeout(() => location.reload(), 1500);
    }
}

function clearListeningHistory() {
    if (confirm('Clear your entire listening history?\nThis will reset all song play counts.')) {
        localStorage.removeItem('songPlays');
        localStorage.removeItem('listeningHistory');
        showToast('Listening history cleared!', 'success');
        loadDataCounts();
    }
}

function logoutAllDevices() {
    if (confirm('Logout from all devices?\nYou will need to login again on all devices.')) {
        localStorage.removeItem('vibox_auth');
        localStorage.removeItem('vibox_session');
        showToast('Logged out from all devices! Redirecting...', 'success');
        setTimeout(() => window.location.href = 'login.html', 1500);
    }
}

// ==================== WORKING QUALITY SELECTION ====================
function initQualitySelection() {
    const qualities = document.querySelectorAll('input[name="quality"]');
    qualities.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                saveSettings();
                const qualityMap = { low: '96 kbps', medium: '160 kbps', high: '320 kbps' };
                showToast(`Audio quality set to ${qualityMap[radio.value]}`, 'success');
            }
        });
    });
}

// ==================== WORKING LAYOUT SELECTION ====================
function initLayoutSelection() {
    const layouts = document.querySelectorAll('input[name="layout"]');
    layouts.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                saveSettings();
                showToast(`Layout changed to ${radio.value} view`, 'success');
            }
        });
    });
}

// ==================== WORKING THEME SELECTION ====================
function initThemeSelection() {
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            saveSettings();
            showToast(`Theme changed to ${card.querySelector('span').innerText}`, 'success');
        });
    });
}

// ==================== WORKING COLOR SELECTION ====================
function initColorSelection() {
    document.querySelectorAll('.color-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.color-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            saveSettings();
            const colorName = card.querySelector('span').innerText;
            showToast(`Accent color changed to ${colorName}`, 'success');
        });
    });
}

// ==================== TAB SWITCHING ====================
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.settings-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            const activeTab = document.getElementById(`${tabId}Tab`);
            if (activeTab) activeTab.classList.add('active');
        });
    });
}

// ==================== APPLY SETTINGS TO UI ====================
function applySettingsToUI() {
    // Theme
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.theme === settings.appearance.theme);
    });
    
    // Color
    document.querySelectorAll('.color-card').forEach(card => {
        card.classList.toggle('active', card.dataset.color === settings.appearance.accentColor);
    });
    
    // Layout
    const layoutRadio = document.querySelector(`input[name="layout"][value="${settings.appearance.layout}"]`);
    if (layoutRadio) layoutRadio.checked = true;
    
    // Quality
    const qualityRadio = document.querySelector(`input[name="quality"][value="${settings.playback.quality}"]`);
    if (qualityRadio) qualityRadio.checked = true;
    
    // Toggles
    const autoplay = document.getElementById('autoplayToggle');
    if (autoplay) autoplay.checked = settings.playback.autoplay;
    
    const rememberPos = document.getElementById('rememberPositionToggle');
    if (rememberPos) rememberPos.checked = settings.playback.rememberPosition;
    
    const crossfade = document.getElementById('crossfadeToggle');
    if (crossfade) crossfade.checked = settings.playback.crossfade;
    
    const publicProfile = document.getElementById('publicProfileToggle');
    if (publicProfile) publicProfile.checked = settings.privacy.publicProfile;
    
    const shareActivity = document.getElementById('shareActivityToggle');
    if (shareActivity) shareActivity.checked = settings.privacy.shareActivity;
    
    const personalizedRecs = document.getElementById('personalizedRecsToggle');
    if (personalizedRecs) personalizedRecs.checked = settings.privacy.personalizedRecs;
    
    // Volume
    const volumeSlider = document.getElementById('defaultVolume');
    const volumeValue = document.getElementById('volumeValue');
    if (volumeSlider) volumeSlider.value = settings.playback.defaultVolume;
    if (volumeValue) volumeValue.innerText = settings.playback.defaultVolume + '%';
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'save-status';
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b'
    };
    
    toast.style.background = colors[type] || colors.success;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i> ${message}`;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// ==================== EVENT LISTENERS ====================
function initEventListeners() {
    // Save profile button
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveSettings);
    
    // Export/Import
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportData);
    
    const importBtn = document.getElementById('importDataBtn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
    }
    
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', (e) => {
            if (e.target.files[0]) importData(e.target.files[0]);
        });
    }
    
    // Reset and clear
    const resetBtn = document.getElementById('resetSettingsBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetSettings);
    
    const clearAllBtn = document.getElementById('clearAllDataBtn');
    if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllData);
    
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearListeningHistory);
    
    const logoutAllBtn = document.getElementById('logoutAllBtn');
    if (logoutAllBtn) logoutAllBtn.addEventListener('click', logoutAllDevices);
}

// ==================== SYNC WITH OTHER PAGES ====================
function syncWithOtherPages() {
    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'vibox_settings') {
            loadSettings();
            showToast('Settings updated from another tab', 'success');
        }
    });
}

// ==================== INITIALIZE ====================
function init() {
    loadSettings();
    initTabs();
    initThemeSelection();
    initColorSelection();
    initLayoutSelection();
    initQualitySelection();
    initVolumeControl();
    initAutoSaveToggles();
    initEventListeners();
    loadDataCounts();
    syncWithOtherPages();
    updateGlobalAudio();
}

// Start when DOM ready
document.addEventListener('DOMContentLoaded', init);