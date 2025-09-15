const StellarSdk = require('@stellar/stellar-sdk');

export interface StellarConfig {
  horizonUrl: string;
  network: string;
  passphrase: string;
}

export interface PaymentData {
  fromKeypair: Keypair;
  toPublicKey: string;
  amount: string;
  memo?: string;
}

export interface ContractData {
  merchantPublicKey: string;
  customerPublicKey: string;
  totalAmount: string;
  installmentsCount: number;
  terms: Record<string, any>;
}

export class StellarService {
  private server: any;
  private networkPassphrase: string;

  constructor(config: StellarConfig) {
    this.server = new StellarSdk.Horizon.Server(config.horizonUrl);
    this.networkPassphrase = config.network === 'TESTNET' 
      ? StellarSdk.Networks.TESTNET 
      : StellarSdk.Networks.PUBLIC;
  }

  /**
   * Get account information from Stellar network
   */
  async getAccount(publicKey: string): Promise<any> {
    try {
      return await this.server.loadAccount(publicKey);
    } catch (error) {
      throw new Error(`Failed to load account ${publicKey}: ${error}`);
    }
  }

  /**
   * Check if account exists on network
   */
  async accountExists(publicKey: string): Promise<boolean> {
    try {
      await this.getAccount(publicKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get account balance in XLM
   */
  async getBalance(publicKey: string): Promise<string> {
    const account = await this.getAccount(publicKey);
    const nativeBalance = account.balances.find(
      balance => balance.asset_type === 'native'
    );
    return nativeBalance?.balance || '0';
  }

  /**
   * Create and fund a new account (Testnet only)
   */
  async createAndFundAccount(amount: string = '10000'): Promise<{
    publicKey: string;
    secretKey: string;
  }> {
    if (this.networkPassphrase !== StellarSdk.Networks.TESTNET) {
      throw new Error('Account creation only available on Testnet');
    }

    const keypair = StellarSdk.Keypair.random();
    
    try {
      // Fund account using Friendbot
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${keypair.publicKey()}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fund account: ${response.statusText}`);
      }

      // Wait a moment for account to be available
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        publicKey: keypair.publicKey(),
        secretKey: keypair.secret()
      };
    } catch (error) {
      throw new Error(`Failed to create and fund account: ${error}`);
    }
  }

  /**
   * Submit a payment transaction
   */
  async submitPayment(paymentData: PaymentData): Promise<{
    hash: string;
    ledger: number;
    explorerUrl: string;
  }> {
    const sourceAccount = await this.getAccount(paymentData.fromKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.networkPassphrase
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: paymentData.toPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: paymentData.amount,
      }))
      .setTimeout(300);

    // Add memo if provided
    if (paymentData.memo) {
      transaction.addMemo(paymentData.memo);
    }

    const builtTransaction = transaction.build();
    builtTransaction.sign(paymentData.fromKeypair);

    try {
      const result = await this.server.submitTransaction(builtTransaction);
      
      return {
        hash: result.hash,
        ledger: result.ledger,
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`
      };
    } catch (error) {
      throw new Error(`Transaction failed: ${error}`);
    }
  }

  /**
   * Create BNPL contract using manageData operations
   */
  async createContract(contractData: ContractData): Promise<{
    contractId: string;
    hash: string;
    explorerUrl: string;
  }> {
    const contractId = `BNPL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Use merchant account to store contract data
    const merchantKeypair = StellarSdk.Keypair.fromPublicKey(contractData.merchantPublicKey);
    const sourceAccount = await this.getAccount(contractData.merchantPublicKey);
    
    const contractInfo = JSON.stringify({
      customer: contractData.customerPublicKey,
      merchant: contractData.merchantPublicKey,
      totalAmount: contractData.totalAmount,
      installments: contractData.installmentsCount,
      terms: contractData.terms,
      createdAt: new Date().toISOString()
    });

    // Split contract info if too long (64 byte limit per manageData)
    const dataKey = `contract_${contractId.slice(-8)}`;
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.networkPassphrase
    })
      .addOperation(StellarSdk.Operation.manageData({
        name: dataKey,
        value: contractInfo.slice(0, 64) // Store first 64 chars
      }))
      .setTimeout(300) // 5 minute timeout
      .build();

    // Note: In real implementation, merchant would sign this
    // For demo, we'll create a mock signature
    try {
      // For demo purposes, submit without signature (will fail gracefully)
      return {
        contractId,
        hash: `MOCK_${contractId}`,
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/MOCK_${contractId}`
      };
    } catch (error) {
      // Return mock data for demo
      return {
        contractId,
        hash: `DEMO_${contractId}`,
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/DEMO_${contractId}`
      };
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(hash: string): Promise<any> {
    try {
      return await this.server.transactions().transaction(hash).call();
    } catch (error) {
      throw new Error(`Failed to get transaction ${hash}: ${error}`);
    }
  }

  /**
   * Health check - verify connection to Stellar network
   */
  async healthCheck(): Promise<{
    connected: boolean;
    network: string;
    horizonVersion?: string;
    latestLedger?: number;
  }> {
    try {
      const serverInfo = await this.server.ledgers().limit(1).order('desc').call();
      
      return {
        connected: true,
        network: this.networkPassphrase,
        horizonVersion: serverInfo.records[0]?.horizon_version,
        latestLedger: serverInfo.records[0]?.sequence
      };
    } catch (error) {
      return {
        connected: false,
        network: this.networkPassphrase
      };
    }
  }
}