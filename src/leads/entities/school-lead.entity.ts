import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity('school_leads')
export class SchoolLead {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  schoolName: string;

  @Field()
  @Column()
  contactPerson: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  phone: string;

  @Field()
  @Column()
  governorate: string;

  @Field()
  @Column()
  approxStudentCount: string;

  @Field(() => [String])
  @Column('simple-array')
  stagesToCover: string[];

  @Field()
  @Column({ default: 'مكالمة هاتفية' })
  preferredChannel: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  notes?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
