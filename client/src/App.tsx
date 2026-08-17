import { useState, useEffect } from 'react';
import type { CartItem } from './types';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { RoleSelectionStep } from './components/RoleSelectionStep';
import { SchoolLeadFormStep } from './components/SchoolLeadFormStep';
import { SchoolLeadDoneStep } from './components/SchoolLeadDoneStep';
import { StageGradeSelectionStep } from './components/StageGradeSelectionStep';
import { StudentCheckoutStep } from './components/StudentCheckoutStep';
import { SubscriptionSuccessStep } from './components/SubscriptionSuccessStep';
import { PaymentResultPage } from './components/PaymentResultPage';

export function App() {
  const userName = 'سارة أحمد';
  const userEmail = 'sara.ahmed@example.com';

  // State persistence via localStorage so data survives redirects & failed payment retries
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'school_student' | 'independent_student' | 'tutor' | null>(() => {
    return (localStorage.getItem('app_selected_role') as any) || null;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('app_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [subtotal, setSubtotal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('app_subtotal');
      return saved ? Number(saved) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [paidGrandTotal, setPaidGrandTotal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('app_paid_grand_total');
      return saved ? Number(saved) : 0;
    } catch (e) {
      return 0;
    }
  });

  // Workflow steps: 'home' | 1 | 'lead' | 'leadDone' | 2 | 3 | 4 | 'result'
  const [step, setStep] = useState<string | number>('home');

  // Payment result callback state
  const [paymentResult, setPaymentResult] = useState<{
    status: 'paid' | 'failed' | 'error';
    paymentId: string | null;
    message?: string | null;
  } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (selectedRole) {
      localStorage.setItem('app_selected_role', selectedRole);
    }
  }, [selectedRole]);

  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('app_cart_items', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => {
    if (subtotal > 0) {
      localStorage.setItem('app_subtotal', String(subtotal));
    }
  }, [subtotal]);

  useEffect(() => {
    if (paidGrandTotal > 0) {
      localStorage.setItem('app_paid_grand_total', String(paidGrandTotal));
    }
  }, [paidGrandTotal]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get('status');
    const payIdParam = params.get('payment_id');
    const msgParam = params.get('message');

    if (statusParam) {
      window.history.replaceState({}, '', '/');
      if (statusParam === 'paid') {
        setPaymentResult({
          status: 'paid',
          paymentId: payIdParam,
        });
        setStep('result');
      } else if (statusParam === 'failed' || statusParam === 'error') {
        setPaymentResult({
          status: 'failed',
          paymentId: payIdParam,
          message: msgParam,
        });
        setStep('result');
      }
    }
  }, []);

  const resetAll = () => {
    setStep('home');
    setSelectedRole(null);
    setCartItems([]);
    setSubtotal(0);
    setPaidGrandTotal(0);
    setPaymentResult(null);

    localStorage.removeItem('app_selected_role');
    localStorage.removeItem('app_cart_items');
    localStorage.removeItem('app_subtotal');
    localStorage.removeItem('app_paid_grand_total');
    localStorage.removeItem('app_selected_grades');
    localStorage.removeItem('app_student_code');
    localStorage.removeItem('app_agree_data');
    localStorage.removeItem('app_agree_terms');
  };

  const getCrumbs = () => {
    if (step === 'home') return [];
    if (step === 'result') {
      return [
        { name: 'نوع الاشتراك' },
        { name: 'المراحل والصفوف' },
        { name: paymentResult?.status === 'paid' ? 'تم الدفع بنجاح' : 'نتيجة الدفع', active: true },
      ];
    }
    if (step === 1) {
      return [{ name: 'نوع الاشتراك', active: true }];
    }
    if (step === 'lead') {
      return [{ name: 'نوع الاشتراك' }, { name: 'بيانات التواصل', active: true }];
    }
    if (step === 'leadDone') {
      return [{ name: 'نوع الاشتراك' }, { name: 'بيانات التواصل' }, { name: 'تم الإرسال', active: true }];
    }
    if (step === 2) {
      return [{ name: 'نوع الاشتراك' }, { name: 'المراحل والصفوف', active: true }];
    }
    if (step === 3 || step === 4) {
      return [{ name: 'نوع الاشتراك' }, { name: 'المراحل والصفوف' }, { name: 'المراجعة', active: true }];
    }
    return [];
  };

  const currentGrandTotal = paidGrandTotal || (subtotal > 0 ? subtotal + Math.round(subtotal * 0.14) : 0);

  return (
    <>
      <Navbar
        userName={userName}
        userEmail={userEmail}
        crumbs={getCrumbs()}
        actionLabel={step === 'home' ? 'تسجيل الخروج' : 'إلغاء'}
        onAction={resetAll}
      />

      <main className="app-wrapper">
        {step === 'result' && paymentResult && (
          <PaymentResultPage
            status={paymentResult.status}
            paymentId={paymentResult.paymentId}
            grandTotal={currentGrandTotal}
            message={paymentResult.message}
            onRetry={() => {
              setPaymentResult(null);
              setStep(3);
            }}
            onGoHome={resetAll}
          />
        )}

        {step === 'home' && (
          <HomePage
            userName={userName}
            onGoToSubscriptions={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <RoleSelectionStep
            selectedRole={selectedRole}
            onSelectRole={(role) => setSelectedRole(role)}
            onNext={() => {
              if (selectedRole === 'teacher') {
                setStep('lead');
              } else if (selectedRole === 'school_student') {
                setStep(2);
              }
            }}
          />
        )}

        {step === 'lead' && (
          <SchoolLeadFormStep
            onBack={() => setStep(1)}
            onSuccess={() => setStep('leadDone')}
          />
        )}

        {step === 'leadDone' && (
          <SchoolLeadDoneStep onRestart={resetAll} />
        )}

        {step === 2 && (
          <StageGradeSelectionStep
            onBack={() => setStep(1)}
            onConfirm={(items, total) => {
              setCartItems(items);
              setSubtotal(total);
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <StudentCheckoutStep
            cartItems={cartItems}
            subtotal={subtotal}
            onBackToGrades={() => setStep(2)}
            onSuccess={(grandTotal) => {
              setPaidGrandTotal(grandTotal);
              setStep(4);
            }}
          />
        )}

        {step === 4 && (
          <SubscriptionSuccessStep
            grandTotal={currentGrandTotal}
            onGoHome={resetAll}
          />
        )}
      </main>
    </>
  );
}

export default App;
