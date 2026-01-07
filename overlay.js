// Obter a API Key da URL ou localStorage
let STEAM_API_KEY = null;

// Função para obter API Key da URL ou localStorage
function getApiKey() {
    // Tentar obter da URL primeiro (para OBS/Streamlabs)
    const urlParams = new URLSearchParams(window.location.search);
    const apiKeyFromUrl = urlParams.get('apiKey');

    if (apiKeyFromUrl) {
        console.log('API Key obtida da URL');
        return apiKeyFromUrl;
    }

    // Fallback para localStorage (para preview local)
    const apiKeyFromStorage = localStorage.getItem('steamApiKey');
    if (apiKeyFromStorage) {
        console.log('API Key obtida do localStorage');
        return apiKeyFromStorage;
    }

    return null;
}

// Inicializar API Key
STEAM_API_KEY = getApiKey();

const UPDATE_INTERVAL = 30000; // Atualizar a cada 30 segundos

// URL do servidor proxy local (certifique-se de que está rodando)
const PROXY_URL = 'http://localhost:3000/api/';

// Função para garantir que temos a API Key
function ensureApiKey() {
    if (!STEAM_API_KEY) {
        STEAM_API_KEY = getApiKey();
    }
    return STEAM_API_KEY;
}

// Função helper para fazer fetch com proxy local
async function fetchWithProxy(url) {
    try {
        const proxyUrl = `${PROXY_URL}?url=${encodeURIComponent(url)}`;
        console.log('Fazendo requisição via proxy:', url);

        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao fazer requisição:', error);
        throw new Error(`Erro ao buscar dados: ${error.message}. Certifique-se de que o servidor proxy está rodando.`);
    }
}

let currentConfig = null;
let lastAchievements = null;

// Função para obter configuração da URL ou localStorage
function getConfig() {
    // Tentar obter da URL primeiro (para OBS)
    const urlParams = new URLSearchParams(window.location.search);
    const steamId = urlParams.get('steamId');
    const appId = urlParams.get('appId');
    const gameName = urlParams.get('gameName');

    if (steamId && appId) {
        console.log('Configuração obtida da URL');
        return {
            steamId: steamId,
            appId: appId,
            gameName: gameName || 'Jogo'
        };
    }

    // Fallback para localStorage (para preview local)
    const storedConfig = localStorage.getItem('gameConfig');
    if (storedConfig) {
        console.log('Configuração obtida do localStorage');
        return JSON.parse(storedConfig);
    }

    return null;
}

// Inicializar overlay
async function initOverlay() {
    currentConfig = getConfig();

    if (!currentConfig) {
        showError('Nenhum jogo configurado. Abra config.html primeiro.');
        return;
    }

    console.log('Configuração carregada:', currentConfig);
    await updateAchievements();

    // Atualizar periodicamente
    setInterval(updateAchievements, UPDATE_INTERVAL);
}

// Buscar conquistas do jogo
async function updateAchievements() {
    if (!currentConfig) return;

    // Garantir que temos a API Key
    ensureApiKey();

    if (!STEAM_API_KEY) {
        showError('API Key não configurada. Por favor, configure no aplicativo.');
        return;
    }

    try {
        const { steamId, appId } = currentConfig;

        // Buscar conquistas do jogador
        const playerAchUrl = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${STEAM_API_KEY}&steamid=${steamId}`;
        const playerData = await fetchWithProxy(playerAchUrl);

        console.log('Resposta da API (playerData):', playerData);

        // Verificar se há erro na resposta
        if (playerData.playerstats?.error) {
            showError(`Erro da Steam API: ${playerData.playerstats.error}`);
            return;
        }

        // Verificar se há conquistas
        if (!playerData.playerstats || !playerData.playerstats.achievements || playerData.playerstats.achievements.length === 0) {
            showError('Este jogo não possui conquistas ou elas não estão disponíveis.');
            return;
        }

        // Buscar informações das conquistas (ícones, descrições)
        const schemaUrl = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${STEAM_API_KEY}&appid=${appId}`;
        const schemaData = await fetchWithProxy(schemaUrl);

        console.log('Resposta da API (schemaData):', schemaData);

        const achievementsSchema = schemaData.game?.availableGameStats?.achievements || [];

        // Combinar dados
        const achievements = playerData.playerstats.achievements.map(playerAch => {
            const schema = achievementsSchema.find(s => s.name === playerAch.apiname);
            return {
                ...playerAch,
                displayName: schema?.displayName || playerAch.apiname,
                description: schema?.description || '',
                icon: schema?.icon || '',
                iconGray: schema?.icongray || ''
            };
        });

        // Calcular estatísticas
        const unlocked = achievements.filter(a => a.achieved === 1);
        const total = achievements.length;
        const percentage = Math.round((unlocked.length / total) * 100);

        // Encontrar última conquista desbloqueada
        const lastUnlocked = unlocked
            .sort((a, b) => (b.unlocktime || 0) - (a.unlocktime || 0))[0];

        // Encontrar próxima conquista (primeira bloqueada)
        const nextLocked = achievements.find(a => a.achieved === 0);

        // Determinar qual conquista mostrar
        const displayAchievement = lastUnlocked || nextLocked || achievements[0];

        displayAchievementInfo(displayAchievement, unlocked.length, total, percentage);

        lastAchievements = achievements;
    } catch (error) {
        console.error('Erro ao atualizar conquistas:', error);
        showError('Erro ao carregar conquistas. Verifique a configuração.');
    }
}

// Exibir informação da conquista
function displayAchievementInfo(achievement, unlocked, total, percentage) {
    const container = document.getElementById('achievementDisplay');
    container.style.display = 'flex';

    // Ícone
    const icon = achievement.achieved === 1 ? achievement.icon : achievement.iconGray;
    document.getElementById('achIcon').src = icon || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22%3E%3Crect fill=%22%23444%22 width=%2264%22 height=%2264%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23888%22 font-size=%2230%22%3E%3F%3C/text%3E%3C/svg%3E';

    // Nome e descrição
    document.getElementById('achName').textContent = achievement.displayName || 'Conquista';

    let statusText = '';
    if (achievement.achieved === 1) {
        const date = new Date(achievement.unlocktime * 1000);
        statusText = `✓ Desbloqueada em ${date.toLocaleDateString('pt-BR')}`;
    } else {
        statusText = '🔒 Bloqueada';
    }

    document.getElementById('achDesc').textContent = statusText;

    // Progresso
    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('progressText').textContent = percentage + '%';
    document.getElementById('unlockedCount').textContent = unlocked;
    document.getElementById('totalCount').textContent = total;

    // Adicionar classe de desbloqueada
    if (achievement.achieved === 1) {
        container.classList.add('unlocked');
    } else {
        container.classList.remove('unlocked');
    }
}

// Mostrar erro
function showError(message) {
    const container = document.getElementById('achievementDisplay');
    container.innerHTML = `
        <div class="error-message">
            <div class="achievement-info">
                <div class="achievement-name">${message}</div>
            </div>
        </div>
    `;
}

// Iniciar quando a página carregar
window.addEventListener('DOMContentLoaded', initOverlay);
