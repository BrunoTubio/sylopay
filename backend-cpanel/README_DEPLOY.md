# Deploy do Backend SyloPay no cPanel

## Passos para Deploy

### 1. Preparar arquivos localmente
```bash
cd backend-cpanel
npm install
npm run build
```

### 2. Fazer upload para o cPanel
Faça upload dos seguintes arquivos/pastas para `/home/sylopay/demo.sylopay.com/api`:
- `dist/` (pasta completa com arquivos JS compilados)
- `node_modules/` (pasta completa)
- `package.json`
- `.htaccess`

### 3. Criar arquivo .env no cPanel
No diretório `/home/sylopay/demo.sylopay.com/api`, crie um arquivo `.env`:
```
NODE_ENV=production
PORT=3000
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_NETWORK=TESTNET
FRONTEND_URL=https://demo.sylopay.com
```

### 4. Configurar aplicação Node.js no cPanel

No painel de configuração Node.js do cPanel:

- **Node.js version**: 22.18.0 (ou versão disponível)
- **Application mode**: Production
- **Application root**: demo.sylopay.com/api
- **Application URL**: demo.sylopay.com
- **Application startup file**: dist/app.js

### 5. Clicar em "STOP APP" e depois "START APP"

### 6. Testar endpoints

Acesse:
- https://demo.sylopay.com/api/ - Informações da API
- https://demo.sylopay.com/api/health - Health check
- https://demo.sylopay.com/api/stellar/health - Stellar health check

## Estrutura de Arquivos no Servidor

```
/home/sylopay/demo.sylopay.com/api/
├── dist/
│   └── app.js (arquivo principal compilado)
├── node_modules/
├── package.json
├── .env
└── .htaccess
```

## Solução de Problemas

### Erro 503
- Verifique se o arquivo `dist/app.js` existe
- Confirme que a porta no .env é 3000
- Reinicie a aplicação no painel Node.js

### Erro de módulos não encontrados
- Certifique-se que node_modules foi enviado completamente
- Ou execute `npm install` via terminal SSH se disponível

### Logs
- Verifique logs no cPanel em "Node.js" → "Run NPM Install"
- Use o botão "Run JS Script" para debug