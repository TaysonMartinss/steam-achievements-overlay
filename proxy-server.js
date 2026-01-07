// Servidor Proxy simples para contornar CORS
// Execute com: node proxy-server.js

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Habilitar CORS para todas as origens
app.use(cors());

// Rota do proxy
app.get('/api/*', async (req, res) => {
    try {
        // Extrair a URL real do parâmetro
        const targetUrl = req.query.url;

        if (!targetUrl) {
            return res.status(400).json({ error: 'URL não fornecida' });
        }

        console.log(`📡 Proxy request: ${targetUrl}`);

        // Fazer a requisição
        const response = await fetch(targetUrl);

        if (!response.ok) {
            console.error(`❌ Steam API error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error('Resposta:', errorText);
            return res.status(response.status).json({
                error: `Steam API error: ${response.status}`,
                details: errorText
            });
        }

        const data = await response.json();
        console.log('✅ Resposta recebida com sucesso');

        // Retornar os dados
        res.json(data);
    } catch (error) {
        console.error('❌ Erro no proxy:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor proxy rodando em http://localhost:${PORT}`);
    console.log(`📝 Use: http://localhost:${PORT}/api/?url=SUA_URL_AQUI`);
});
