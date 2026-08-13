import React, { useState } from 'react';
import type { PaymentSessionInput, PaymentRecord } from '../types';
import { initiatePaymentGql } from '../services/api';
import { Shield, ArrowRight, DollarSign, User, Mail, FileText } from 'lucide-react';

interface Props {
  onProceed: (session: PaymentSessionInput, paymentRecord: PaymentRecord) => void;
}

const PRESET_AMOUNTS = [50, 100, 250, 500];

export const PaymentDetailsForm: React.FC<Props> = ({ onProceed }) => {
  const [payerName, setPayerName] = useState('Abdulrhman Shredam');
  const [payerEmail, setPayerEmail] = useState('abdosheredam@gmail.com');
  const [description, setDescription] = useState('Custom Package — Annual Plan');
  const [amountSar, setAmountSar] = useState<number>(100);
  const [customInput, setCustomInput] = useState<string>('100');
  const [activePreset, setActivePreset] = useState<number | 'custom'>(100);
  const [loading, setLoading] = useState(false);

  const handlePresetClick = (val: number) => {
    setActivePreset(val);
    setAmountSar(val);
    setCustomInput(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    setActivePreset('custom');
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setAmountSar(parsed);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!payerName.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (!payerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    if (!amountSar || amountSar < 1) {
      alert('Minimum payment amount is 1.00 SAR');
      return;
    }

    setLoading(true);
    const sessionData: PaymentSessionInput = {
      payerName: payerName.trim(),
      payerEmail: payerEmail.trim(),
      description: description.trim() || 'Custom Order',
      amountSar,
    };

    try {
      // Execute GraphQL mutation to create INITIATED record in PostgreSQL
      const paymentRecord = await initiatePaymentGql(sessionData);
      onProceed(sessionData, paymentRecord);
    } catch (err: any) {
      alert('Failed to initiate payment session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700 }}>
            Enter Payment Details
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '3px' }}>
            Specify details & payment amount in SAR
          </p>
        </div>
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
          STEP 1 OF 2
        </div>
      </div>

      {/* Customer Info */}
      <div className="field-group">
        <label htmlFor="payerName" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={14} color="var(--text-secondary)" /> Full Name
        </label>
        <input
          id="payerName"
          type="text"
          value={payerName}
          onChange={(e) => setPayerName(e.target.value)}
          placeholder="Abdulrhman Shredam"
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="payerEmail" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mail size={14} color="var(--text-secondary)" /> Email Address
        </label>
        <input
          id="payerEmail"
          type="email"
          value={payerEmail}
          onChange={(e) => setPayerEmail(e.target.value)}
          placeholder="abdosheredam@gmail.com"
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="description" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={14} color="var(--text-secondary)" /> Payment Description
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Custom Package — Annual Plan"
          required
        />
      </div>

      {/* Amount Selector */}
      <div className="field-group" style={{ marginTop: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <DollarSign size={14} color="var(--text-secondary)" /> Select Amount (SAR)
        </label>

        <div className="presets-grid">
          {PRESET_AMOUNTS.map((val) => (
            <button
              type="button"
              key={val}
              className={`preset-btn ${activePreset === val ? 'active' : ''}`}
              onClick={() => handlePresetClick(val)}
            >
              {val} SAR
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type="number"
            min="1"
            step="0.01"
            value={customInput}
            onChange={handleCustomChange}
            placeholder="Custom Amount in SAR"
            style={{ paddingRight: '60px' }}
          />
          <span
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '13px',
              color: 'var(--gold-1)',
            }}
          >
            SAR
          </span>
        </div>
      </div>

      {/* Summary Box */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '16px',
          margin: '20px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total to Pay:</span>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '22px',
            background: 'linear-gradient(135deg, var(--gold-2), var(--gold-1))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {amountSar.toFixed(2)} SAR
        </span>
      </div>

      {/* Submit Button */}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? (
          'Initiating Session…'
        ) : (
          <>
            Proceed to Checkout <ArrowRight size={18} />
          </>
        )}
      </button>

      {/* Security Footer */}
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
        256-bit SSL · Powered by Moyasar & NestJS GraphQL
      </div>
    </form>
  );
};
