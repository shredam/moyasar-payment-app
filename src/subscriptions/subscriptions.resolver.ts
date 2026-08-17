import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from './entities/subscription.entity';
import { School } from '../schools/entities/school.entity';
import { Student } from '../students/entities/student.entity';
import { CreateSubscriptionInput } from './dto/create-subscription.input';

@Resolver(() => Subscription)
export class SubscriptionsResolver {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Query(() => [School], { name: 'schools', description: 'Get available schools' })
  getSchools(): Promise<School[]> {
    return this.subscriptionsService.getSchools();
  }

  @Query(() => Student, { name: 'verifyStudentCode', description: 'Lookup student details by school and student code' })
  verifyStudentCode(
    @Args('schoolCode') schoolCode: string,
    @Args('studentCode') studentCode: string,
  ): Promise<Student> {
    return this.subscriptionsService.verifyStudentCode(schoolCode, studentCode);
  }

  @Mutation(() => Subscription, { description: 'Create and confirm a student package subscription' })
  createSubscription(
    @Args('input') input: CreateSubscriptionInput,
  ): Promise<Subscription> {
    return this.subscriptionsService.create(input);
  }

  @Query(() => [Subscription], { name: 'subscriptions', description: 'Get all subscriptions' })
  findAll(): Promise<Subscription[]> {
    return this.subscriptionsService.findAll();
  }
}
