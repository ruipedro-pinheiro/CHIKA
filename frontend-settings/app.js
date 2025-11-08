/**
 * ⚙️ CHIKA SETTINGS - Configuration Management
 */

// === CONFIG ===
const API_BASE = 'http://localhost:8000';

// === STATE ===
let settings = {
    apiKeys: {
        anthropic: '',
        openai: '',
        google: '',
        ollama_url: 'http://localhost:11434'
    },
    models: {
        claude: 'claude-3-sonnet-20240229',
        gpt: 'gpt-4-turbo-preview',
        gemini: 'gemini-pro'
    },
    preferences: {
        theme: 'dark',
        defaultInterface: 'home',
        enableSounds: false,
        enableNotifications: true,
        responseLength: 'medium',
        temperature: 0.7,
        autoSave: true,
        markdownPreview: true
    },
    advanced: {
        maxTokens: 4096,
        requestTimeout: 60,
        enableStreaming: true,
        enableCache: false,
        contextSize: 50,
        autoCompress: true
    },
    stats: {
        messagesSent: 0
    }
};

// === DOM ELEMENTS ===
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.settings-section');
const toastEl = document.getElementById('toast');
const loadingEl = document.getElementById('loading');

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupNavigation();
    setupAPIKeys();
    setupOAuth();
    setupModels();
    setupPreferences();
    setupAdvanced();
    setupAbout();
    updateUI();
});

// === NAVIGATION ===
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            
            // Update nav
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            // Update sections
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// === API KEYS ===
function setupAPIKeys() {
    // Password toggle
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.target);
            if (target.type === 'password') {
                target.type = 'text';
                btn.textContent = '🙈';
            } else {
                target.type = 'password';
                btn.textContent = '👁️';
            }
        });
    });

    // Test API connections
    document.querySelectorAll('.test-api').forEach(btn => {
        btn.addEventListener('click', async () => {
            const provider = btn.dataset.provider;
            await testAPIConnection(provider);
        });
    });

    // Save on blur
    document.getElementById('anthropic-key').addEventListener('blur', () => {
        settings.apiKeys.anthropic = document.getElementById('anthropic-key').value;
        saveSettings();
        updateAPIStatus('anthropic');
    });

    document.getElementById('openai-key').addEventListener('blur', () => {
        settings.apiKeys.openai = document.getElementById('openai-key').value;
        saveSettings();
        updateAPIStatus('openai');
    });

    document.getElementById('google-key').addEventListener('blur', () => {
        settings.apiKeys.google = document.getElementById('google-key').value;
        saveSettings();
        updateAPIStatus('google');
    });

    document.getElementById('ollama-url').addEventListener('blur', () => {
        settings.apiKeys.ollama_url = document.getElementById('ollama-url').value;
        saveSettings();
    });
}

async function testAPIConnection(provider) {
    showLoading(true);
    showToast(`Test de connexion ${provider}...`, 'info');

    try {
        const response = await fetch(`${API_BASE}/test/${provider}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: settings.apiKeys[provider],
                url: provider === 'ollama' ? settings.apiKeys.ollama_url : undefined
            })
        });

        if (response.ok) {
            showToast(`✅ ${provider} connecté avec succès!`, 'success');
            updateAPIStatus(provider, 'success');
        } else {
            throw new Error('Connection failed');
        }
    } catch (error) {
        showToast(`❌ Erreur connexion ${provider}`, 'error');
        updateAPIStatus(provider, 'error');
    } finally {
        showLoading(false);
    }
}

function updateAPIStatus(provider, status = null) {
    const statusEl = document.getElementById(`status-${provider}`);
    const badge = statusEl.querySelector('.status-badge');
    
    if (status === 'success') {
        badge.textContent = 'Connecté';
        badge.className = 'status-badge success';
    } else if (status === 'error') {
        badge.textContent = 'Erreur';
        badge.className = 'status-badge error';
    } else {
        const hasKey = settings.apiKeys[provider] && settings.apiKeys[provider].length > 0;
        badge.textContent = hasKey ? 'Configuré' : 'Non configuré';
        badge.className = hasKey ? 'status-badge warning' : 'status-badge';
    }
}

// === OAUTH ===
function setupOAuth() {
    document.querySelectorAll('.oauth-connect').forEach(btn => {
        btn.addEventListener('click', async () => {
            const provider = btn.dataset.provider;
            await initiateOAuth(provider);
        });
    });

    document.querySelectorAll('.oauth-disconnect').forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.dataset.provider;
            disconnectOAuth(provider);
        });
    });
}

async function initiateOAuth(provider) {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/oauth/${provider}/url`);
        const data = await response.json();
        
        // Open OAuth window
        window.open(data.url, 'oauth', 'width=600,height=700');
        showToast('Fenêtre OAuth ouverte. Complétez l\'authentification.', 'info');
    } catch (error) {
        showToast('Erreur lors de l\'initialisation OAuth', 'error');
    } finally {
        showLoading(false);
    }
}

