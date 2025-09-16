# Deploy da Versão Híbrida - COM Stellar (via API REST)

Esta versão acessa a rede Stellar real usando a API REST, sem o SDK pesado.

## Comandos para executar no SSH:

```bash
# 1. Entre no ambiente virtual
source /home/sylopay/nodevenv/demo.sylopay.com/api/22/bin/activate && cd /home/sylopay/demo.sylopay.com/api

# 2. Faça backup do arquivo atual
cp dist/app.js dist/app-backup-$(date +%Y%m%d).js

# 3. Faça upload do arquivo dist/app-hybrid.js via File Manager ou crie direto:
# (Copie o conteúdo do arquivo dist/app-hybrid.js)

# 4. Substitua o app.js
mv dist/app-hybrid.js dist/app.js

# 5. Teste executar
node dist/app.js

# 6. Se funcionar, teste os endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/stellar/health

# 7. Reinicie no painel do cPanel
```

## O que esta versão faz:

✅ **ACESSA Stellar real** via API REST (sem SDK)
✅ **Cria contas reais** no testnet via Friendbot
✅ **Consulta saldos reais** da blockchain
✅ **Verifica status real** da rede Stellar
✅ **Fallback para mock** se a rede estiver fora

## Endpoints funcionais:

- `/api/stellar/health` - Status real da rede Stellar
- `/api/stellar/create-account` - Tenta criar conta real no testnet
- `/api/stellar/account/:publicKey` - Busca conta real na blockchain
- `/api/stellar/transactions/:accountId` - Busca transações reais
- `/api/quotation` - Gera cotações
- `/api/contract` - Cria contratos (local com memo Stellar)

## Vantagens:

1. **Sem WebAssembly** - Não usa o SDK pesado
2. **Conexão real** - Acessa a blockchain Stellar
3. **Resiliente** - Funciona mesmo se Stellar estiver fora
4. **Leve** - Usa apenas fetch nativo do Node.js