import React, { useState, useEffect } from 'react';
import { getAllDatabaseDataApi } from '../services/api';

interface AdminDataPageProps {
  onBackHome: () => void;
}

export const AdminDataPage: React.FC<AdminDataPageProps> = ({ onBackHome }) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'subscriptions' | 'payments'>('leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    schoolLeads: any[];
    subscriptions: any[];
    payments: any[];
  }>({
    schoolLeads: [],
    subscriptions: [],
    payments: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getAllDatabaseDataApi();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const fmtSar = (val: number) => {
    // If value is in Halalas (e.g. 136800 Halalas = 1368 SAR)
    const sar = val > 10000 ? val / 100 : val;
    return sar.toLocaleString('ar-SA') + ' ريال سعودي';
  };

  const fmtDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-SA') + ' ' + d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  const completedPayments = data.payments.filter((item) => item.status !== 'INITIATED');

  // Filtering
  const filteredLeads = data.schoolLeads.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.schoolName || '').toLowerCase().includes(q) ||
      (item.contactPerson || '').toLowerCase().includes(q) ||
      (item.email || '').toLowerCase().includes(q) ||
      (item.phone || '').includes(q) ||
      (item.governorate || '').toLowerCase().includes(q)
    );
  });

  const filteredSubs = data.subscriptions.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.studentCode || '').toLowerCase().includes(q) ||
      (item.schoolCode || '').toLowerCase().includes(q) ||
      (item.status || '').toLowerCase().includes(q)
    );
  });

  const filteredPayments = completedPayments.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.id || '').toLowerCase().includes(q) ||
      (item.moyasarId || '').toLowerCase().includes(q) ||
      (item.payerName || '').toLowerCase().includes(q) ||
      (item.payerEmail || '').toLowerCase().includes(q) ||
      (item.status || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="admin-data-container">
      <div className="admin-data-header">
        <div>
          <button type="button" className="back-link" onClick={onBackHome}>
            رجوع للرئيسية
          </button>
          <h1 className="admin-title">سجلات قاعدة البيانات (Database Records)</h1>
          <p className="admin-subtitle">
            عرض واسترجاع كافة البيانات المخزنة في النظام: طلبات التعاقد للمدارس، اشتراكات الطلاب، وسجلات ميسر للدفع.
          </p>
        </div>

        <button type="button" className="btn-refresh" onClick={loadData} disabled={loading}>
          {loading ? 'جاري التحميل...' : 'تحديث البيانات 🔄'}
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs-bar">
        <button
          type="button"
          className={`admin-tab ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          📋 طلبات التعاقد ({data.schoolLeads.length})
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          🎓 اشتراكات الطلاب ({data.subscriptions.length})
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          💳 سجلات دفع ميسر ({completedPayments.length})
        </button>
      </div>


      {/* Search Input */}
      <div className="admin-search-bar">
        <input
          type="text"
          className="admin-search-input"
          placeholder="بحث بالاسم، الكود، البريد الإلكتروني، أو الهاتف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tab 1: School Leads Table */}
      {activeTab === 'leads' && (
        <div className="table-responsive-box">
          {filteredLeads.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>اسم المدرسة</th>
                  <th>مسؤول التواصل</th>
                  <th>البريد الإلكتروني</th>
                  <th>رقم الهاتف</th>
                  <th>المحافظة</th>
                  <th>عدد الطلاب</th>
                  <th>المراحل المطلوب تغطيتها</th>
                  <th>وسيلة التواصل</th>
                  <th>تاريخ الطلب</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold">{item.schoolName}</td>
                    <td>{item.contactPerson}</td>
                    <td className="dir-ltr">{item.email}</td>
                    <td className="dir-ltr">{item.phone}</td>
                    <td>{item.governorate || '—'}</td>
                    <td>{item.approxStudentCount || '—'}</td>
                    <td>
                      <div className="tags-flex">
                        {Array.isArray(item.stagesToCover)
                          ? item.stagesToCover.map((st: string, idx: number) => (
                              <span key={idx} className="tag-badge">
                                {st}
                              </span>
                            ))
                          : item.stagesToCover}
                      </div>
                    </td>
                    <td>
                      <span className="channel-pill">{item.preferredChannel}</span>
                    </td>
                    <td className="time-text">{fmtDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data-card">لا توجد طلبات تعاقد مخزنة حاليًا.</div>
          )}
        </div>
      )}

      {/* Tab 2: Subscriptions Table */}
      {activeTab === 'subscriptions' && (
        <div className="table-responsive-box">
          {filteredSubs.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>كود الطالب</th>
                  <th>كود المدرسة</th>
                  <th>الباكدج المختارة</th>
                  <th>عدد الصفوف</th>
                  <th>الإجمالي قبل الضريبة</th>
                  <th>ضريبة 14%</th>
                  <th>الإجمالي المستحق (SAR)</th>
                  <th>الحالة</th>
                  <th>تاريخ الاشتراك</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold">{item.studentCode}</td>
                    <td className="code-pill">{item.schoolCode}</td>
                    <td>
                      <div className="tags-flex">
                        {Array.isArray(item.gradePackage)
                          ? item.gradePackage.map((g: string, idx: number) => (
                              <span key={idx} className="tag-badge">
                                {g}
                              </span>
                            ))
                          : item.gradePackage}
                      </div>
                    </td>
                    <td>{item.gradeCount} صفوف</td>
                    <td>{fmtSar(item.subtotal)}</td>
                    <td>{fmtSar(item.vatAmount)}</td>
                    <td className="total-highlight">{fmtSar(item.grandTotal)}</td>
                    <td>
                      <span className="status-pill paid">{item.status}</span>
                    </td>
                    <td className="time-text">{fmtDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data-card">لا توجد اشتراكات مخزنة حاليًا.</div>
          )}
        </div>
      )}

      {/* Tab 3: Moyasar Payments Table */}
      {activeTab === 'payments' && (
        <div className="table-responsive-box">
          {filteredPayments.length > 0 ? (
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>معرف المحلي (Local ID)</th>
                  <th>معرف ميسر (Moyasar ID)</th>
                  <th>اسم الدافع</th>
                  <th>البريد الإلكتروني</th>
                  <th>المبلغ (ريال سعودي)</th>
                  <th>وسيلة الدفع</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((item) => (
                  <tr key={item.id}>
                    <td className="mono-text">{item.id.slice(0, 13)}...</td>
                    <td className="mono-text">{item.moyasarId || '—'}</td>
                    <td className="font-bold">{item.payerName || 'طالب المنصة'}</td>
                    <td className="dir-ltr">{item.payerEmail || '—'}</td>
                    <td className="total-highlight">{fmtSar(item.amount)}</td>
                    <td>{item.paymentMethod || 'بطاقة مدى / فيزا'}</td>
                    <td>
                      <span className={`status-pill ${item.status === 'PAID' ? 'paid' : 'failed'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="time-text">{fmtDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data-card">لا توجد عمليات دفع مخزنة في بوابة ميسر حاليًا.</div>
          )}
        </div>
      )}
    </div>
  );
};
