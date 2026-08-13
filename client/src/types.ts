export interface PaymentSessionInput {
  payerName: string;
  payerEmail: string;
  description: string;
  amountSar: number; // e.g. 150.00
}

export interface PaymentRecord {
  id: string;
  moyasarId?: string;
  amount: number; // in Halalas
  currency: string;
  status: 'INITIATED' | 'PAID' | 'FAILED' | 'AUTHORIZED' | 'REFUNDED';
  description: string;
  payerName?: string;
  payerEmail?: string;
  paymentMethod?: string;
  createdAt: string;
}
