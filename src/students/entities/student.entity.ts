import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity('students')
export class Student {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  code: string;

  @Field()
  @Column()
  fullName: string;

  @Field()
  @Column()
  phone: string;

  @Field()
  @Column()
  grade: string;

  @Field()
  @Column()
  schoolCode: string;

  @Field()
  @Column()
  guardianName: string;

  @Field()
  @Column()
  guardianPhone: string;

  @Field({ defaultValue: false })
  @Column({ default: false })
  isUsed: boolean;
}
