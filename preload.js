const { contextBridge } = require('electron');

// Expor APIs seguras para o renderer process
contextBridge.exposeInMainWorld('electron', {
    // Adicionar APIs conforme necessário
});
