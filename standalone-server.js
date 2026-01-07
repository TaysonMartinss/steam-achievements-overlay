// Servidor standalone para rodar o overlay sem Electron
// Execute: node standalone-server.js

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Endpoint proxy para Steam API
app.get('/api/', async (req, res) => {
    try {
        const targetUrl = req.query.url;

        if (!targetUrl) {
            return res.status(400).json({ error: 'URL não fornecida' });
        }

        console.log('Proxy requisição para:', targetUrl);

        const response = await fetch(targetUrl);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error('Erro no proxy:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'config.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 Servidor Overlay Steam - RODANDO                        ║
║                                                               ║
║   📡 URL do Servidor: http://localhost:${PORT}                   ║
║   📋 Configuração: http://localhost:${PORT}/config.html          ║
║   🎮 Overlay: http://localhost:${PORT}/overlay.html              ║
║                                                               ║
║   ⚠️  Para usar no Streamlabs/OBS:                           ║
║   1. Mantenha este servidor rodando                          ║
║   2. Configure seu jogo em: http://localhost:${PORT}            ║
║   3. Copie a URL do overlay gerada                           ║
║   4. Cole no Browser Source do Streamlabs/OBS                ║
║                                                               ║
║   ⌨️  Pressione Ctrl+C para parar o servidor                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
});

// Tratamento de erros
process.on('SIGINT', () => {
    console.log('\n\n👋 Servidor finalizado. Até logo!');
    process.exit(0);
});
