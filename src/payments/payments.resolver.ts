import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { CreatePaymentInput } from './dto/create-payment.input';

@Resolver(() => Payment)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Initiate a new payment session.
   * Returns the local payment record whose ID should be passed as
   * the Moyasar callback_url query parameter.
   */
  @Mutation(() => Payment, { description: 'Create a new payment session' })
  initiatePayment(
    @Args('input') input: CreatePaymentInput,
  ): Promise<Payment> {
    return this.paymentsService.initiatePayment(input);
  }

  /**
   * Verify a payment after the Moyasar form redirect.
   * The frontend calls this mutation with both the Moyasar payment ID
   * (from callback URL params) and the local payment ID.
   */
  @Mutation(() => Payment, { description: 'Verify a Moyasar payment server-side' })
  verifyPayment(
    @Args('moyasarPaymentId', { type: () => ID }) moyasarPaymentId: string,
    @Args('localPaymentId', { type: () => ID }) localPaymentId: string,
  ): Promise<Payment> {
    return this.paymentsService.verifyPayment(moyasarPaymentId, localPaymentId);
  }

  /** List all payment records, newest first */
  @Query(() => [Payment], { name: 'payments', description: 'Get all payments' })
  findAll(): Promise<Payment[]> {
    return this.paymentsService.findAll();
  }

  /** Get a single payment by local UUID */
  @Query(() => Payment, { name: 'payment', description: 'Get a payment by ID' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Payment> {
    return this.paymentsService.findOne(id);
  }
}
