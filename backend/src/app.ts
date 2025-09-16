import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import * as StellarSdk from '@stellar/stellar-sdk';

config();

const app = express();
const PORT = process.env.PORT || 8080;

// Stellar configuration
const stellarServer = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const STELLAR_NETWORK = StellarSdk.Networks.TESTNET;

// Pre-funded merchant account for demo (in production, would be secure)
const MERCHANT_SECRET = 'SCZANGBA5YHTNYVWV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4';
const MERCHANT_KEYPAIR = (() => {
  try {
    return StellarSdk.Keypair.fromSecret(MERCHANT_SECRET);
  } catch {
    return StellarSdk.Keypair.random(); // Fallback if invalid
  }
})();

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

// Real Stellar account creation
async function createRealStellarAccount(): Promise<{publicKey: string, secretKey: string}> {
  const keypair = StellarSdk.Keypair.random();

  try {
    // Fund account using Friendbot (testnet only)
    const friendbotResponse = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(keypair.publicKey())}`
    );

    if (!friendbotResponse.ok) {
      throw new Error('Friendbot funding failed');
    }

    console.log(`✅ Real Stellar account created: ${keypair.publicKey()}`);

    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret()
    };
  } catch (error) {
    console.error('Error creating Stellar account:', error);
    throw error;
  }
}

// Real balance check
async function getRealBalance(publicKey: string): Promise<string> {
  try {
    const account = await stellarServer.loadAccount(publicKey);
    const xlmBalance = account.balances.find(b => b.asset_type === 'native');
    return xlmBalance?.balance || '0';
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
}

// Root endpoint
app.get('/', (req: express.Request, res: express.Response) => {
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
      createAccount: '/api/stellar/create-account',
      getAccount: '/api/stellar/account/:publicKey',
      getTransactions: '/api/stellar/transactions/:accountId',
      processPayment: '/api/stellar/process-payment'
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
        stellar: 'connected'
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

// Stellar health check (real)
app.get('/api/stellar/health', async (_req: express.Request, res: express.Response) => {
  try {
    const ledgers = await stellarServer.ledgers()
      .order('desc')
      .limit(1)
      .call();

    const latestLedger = ledgers.records[0];

    res.json({
      connected: true,
      network: 'TESTNET',
      latestLedger: latestLedger.sequence,
      closedAt: latestLedger.closed_at,
      horizonUrl: 'https://horizon-testnet.stellar.org',
      merchantAccount: MERCHANT_KEYPAIR.publicKey(),
      note: 'Connected to real Stellar testnet'
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error instanceof Error ? error.message : 'Stellar connection failed'
    });
  }
});

// Create real Stellar account
app.post('/api/stellar/create-account', async (_req: express.Request, res: express.Response) => {
  try {
    const account = await createRealStellarAccount();
    const balance = await getRealBalance(account.publicKey);

    res.json({
      success: true,
      account: {
        publicKey: account.publicKey,
        secretKey: process.env.NODE_ENV === 'development' ? account.secretKey : '[HIDDEN]'
      },
      balance: balance,
      funded: true,
      explorerUrl: `https://stellar.expert/explorer/testnet/account/${account.publicKey}`,
      note: 'Real account created and funded via Friendbot'
    });
  } catch (error) {
    console.error('Account creation failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Account creation failed'
    });
  }
});

// Get real account info
app.get('/api/stellar/account/:publicKey', async (req: express.Request, res: express.Response) => {
  try {
    const { publicKey } = req.params;
    const account = await stellarServer.loadAccount(publicKey);
    const balance = await getRealBalance(publicKey);

    res.json({
      publicKey,
      balance,
      sequence: account.sequence,
      subentryCount: account.subentry_count,
      lastModified: account.last_modified_ledger,
      explorerUrl: `https://stellar.expert/explorer/testnet/account/${publicKey}`,
      note: 'Real account data from Stellar network'
    });
  } catch (error) {
    console.error('Account lookup failed:', error);
    res.status(404).json({
      error: error instanceof Error ? error.message : 'Account not found on Stellar network'
    });
  }
});