function disconnectOAuth(provider) {
    localStorage.removeItem(`oauth_token_${provider}`);
    document.getElementById(`oauth-info-${provider}`).classList.add('hidden');
    document.getElementById(`oauth-status-${provider}`).querySelector('.status-badge').textContent = 'Non connecté';
    showToast('OAuth déconnecté', 'success');
}

// === MODELS ===
function setupModels() {
    document.getElementById('claude-model').addEventListener('change', (e) => {
        settings.models.claude = e.target.value;
        saveSettings();
    });

    document.getElementById('gpt-model').addEventListener('change', (e) => {
        settings.models.gpt = e.target.value;
        saveSettings();
    });

    document.getElementById('gemini-model').addEventListener('change', (e) => {
        settings.models.gemini = e.target.value;
        saveSettings();
    });
}

// === PREFERENCES ===
function setupPreferences() {
    // Theme
    document.getElementById('default-theme').addEventListener('change', (e) => {
        settings.preferences.theme = e.target.value;
        saveSettings();
        applyTheme(e.target.value);
    });

    // Default interface
    document.getElementById('default-interface').addEventListener('change', (e) => {
        settings.preferences.defaultInterface = e.target.value;
        saveSettings();
    });

    // Checkboxes
    ['enable-sounds', 'enable-notifications', 'auto-save', 'markdown-preview'].forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            const key = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace('enable', 'enable');
            settings.preferences[id.replace(/-/g, '_').replace('enable_', 'enable')] = e.target.checked;
            saveSettings();
        });
    });

    // Response length
    document.getElementById('response-length').addEventListener('change', (e) => {
        settings.preferences.responseLength = e.target.value;
        saveSettings();
    });

    // Temperature slider
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperature-value');
    
    temperatureSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        temperatureValue.textContent = value.toFixed(1);
        settings.preferences.temperature = value;
        saveSettings();
    });
}

// === ADVANCED ===
function setupAdvanced() {
    // Max tokens
    document.getElementById('max-tokens').addEventListener('blur', (e) => {
        settings.advanced.maxTokens = parseInt(e.target.value);
        saveSettings();
    });

    // Request timeout
    document.getElementById('request-timeout').addEventListener('blur', (e) => {
        settings.advanced.requestTimeout = parseInt(e.target.value);
        saveSettings();
    });

    // Checkboxes
    ['enable-streaming', 'enable-cache', 'auto-compress'].forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            const key = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            settings.advanced[key] = e.target.checked;
            saveSettings();
        });
    });

    // Context size
    document.getElementById('context-size').addEventListener('blur', (e) => {
        settings.advanced.contextSize = parseInt(e.target.value);
        saveSettings();
    });

    // Clear context
    document.getElementById('clear-context').addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment effacer tout le contexte?')) {
            localStorage.removeItem('chika_context');
            showToast('Contexte effacé', 'success');
        }
    });

    // Export settings
    document.getElementById('export-settings').addEventListener('click', exportSettings);

    // Import settings
    document.getElementById('import-settings').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', importSettings);

    // Reset all
    document.getElementById('reset-all').addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment réinitialiser tous les paramètres?')) {
            localStorage.clear();
            location.reload();
        }
    });
}

