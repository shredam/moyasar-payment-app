import type { PaymentRecord, PaymentSessionInput } from '../types';

const GRAPHQL_URL = '/graphql';

export async function gql<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apollo-require-preflight': 'true',
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

export async function initiatePaymentGql(input: PaymentSessionInput): Promise<PaymentRecord> {
  // Convert SAR to Halalas (1 SAR = 100 Halalas)
  const amountHalalas = Math.round(input.amountSar * 100);

  const data = await gql<{ initiatePayment: PaymentRecord }>(
    `
    mutation Initiate($input: CreatePaymentInput!) {
      initiatePayment(input: $input) {
        id amount currency status description payerName payerEmail createdAt
      }
    }
    `,
    {
      input: {
        amount: amountHalalas,
        description: input.description,
        payerName: input.payerName,
        payerEmail: input.payerEmail,
      },
    },
  );

  return data.initiatePayment;
}

export async function fetchPaymentsGql(): Promise<PaymentRecord[]> {
  const data = await gql<{ payments: PaymentRecord[] }>(`
    query {
      payments {
        id moyasarId amount currency status description payerName payerEmail paymentMethod createdAt
      }
    }
  `);
  return data.payments;
}
