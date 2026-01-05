import React, { useState, useEffect } from 'react';
import { getCards, getCardsNotPrinted, getCardsNotEncoded, getExpiringCards, CARD_STATUSES } from '../../../../apis/membershipCards';
import './OperationalReports.scss';

const OperationalReports = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    revokedCards: 0,
    expiredCards: 0,
    pendingPrint: 0,
    pendingEncode: 0,
    expiringNext30Days: 0,
    replacementCards: 0,
    cardsByStatus: {},
    recentActivity: [],
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const [cardsRes, notPrintedRes, notEncodedRes, expiringRes] = await Promise.all([
        getCards(),
        getCardsNotPrinted(),
        getCardsNotEncoded(),
        getExpiringCards(30),
      ]);
      
      const cards = cardsRes.data || [];
      const notPrinted = notPrintedRes.data || [];
      const notEncoded = notEncodedRes.data || [];
      const expiring = expiringRes.data || [];
      
      // Calculate statistics
      const cardsByStatus = {};
      cards.forEach(card => {
        cardsByStatus[card.status] = (cardsByStatus[card.status] || 0) + 1;
      });
      
      setStats({
        totalCards: cards.length,
        activeCards: cards.filter(c => c.status === 'active').length,
        revokedCards: cards.filter(c => c.status === 'revoked').length,
        expiredCards: cards.filter(c => c.status === 'expired').length,
        pendingPrint: notPrinted.length,
        pendingEncode: notEncoded.filter(c => c.printed_at && !c.encoded_at).length,
        expiringNext30Days: expiring.length,
        replacementCards: cards.filter(c => c.is_replacement).length,
        cardsByStatus,
        recentActivity: cards.slice(0, 10),
      });
    } catch (err) {
      console.error('Error fetching operational data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    alert(`سيتم تصدير التقرير بصيغة ${format}`);
  };

  if (loading) {
    return (
      <div className="operational-reports operational-reports--loading">
        <div className="loading-spinner"></div>
        <span>جاري تحميل التقرير...</span>
      </div>
    );
  }

  return (
    <div className="operational-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="reports-header__title">
          <h2>التقارير التشغيلية</h2>
          <p>متابعة حالة البطاقات والعمليات</p>
        </div>
        <div className="reports-header__actions">
          <button className="refresh-btn" onClick={fetchReportData}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3.51 9C4.01717 7.56678 4.87913 6.2854 6.01547 5.27542C7.1518 4.26543 8.52547 3.55976 10.0083 3.22426C11.4911 2.88875 13.0348 2.93434 14.4952 3.35677C15.9556 3.77921 17.2853 4.56471 18.36 5.64L23 10M1 14L5.64 18.36C6.71475 19.4353 8.04437 20.2208 9.50481 20.6432C10.9652 21.0657 12.5089 21.1112 13.9917 20.7757C15.4745 20.4402 16.8482 19.7346 17.9845 18.7246C19.1209 17.7146 19.9828 16.4332 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            تحديث
          </button>
          <div className="export-buttons">
            <button className="export-btn" onClick={() => handleExport('PDF')}>PDF</button>
            <button className="export-btn" onClick={() => handleExport('Excel')}>Excel</button>
          </div>
        </div>
      </div>

      {/* Cards Stats */}
      <div className="ops-grid">
        <div className="ops-card ops-card--primary">
          <div className="ops-card__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="ops-card__content">
            <span className="ops-card__value">{stats.totalCards}</span>
            <span className="ops-card__label">إجمالي البطاقات</span>
          </div>
        </div>

        <div className="ops-card ops-card--success">
          <div className="ops-card__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2"/>
              <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="ops-card__content">
            <span className="ops-card__value">{stats.activeCards}</span>
            <span className="ops-card__label">بطاقات نشطة</span>
          </div>
        </div>

        <div className="ops-card ops-card--warning">
          <div className="ops-card__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18C1.64 18.3024 1.54 18.6453 1.53 18.9945C1.52 19.3437 1.60 19.6916 1.76 20.0034C1.92 20.3153 2.15 20.5814 2.44 20.7757C2.72 20.97 3.05 21.0856 3.4 21.11H20.34C20.69 21.0856 21.01 20.97 21.3 20.7757C21.58 20.5814 21.81 20.3153 21.97 20.0034C22.13 19.6916 22.21 19.3437 22.2 18.9945C22.19 18.6453 22.09 18.3024 21.91 18L13.44 3.86C13.27 3.56611 13.03 3.32312 12.74 3.15448C12.44 2.98585 12.11 2.89725 11.77 2.89725C11.43 2.89725 11.1 2.98585 10.8 3.15448C10.5 3.32312 10.26 3.56611 10.09 3.86H10.29Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="ops-card__content">
            <span className="ops-card__value">{stats.expiringNext30Days}</span>
            <span className="ops-card__label">تنتهي خلال 30 يوم</span>
          </div>
        </div>

        <div className="ops-card ops-card--danger">
          <div className="ops-card__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="ops-card__content">
            <span className="ops-card__value">{stats.revokedCards}</span>
            <span className="ops-card__label">بطاقات ملغاة</span>
          </div>
        </div>

        <div className="ops-card ops-card--replacement">
          <div className="ops-card__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="ops-card__content">
            <span className="ops-card__value">{stats.replacementCards}</span>
            <span className="ops-card__label">بطاقات بديلة</span>
          </div>
        </div>
      </div>

      {/* Queue Status */}
      <div className="queue-section">
        <h3>حالة طوابير العمل</h3>
        <div className="queue-cards">
          <div className="queue-card queue-card--print">
            <div className="queue-card__header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18" stroke="currentColor" strokeWidth="2"/>
                <rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>في انتظار الطباعة</span>
            </div>
            <div className="queue-card__value">{stats.pendingPrint}</div>
            <div className="queue-card__bar">
              <div className="queue-card__bar-fill" style={{ width: `${Math.min(stats.pendingPrint * 10, 100)}%` }}></div>
            </div>
          </div>

          <div className="queue-card queue-card--encode">
            <div className="queue-card__header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>في انتظار التشفير</span>
            </div>
            <div className="queue-card__value">{stats.pendingEncode}</div>
            <div className="queue-card__bar">
              <div className="queue-card__bar-fill" style={{ width: `${Math.min(stats.pendingEncode * 10, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h3>آخر البطاقات المصدرة</h3>
        <div className="activity-table">
          <table>
            <thead>
              <tr>
                <th>رقم البطاقة</th>
                <th>الضابط / المستفيد</th>
                <th>الحالة</th>
                <th>النوع</th>
                <th>تاريخ الانتهاء</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivity.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">لا توجد بطاقات</td>
                </tr>
              ) : (
                stats.recentActivity.map((card) => (
                  <tr key={card.id}>
                    <td className="card-uid">{card.card_uid}</td>
                    <td>{card.subscription?.officer?.full_name || '-'}</td>
                    <td>
                      <span className={`status-badge status-badge--${card.status}`}>
                        {CARD_STATUSES.find(s => s.value === card.status)?.label || card.status}
                      </span>
                    </td>
                    <td>
                      {card.is_replacement ? (
                        <span className="replacement-badge" title="بطاقة بديلة">
                          🔄 بديلة
                        </span>
                      ) : (
                        <span className="original-badge" title="بطاقة أصلية">
                          ✓ أصلية
                        </span>
                      )}
                    </td>
                    <td>{card.expiry_date ? new Date(card.expiry_date).toLocaleDateString('ar-EG') : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OperationalReports;




