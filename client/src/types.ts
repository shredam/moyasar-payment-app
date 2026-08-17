export interface PaymentSessionInput {
  payerName: string;
  payerEmail: string;
  description: string;
  amountSar: number;
}

export interface PaymentRecord {
  id: string;
  moyasarId?: string;
  amount: number;
  currency: string;
  status: 'INITIATED' | 'PAID' | 'FAILED' | 'AUTHORIZED' | 'REFUNDED';
  description: string;
  payerName?: string;
  payerEmail?: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface RoleDef {
  id: 'teacher' | 'school_student' | 'independent_student' | 'tutor';
  title: string;
  subtitle: string;
  disabled?: boolean;
}

export interface GradeItem {
  id: string;
  name: string;
  price: number;
  subjects?: string[];
  classes?: string;
}

export interface StageDef {
  id: string;
  name: string;
  disabled?: boolean;
  grades: GradeItem[];
}

export interface CartItem {
  subject: string;
  grade: GradeItem;
}

export interface SchoolItem {
  id: string;
  name: string;
  code: string;
}

export interface StudentProfile {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  grade: string;
  schoolCode: string;
  guardianName: string;
  guardianPhone: string;
  isUsed?: boolean;
}


export interface SchoolLeadInput {
  schoolName: string;
  contactPerson: string;
  email: string;
  phone: string;
  governorate: string;
  approxStudentCount: string;
  stagesToCover: string[];
  preferredChannel: string;
  notes?: string;
}

export interface SubscriptionInput {
  studentCode: string;
  schoolCode: string;
  gradePackage: string[];
  gradeCount: number;
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
}
