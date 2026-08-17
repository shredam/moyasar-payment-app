import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
@Entity('subscriptions')
export class Subscription {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  studentCode: string;

  @Field()
  @Column()
  schoolCode: string;

  @Field(() => [String])
  @Column('simple-array')
  gradePackage: string[];

  @Field(() => Int)
  @Column()
  gradeCount: number;

  @Field(() => Float)
  @Column('float')
  subtotal: number;

  @Field(() => Float)
  @Column('float')
  vatAmount: number;

  @Field(() => Float)
  @Column('float')
  grandTotal: number;

  @Field()
  @Column({ default: 'ACTIVE' })
  status: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
