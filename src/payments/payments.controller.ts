import { Controller, Get, Query, Redirect, Logger } from '@nestjs/common';
import { PaymentsService } from './payments.service';

/**
 * HTTP Controller — handles the Moyasar callback redirect.
 * Moyasar redirects to this endpoint after the user completes payment.
 * The callback URL includes `id` (Moyasar payment ID) and `status` as query params.
 */
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('callback')
  @Redirect('/', 302)
  async handleCallback(
    @Query('id') moyasarId: string,
    @Query('status') status: string,
    @Query('payment_id') localPaymentId?: string,
  ) {
    this.logger.log(
      `Moyasar callback received — moyasarId: ${moyasarId}, status: ${status}, localId: ${localPaymentId}`,
    );

    if (!moyasarId) {
      this.logger.warn('Missing Moyasar ID in callback redirect');
      return { url: '/?status=error&message=missing_id' };
    }

    try {
      const payment = await this.paymentsService.verifyPayment(
        moyasarId,
        localPaymentId,
      );
      return {
        url: `/?status=${payment.status.toLowerCase()}&payment_id=${payment.id}`,
      };
    } catch (error: any) {
      this.logger.error(`Verification failed: ${error.message}`);
      return { url: `/?status=failed&message=${encodeURIComponent(error.message)}` };
    }
  }
}
