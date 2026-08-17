import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { School } from '../schools/entities/school.entity';
import { Student } from '../students/entities/student.entity';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsResolver } from './subscriptions.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, School, Student])],
  providers: [SubscriptionsService, SubscriptionsResolver],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
