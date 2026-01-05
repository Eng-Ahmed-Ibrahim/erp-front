import React, { useState, useEffect } from 'react';
import { getSubscriptions, SUBSCRIPTION_STATUSES, RANKS } from '../../../../apis/membershipCards';
import './MembershipReports.scss';

const MembershipReports = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    suspended: 0,
    byRank: {},
    byRelationship: {},
  });
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptions({ perPage: 1000 });
      const subscriptions = response.data || [];
      
      // Calculate statistics
      const newStats = {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'active').length,
        expired: subscriptions.filter(s => s.status === 'expired').length,
        suspended: subscriptions.filter(s => s.status === 'suspended').length,
        byRank: {},
        byRelationship: {},
      };
      
      // Group by rank
      subscriptions.forEach(sub => {
        const rank = sub.officer?.rank || 'غير محدد';
        newStats.byRank[rank] = (newStats.byRank[rank] || 0) + 1;
      });
      
      // Group by relationship (for beneficiaries)
      subscriptions.forEach(sub => {
        if (sub.beneficiary) {
          const rel = sub.beneficiary.relationship_type || 'غير محدد';
          newStats.byRelationship[rel] = (newStats.byRelationship[rel] || 0) + 1;
        } else {
          newStats.byRelationship['ضابط'] = (newStats.byRelationship['ضابط'] || 0) + 1;
        }
      });
      
      setStats(newStats);
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  const handleExport = (format) => {
    // Placeholder for export functionality
    alert(`سيتم تصدير التقرير بصيغة ${format}`);
  };

  if (loading) {
    return (
      <div className="membership-reports membership-reports--loading">
        <div className="loading-spinner"></div>
        <span>جاري تحميل التقرير...</span>
      </div>
    );
  }

  return (
    <div className="membership-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="reports-header__title">
          <h2>تقارير العضوية</h2>
          <p>إحصائيات شاملة عن العضويات النشطة والمنتهية</p>
        </div>
        <div className="reports-header__actions">
          <div className="date-range">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            />
            <span>إلى</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>
          <div className="export-buttons">
            <button className="export-btn" onClick={() => handleExport('PDF')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
              </svg>
              PDF
            </button>
            <button className="export-btn" onClick={() => handleExport('Excel')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 3V21" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card--total">
          <div className="stat-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.total}</span>
            <span className="stat-card__label">إجمالي العضويات</span>
          </div>
        </div>

        <div className="stat-card stat-card--active">
          <div className="stat-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2"/>
              <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.active}</span>
            <span className="stat-card__label">العضويات النشطة</span>
            <span className="stat-card__percentage">{getPercentage(stats.active, stats.total)}%</span>
          </div>
        </div>

        <div className="stat-card stat-card--expired">
          <div className="stat-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.expired}</span>
            <span className="stat-card__label">العضويات المنتهية</span>
            <span className="stat-card__percentage">{getPercentage(stats.expired, stats.total)}%</span>
          </div>
        </div>

        <div className="stat-card stat-card--suspended">
          <div className="stat-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-card__content">
            <span className="stat-card__value">{stats.suspended}</span>
            <span className="stat-card__label">العضويات الموقوفة</span>
            <span className="stat-card__percentage">{getPercentage(stats.suspended, stats.total)}%</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* By Rank */}
        <div className="chart-card">
          <h3>العضويات حسب الرتبة</h3>
          <div className="chart-bars">
            {Object.entries(stats.byRank)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([rank, count]) => (
                <div key={rank} className="bar-item">
                  <div className="bar-label">{rank}</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${getPercentage(count, stats.total)}%` }}
                    ></div>
                  </div>
                  <div className="bar-value">{count}</div>
                </div>
              ))}
          </div>
        </div>

        {/* By Relationship */}
        <div className="chart-card">
          <h3>العضويات حسب نوع المستفيد</h3>
          <div className="chart-bars">
            {Object.entries(stats.byRelationship)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type} className="bar-item">
                  <div className="bar-label">{type}</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill bar-fill--alt" 
                      style={{ width: `${getPercentage(count, stats.total)}%` }}
                    ></div>
                  </div>
                  <div className="bar-value">{count}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipReports;