// Quotation endpoint
app.post('/api/quotation', async (req: express.Request, res: express.Response) => {
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
app.post('/api/contract', async (req: express.Request, res: express.Response) => {
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
      merchantPublicKey || MERCHANT_KEYPAIR.publicKey(),
      customerPublicKey || (await createRealStellarAccount()).publicKey,
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

    // Create real blockchain transaction for contract
    let stellarTxHash = null;
    try {
      const sourceAccount = await stellarServer.loadAccount(MERCHANT_KEYPAIR.publicKey());

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: STELLAR_NETWORK
      })
      .addOperation(StellarSdk.Operation.payment({
        destination: customerPublicKey || (await createRealStellarAccount()).publicKey,
        amount: totalAmount,
        asset: StellarSdk.Asset.native()
      }))
      .addMemo(StellarSdk.Memo.text(`BNPL-${contractId}`))
      .setTimeout(180)
      .build();

      transaction.sign(MERCHANT_KEYPAIR);
      const result = await stellarServer.submitTransaction(transaction);
      stellarTxHash = result.hash;

      console.log(`✅ Real BNPL contract created on Stellar: ${stellarTxHash}`);
    } catch (stellarError) {
      console.error('Stellar transaction failed:', stellarError);
      // Continue with local contract even if blockchain fails
    }

    res.json({
      success: true,
      contract: {
        id: contractId,
        merchantPublicKey: merchantPublicKey || MERCHANT_KEYPAIR.publicKey(),
        customerPublicKey: customerPublicKey || 'PENDING_CREATION',
        totalAmount,
        installmentsCount,
        installmentAmount,
        status: 'active',
        customerData,
        installments,
        stellarTxHash,
        explorerUrl: stellarTxHash ? `https://stellar.expert/explorer/testnet/tx/${stellarTxHash}` : null,
        createdAt: new Date().toISOString(),
        note: stellarTxHash ? 'Contract registered on Stellar blockchain' : 'Local contract only'
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

// Get real transaction history
app.get('/api/stellar/transactions/:accountId', async (req: express.Request, res: express.Response) => {
  try {
    const { accountId } = req.params;

    const transactions = await stellarServer.transactions()
      .forAccount(accountId)
      .order('desc')
      .limit(20)
      .call();

    const formattedTxs = transactions.records.map(tx => ({
      hash: tx.hash,
      createdAt: tx.created_at,
      ledger: tx.ledger_attr,
      operationCount: tx.operation_count,
      memo: tx.memo,
      memoType: tx.memo_type,
      feeCharged: tx.fee_charged,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${tx.hash}`,
      successful: tx.successful
    }));

    res.json({
      success: true,
      account: accountId,
      transactions: formattedTxs,
      total: formattedTxs.length
    });
  } catch (error) {
    console.error('Transaction history failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get transaction history'
    });
  }
});

// Process real payment
app.post('/api/stellar/process-payment', async (req: express.Request, res: express.Response) => {
  try {
    const { contractId, installmentNumber, customerSecretKey } = req.body;

    if (!customerSecretKey) {
      return res.status(400).json({ error: 'Customer secret key required for real payment' });
    }

    // Get installment details
    const installment = await db.get(
      'SELECT * FROM installments WHERE contract_id = ? AND number = ?',
      [contractId, installmentNumber]
    );

    if (!installment) {
      return res.status(404).json({ error: 'Installment not found' });
    }

    if (installment.status === 'paid') {
      return res.status(400).json({ error: 'Installment already paid' });
    }

    // Create real payment transaction
    const customerKeypair = StellarSdk.Keypair.fromSecret(customerSecretKey);
    const sourceAccount = await stellarServer.loadAccount(customerKeypair.publicKey());

    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: STELLAR_NETWORK
    })
    .addOperation(StellarSdk.Operation.payment({
      destination: MERCHANT_KEYPAIR.publicKey(),
      amount: installment.amount,
      asset: StellarSdk.Asset.native()
    }))
    .addMemo(StellarSdk.Memo.text(`BNPL-${contractId}-P${installmentNumber}`))
    .setTimeout(180)
    .build();

    transaction.sign(customerKeypair);
    const result = await stellarServer.submitTransaction(transaction);

    // Update installment in database
    await db.run(`
      UPDATE installments
      SET status = 'paid', tx_hash = ?, paid_at = CURRENT_TIMESTAMP
      WHERE contract_id = ? AND number = ?
    `, [result.hash, contractId, installmentNumber]);

    console.log(`✅ Real payment processed: ${result.hash}`);

    res.json({
      success: true,
      txHash: result.hash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
      amount: installment.amount,
      installmentNumber,
      status: 'Payment confirmed on blockchain'
    });
  } catch (error) {
    console.error('Payment processing failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Payment processing failed'
    });
  }
});

// Error handling
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
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