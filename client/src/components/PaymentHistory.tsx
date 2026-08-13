import React, { useState } from 'react';
import type { PaymentRecord } from '../types';
import { fetchPaymentsGql } from '../services/api';
import { ChevronDown, History } from 'lucide-react';

export const PaymentHistory: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchPaymentsGql();
      setPayments(data);
    } catch (err) {
      console.warn('Could not load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      loadHistory();
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '480px', marginTop: '20px' }}>
      <button
        type="button"
        onClick={handleToggle}
        style={{
          width: '100%',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          padding: '12px 18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={16} /> Recent Payments History
        </span>
        <ChevronDown
          size={16}
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'var(--transition)' }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: '10px',
            maxHeight: '280px',
            overflowY: 'auto',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '8px',
          }}
        >
          {loading ? (
            <p style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Loading payment history…
            </p>
          ) : payments.length === 0 ? (
            <p style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
              No payments found.
            </p>
          ) : (
            payments.map((p) => {
              const sar = (p.amount / 100).toFixed(2);
              const dateStr = new Date(p.createdAt).toLocaleDateString('en-SA', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const badgeColor =
                p.status === 'PAID'
                  ? 'var(--green)'
                  : p.status === 'FAILED'
                  ? 'var(--coral)'
                  : 'var(--blue)';

              const badgeBg =
                p.status === 'PAID'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : p.status === 'FAILED'
                  ? 'rgba(255, 107, 107, 0.15)'
                  : 'rgba(59, 130, 246, 0.15)';

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '10px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {p.description}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {p.payerName ? `${p.payerName} · ` : ''}
                      {dateStr}
                    </div>
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: 'var(--gold-1)',
                      margin: '0 12px',
                    }}
                  >
                    {sar} SAR
                  </div>

                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      color: badgeColor,
                      background: badgeBg,
                    }}
                  >
                    {p.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
