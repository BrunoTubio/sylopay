import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { initializeDatabase } from './config/database';
import { StellarService } from './services/StellarService';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Load environment variables
config();

const app = express();
const PORT = process.env.API_PORT || 3000;

// Initialize Stellar service
const stellarService = new StellarService({
  horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  network: process.env.STELLAR_NETWORK || 'TESTNET',
  passphrase: process.env.STELLAR_NETWORK || 'TESTNET'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3002'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml')); // Ajuste o caminho se necessário
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const stellarHealth = await stellarService.healthCheck();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        stellar: stellarHealth.connected ? 'healthy' : 'unhealthy',
        database: 'healthy' // Will implement proper DB health check
      },
      stellar: stellarHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Stellar endpoints
app.get('/api/stellar/health', async (req, res) => {
  try {
    const health = await stellarService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Stellar service error' 
    });
  }
});

app.post('/api/stellar/create-account', async (req, res) => {
  try {
    const account = await stellarService.createAndFundAccount();
    res.json({
      success: true,
      account: {
        publicKey: account.publicKey,
        // Never return secret key in production!
        secretKey: process.env.NODE_ENV === 'development' ? account.secretKey : '[HIDDEN]'
      },
      explorerUrl: `https://stellar.expert/explorer/testnet/account/${account.publicKey}`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Account creation failed' 
    });
  }
});

app.get('/api/stellar/account/:publicKey', async (req, res) => {
  try {
    const { publicKey } = req.params;
    const account = await stellarService.getAccount(publicKey);
    const balance = await stellarService.getBalance(publicKey);
    
    res.json({
      publicKey,
      balance,
      sequence: account.sequence,
      explorerUrl: `https://stellar.expert/explorer/testnet/account/${publicKey}`
    });
  } catch (error) {
    res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Account not found' 
    });
  }
});

// Basic quotation endpoint
app.post('/api/quotation', async (req, res) => {
  try {
    const { amount, installments = 3 } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    const installmentAmount = (parseFloat(amount) / installments).toFixed(7);
    
    // Generate quotation options
    const options = [2, 3, 4].map(count => {
      const installmentValue = (parseFloat(amount) / count).toFixed(7);
      return {
        installmentsCount: count,
        installmentAmount: installmentValue,
        totalAmount: amount,
        frequencyDays: 30,
        interestRate: '0.0000',
        description: `${count}x de ${installmentValue} XLM`
      };
    });

    res.json({
      success: true,
      originalAmount: amount,
      options,
      currency: 'XLM',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Quotation failed' 
    });
  }
});

// Basic contract creation endpoint
app.post('/api/contract', async (req, res) => {
  try {
    const { merchantPublicKey, customerPublicKey, totalAmount, installmentsCount } = req.body;
    
    if (!merchantPublicKey || !customerPublicKey || !totalAmount || !installmentsCount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const contract = await stellarService.createContract({
      merchantPublicKey,
      customerPublicKey,
      totalAmount,
      installmentsCount,
      terms: {
        frequencyDays: 30,
        interestRate: '0.0000',
        createdAt: new Date().toISOString()
      }
    });

    res.json({
      success: true,
      contract: {
        id: contract.contractId,
        stellarTxHash: contract.hash,
        explorerUrl: contract.explorerUrl,
        status: 'created'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Contract creation failed' 
    });
  }
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`⭐ Stellar health: http://localhost:${PORT}/api/stellar/health`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;