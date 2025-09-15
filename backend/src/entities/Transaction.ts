import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Contract } from './Contract';

export enum TransactionType {
  CONTRACT_CREATION = 'contract_creation',
  INSTALLMENT_PAYMENT = 'installment_payment',
  MERCHANT_PAYOUT = 'merchant_payout',
  REFUND = 'refund'
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ name: 'contract_id' })
  contractId?: string;

  @Column({ name: 'stellar_tx_hash', length: 64, unique: true, nullable: true })
  stellarTxHash?: string;

  @Column({ name: 'transaction_type' })
  transactionType?: string;

  @Column({ default: 'pending' })
  status?: string;

  @Column()
  amount?: string;

  @Column({ name: 'from_address', length: 56 })
  fromAddress?: string;

  @Column({ name: 'to_address', length: 56 })
  toAddress?: string;

  @Column({ nullable: true })
  memo?: string;

  @Column({ type: 'text', nullable: true, name: 'stellar_result' })
  stellarResult?: string;

  @Column({ name: 'error_message', nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @Column({ name: 'confirmed_at', nullable: true })
  confirmedAt?: Date;

  // Relations
  @ManyToOne(() => Contract, contract => contract.transactions)
  @JoinColumn({ name: 'contract_id' })
  contract?: Contract;
}