import React, { useState } from 'react';
import { getSubscriptionsReport, SUBSCRIPTION_STATUSES } from '../../../../apis/membershipCards';
import './SubscriptionsReport.scss';

const SubscriptionsReport = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const fetchReport = async () => {
    if (!dateRange.from || !dateRange.to) {
      setError('يرجى اختيار تاريخ البداية والنهاية');
      return;
    }

    if (new Date(dateRange.from) > new Date(dateRange.to)) {
      setError('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getSubscriptionsReport(dateRange.from, dateRange.to);
      if (response.success) {
        setReportData(response.data);
      } else {
        setError(response.message || 'حدث خطأ في جلب التقرير');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.message || 'حدث خطأ في جلب التقرير');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const getStatusBadge = (status) => {
    const statusInfo = SUBSCRIPTION_STATUSES.find(s => s.value === status);
    return (
      <span 
        className={`status-badge status-badge--${status}`}
        style={{ '--status-color': statusInfo?.color }}
      >
        {statusInfo?.label || status}
      </span>
    );
  };

  return (
    <div className="subscriptions-report">
      <div className="report-header">
        <div className="report-header__title-section">
          <h2>تقرير الاشتراكات المالية</h2>
          <p className="report-description">
            عرض جميع الاشتراكات التي تم إنشاؤها خلال فترة زمنية محددة مع الإجماليات المالية
          </p>
        </div>
        <div className="report-header__filters">
          <div className="filter-group">
            <label htmlFor="from_date">من تاريخ</label>
            <input
              type="date"
              id="from_date"
              value={dateRange.from}
              onChange={(e) => handleDateChange('from', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="to_date">إلى تاريخ</label>
            <input
              type="date"
              id="to_date"
              value={dateRange.to}
              onChange={(e) => handleDateChange('to', e.target.value)}
            />
          </div>
          <button 
            className="btn btn--primary"
            onClick={fetchReport}
            disabled={loading}
          >
            {loading ? 'جاري التحميل...' : 'عرض التقرير'}
          </button>
        </div>
      </div>

      {error && (
        <div className="report-error">
          {error}
        </div>
      )}

      {reportData && (
        <>
          <div className="report-summary">
            <div className="summary-card">
              <div className="summary-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="summary-card__content">
                <span className="summary-card__label">إجمالي الاشتراكات</span>
                <span className="summary-card__value">{reportData.summary.total_count}</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="summary-card__content">
                <span className="summary-card__label">إجمالي الإيرادات</span>
                <span className="summary-card__value summary-card__value--primary">
                  {formatCurrency(reportData.summary.total_revenue)}
                </span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="summary-card__content">
                <span className="summary-card__label">رسوم التسجيل</span>
                <span className="summary-card__value">{formatCurrency(reportData.summary.total_establishment_fee)}</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="7" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="summary-card__content">
                <span className="summary-card__label">الاشتراك السنوي</span>
                <span className="summary-card__value">{formatCurrency(reportData.summary.total_annual_fee)}</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="summary-card__content">
                <span className="summary-card__label">رسوم الإصدار</span>
                <span className="summary-card__value">{formatCurrency(reportData.summary.total_issuance_fee)}</span>
              </div>
            </div>
          </div>

          <div className="report-table-container">
            <h3 className="table-title">قائمة الاشتراكات</h3>
            <div className="table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>تاريخ الإنشاء</th>
                    <th>الضابط</th>
                    <th>المستفيد</th>
                    <th>خطة الرسوم</th>
                    <th>الحالة</th>
                    <th>رسوم التسجيل</th>
                    <th>الاشتراك السنوي</th>
                    <th>رسوم الإصدار</th>
                    <th>الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="empty-state">
                        لا توجد اشتراكات في هذه الفترة
                      </td>
                    </tr>
                  ) : (
                    reportData.subscriptions.map((subscription, index) => (
                      <tr key={subscription.id}>
                        <td>{index + 1}</td>
                        <td>{formatDate(subscription.created_at)}</td>
                        <td>
                          {subscription.officer ? (
                            <div className="officer-info">
                              <span className="officer-name">{subscription.officer.full_name}</span>
                              <span className="officer-rank">{subscription.officer.rank}</span>
                            </div>
                          ) : '-'}
                        </td>
                        <td>
                          {subscription.beneficiary ? subscription.beneficiary.full_name : '-'}
                        </td>
                        <td>{subscription.fee_plan?.name || '-'}</td>
                        <td>{getStatusBadge(subscription.status)}</td>
                        <td className="amount-cell">{formatCurrency(subscription.establishment_fee || 0)}</td>
                        <td className="amount-cell">{formatCurrency(subscription.annual_fee || 0)}</td>
                        <td className="amount-cell">{formatCurrency(subscription.issuance_fee || 0)}</td>
                        <td className="amount-cell amount-cell--total">
                          {formatCurrency(subscription.total_amount || 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {reportData.subscriptions.length > 0 && (
                  <tfoot>
                    <tr className="table-footer">
                      <td colSpan="6" className="footer-label">الإجمالي</td>
                      <td className="amount-cell">{formatCurrency(reportData.summary.total_establishment_fee)}</td>
                      <td className="amount-cell">{formatCurrency(reportData.summary.total_annual_fee)}</td>
                      <td className="amount-cell">{formatCurrency(reportData.summary.total_issuance_fee)}</td>
                      <td className="amount-cell amount-cell--total">
                        {formatCurrency(reportData.summary.total_revenue)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SubscriptionsReport;

