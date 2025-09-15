import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Customer } from './Customer';
import { Transaction } from './Transaction';
import { Installment } from './Installment';

export enum ContractStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  CANCELLED = 'cancelled'
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ name: 'customer_id' })
  customerId?: string;

  @Column({ name: 'merchant_name' })
  merchantName?: string;

  @Column({ name: 'merchant_public_key', length: 56 })
  merchantPublicKey?: string;

  @Column({ name: 'product_name' })
  productName?: string;

  @Column({ name: 'total_amount' })
  totalAmount?: string;

  @Column({ name: 'installment_amount' })
  installmentAmount?: string;

  @Column({ name: 'installments_count' })
  installmentsCount?: number;

  @Column({ name: 'frequency_days', default: 30 })
  frequencyDays?: number;

  @Column({ name: 'interest_rate', default: '0.0000' })
  interestRate?: string;

  @Column({ default: 'pending' })
  status?: string;

  @Column({ name: 'stellar_contract_id', nullable: true, length: 64 })
  stellarContractId?: string;

  @Column({ type: 'text' })
  terms?: string;

  @Column({ type: 'text', default: '{}' })
  metadata?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  // Relations
  @ManyToOne(() => Customer, customer => customer.contracts)
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @OneToMany(() => Transaction, transaction => transaction.contract)
  transactions?: Transaction[];

  @OneToMany(() => Installment, installment => installment.contract)
  installments?: Installment[];
}