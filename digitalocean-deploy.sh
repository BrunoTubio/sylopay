#!/bin/bash

# Script de Deploy para DigitalOcean Droplet
# Ubuntu 22.04 LTS

echo "=== SyloPay Deploy Script for DigitalOcean ==="

# 1. Atualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Instalar Docker e Docker Compose
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# 4. Instalar PM2 para gerenciar processos
sudo npm install -g pm2

# 5. Instalar Nginx
sudo apt install -y nginx

# 6. Clonar seu fork
cd /home
git clone https://github.com/SEU_USUARIO/sylopay.git
cd sylopay

# 7. Configurar Backend
cd backend

# Criar arquivo .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=bnpl_hackathon
DATABASE_USER=bnpl
DATABASE_PASSWORD=secure_password_here
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://localhost:5672
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_NETWORK=TESTNET
FRONTEND_URL=https://demo.sylopay.com
EOF

# Iniciar containers do Docker
docker-compose up -d

# Instalar dependências
npm install

# Build
npm run build

# Iniciar com PM2
pm2 start dist/app.js --name sylopay-backend

# 8. Configurar Frontend
cd ../frontend

# Criar .env
cat > .env << 'EOF'
VITE_API_URL=https://api.sylopay.com
EOF

# Instalar e buildar
npm install
npm run build

# 9. Configurar Nginx
sudo cat > /etc/nginx/sites-available/sylopay << 'EOF'
# Backend API
server {
    listen 80;
    server_name api.sylopay.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name demo.sylopay.com;
    root /home/sylopay/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Ativar site
sudo ln -s /etc/nginx/sites-available/sylopay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 10. Instalar Certbot para SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d demo.sylopay.com -d api.sylopay.com

# 11. Configurar PM2 para iniciar no boot
pm2 startup systemd
pm2 save

echo "=== Deploy Completo! ==="
echo "Frontend: https://demo.sylopay.com"
echo "Backend: https://api.sylopay.com"
echo "Para ver logs: pm2 logs sylopay-backend"