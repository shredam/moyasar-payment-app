import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsEmail, IsArray, IsOptional } from 'class-validator';

@InputType()
export class CreateSchoolLeadInput {
  @Field()
  @IsNotEmpty()
  schoolName: string;

  @Field()
  @IsNotEmpty()
  contactPerson: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  phone: string;

  @Field()
  @IsNotEmpty()
  governorate: string;

  @Field()
  @IsNotEmpty()
  approxStudentCount: string;

  @Field(() => [String])
  @IsArray()
  stagesToCover: string[];

  @Field({ defaultValue: 'مكالمة هاتفية' })
  @IsNotEmpty()
  preferredChannel: string;

  @Field({ nullable: true })
  @IsOptional()
  notes?: string;
}
