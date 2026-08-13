import { useState, useEffect } from 'react';
import type { PaymentSessionInput, PaymentRecord } from './types';
import { PaymentDetailsForm } from './components/PaymentDetailsForm';
import { MoyasarCheckout } from './components/MoyasarCheckout';
import { PaymentHistory } from './components/PaymentHistory';
import { CheckCircle2, XCircle } from 'lucide-react';

export function App() {
  const [step, setStep] = useState<'form' | 'checkout'>('form');
  const [session, setSession] = useState<PaymentSessionInput | null>(null);
  const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(null);
  const [resultStatus, setResultStatus] = useState<'paid' | 'failed' | null>(null);
  const [resultPaymentId, setResultPaymentId] = useState<string | null>(null);

  // Check for callback redirect status query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const payId = params.get('payment_id');

    if (status) {
      window.history.replaceState({}, '', '/');
      if (status === 'paid') {
        setResultStatus('paid');
        setResultPaymentId(payId);
      } else if (status === 'failed' || status === 'error') {
        setResultStatus('failed');
        setResultPaymentId(payId);
      }
    }
  }, []);

  const handleProceedToCheckout = (sData: PaymentSessionInput, record: PaymentRecord) => {
    setSession(sData);
    setPaymentRecord(record);
    setStep('checkout');
  };

  const handleBackToForm = () => {
    setStep('form');
  };

  return (
    <>
      {/* Background Orbs & Canvas */}
      <div className="bg-canvas" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Callback Status Modal */}
      {resultStatus && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(4,8,16,0.92)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '44px 36px',
              textAlign: 'center',
              maxWidth: '380px',
              width: '90%',
            }}
          >
            <div style={{ fontSize: '52px', marginBottom: '18px' }}>
              {resultStatus === 'paid' ? (
                <CheckCircle2 size={60} color="var(--green)" />
              ) : (
                <XCircle size={60} color="var(--coral)" />
              )}
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '24px',
                fontWeight: 800,
                marginBottom: '10px',
                color: resultStatus === 'paid' ? 'var(--green)' : 'var(--coral)',
              }}
            >
              {resultStatus === 'paid' ? 'Payment Successful!' : 'Payment Failed'}
            </h2>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              {resultStatus === 'paid'
                ? 'Your payment was processed successfully. A confirmation receipt has been sent to your email.'
                : 'Your payment could not be completed. Please check your card details and try again.'}
            </p>

            {resultPaymentId && (
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  marginBottom: '22px',
                  wordBreak: 'break-all',
                }}
              >
                Payment ID: {resultPaymentId}
              </div>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setResultStatus(null);
                setStep('form');
              }}
            >
              {resultStatus === 'paid' ? '🎉 Done — Return Home' : '↩ Try Again'}
            </button>
          </div>
        </div>
      )}

      {/* Main React App */}
      <main className="app-wrapper">
        {/* Brand Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            borderRadius: '50px',
            padding: '8px 20px',
            marginBottom: '28px',
            fontFamily: 'var(--font-heading)',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--green)',
              boxShadow: '0 0 10px var(--green)',
            }}
          />
          React SPA · Moyasar & NestJS GraphQL
        </div>

        {/* Step 1 or Step 2 Card */}
        <div className="checkout-card">
          {step === 'form' ? (
            <PaymentDetailsForm onProceed={handleProceedToCheckout} />
          ) : (
            session &&
            paymentRecord && (
              <MoyasarCheckout session={session} paymentRecord={paymentRecord} onBack={handleBackToForm} />
            )
          )}
        </div>

        {/* Recent Payment History Drawer */}
        <PaymentHistory />
      </main>
    </>
  );
}

export default App;
