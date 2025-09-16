import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

config();

const app = express();
const PORT = process.env.PORT || 8080;

// SQLite Database
let db: any;

const initDatabase = async () => {
  db = await open({
    filename: path.join(__dirname, '..', 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      merchant_public_key TEXT,
      customer_public_key TEXT,
      total_amount DECIMAL(20,7),
      installments_count INTEGER,
      installment_amount DECIMAL(20,7),
      status TEXT DEFAULT 'active',
      customer_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS installments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id TEXT,
      number INTEGER,
      amount DECIMAL(20,7),
      due_date DATETIME,
      status TEXT DEFAULT 'pending',
      tx_hash TEXT,
      paid_at DATETIME,
      FOREIGN KEY (contract_id) REFERENCES contracts(id)
    );
  `);

  console.log('✅ SQLite database initialized');
};

// Middleware
app.use(cors({
  origin: [
    'https://demo.sylopay.com',
    'http://localhost:3001',
    'http://localhost:5173',
    /\.sylopay\.com$/
  ],
  credentials: true
}));

app.use(express.json());

// Helper function to generate mock Stellar keys
function generateMockKeys() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let publicKey = 'G';
  let secretKey = 'S';

  for (let i = 0; i < 55; i++) {
    publicKey += chars[Math.floor(Math.random() * chars.length)];
    secretKey += chars[Math.floor(Math.random() * chars.length)];
  }

  return { publicKey, secretKey };
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SyloPay BNPL API',
    version: '1.0.0',
    status: 'running',
    environment: 'production',
    database: 'SQLite',
    endpoints: {
      health: '/health',
      stellar: '/api/stellar/health',
      quotation: '/api/quotation',
      contract: '/api/contract',
      createAccount: '/api/stellar/create-account'
    }
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.get('SELECT 1');

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'healthy',
        database: 'healthy',
        stellar: 'mocked'
      },
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Stellar health check (mocked for simplicity)
app.get('/api/stellar/health', async (req, res) => {
  res.json({
    connected: true,
    network: 'TESTNET',
    latestLedger: Math.floor(Date.now() / 5000), // Mock ledger number
    horizonUrl: 'https://horizon-testnet.stellar.org',
    note: 'Using simplified mock for demo'
  });
});

// Create Stellar account (mocked)
app.post('/api/stellar/create-account', async (req, res) => {
  try {
    const keys = generateMockKeys();

    res.json({
      success: true,
      account: {
        publicKey: keys.publicKey,
        secretKey: process.env.NODE_ENV === 'development' ? keys.secretKey : '[HIDDEN]'
      },
      balance: '10000.0000000',
      explorerUrl: `https://stellar.expert/explorer/testnet/account/${keys.publicKey}`,
      note: 'Mock account for demo purposes'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Account creation failed'
    });
  }
});

// Get account info (mocked)
app.get('/api/stellar/account/:publicKey', async (req, res) => {
  const { publicKey } = req.params;

  res.json({
    publicKey,
    balance: '10000.0000000',
    sequence: Date.now().toString(),
    explorerUrl: `https://stellar.expert/explorer/testnet/account/${publicKey}`,
    note: 'Mock data for demo'
  });
});

// Quotation endpoint
app.post('/api/quotation', async (req, res) => {
  try {
    const { amount, installments = 3 } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    const options = [2, 3, 4].map(count => {
      const installmentValue = (parseFloat(amount) / count).toFixed(2);
      return {
        installmentsCount: count,
        installmentAmount: installmentValue,
        totalAmount: amount,
        frequencyDays: 30,
        interestRate: '0.0000',
        description: `${count}x de R$ ${installmentValue}`
      };
    });

    res.json({
      success: true,
      originalAmount: amount,
      options,
      currency: 'BRL',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Quotation failed'
    });
  }
});

// Contract creation with SQLite persistence
app.post('/api/contract', async (req, res) => {
  try {
    const {
      merchantPublicKey,
      customerPublicKey,
      totalAmount,
      installmentsCount,
      customerData
    } = req.body;

    if (!totalAmount || !installmentsCount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const contractId = `BNPL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const installmentAmount = (parseFloat(totalAmount) / installmentsCount).toFixed(2);

    // Insert contract into SQLite
    await db.run(`
      INSERT INTO contracts (
        id, merchant_public_key, customer_public_key, total_amount,
        installments_count, installment_amount, customer_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      contractId,
      merchantPublicKey || generateMockKeys().publicKey,
      customerPublicKey || generateMockKeys().publicKey,
      totalAmount,
      installmentsCount,
      installmentAmount,
      JSON.stringify(customerData || {})
    ]);

    // Create installments
    const installments = [];
    for (let i = 1; i <= installmentsCount; i++) {
      const dueDate = new Date(Date.now() + (30 * i * 24 * 60 * 60 * 1000)).toISOString();

      await db.run(`
        INSERT INTO installments (contract_id, number, amount, due_date)
        VALUES (?, ?, ?, ?)
      `, [contractId, i, installmentAmount, dueDate]);

      installments.push({
        number: i,
        amount: installmentAmount,
        dueDate,
        status: 'pending',
        txHash: null
      });
    }

    res.json({
      success: true,
      contract: {
        id: contractId,
        merchantPublicKey,
        customerPublicKey,
        totalAmount,
        installmentsCount,
        installmentAmount,
        status: 'active',
        customerData,
        installments,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Contract creation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Contract creation failed'
    });
  }
});

// Get contract by ID
app.get('/api/contract/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await db.get('SELECT * FROM contracts WHERE id = ?', [id]);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const installments = await db.all(
      'SELECT * FROM installments WHERE contract_id = ? ORDER BY number',
      [id]
    );

    res.json({
      success: true,
      contract: {
        ...contract,
        customerData: JSON.parse(contract.customer_data || '{}'),
        installments
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Database error'
    });
  }
});

// Get all contracts
app.get('/api/contracts', async (req, res) => {
  try {
    const contracts = await db.all('SELECT * FROM contracts ORDER BY created_at DESC');

    res.json({
      success: true,
      contracts: contracts.map(c => ({
        ...c,
        customerData: JSON.parse(c.customer_data || '{}')
      })),
      total: contracts.length
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Database error'
    });
  }
});

// Process payment
app.post('/api/stellar/process-payment', async (req, res) => {
  try {
    const { contractId, installmentNumber } = req.body;

    const txHash = Array.from({length: 64}, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('').toUpperCase();

    // Update installment in database
    await db.run(`
      UPDATE installments
      SET status = 'paid', tx_hash = ?, paid_at = CURRENT_TIMESTAMP
      WHERE contract_id = ? AND number = ?
    `, [txHash, contractId, installmentNumber]);

    res.json({
      success: true,
      txHash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
      status: 'Payment processed'
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Payment processing failed'
    });
  }
});

// Error handling
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
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 SyloPay Backend running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`💾 Database: SQLite`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS enabled for: demo.sylopay.com`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;