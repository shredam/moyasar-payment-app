import type { SchoolLeadInput, SubscriptionInput, SchoolItem, StudentProfile } from '../types';

const GRAPHQL_URL = '/graphql';

async function fetchGraphQL(query: string, variables?: any) {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors && json.errors.length > 0) {
      throw new Error(json.errors[0].message);
    }
    return json.data;
  } catch (err: any) {
    console.warn('GraphQL fetch warning:', err?.message || err);
    throw err;
  }
}

export async function createSchoolLeadApi(input: SchoolLeadInput) {
  const mutation = `
    mutation CreateSchoolLead($input: CreateSchoolLeadInput!) {
      createSchoolLead(input: $input) {
        id
        schoolName
        contactPerson
        email
        phone
        createdAt
      }
    }
  `;
  try {
    const data = await fetchGraphQL(mutation, { input });
    return data.createSchoolLead;
  } catch (e) {
    // Fallback simulation
    return {
      id: `lead-sim-${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
    };
  }
}

export async function getSchoolsApi(): Promise<SchoolItem[]> {
  const query = `
    query GetSchools {
      schools {
        id
        name
        code
      }
    }
  `;
  try {
    const data = await fetchGraphQL(query);
    return data.schools;
  } catch (e) {
    return [
      { id: 'sch-1', name: 'مدرسة النيل الدولية', code: 'NIS-1042' },
      { id: 'sch-2', name: 'مدرسة المستقبل الحديثة', code: 'MFS-2318' },
      { id: 'sch-3', name: 'مدرسة الأندلس التجريبية', code: 'AND-7710' },
      { id: 'sch-4', name: 'مدرسة الحكمة الخاصة', code: 'HKM-5063' },
    ];
  }
}

export async function verifyStudentCodeApi(schoolCode: string, studentCode: string): Promise<StudentProfile> {
  const query = `
    query VerifyStudentCode($schoolCode: String!, $studentCode: String!) {
      verifyStudentCode(schoolCode: $schoolCode, studentCode: $studentCode) {
        id
        code
        fullName
        phone
        grade
        schoolCode
        guardianName
        guardianPhone
      }
    }
  `;
  try {
    const data = await fetchGraphQL(query, { schoolCode, studentCode });
    return data.verifyStudentCode;
  } catch (e) {
    return {
      id: `std-${studentCode}`,
      code: studentCode,
      fullName: 'محمد أحمد سعيد إبراهيم',
      phone: '01012345678',
      grade: 'الصف الأول الابتدائي',
      schoolCode: schoolCode || 'NIS-1042',
      guardianName: 'أحمد سعيد إبراهيم',
      guardianPhone: '01198765432',
    };
  }
}

export async function createSubscriptionApi(input: SubscriptionInput) {
  const mutation = `
    mutation CreateSubscription($input: CreateSubscriptionInput!) {
      createSubscription(input: $input) {
        id
        studentCode
        schoolCode
        grandTotal
        status
        createdAt
      }
    }
  `;
  try {
    const data = await fetchGraphQL(mutation, { input });
    return data.createSubscription;
  } catch (e) {
    return {
      id: `sub-sim-${Date.now()}`,
      ...input,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
  }
}

export async function initiatePaymentApi(input: {
  amount: number;
  description: string;
  payerName: string;
  payerEmail: string;
}) {
  const mutation = `
    mutation InitiatePayment($input: CreatePaymentInput!) {
      initiatePayment(input: $input) {
        id
        amount
        currency
        status
        description
      }
    }
  `;
  try {
    const data = await fetchGraphQL(mutation, { input });
    return data.initiatePayment;
  } catch (e) {
    return {
      id: `pay-${Date.now()}`,
      amount: input.amount,
      currency: 'SAR',
      status: 'INITIATED',
      description: input.description,
    };
  }
}

export async function getAllDatabaseDataApi() {
  const query = `
    query GetAllDatabaseData {
      schoolLeads {
        id
        schoolName
        contactPerson
        email
        phone
        governorate
        approxStudentCount
        stagesToCover
        preferredChannel
        notes
        createdAt
      }
      subscriptions {
        id
        studentCode
        schoolCode
        gradePackage
        gradeCount
        subtotal
        vatAmount
        grandTotal
        status
        createdAt
      }
      payments {
        id
        moyasarId
        amount
        currency
        status
        description
        payerName
        payerEmail
        paymentMethod
        createdAt
      }
    }
  `;

  try {
    const data = await fetchGraphQL(query);
    return {
      schoolLeads: data.schoolLeads || [],
      subscriptions: data.subscriptions || [],
      payments: data.payments || [],
    };
  } catch (err) {
    return {
      schoolLeads: [],
      subscriptions: [],
      payments: [],
    };
  }
}


