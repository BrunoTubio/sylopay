import { Keypair } from "@stellar/stellar-sdk";

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