// === ABOUT ===
function setupAbout() {
    // Load stats
    const messagesSent = parseInt(localStorage.getItem('chika_messages_sent') || '0');
    document.getElementById('stat-messages').textContent = messagesSent;
    settings.stats.messagesSent = messagesSent;
}

// === SAVE ALL ===
document.getElementById('save-all').addEventListener('click', () => {
    saveSettings();
    showToast('✅ Tous les paramètres sauvegardés!', 'success');
});

// === STORAGE ===
function loadSettings() {
    const saved = localStorage.getItem('chika_settings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
    }
    updateUI();
}

function saveSettings() {
    localStorage.setItem('chika_settings', JSON.stringify(settings));
}

function updateUI() {
    // API Keys
    document.getElementById('anthropic-key').value = settings.apiKeys.anthropic || '';
    document.getElementById('openai-key').value = settings.apiKeys.openai || '';
    document.getElementById('google-key').value = settings.apiKeys.google || '';
    document.getElementById('ollama-url').value = settings.apiKeys.ollama_url || 'http://localhost:11434';

    // Update statuses
    updateAPIStatus('anthropic');
    updateAPIStatus('openai');
    updateAPIStatus('google');

    // Models
    document.getElementById('claude-model').value = settings.models.claude;
    document.getElementById('gpt-model').value = settings.models.gpt;
    document.getElementById('gemini-model').value = settings.models.gemini;

    // Preferences
    document.getElementById('default-theme').value = settings.preferences.theme;
    document.getElementById('default-interface').value = settings.preferences.defaultInterface;
    document.getElementById('enable-sounds').checked = settings.preferences.enableSounds;
    document.getElementById('enable-notifications').checked = settings.preferences.enableNotifications;
    document.getElementById('response-length').value = settings.preferences.responseLength;
    document.getElementById('temperature').value = settings.preferences.temperature;
    document.getElementById('temperature-value').textContent = settings.preferences.temperature.toFixed(1);
    document.getElementById('auto-save').checked = settings.preferences.autoSave;
    document.getElementById('markdown-preview').checked = settings.preferences.markdownPreview;

    // Advanced
    document.getElementById('max-tokens').value = settings.advanced.maxTokens;
    document.getElementById('request-timeout').value = settings.advanced.requestTimeout;
    document.getElementById('enable-streaming').checked = settings.advanced.enableStreaming;
    document.getElementById('enable-cache').checked = settings.advanced.enableCache;
    document.getElementById('context-size').value = settings.advanced.contextSize;
    document.getElementById('auto-compress').checked = settings.advanced.autoCompress;

    // Apply theme
    applyTheme(settings.preferences.theme);
}

function applyTheme(theme) {
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
}

// === EXPORT/IMPORT ===
function exportSettings() {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chika-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Paramètres exportés', 'success');
}

function importSettings(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            settings = { ...settings, ...imported };
            saveSettings();
            updateUI();
            showToast('Paramètres importés avec succès!', 'success');
        } catch (error) {
            showToast('Erreur lors de l\'importation', 'error');
        }
    };
    reader.readAsText(file);
}

// === UI HELPERS ===
function showLoading(show) {
    loadingEl.classList.toggle('hidden', !show);
}

function showToast(message, type = 'info') {
    toastEl.textContent = message;
    toastEl.className = `toast ${type}`;
    toastEl.classList.remove('hidden');

    setTimeout(() => {
        toastEl.classList.add('hidden');
    }, 3000);
}

// === EXPOSE SETTINGS ===
window.chikaSettings = settings;
