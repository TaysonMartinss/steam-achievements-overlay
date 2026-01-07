// Obter a API Key do localStorage
let STEAM_API_KEY = localStorage.getItem('steamApiKey');

// URL do servidor proxy local (certifique-se de que está rodando)
const PROXY_URL = 'http://localhost:3000/api/';

// Verificar se a API Key está configurada
window.addEventListener('DOMContentLoaded', () => {
    if (!STEAM_API_KEY) {
        // Redirecionar para a página de configuração da API Key
        window.location.href = 'api-key.html';
    }
});

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

// Função para extrair Steam ID do perfil
async function getSteamId(profileUrl) {
    try {
        // Remove trailing slash
        profileUrl = profileUrl.replace(/\/$/, '');

        // Se já for um Steam ID numérico
        if (/^\d+$/.test(profileUrl.split('/').pop())) {
            return profileUrl.split('/').pop();
        }

        // Se for um custom URL
        const customUrl = profileUrl.split('/').pop();
        const apiUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${customUrl}`;

        const data = await fetchWithProxy(apiUrl);

        if (data.response.success === 1) {
            return data.response.steamid;
        }
        throw new Error('Não foi possível encontrar o Steam ID');
    } catch (error) {
        console.error('Erro ao obter Steam ID:', error);
        throw error;
    }
}

// Função para carregar jogos do usuário
async function loadGames() {
    const profileUrl = document.getElementById('profileUrl').value.trim();
    const statusDiv = document.getElementById('profileStatus');

    if (!profileUrl) {
        statusDiv.innerHTML = '<span class="error">❌ Por favor, insira o link do perfil</span>';
        return;
    }

    if (!STEAM_API_KEY) {
        statusDiv.innerHTML = '<span class="error">❌ API Key não configurada. Redirecionando...</span>';
        setTimeout(() => window.location.href = 'api-key.html', 1500);
        return;
    }

    statusDiv.innerHTML = '<span class="loading">⏳ Carregando jogos...</span>';

    try {
        const steamId = await getSteamId(profileUrl);
        const apiUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`;

        const data = await fetchWithProxy(apiUrl);

        if (!data.response.games || data.response.games.length === 0) {
            statusDiv.innerHTML = '<span class="error">❌ Nenhum jogo encontrado. Verifique se o perfil está público.</span>';
            return;
        }

        // Ordenar jogos por tempo jogado
        const games = data.response.games.sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0));

        displayGames(games, steamId);
        statusDiv.innerHTML = '<span class="success">✓ Jogos carregados com sucesso!</span>';

        // Mudar para o painel de jogos
        goToPanel('panel-games', 3);

        // Atualizar stepper para etapa 3
        updateStepper(3);

        // Salvar Steam ID
        localStorage.setItem('steamId', steamId);
    } catch (error) {
        statusDiv.innerHTML = `<span class="error">❌ Erro: ${error.message}</span>`;
    }
}

// Variáveis de paginação
let allGames = [];
let currentSteamId = '';
let currentPage = 1;
const gamesPerPage = 12;

// Função para exibir lista de jogos com paginação
function displayGames(games, steamId) {
    allGames = games;
    currentSteamId = steamId;
    currentPage = 1;
    renderGamesPage();
}

// Função para renderizar a página atual de jogos
function renderGamesPage() {
    const gamesList = document.getElementById('gamesList');
    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const gamesOnPage = allGames.slice(startIndex, endIndex);

    gamesList.innerHTML = '';

    gamesOnPage.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.onclick = () => selectGame(game.appid, game.name, currentSteamId);

        const imgUrl = `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`;

        gameCard.innerHTML = `
            <img src="${imgUrl}" alt="${game.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22%3E%3Crect fill=%22%23333%22 width=%2264%22 height=%2264%22/%3E%3C/svg%3E'">
            <div class="game-name">${game.name}</div>
            <div class="game-playtime">${Math.round(game.playtime_forever / 60)}h jogadas</div>
        `;

        gamesList.appendChild(gameCard);
    });

    updatePaginationControls();
}

