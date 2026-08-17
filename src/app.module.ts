import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { LeadsModule } from './leads/leads.module';
import { SchoolLead } from './leads/entities/school-lead.entity';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { Subscription } from './subscriptions/entities/subscription.entity';
import { School } from './schools/entities/school.entity';
import { Student } from './students/entities/student.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', '123456789'),
        database: config.get<string>('DB_NAME', 'moyasar_payments'),
        entities: [Payment, SchoolLead, Subscription, School, Student],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      introspection: true,
      csrfPrevention: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    PaymentsModule,
    LeadsModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}

