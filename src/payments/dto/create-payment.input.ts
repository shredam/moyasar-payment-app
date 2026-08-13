import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

@InputType()
export class CreatePaymentInput {
  @Field(() => Int)
  @IsInt()
  @Min(100, { message: 'Amount must be at least 100 Halalas (1.00 SAR)' })
  amount: number; // in Halalas — e.g. 10000 = 100.00 SAR

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  payerName: string;

  @Field()
  @IsEmail()
  payerEmail: string;
}