// Função para mudar de página
function changePage(direction) {
    const totalPages = Math.ceil(allGames.length / gamesPerPage);
    const newPage = currentPage + direction;

    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderGamesPage();

        // Scroll suave para o topo da lista de jogos
        document.getElementById('gamesList').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Função para atualizar controles de paginação
function updatePaginationControls() {
    const totalPages = Math.ceil(allGames.length / gamesPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pagination = document.getElementById('pagination');

    // Mostrar/ocultar paginação
    if (totalPages <= 1) {
        pagination.style.display = 'none';
    } else {
        pagination.style.display = 'flex';
    }

    // Atualizar texto da página
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

    // Desabilitar botões conforme necessário
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// Função para selecionar um jogo
async function selectGame(appId, gameName, steamId) {
    const config = {
        appId: appId,
        gameName: gameName,
        steamId: steamId
    };

    // Salvar no localStorage também (fallback)
    localStorage.setItem('gameConfig', JSON.stringify(config));

    // Mudar para o painel final
    goToPanel('panel-done', 4);

    document.getElementById('selectedGameInfo').innerHTML = `
        <p><strong>Jogo selecionado:</strong> ${gameName}</p>
        <p><strong>App ID:</strong> ${appId}</p>
    `;

    // Criar URL com parâmetros para funcionar no OBS
    const apiKey = localStorage.getItem('steamApiKey');
    // SEMPRE usar localhost:3000 para garantir que funciona no OBS/Streamlabs
    const baseUrl = 'http://localhost:3000/overlay.html';
    const overlayUrl = `${baseUrl}?steamId=${steamId}&appId=${appId}&apiKey=${apiKey}&gameName=${encodeURIComponent(gameName)}`;
    document.getElementById('overlayUrl').textContent = overlayUrl;

    // Atualizar stepper para etapa 4 (concluído)
    updateStepper(4);

    // Não precisa mais de scroll
}

// Função para navegar entre painéis
function goToPanel(panelId, step) {
    // Ocultar todos os painéis
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    // Mostrar o painel selecionado
    document.getElementById(panelId).classList.add('active');

    // Atualizar stepper
    if (step) {
        updateStepper(step);
    }

    // Scroll para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Função para copiar URL do overlay
function copyOverlayUrl() {
    const urlElement = document.getElementById('overlayUrl');
    const url = urlElement.textContent;

    navigator.clipboard.writeText(url).then(() => {
        alert('✓ URL copiada para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('✓ URL copiada para a área de transferência!');
    });
}

// Função para abrir overlay em nova janela
function openOverlay() {
    const overlayUrl = document.getElementById('overlayUrl').textContent;
    window.open(overlayUrl, 'Overlay', 'width=400,height=150');
}

// Função para atualizar o stepper
function updateStepper(currentStep) {
    const steps = [
        { element: document.getElementById('step-profile'), line: null },
        { element: document.getElementById('step-game'), line: document.getElementById('line-game') },
        { element: document.getElementById('step-done'), line: document.getElementById('line-done') }
    ];

    // Atualizar cada etapa
    steps.forEach((step, index) => {
        const stepNumber = index + 2; // Começa do 2 (API Key é 1)

        if (stepNumber < currentStep) {
            // Etapa completada
            step.element.classList.remove('active');
            step.element.classList.add('completed');
            step.element.querySelector('.step-number').innerHTML = '<i class="fas fa-check"></i>';
            if (step.line) step.line.classList.add('completed');
        } else if (stepNumber === currentStep) {
            // Etapa ativa
            step.element.classList.remove('completed');
            step.element.classList.add('active');
            step.element.querySelector('.step-number').textContent = stepNumber;
        } else {
            // Etapa futura
            step.element.classList.remove('active', 'completed');
            step.element.querySelector('.step-number').textContent = stepNumber;
            if (step.line) step.line.classList.remove('completed');
        }
    });
}

// Função para atualizar o stepper
function updateStepper(currentStep) {
    const steps = [
        { element: document.getElementById('step-profile'), line: null },
        { element: document.getElementById('step-game'), line: document.getElementById('line-game') },
        { element: document.getElementById('step-done'), line: document.getElementById('line-done') }
    ];

    // Atualizar cada etapa
    steps.forEach((step, index) => {
        const stepNumber = index + 2; // Começa do 2 (API Key é 1)

        if (stepNumber < currentStep) {
            // Etapa completada
            step.element.classList.remove('active');
            step.element.classList.add('completed');
            step.element.querySelector('.step-number').innerHTML = '<i class="fas fa-check"></i>';
            if (step.line) step.line.classList.add('completed');
        } else if (stepNumber === currentStep) {
            // Etapa ativa
            step.element.classList.remove('completed');
            step.element.classList.add('active');
            step.element.querySelector('.step-number').textContent = stepNumber;
        } else {
            // Etapa futura
            step.element.classList.remove('active', 'completed');
            step.element.querySelector('.step-number').textContent = stepNumber;
            if (step.line) step.line.classList.remove('completed');
        }
    });
}
