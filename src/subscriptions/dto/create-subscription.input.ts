import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsArray, IsNumber } from 'class-validator';

@InputType()
export class CreateSubscriptionInput {
  @Field()
  @IsNotEmpty()
  studentCode: string;

  @Field()
  @IsNotEmpty()
  schoolCode: string;

  @Field(() => [String])
  @IsArray()
  gradePackage: string[];

  @Field(() => Int)
  @IsNumber()
  gradeCount: number;

  @Field(() => Float)
  @IsNumber()
  subtotal: number;

  @Field(() => Float)
  @IsNumber()
  vatAmount: number;

  @Field(() => Float)
  @IsNumber()
  grandTotal: number;
}
