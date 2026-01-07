# 🎮 Overlay de Conquistas Steam para OBS/Streamlabs

Um overlay moderno e elegante que exibe suas conquistas do Steam em tempo real durante suas transmissões!

## ✨ Funcionalidades

- 🔗 Conecta com perfil público da Steam
- 🎯 Seleciona qualquer jogo da sua biblioteca
- 🏆 Mostra a última conquista desbloqueada
- 📊 Exibe progresso completo de conquistas
- 🎨 Design moderno com animações suaves
- 🔄 Atualização automática a cada 30 segundos
- 🎭 Transparente e otimizado para streaming

## 📋 Pré-requisitos

1. **Chave da Steam API**
   - Acesse: https://steamcommunity.com/dev/apikey
   - Crie sua chave gratuita
   - Você precisará de um domínio (pode usar `localhost` para testes)

2. **Perfil Steam Público**
   - Seu perfil e jogos devem estar configurados como públicos
   - Vá em: Perfil → Editar Perfil → Configurações de Privacidade
   - Configure "Meu perfil" e "Detalhes do jogo" como "Público"

## 🚀 Instalação

### Passo 1: Configurar a Chave da API

1. Abra o arquivo `config.js`
2. Localize a linha:
   ```javascript
   const STEAM_API_KEY = 'SUA_CHAVE_API_AQUI';
   ```
3. Substitua `'SUA_CHAVE_API_AQUI'` pela sua chave da Steam API

4. Abra o arquivo `overlay.js`
5. Repita o processo:
   ```javascript
   const STEAM_API_KEY = 'SUA_CHAVE_API_AQUI';
   ```

### Passo 2: Servir os Arquivos

Você precisa servir os arquivos via HTTP (não abre apenas clicando no arquivo).

**Opção 1: VS Code Live Server (Recomendado)**
1. Instale a extensão "Live Server" no VS Code
2. Clique com botão direito em `config.html`
3. Selecione "Open with Live Server"

**Opção 2: Python**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Opção 3: Node.js**
```bash
npx http-server
```

**Opção 4: PHP**
```bash
php -S localhost:8000
```

### Passo 3: Configurar o Overlay

1. Abra `config.html` no navegador (ex: http://localhost:8000/config.html)
2. Cole o link do seu perfil Steam
   - Exemplo: `https://steamcommunity.com/id/seuperfil`
   - Ou: `https://steamcommunity.com/profiles/76561198012345678`
3. Clique em "Carregar Jogos"
4. Selecione o jogo que deseja exibir
5. Copie a URL do overlay gerada

## 🎥 Adicionar no OBS/Streamlabs

### OBS Studio

1. Clique no **+** em "Fontes"
2. Selecione **"Navegador"** (Browser Source)
3. Configure:
   - **URL**: Cole a URL do overlay
   - **Largura**: `500`
   - **Altura**: `150`
   - ✅ Marque: "Atualizar o navegador quando a cena ficar ativa"
   - ✅ Marque: "Fechar quando não visível"
4. Clique em "OK"
5. Posicione e redimensione conforme necessário

### Streamlabs OBS

1. Clique no **+** em "Fontes"
2. Selecione **"Widget URL do Navegador"**
3. Cole a URL do overlay
4. Configure as dimensões: **500x150**
5. Clique em "Adicionar Fonte"

## 🎨 Personalização

### Alterar Intervalo de Atualização

No arquivo `overlay.js`, linha 3:
```javascript
const UPDATE_INTERVAL = 30000; // 30 segundos (em milissegundos)
```

### Customizar Cores

Edite o arquivo `overlay-styles.css`:

```css
/* Cor de fundo do overlay */
.achievement-container {
    background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(46, 26, 46, 0.95) 100%);
}

/* Cor da barra de progresso */
.progress-fill {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

/* Cor quando desbloqueada */
.achievement-container.unlocked .achievement-name {
    color: #ffd700;
}
```

### Ajustar Tamanho da Fonte

No `overlay-styles.css`:
```css
.achievement-name {
    font-size: 18px; /* Altere conforme necessário */
}
```

## 🔧 Solução de Problemas

### "Configure sua chave da Steam API"
- Verifique se você colocou a chave correta em `config.js` e `overlay.js`
- A chave deve estar entre aspas: `'ABC123...'`

### "Nenhum jogo encontrado"
- Certifique-se de que seu perfil está público
- Verifique se o link do perfil está correto
- Aguarde alguns minutos e tente novamente

### "Este jogo não possui conquistas"
- Nem todos os jogos têm conquistas no Steam
- Selecione outro jogo da lista

### Overlay não aparece no OBS
- Verifique se a URL está correta
- Certifique-se de que o servidor local está rodando
- Tente atualizar a fonte no OBS (botão direito → Atualizar)

### Erro de CORS
- Use o servidor HTTP local (não abra o arquivo diretamente)
- O projeto já usa um proxy CORS, mas algumas APIs podem ter limites
- Se persistir, considere usar um servidor próprio

## 📁 Estrutura de Arquivos

```
projeto/
│
├── config.html           # Página de configuração
├── config.js            # Lógica da configuração
├── styles.css           # Estilos da página de config
│
├── overlay.html         # Overlay para OBS
├── overlay.js           # Lógica do overlay
├── overlay-styles.css   # Estilos do overlay
│
└── README.md            # Esta documentação
```

## 🌐 APIs Utilizadas

- **Steam Web API**: Para buscar dados de jogos e conquistas
- **AllOrigins**: Proxy CORS para contornar restrições de origem cruzada

## ⚠️ Limitações

- Funciona apenas com jogos da Steam
- Perfil deve estar público
- Requer conexão com internet
- API da Steam tem limite de requisições (200 por 5 minutos)
- Alguns jogos podem não ter conquistas

## 💡 Dicas

1. **Teste antes da live**: Sempre teste o overlay antes de transmitir
2. **Perfil público**: Mantenha pelo menos os jogos públicos
3. **Seleção de jogos**: Escolha jogos com conquistas interessantes
4. **Posicionamento**: Coloque o overlay em um canto discreto
5. **Backup da config**: Salve a URL do overlay em algum lugar

## 🎬 Como Funciona

1. Você insere o link do seu perfil Steam
2. O sistema busca todos os seus jogos via Steam API
3. Você seleciona o jogo que deseja monitorar
4. O overlay busca as conquistas do jogo a cada 30 segundos
5. Exibe a última conquista desbloqueada ou a próxima a desbloquear
6. Mostra o progresso geral (X/Y conquistas - Z%)

## 🔐 Privacidade

- Todos os dados são armazenados localmente no navegador (localStorage)
- Nenhuma informação é enviada para servidores externos (exceto Steam API)
- Seu Steam API key permanece no seu computador

## 📝 Licença

Este projeto é livre para uso pessoal e em streams. Sinta-se à vontade para modificar conforme necessário!

## 🆘 Suporte

Se tiver problemas:
1. Verifique os pré-requisitos
2. Leia a seção de solução de problemas
3. Confira as configurações de privacidade da Steam
4. Tente com outro navegador

## 🎯 Próximas Melhorias Possíveis

- [ ] Suporte para Xbox Live
- [ ] Suporte para PlayStation Network
- [ ] Múltiplos estilos de tema
- [ ] Notificações animadas para novas conquistas
- [ ] Histórico de conquistas desbloqueadas na sessão
- [ ] Sons personalizados

---

**Desenvolvido para streamers que querem compartilhar suas conquistas!** 🎮✨
