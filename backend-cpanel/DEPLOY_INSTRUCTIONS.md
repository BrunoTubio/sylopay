# INSTRUÇÕES DE DEPLOY - VERSÃO LITE (SEM STELLAR SDK)

## Problema Identificado
O servidor cPanel tem limitação de memória que impede o Stellar SDK de funcionar (erro WebAssembly out of memory).

## Solução
Criamos uma versão "lite" sem o Stellar SDK pesado, usando endpoints mockados para demonstração.

## Comandos para executar no SSH do cPanel:

```bash
# 1. Entre no ambiente virtual e vá para o diretório
source /home/sylopay/nodevenv/demo.sylopay.com/api/22/bin/activate && cd /home/sylopay/demo.sylopay.com/api

# 2. Faça backup do app.js atual
cp dist/app.js dist/app.js.backup

# 3. Remova o Stellar SDK das dependências
npm uninstall stellar-sdk @stellar/stellar-sdk

# 4. Instale apenas as dependências leves
npm install express cors dotenv

# 5. Crie o novo arquivo app-lite.js
# COPIE O CONTEÚDO DO ARQUIVO dist/app-lite.js PARA dist/app-lite.js no servidor

# 6. Renomeie para substituir o app.js
mv dist/app.js dist/app-full.js
mv dist/app-lite.js dist/app.js

# 7. Teste executar
node dist/app.js

# 8. Se funcionar, teste o health check
curl http://localhost:3000/health

# 9. No painel do cPanel, clique em RESTART para reiniciar a aplicação
```

## Endpoints Disponíveis (Todos Mockados)

- GET `/` - Informações da API
- GET `/health` - Health check
- GET `/api/stellar/health` - Status do Stellar (mockado)
- POST `/api/stellar/create-account` - Criar conta (mockada)
- GET `/api/stellar/account/:publicKey` - Info da conta (mockada)
- POST `/api/quotation` - Gerar cotação
- POST `/api/contract` - Criar contrato
- GET `/api/contract/:id` - Buscar contrato
- GET `/api/contracts` - Listar contratos
- POST `/api/stellar/process-payment` - Processar pagamento (mockado)

## Notas Importantes

1. Esta versão usa dados mockados para demonstração
2. Não há conexão real com a blockchain Stellar
3. Os dados são armazenados em memória (reiniciar perde os dados)
4. Ideal para demonstração e testes do frontend

## Upload via File Manager

Se preferir fazer upload via File Manager:
1. Faça upload do arquivo `dist/app-lite.js`
2. Renomeie `dist/app.js` para `dist/app-backup.js`
3. Renomeie `dist/app-lite.js` para `dist/app.js`
4. Reinicie a aplicação no painel Node.js