import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentStatus {
  INITIATED = 'INITIATED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  AUTHORIZED = 'AUTHORIZED',
  REFUNDED = 'REFUNDED',
}

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'The payment lifecycle status',
});

@ObjectType()
@Entity('payments')
export class Payment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  moyasarId: string;

  @Field(() => Int)
  @Column({ type: 'int' })
  amount: number; // stored in Halalas (1 SAR = 100 Halalas)

  @Field()
  @Column({ default: 'SAR' })
  currency: string;

  @Field(() => PaymentStatus)
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.INITIATED })
  status: PaymentStatus;

  @Field()
  @Column()
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  payerName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  payerEmail: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  paymentMethod: string; // creditcard, mada, applepay

  @Field({ nullable: true })
  @Column({ nullable: true })
  callbackUrl: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
