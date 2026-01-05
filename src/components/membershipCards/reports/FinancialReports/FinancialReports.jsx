import React, { useState, useEffect } from 'react';
import { getSubscriptions, getFeePlans, getCards } from '../../../../apis/membershipCards';
import './FinancialReports.scss';

const FinancialReports = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    establishmentFees: 0,
    annualFees: 0,
    issuanceFees: 0,
    replacementCardFees: 0,
    byMonth: [],
    byFeePlan: {},
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
      
      const [subscriptionsRes, feePlansRes, cardsRes] = await Promise.all([
        getSubscriptions({ perPage: 1000 }),
        getFeePlans(),
        getCards(),
      ]);
      
      const subscriptions = subscriptionsRes.data || [];
      const feePlans = feePlansRes.data || [];
      const cards = cardsRes.data || [];
      
      // Create fee plan lookup
      const feePlanLookup = {};
      feePlans.forEach(plan => {
        feePlanLookup[plan.id] = plan;
      });
      
      // Get replacement card fee from config (default 50)
      const replacementFee = 50.00; // This should come from API, but for now using default
      
      // Calculate financial statistics
      let totalRevenue = 0;
      let establishmentFees = 0;
      let annualFees = 0;
      let issuanceFees = 0;
      let replacementCardFees = 0;
      const byFeePlan = {};
      const byMonth = {};
      
      // Calculate replacement card fees
      const replacementCards = cards.filter(c => c.is_replacement);
      replacementCardFees = replacementCards.length * replacementFee;
      
      subscriptions.forEach(sub => {
        const plan = feePlanLookup[sub.fee_plan_id];
        if (!plan) return;
        
        const estFee = parseFloat(plan.establishment_fee) || 0;
        const annFee = parseFloat(plan.annual_subscription_fee) || 0;
        const issFee = parseFloat(plan.issuance_fee) || 0;
        const subTotal = estFee + annFee + issFee;
        
        totalRevenue += subTotal;
        establishmentFees += estFee;
        annualFees += annFee;
        issuanceFees += issFee;
        
        // Group by fee plan
        const planName = plan.name || 'غير محدد';
        byFeePlan[planName] = (byFeePlan[planName] || 0) + subTotal;
        
        // Group by month
        if (sub.created_at) {
          const month = sub.created_at.substring(0, 7); // YYYY-MM
          byMonth[month] = (byMonth[month] || 0) + subTotal;
        }
      });
      
      // Convert byMonth to sorted array
      const monthsArray = Object.entries(byMonth)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-12)
        .map(([month, amount]) => ({
          month: formatMonth(month),
          amount,
        }));
      
      // Add replacement fees to total revenue
      const finalTotalRevenue = totalRevenue + replacementCardFees;
      
      setStats({
        totalRevenue: finalTotalRevenue,
        establishmentFees,
        annualFees,
        issuanceFees,
        replacementCardFees,
        byMonth: monthsArray,
        byFeePlan,
      });
    } catch (err) {
      console.error('Error fetching financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleExport = (format) => {
    alert(`سيتم تصدير التقرير بصيغة ${format}`);
  };

  if (loading) {
    return (
      <div className="financial-reports financial-reports--loading">
        <div className="loading-spinner"></div>
        <span>جاري تحميل التقرير...</span>
      </div>
    );
  }

  const maxMonthAmount = Math.max(...stats.byMonth.map(m => m.amount), 1);

  return (
    <div className="financial-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="reports-header__title">
          <h2>التقارير المالية</h2>
          <p>إيرادات الرسوم والاشتراكات</p>
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
            <button className="export-btn" onClick={() => handleExport('PDF')}>PDF</button>
            <button className="export-btn" onClick={() => handleExport('Excel')}>Excel</button>
          </div>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="revenue-grid">
        <div className="revenue-card revenue-card--total">
          <div className="revenue-card__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="revenue-card__content">
            <span className="revenue-card__label">إجمالي الإيرادات</span>
            <span className="revenue-card__value">{formatCurrency(stats.totalRevenue)} ج.م</span>
          </div>
        </div>

        <div className="revenue-card">
          <div className="revenue-card__icon revenue-card__icon--establishment">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 21V7L12 3L19 7V21" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 21V15H15V21" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="revenue-card__content">
            <span className="revenue-card__label">رسوم التأسيس</span>
            <span className="revenue-card__value">{formatCurrency(stats.establishmentFees)} ج.م</span>
          </div>
        </div>

        <div className="revenue-card">
          <div className="revenue-card__icon revenue-card__icon--annual">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="revenue-card__content">
            <span className="revenue-card__label">الاشتراكات السنوية</span>
            <span className="revenue-card__value">{formatCurrency(stats.annualFees)} ج.م</span>
          </div>
        </div>

        <div className="revenue-card">
          <div className="revenue-card__icon revenue-card__icon--issuance">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="revenue-card__content">
            <span className="revenue-card__label">رسوم الإصدار</span>
            <span className="revenue-card__value">{formatCurrency(stats.issuanceFees)} ج.م</span>
          </div>
        </div>

        <div className="revenue-card revenue-card--replacement">
          <div className="revenue-card__icon revenue-card__icon--replacement">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="revenue-card__content">
            <span className="revenue-card__label">رسوم البطاقات البديلة</span>
            <span className="revenue-card__value">{formatCurrency(stats.replacementCardFees)} ج.م</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        {/* Monthly Revenue Chart */}
        <div className="chart-card chart-card--full">
          <h3>الإيرادات الشهرية</h3>
          <div className="monthly-chart">
            {stats.byMonth.map((item, index) => (
              <div key={index} className="month-bar">
                <div className="month-bar__fill-container">
                  <div 
                    className="month-bar__fill" 
                    style={{ height: `${(item.amount / maxMonthAmount) * 100}%` }}
                  >
                    <span className="month-bar__value">{formatCurrency(item.amount)}</span>
                  </div>
                </div>
                <span className="month-bar__label">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Fee Plan */}
        <div className="chart-card">
          <h3>الإيرادات حسب خطة الرسوم</h3>
          <div className="pie-list">
            {Object.entries(stats.byFeePlan)
              .sort((a, b) => b[1] - a[1])
              .map(([plan, amount], index) => {
                const percentage = ((amount / stats.totalRevenue) * 100).toFixed(1);
                return (
                  <div key={plan} className="pie-item">
                    <div className="pie-item__color" style={{ backgroundColor: getColor(index) }}></div>
                    <div className="pie-item__info">
                      <span className="pie-item__label">{plan}</span>
                      <span className="pie-item__percentage">{percentage}%</span>
                    </div>
                    <span className="pie-item__value">{formatCurrency(amount)} ج.م</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

const getColor = (index) => {
  const colors = ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#D2B48C', '#BC8F8F', '#A0522D'];
  return colors[index % colors.length];
};

export default FinancialReports;




