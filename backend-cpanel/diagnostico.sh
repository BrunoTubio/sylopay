#!/bin/bash

echo "=== DIAGNÓSTICO DO DEPLOY SYLOPAY ==="
echo ""

# 1. Entrar no ambiente virtual
echo "1. Entrando no ambiente virtual..."
source /home/sylopay/nodevenv/demo.sylopay.com/api/22/bin/activate && cd /home/sylopay/demo.sylopay.com/api

# 2. Verificar versão do Node
echo ""
echo "2. Versão do Node.js:"
node --version

# 3. Verificar versão do npm
echo ""
echo "3. Versão do NPM:"
npm --version

# 4. Verificar diretório atual
echo ""
echo "4. Diretório atual:"
pwd

# 5. Listar arquivos no diretório
echo ""
echo "5. Arquivos no diretório:"
ls -la

# 6. Verificar se dist/app.js existe
echo ""
echo "6. Verificando arquivo dist/app.js:"
if [ -f "dist/app.js" ]; then
    echo "✓ dist/app.js existe"
    echo "Primeiras 20 linhas do arquivo:"
    head -20 dist/app.js
else
    echo "✗ dist/app.js NÃO existe!"
    echo "Conteúdo da pasta dist:"
    ls -la dist/
fi

# 7. Verificar arquivo .env
echo ""
echo "7. Verificando arquivo .env:"
if [ -f ".env" ]; then
    echo "✓ .env existe"
    echo "Conteúdo (sem dados sensíveis):"
    grep -E "^(NODE_ENV|PORT|STELLAR_NETWORK)" .env
else
    echo "✗ .env NÃO existe!"
fi

# 8. Verificar package.json
echo ""
echo "8. Verificando package.json:"
if [ -f "package.json" ]; then
    echo "✓ package.json existe"
    echo "Scripts disponíveis:"
    grep -A 5 '"scripts"' package.json
else
    echo "✗ package.json NÃO existe!"
fi

# 9. Verificar node_modules
echo ""
echo "9. Verificando node_modules:"
if [ -d "node_modules" ]; then
    echo "✓ node_modules existe"
    echo "Total de pacotes:"
    ls node_modules | wc -l
else
    echo "✗ node_modules NÃO existe!"
fi

# 10. Tentar executar o app manualmente
echo ""
echo "10. Tentando executar a aplicação manualmente:"
echo "Executando: node dist/app.js"
timeout 5 node dist/app.js 2>&1 | head -20

# 11. Verificar logs de erro
echo ""
echo "11. Verificando logs de erro recentes:"
if [ -f "npm-debug.log" ]; then
    echo "npm-debug.log encontrado:"
    tail -20 npm-debug.log
fi

if [ -f "stderr.log" ]; then
    echo "stderr.log encontrado:"
    tail -20 stderr.log
fi

# 12. Verificar processos Node rodando
echo ""
echo "12. Processos Node.js rodando:"
ps aux | grep node | grep -v grep

# 13. Verificar porta 3000
echo ""
echo "13. Verificando porta 3000:"
netstat -tuln | grep 3000 || lsof -i :3000 || echo "Porta 3000 não está em uso"

# 14. Testar compilação TypeScript
echo ""
echo "14. Verificando se TypeScript pode compilar:"
if [ -f "tsconfig.json" ] && [ -d "src" ]; then
    echo "Tentando compilar TypeScript:"
    npx tsc --noEmit 2>&1 | head -20
else
    echo "tsconfig.json ou pasta src não encontrados"
fi

echo ""
echo "=== FIM DO DIAGNÓSTICO ==="