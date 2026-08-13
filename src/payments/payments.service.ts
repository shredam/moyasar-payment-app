import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentInput } from './dto/create-payment.input';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly MOYASAR_API = 'https://api.moyasar.com/v1';

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create an INITIATED payment record in the database.
   * Returns the local payment ID to embed in the Moyasar callback URL.
   */
  async initiatePayment(input: CreatePaymentInput): Promise<Payment> {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');

    const payment = this.paymentsRepository.create({
      amount: input.amount,
      currency: 'SAR',
      status: PaymentStatus.INITIATED,
      description: input.description,
      payerName: input.payerName,
      payerEmail: input.payerEmail,
      callbackUrl: `${appUrl}/payments/callback`,
    });

    const saved = await this.paymentsRepository.save(payment);
    this.logger.log(`Payment initiated with local ID: ${saved.id}`);
    return saved;
  }

  /**
   * Verify a Moyasar payment server-side using the secret key.
   * Called after the Moyasar form redirects the user back with a payment ID.
   */
  async verifyPayment(moyasarPaymentId: string, localPaymentId: string): Promise<Payment> {
    const secretKey = this.configService.get<string>('MOYASAR_SECRET_KEY');
    if (!secretKey) {
      throw new BadRequestException('Moyasar secret key not configured');
    }

    // Find local payment
    const payment = await this.paymentsRepository.findOne({
      where: { id: localPaymentId },
    });
    if (!payment) {
      throw new NotFoundException(`Payment record ${localPaymentId} not found`);
    }

    // Fetch from Moyasar API — server-to-server using SECRET key (sk_test_...)
    const authHeader = Buffer.from(`${secretKey}:`).toString('base64');
    let moyasarData: any;

    try {
      const response = await axios.get(
        `${this.MOYASAR_API}/payments/${moyasarPaymentId}`,
        {
          headers: { Authorization: `Basic ${authHeader}` },
        },
      );
      moyasarData = response.data;
    } catch (error: any) {
      this.logger.error(
        `Moyasar API error: ${error?.response?.data?.message ?? error.message}`,
      );
      throw new BadRequestException('Could not verify payment with Moyasar');
    }

    // Validate amount & currency match to prevent tampering
    if (
      moyasarData.amount !== payment.amount ||
      moyasarData.currency !== payment.currency
    ) {
      this.logger.warn(
        `Payment ${localPaymentId} amount/currency mismatch! ` +
          `Expected ${payment.amount} ${payment.currency}, ` +
          `got ${moyasarData.amount} ${moyasarData.currency}`,
      );
      payment.status = PaymentStatus.FAILED;
      return this.paymentsRepository.save(payment);
    }

    // Map Moyasar status to local enum
    payment.moyasarId = moyasarData.id;
    payment.paymentMethod = moyasarData.source?.type ?? null;

    if (moyasarData.status === 'paid') {
      payment.status = PaymentStatus.PAID;
    } else if (moyasarData.status === 'authorized') {
      payment.status = PaymentStatus.AUTHORIZED;
    } else {
      payment.status = PaymentStatus.FAILED;
    }

    const updated = await this.paymentsRepository.save(payment);
    this.logger.log(`Payment ${localPaymentId} status → ${updated.status}`);
    return updated;
  }

  /** List all payments (newest first) */
  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /** Find a single payment by local UUID */
  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }
    return payment;
  }
}
