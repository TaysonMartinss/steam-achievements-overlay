const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

let mainWindow;
let overlayWindow;
let server;
const PORT = 3000;

// Iniciar servidor Express
function startServer() {
    const expressApp = express();
    expressApp.use(cors());
    expressApp.use(express.json());
    expressApp.use(express.static(__dirname));

    // Endpoint proxy genérico para a Steam API
    expressApp.get('/api/', async (req, res) => {
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

    server = expressApp.listen(PORT, () => {
        console.log(`✅ Servidor proxy rodando em http://localhost:${PORT}`);
    });
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('api-key.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createOverlayWindow() {
    overlayWindow = new BrowserWindow({
        width: 400,
        height: 150,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    overlayWindow.loadFile('overlay.html');

    overlayWindow.on('closed', () => {
        overlayWindow = null;
    });
}

app.whenReady().then(() => {
    startServer();

    // Aguardar um pouco para garantir que o servidor está pronto
    setTimeout(() => {
        createMainWindow();
    }, 500);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (server) {
        server.close();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC para abrir janela de overlay
ipcMain.on('open-overlay', () => {
    if (!overlayWindow) {
        createOverlayWindow();
    } else {
        overlayWindow.show();
    }
});
