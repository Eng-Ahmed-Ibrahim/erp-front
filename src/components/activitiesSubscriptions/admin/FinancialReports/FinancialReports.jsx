import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import 'moment/locale/ar';
import {
  getFinancialDashboardStats,
  getFinancialRevenueAnalytics,
  getSubscriptionsFinancials,
  getRevenueByAcademy,
  getRevenueBySubscriberType,
  getAcademies,
  updateSubscription,
} from '../../../../apis/activitiesSubscriptions';
import DataTable from '../../shared/DataTable/DataTable';
import './FinancialReports.scss';

moment.locale('ar');

const FinancialReports = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState({
    start_date: moment().startOf('month').format('YYYY-MM-DD'),
    end_date: moment().endOf('month').format('YYYY-MM-DD'),
  });
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [selectedSubscriberType, setSelectedSubscriberType] = useState(null);
  const [groupBy, setGroupBy] = useState('daily');
  const [academies, setAcademies] = useState([]);
  const [cancellingSubscription, setCancellingSubscription] = useState(null);

  useEffect(() => {
    loadAcademies();
  }, []);

  const loadAcademies = async () => {
    try {
      const response = await getAcademies();
      setAcademies(response.data || []);
    } catch (error) {
      console.error('Error loading academies:', error);
    }
  };

  // Fetch dashboard stats
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['activities-financial-dashboard-stats', dateRange],
    queryFn: () =>
      getFinancialDashboardStats({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      }),
    enabled: !!dateRange.start_date && !!dateRange.end_date,
  });

  // Fetch revenue analytics
  const {
    data: revenueAnalytics,
    isLoading: revenueLoading,
  } = useQuery({
    queryKey: ['activities-revenue-analytics', dateRange, groupBy],
    queryFn: () =>
      getFinancialRevenueAnalytics({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        group_by: groupBy,
      }),
    enabled: !!dateRange.start_date && !!dateRange.end_date,
  });

  // Fetch subscriptions financials
  const {
    data: subscriptionsFinancials,
    isLoading: subscriptionsLoading,
  } = useQuery({
    queryKey: ['activities-subscriptions-financials', dateRange, selectedAcademy, selectedSubscriberType],
    queryFn: () =>
      getSubscriptionsFinancials({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        academy_id: selectedAcademy || undefined,
        subscriber_type: selectedSubscriberType || undefined,
      }),
    enabled: !!dateRange.start_date && !!dateRange.end_date,
  });

  // Fetch revenue by academy
  const {
    data: revenueByAcademy,
    isLoading: revenueByAcademyLoading,
  } = useQuery({
    queryKey: ['activities-revenue-by-academy', dateRange],
    queryFn: () =>
      getRevenueByAcademy({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      }),
    enabled: !!dateRange.start_date && !!dateRange.end_date,
  });

  // Fetch revenue by subscriber type
  const {
    data: revenueBySubscriberType,
    isLoading: revenueBySubscriberTypeLoading,
  } = useQuery({
    queryKey: ['activities-revenue-by-subscriber-type', dateRange],
    queryFn: () =>
      getRevenueBySubscriberType({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      }),
    enabled: !!dateRange.start_date && !!dateRange.end_date,
  });

  const stats = dashboardStats?.data?.stats || {};
  const revenueData = revenueAnalytics?.data || {};
  const subscriptions = subscriptionsFinancials?.data?.subscriptions || [];
  const subscriptionsSummary = subscriptionsFinancials?.data?.summary || {};
  const academyRevenue = revenueByAcademy?.data?.revenue_by_academy || [];
  const academySummary = revenueByAcademy?.data?.summary || {};
  const subscriberTypeRevenue = revenueBySubscriberType?.data?.revenue_by_subscriber_type || [];
  const subscriberTypeSummary = revenueBySubscriberType?.data?.summary || {};

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0.00';
    return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatDate = (date) => {
    return moment(date).format('YYYY-MM-DD');
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الاشتراك؟')) {
      return;
    }

    try {
      setCancellingSubscription(subscriptionId);
      await updateSubscription(subscriptionId, { status: 'cancelled' });
      
      // Invalidate and refetch subscriptions data
      queryClient.invalidateQueries(['activities-subscriptions-financials']);
      queryClient.invalidateQueries(['activities-financial-dashboard-stats']);
      
      alert('تم إلغاء الاشتراك بنجاح');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('حدث خطأ أثناء إلغاء الاشتراك');
    } finally {
      setCancellingSubscription(null);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
    { id: 'revenue', label: 'تحليل الإيرادات', icon: '💰' },
    { id: 'subscriptions', label: 'الاشتراكات المالية', icon: '📋' },
    { id: 'academies', label: 'الإيرادات حسب الأكاديمية', icon: '🏫' },
    { id: 'subscriber-types', label: 'الإيرادات حسب نوع المشترك', icon: '👥' },
  ];

  const subscriberTypeLabels = {
    infantry: 'عسكري',
    civilian: 'مدني',
    other: 'أخر',
  };

  const statusLabels = {
    active: 'نشط',
    expired: 'منتهي',
    cancelled: 'ملغي',
  };

  return (
    <div className="financial-reports">
      <div className="financial-reports__header">
        <h2 className="financial-reports__title">التقارير المالية</h2>
        <div className="financial-reports__filters">
          <div className="filter-group">
            <label>من تاريخ:</label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) =>
                setDateRange({ ...dateRange, start_date: e.target.value })
              }
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>إلى تاريخ:</label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) =>
                setDateRange({ ...dateRange, end_date: e.target.value })
              }
              className="filter-input"
            />
          </div>
          <button
            className="btn btn--primary"
            onClick={() => {
              refetchStats();
              window.location.reload();
            }}
          >
            تحديث
          </button>
        </div>
      </div>

      <div className="financial-reports__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${
              activeTab === tab.id ? 'tab-button--active' : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-button__icon">{tab.icon}</span>
            <span className="tab-button__label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="financial-reports__content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            {statsLoading ? (
              <div className="loading">جاري التحميل...</div>
            ) : (
              <>
                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="summary-card__label">إجمالي الإيرادات</div>
                    <div className="summary-card__value">
                      {formatCurrency(stats.total_revenue)} ج.م
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card__label">إجمالي الاشتراكات</div>
                    <div className="summary-card__value">
                      {stats.total_subscriptions || 0}
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card__label">الاشتراكات النشطة</div>
                    <div className="summary-card__value">
                      {stats.active_subscriptions || 0}
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card__label">الاشتراكات المنتهية</div>
                    <div className="summary-card__value">
                      {stats.expired_subscriptions || 0}
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card__label">الاشتراكات الملغاة</div>
                    <div className="summary-card__value">
                      {stats.cancelled_subscriptions || 0}
                    </div>
                  </div>
                </div>

                {/* Quick Insights Section */}
                <div className="insights-section">
                  <h3 className="insights-title">نظرة سريعة</h3>
                  <div className="insights-grid">
                    <div className="insight-card">
                      <div className="insight-card__icon">📊</div>
                      <div className="insight-card__content">
                        <div className="insight-card__title">معدل النمو</div>
                        <div className="insight-card__value">
                          {dashboardStats?.data?.growth?.revenue_growth_percentage > 0 ? (
                            <span className="insight-positive">
                              +{dashboardStats.data.growth.revenue_growth_percentage.toFixed(1)}%
                            </span>
                          ) : dashboardStats?.data?.growth?.revenue_growth_percentage < 0 ? (
                            <span className="insight-negative">
                              {dashboardStats.data.growth.revenue_growth_percentage.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="insight-neutral">0%</span>
                          )}
                        </div>
                        <div className="insight-card__description">نمو الإيرادات مقارنة بالشهر السابق</div>
                      </div>
                    </div>

                    <div className="insight-card">
                      <div className="insight-card__icon">📈</div>
                      <div className="insight-card__content">
                        <div className="insight-card__title">معدل النجاح</div>
                        <div className="insight-card__value">
                          {stats.total_subscriptions > 0 
                            ? ((stats.active_subscriptions / stats.total_subscriptions) * 100).toFixed(1)
                            : 0}%
                        </div>
                        <div className="insight-card__description">نسبة الاشتراكات النشطة من الإجمالي</div>
                      </div>
                    </div>

                    <div className="insight-card">
                      <div className="insight-card__icon">💰</div>
                      <div className="insight-card__content">
                        <div className="insight-card__title">متوسط القيمة</div>
                        <div className="insight-card__value">
                          {formatCurrency(stats.average_subscription_price)} ج.م
                        </div>
                        <div className="insight-card__description">متوسط قيمة كل اشتراك</div>
                      </div>
                    </div>

                    <div className="insight-card">
                      <div className="insight-card__icon">📅</div>
                      <div className="insight-card__content">
                        <div className="insight-card__title">الفترة</div>
                        <div className="insight-card__value">
                          {moment(dateRange.start_date).format('DD/MM/YYYY')} - {moment(dateRange.end_date).format('DD/MM/YYYY')}
                        </div>
                        <div className="insight-card__description">نطاق البيانات المعروضة</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Distribution Chart */}
                <div className="chart-section">
                  <div className="chart-card">
                    <h3 className="chart-title">توزيع الاشتراكات حسب الحالة</h3>
                    <div className="status-chart">
                      <div className="status-chart__item">
                        <div className="status-chart__bar-container">
                          <div 
                            className="status-chart__bar status-chart__bar--active"
                            style={{ 
                              width: stats.total_subscriptions > 0 
                                ? `${(stats.active_subscriptions / stats.total_subscriptions) * 100}%`
                                : '0%'
                            }}
                          >
                            <span className="status-chart__value">{stats.active_subscriptions || 0}</span>
                          </div>
                        </div>
                        <div className="status-chart__label">
                          <span className="status-chart__indicator status-chart__indicator--active"></span>
                          <span>نشط</span>
                        </div>
                      </div>
                      <div className="status-chart__item">
                        <div className="status-chart__bar-container">
                          <div 
                            className="status-chart__bar status-chart__bar--expired"
                            style={{ 
                              width: stats.total_subscriptions > 0 
                                ? `${(stats.expired_subscriptions / stats.total_subscriptions) * 100}%`
                                : '0%'
                            }}
                          >
                            <span className="status-chart__value">{stats.expired_subscriptions || 0}</span>
                          </div>
                        </div>
                        <div className="status-chart__label">
                          <span className="status-chart__indicator status-chart__indicator--expired"></span>
                          <span>منتهي</span>
                        </div>
                      </div>
                      <div className="status-chart__item">
                        <div className="status-chart__bar-container">
                          <div 
                            className="status-chart__bar status-chart__bar--cancelled"
                            style={{ 
                              width: stats.total_subscriptions > 0 
                                ? `${(stats.cancelled_subscriptions / stats.total_subscriptions) * 100}%`
                                : '0%'
                            }}
                          >
                            <span className="status-chart__value">{stats.cancelled_subscriptions || 0}</span>
                          </div>
                        </div>
                        <div className="status-chart__label">
                          <span className="status-chart__indicator status-chart__indicator--cancelled"></span>
                          <span>ملغي</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="revenue-section">
            <div className="section-header">
              <h3>تحليل الإيرادات</h3>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="filter-select"
              >
                <option value="daily">يومي</option>
                <option value="weekly">أسبوعي</option>
                <option value="monthly">شهري</option>
                <option value="yearly">سنوي</option>
              </select>
            </div>
            {revenueLoading ? (
              <div className="loading">جاري التحميل...</div>
            ) : (
              <>
                {revenueData.revenue_data && revenueData.revenue_data.length > 0 ? (
                  <div className="revenue-table-container">
                    <table className="revenue-table">
                      <thead>
                        <tr>
                          <th>التاريخ</th>
                          <th>الإيرادات</th>
                          <th>عدد الاشتراكات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueData.revenue_data.map((item, index) => (
                          <tr key={index}>
                            <td>
                              {groupBy === 'daily'
                                ? formatDate(item.date)
                                : groupBy === 'weekly'
                                ? `الأسبوع ${item.week}`
                                : groupBy === 'monthly'
                                ? `${item.year}-${item.month}`
                                : item.year}
                            </td>
                            <td>{formatCurrency(item.revenue)} ج.م</td>
                            <td>{item.subscriptions_count || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th>الإجمالي</th>
                          <th>
                            {formatCurrency(revenueData.summary?.total_revenue)} ج.م
                          </th>
                          <th>{revenueData.summary?.total_subscriptions || 0}</th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">لا توجد بيانات</div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="subscriptions-section">
            <div className="section-header">
              <h3>الاشتراكات المالية</h3>
              <div className="filters-row">
                <select
                  value={selectedAcademy || ''}
                  onChange={(e) => setSelectedAcademy(e.target.value || null)}
                  className="filter-select"
                >
                  <option value="">جميع الأكاديميات</option>
                  {academies.map((academy) => (
                    <option key={academy.id} value={academy.id}>
                      {academy.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedSubscriberType || ''}
                  onChange={(e) =>
                    setSelectedSubscriberType(e.target.value || null)
                  }
                  className="filter-select"
                >
                  <option value="">جميع الأنواع</option>
                  <option value="infantry">عسكري</option>
                  <option value="civilian">مدني</option>
                  <option value="other">أخر</option>
                </select>
              </div>
            </div>
            {subscriptionsLoading ? (
              <div className="loading">جاري التحميل...</div>
            ) : (
              <>
                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="summary-card__label">إجمالي الاشتراكات</div>
                    <div className="summary-card__value">
                      {subscriptionsSummary.total_subscriptions || 0}
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card__label">إجمالي الإيرادات</div>
                    <div className="summary-card__value">
                      {formatCurrency(subscriptionsSummary.total_revenue)} ج.م
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card__label">حصة المشاة</div>
                    <div className="summary-card__value">
                      {formatCurrency(subscriptionsSummary.total_infantry_revenue_share)} ج.م
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card__label">حصة الأكاديمية</div>
                    <div className="summary-card__value">
                      {formatCurrency(subscriptionsSummary.total_academy_revenue_share)} ج.م
                    </div>
                  </div>
                </div>
                {subscriptions.length > 0 ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>تاريخ الاشتراك</th>
                          <th>اسم المشترك</th>
                          <th>نوع المشترك</th>
                          <th>اسم العرض</th>
                          <th>اسم الأكاديمية</th>
                          <th>السعر</th>
                          <th>الحالة</th>
                          <th>الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.map((subscription) => (
                          <tr key={subscription.id}>
                            <td>{formatDate(subscription.created_at)}</td>
                            <td>{subscription.subscriber_name}</td>
                            <td>
                              <span className="badge badge--type">
                                {subscriberTypeLabels[subscription.subscriber_type] || subscription.subscriber_type}
                              </span>
                            </td>
                            <td>{subscription.offer_name}</td>
                            <td>{subscription.academy_name}</td>
                            <td>{formatCurrency(subscription.subscription_price)} ج.م</td>
                            <td>
                              <span
                                className={`badge badge--${subscription.status}`}
                              >
                                {statusLabels[subscription.status] || subscription.status}
                              </span>
                            </td>
                            <td>
                              {subscription.status === 'active' && (
                                <button
                                  className="action-btn action-btn--cancel"
                                  onClick={() => handleCancelSubscription(subscription.id)}
                                  disabled={cancellingSubscription === subscription.id}
                                  title="إلغاء الاشتراك"
                                >
                                  {cancellingSubscription === subscription.id ? (
                                    'جاري...'
                                  ) : (
                                    'إلغاء'
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">لا توجد بيانات</div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'academies' && (
          <div className="academies-section">
            <div className="section-header">
              <h3>الإيرادات حسب الأكاديمية</h3>
            </div>
            {revenueByAcademyLoading ? (
              <div className="loading">جاري التحميل...</div>
            ) : (
              <>
                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="summary-card__label">إجمالي الإيرادات</div>
                    <div className="summary-card__value">
                      {formatCurrency(academySummary.total_revenue)} ج.م
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card__label">حصة المشاة</div>
                    <div className="summary-card__value">
                      {formatCurrency(academySummary.total_infantry_revenue_share)} ج.م
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card__label">حصة الأكاديميات</div>
                    <div className="summary-card__value">
                      {formatCurrency(academySummary.total_academy_revenue_share)} ج.م
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card__label">عدد الاشتراكات</div>
                    <div className="summary-card__value">
                      {academySummary.total_subscriptions || 0}
                    </div>
                  </div>
                </div>
                {academyRevenue.length > 0 ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>اسم الأكاديمية</th>
                          <th>إجمالي الإيرادات</th>
                          <th>حصة المشاة</th>
                          <th>حصة الأكاديمية</th>
                          <th>عدد الاشتراكات</th>
                          <th>الاشتراكات النشطة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {academyRevenue.map((academy) => (
                          <tr key={academy.id}>
                            <td>{academy.academy_name}</td>
                            <td>{formatCurrency(academy.total_revenue)} ج.م</td>
                            <td>{formatCurrency(academy.infantry_revenue_share)} ج.م</td>
                            <td>{formatCurrency(academy.academy_revenue_share)} ج.م</td>
                            <td>{academy.subscriptions_count}</td>
                            <td>{academy.active_subscriptions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">لا توجد بيانات</div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'subscriber-types' && (
          <div className="subscriber-types-section">
            <div className="section-header">
              <h3>الإيرادات حسب نوع المشترك</h3>
            </div>
            {revenueBySubscriberTypeLoading ? (
              <div className="loading">جاري التحميل...</div>
            ) : (
              <>
                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="summary-card__label">إجمالي الإيرادات</div>
                    <div className="summary-card__value">
                      {formatCurrency(subscriberTypeSummary.total_revenue)} ج.م
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card__label">إجمالي الاشتراكات</div>
                    <div className="summary-card__value">
                      {subscriberTypeSummary.total_subscriptions || 0}
                    </div>
                  </div>
                </div>
                {subscriberTypeRevenue.length > 0 ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>نوع المشترك</th>
                          <th>إجمالي الإيرادات</th>
                          <th>عدد الاشتراكات</th>
                          <th>الاشتراكات النشطة</th>
                          <th>متوسط سعر الاشتراك</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriberTypeRevenue.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <span className="badge badge--type">
                                {subscriberTypeLabels[item.subscriber_type] || item.subscriber_type}
                              </span>
                            </td>
                            <td>{formatCurrency(item.total_revenue)} ج.م</td>
                            <td>{item.subscriptions_count}</td>
                            <td>{item.active_subscriptions}</td>
                            <td>{formatCurrency(item.average_subscription_price)} ج.م</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">لا توجد بيانات</div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReports;

