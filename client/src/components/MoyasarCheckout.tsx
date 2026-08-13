import React, { useEffect } from 'react';
import type { PaymentRecord, PaymentSessionInput } from '../types';
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react';

interface Props {
  session: PaymentSessionInput;
  paymentRecord: PaymentRecord;
  onBack: () => void;
}

// Global Moyasar SDK type window augmentation
declare global {
  interface Window {
    Moyasar?: {
      init: (config: any) => void;
    };
  }
}

const MOYASAR_PK = 'pk_test_RVnhNipcchuneCmBNKfUTM74rMroJfCsvR9U5hWb';

export const MoyasarCheckout: React.FC<Props> = ({ session, paymentRecord, onBack }) => {
  const amountHalalas = Math.round(session.amountSar * 100);

  useEffect(() => {
    if (!window.Moyasar) {
      console.error('Moyasar SDK script not loaded in window');
      return;
    }

    const container = document.getElementById('moyasar-form-container');
    if (container) {
      container.innerHTML = '<div class="mysr-form"></div>';
    }

    window.Moyasar.init({
      element: '.mysr-form',
      amount: amountHalalas,
      currency: 'SAR',
      description: session.description,
      publishable_api_key: MOYASAR_PK,
      // Pass the PostgreSQL local payment ID as a query param in callback_url
      callback_url: `${window.location.origin}/payments/callback?payment_id=${paymentRecord.id}`,
      methods: ['creditcard'],
      supported_networks: ['mada', 'visa', 'mastercard', 'amex'],
      on_completed: function () {
        console.log('Moyasar payment completed, redirecting to callback…');
      },
      on_failure: function (err: any) {
        console.warn('Moyasar payment failure:', err);
      },
    });
  }, [session, paymentRecord]);

  return (
    <div className="card-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          <ArrowLeft size={16} /> Change Details
        </button>
        <div
          style={{
            background: 'linear-gradient(135deg, var(--gold-2), var(--gold-1))',
            color: '#1a0800',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: '8px',
          }}
        >
          STEP 2 OF 2
        </div>
      </div>

      {/* Order Summary Box */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '18px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '16px' }}>
              {session.description}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              For: {session.payerName} ({session.payerEmail})
            </p>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '20px',
              color: 'var(--gold-1)',
            }}
          >
            {session.amountSar.toFixed(2)} SAR
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--green)' }}>
          <CheckCircle size={13} /> Session Created & Bound to DB (ID: {paymentRecord.id.slice(0, 8)}…)
        </div>
      </div>

      {/* Moyasar SDK Form Mount */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '12px',
          }}
        >
          Payment Details
        </div>
        <div id="moyasar-form-container">
          <div className="mysr-form"></div>
        </div>
      </div>

      {/* Security notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '20px',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        <Shield size={13} color="var(--green)" />
        256-bit SSL · Powered by Moyasar · PCI DSS Compliant
      </div>
    </div>
  );
};
