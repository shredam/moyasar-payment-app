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
  /**
   * Verify a Moyasar payment server-side using the secret key.
   * Called after Moyasar redirects back to callback URL with payment `id`.
   */
  async verifyPayment(moyasarPaymentId: string, localPaymentId?: string): Promise<Payment> {
    const secretKey = this.configService.get<string>('MOYASAR_SECRET_KEY');
    if (!secretKey) {
      throw new BadRequestException('Moyasar secret key not configured in .env');
    }

    // 1. Fetch live payment status from Moyasar API — server-to-server with SECRET key
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
        `Moyasar API verification failed: ${error?.response?.data?.message ?? error.message}`,
      );
      throw new BadRequestException(`Could not verify payment ${moyasarPaymentId} with Moyasar`);
    }

    // 2. Find local payment record (by local UUID or moyasarId)
    let payment: Payment | null = null;

    if (localPaymentId) {
      payment = await this.paymentsRepository.findOne({ where: { id: localPaymentId } });
    }

    if (!payment) {
      payment = await this.paymentsRepository.findOne({ where: { moyasarId: moyasarPaymentId } });
    }

    // 3. Create record if it doesn't exist yet
    if (!payment) {
      payment = this.paymentsRepository.create({
        moyasarId: moyasarPaymentId,
        amount: moyasarData.amount,
        currency: moyasarData.currency ?? 'SAR',
        description: moyasarData.description ?? 'Moyasar Payment',
        payerName: moyasarData.source?.name ?? 'Customer',
        payerEmail: moyasarData.source?.email ?? null,
      });
    }

    // 4. Update status & metadata from verified Moyasar response
    payment.moyasarId = moyasarData.id;
    payment.paymentMethod = moyasarData.source?.type ?? moyasarData.source?.company ?? 'creditcard';

    if (moyasarData.status === 'paid') {
      payment.status = PaymentStatus.PAID;
    } else if (moyasarData.status === 'authorized') {
      payment.status = PaymentStatus.AUTHORIZED;
    } else {
      payment.status = PaymentStatus.FAILED;
    }

    const updated = await this.paymentsRepository.save(payment);
    this.logger.log(`Verified payment ${updated.id} (Moyasar: ${moyasarData.id}) → ${updated.status}`);
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
