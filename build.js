const builder = require('electron-builder');
const Platform = builder.Platform;

// Configuração para gerar apenas o executável Windows
builder.build({
    targets: Platform.WINDOWS.createTarget(),
    config: {
        appId: 'com.steamoverlay.app',
        productName: 'Steam Overlay',
        directories: {
            output: 'dist'
        },
        win: {
            target: [
                {
                    target: 'nsis',
                    arch: ['x64']
                },
                {
                    target: 'portable',
                    arch: ['x64']
                }
            ]
        }
    }
}).then(() => {
    console.log('✅ Build concluído com sucesso!');
}).catch((error) => {
    console.error('❌ Erro ao fazer build:', error);
});
