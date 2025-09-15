import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Contract } from './Contract';

export enum InstallmentStatus {
  PENDING = 'pending',
  DUE = 'due',
  OVERDUE = 'overdue',
  PAID = 'paid',
  DEFAULTED = 'defaulted'
}

@Entity('installments')
@Unique(['contractId', 'installmentNumber'])
export class Installment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contract_id' })
  contractId: string;

  @Column({ name: 'installment_number' })
  installmentNumber: number;

  @Column()
  amount: string;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ default: 'pending' })
  status: string;

  @Column({ name: 'payment_tx_hash', length: 64, nullable: true })
  paymentTxHash?: string;

  @Column({ name: 'late_fee', default: '0.0000000' })
  lateFee: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'paid_at', nullable: true })
  paidAt?: Date;

  // Relations
  @ManyToOne(() => Contract, contract => contract.installments)
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;
}