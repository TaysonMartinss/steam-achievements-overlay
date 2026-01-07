// Verificar se já existe uma API Key salva
window.addEventListener('DOMContentLoaded', () => {
    const savedApiKey = localStorage.getItem('steamApiKey');

    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
        document.getElementById('apiKeyStatus').innerHTML =
            '<span class="success-text">✓ API Key já configurada. Você pode alterá-la ou continuar.</span>';
    }
});

// Função para mostrar/ocultar API Key
function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('apiKey');
    const toggleIcon = document.getElementById('toggleIcon');

    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        apiKeyInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Função para validar o formato da API Key
function validateApiKey(apiKey) {
    // API Key da Steam tem 32 caracteres hexadecimais
    const regex = /^[A-F0-9]{32}$/i;
    return regex.test(apiKey.trim());
}

// Função para salvar a API Key
async function saveApiKey() {
    const apiKeyInput = document.getElementById('apiKey');
    const apiKey = apiKeyInput.value.trim().toUpperCase();
    const statusDiv = document.getElementById('apiKeyStatus');

    if (!apiKey) {
        statusDiv.innerHTML = '<span class="error">❌ Por favor, insira a API Key</span>';
        return;
    }

    if (!validateApiKey(apiKey)) {
        statusDiv.innerHTML = '<span class="error">❌ API Key inválida. Deve conter 32 caracteres hexadecimais</span>';
        return;
    }

    statusDiv.innerHTML = '<span class="loading">⏳ Validando API Key...</span>';

    try {
        // Testar a API Key fazendo uma requisição simples
        const testUrl = `https://api.steampowered.com/ISteamWebAPIUtil/GetSupportedAPIList/v1/?key=${apiKey}`;

        // Usar o proxy local
        const PROXY_URL = 'http://localhost:3000/api/';
        const proxyUrl = `${PROXY_URL}?url=${encodeURIComponent(testUrl)}`;

        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error('Não foi possível conectar ao servidor proxy');
        }

        const data = await response.json();

        // Se a API Key for inválida, a Steam retorna um erro específico
        if (data.error) {
            throw new Error('API Key inválida ou sem permissões');
        }

        // Salvar no localStorage
        localStorage.setItem('steamApiKey', apiKey);

        statusDiv.innerHTML = '<span class="success-text">✅ API Key validada e salva com sucesso!</span>';

        // Redirecionar para a página de configuração após 1 segundo
        setTimeout(() => {
            window.location.href = 'config.html';
        }, 1000);

    } catch (error) {
        console.error('Erro ao validar API Key:', error);

        // Mesmo com erro de validação, permitir salvar (pode ser problema de rede)
        if (confirm('Não foi possível validar a API Key automaticamente. Deseja salvar mesmo assim?')) {
            localStorage.setItem('steamApiKey', apiKey);
            statusDiv.innerHTML = '<span class="success-text">✅ API Key salva! Redirecionando...</span>';
            setTimeout(() => {
                window.location.href = 'config.html';
            }, 1000);
        } else {
            statusDiv.innerHTML = `<span class="error">❌ Erro: ${error.message}</span>`;
        }
    }
}

// Permitir salvar ao pressionar Enter
document.getElementById('apiKey').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveApiKey();
    }
});
