import React, { useState, useEffect } from 'react';
import {
  getAttendanceByDateRange,
  getAttendanceStats,
  getSubscriptions,
  getAcademies,
  getOffers,
} from '../../../../apis/activitiesSubscriptions';
import DataTable from '../../shared/DataTable/DataTable';
import './AttendanceManagement.scss';

const AttendanceManagement = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [academies, setAcademies] = useState([]);
  const [offers, setOffers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [academyFilter, setAcademyFilter] = useState('');
  const [offerFilter, setOfferFilter] = useState('');
  const [subscriberFilter, setSubscriberFilter] = useState('');
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [stats, setStats] = useState({
    totalAttendance: 0,
    totalSubscriptions: 0,
    averageAttendance: 0,
  });
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Debounced filtering effect
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      loadData();
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [dateFrom, dateTo, academyFilter, offerFilter, subscriberFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        attendanceRes,
        academiesRes,
        offersRes,
        subscriptionsRes,
        statsRes,
      ] = await Promise.all([
        getAttendanceByDateRange(dateFrom, dateTo),
        getAcademies(),
        getOffers(),
        getSubscriptions(),
        getAttendanceStats(dateFrom, dateTo),
      ]);

      let filteredAttendance = attendanceRes.data || [];

      // Debug: Log the data structure
      console.log('=== DEBUGGING ATTENDANCE DATA ===');
      console.log('attendanceRes:', attendanceRes);
      console.log('attendanceRes.data:', attendanceRes.data);
      console.log('filteredAttendance:', filteredAttendance);
      if (filteredAttendance[0]) {
        console.log('First attendance record:', filteredAttendance[0]);
        console.log('First subscription:', filteredAttendance[0].subscription);
        console.log('First offer:', filteredAttendance[0].subscription?.offer);
        console.log(
          'First academy:',
          filteredAttendance[0].subscription?.offer?.academy
        );
      }

      // Apply filters
      if (academyFilter) {
        filteredAttendance = filteredAttendance.filter(
          (attendance) =>
            attendance?.subscription?.offer?.academy_id == academyFilter
        );
      }

      if (offerFilter) {
        filteredAttendance = filteredAttendance.filter(
          (attendance) => attendance?.subscription?.offer_id == offerFilter
        );
      }

      if (subscriberFilter) {
        filteredAttendance = filteredAttendance.filter((attendance) =>
          attendance?.subscription?.subscriber?.full_name
            ?.toLowerCase()
            .includes(subscriberFilter.toLowerCase())
        );
      }

      setAttendanceData(filteredAttendance);
      setAcademies(academiesRes.data || []);
      setOffers(offersRes.data || []);
      setSubscriptions(subscriptionsRes.data || []);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value);
  };

  const handleDateToChange = (e) => {
    setDateTo(e.target.value);
  };

  const handleAcademyFilterChange = (e) => {
    setAcademyFilter(e.target.value);
  };

  const handleOfferFilterChange = (e) => {
    setOfferFilter(e.target.value);
  };

  const handleSubscriberFilterChange = (e) => {
    setSubscriberFilter(e.target.value);
  };

  const clearAllFilters = () => {
    setDateFrom('');
    setDateTo('');
    setAcademyFilter('');
    setOfferFilter('');
    setSubscriberFilter('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    const months = [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    const months = [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} - ${hours}:${minutes}`;
  };

  const columns = [
    {
      key: 'academy_name',
      header: 'الأكاديمية',
      render: (value, attendance, index) =>
        attendance?.subscription?.offer?.academy?.name || 'غير محدد',
    },
    {
      key: 'offer_name',
      header: 'العرض',
      render: (value, attendance, index) =>
        attendance?.subscription?.offer?.name || 'غير محدد',
    },
    {
      key: 'subscriber_name',
      header: 'اسم المشترك',
      render: (value, attendance, index) =>
        attendance?.subscription?.subscriber?.full_name || 'غير محدد',
    },
    {
      key: 'subscription_created_at',
      header: 'تاريخ إنشاء الاشتراك',
      render: (value, attendance, index) =>
        formatDate(attendance?.subscription?.created_at),
    },
    {
      key: 'offer_classes',
      header: 'عدد حصص العرض',
      render: (value, attendance, index) =>
        attendance?.subscription?.offer?.classes_count || 0,
    },
    {
      key: 'attendance_count',
      header: ' الحضور',
      render: (value, attendance, index) => attendance?.attendance_count || 0,
    },
    {
      key: 'attendance_percentage',
      header: 'نسبة الحضور',
      render: (value, attendance, index) => {
        const totalClasses =
          attendance?.subscription?.offer?.classes_count || 0;
        const attendedClasses = attendance?.attendance_count || 0;
        const percentage =
          totalClasses > 0
            ? Math.round((attendedClasses / totalClasses) * 100)
            : 0;
        return `${percentage}%`;
      },
    },
    {
      key: 'last_attendance',
      header: 'آخر حضور',
      render: (value, attendance, index) =>
        formatDateTime(attendance?.last_attendance_date),
    },
  ];

  const actions = (attendance) => (
    <div className="data-table__actions">
      <button
        className="action-btn action-btn--view"
        onClick={() => {
          setSelectedAttendance(attendance);
          setShowDetailsModal(true);
        }}
        title="عرض التفاصيل"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="attendance-management">
      <div className="page-header">
        <h1 className="page-title">الحضور</h1>
        <div className="header-actions">
          <div className="filters-container">
            <div className="date-filters">
              <div className="date-input-container">
                <svg
                  className="date-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15.6945 13.7H15.7035M15.6945 16.7H15.7035M11.9955 13.7H12.0045M11.9955 16.7H12.0045M8.29431 13.7H8.30329M8.29431 16.7H8.30329"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="date"
                  placeholder="من تاريخ"
                  value={dateFrom}
                  onChange={handleDateFromChange}
                  className="date-input"
                  title="من تاريخ"
                />
              </div>
              <div className="date-input-container">
                <svg
                  className="date-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15.6945 13.7H15.7035M15.6945 16.7H15.7035M11.9955 13.7H12.0045M11.9955 16.7H12.0045M8.29431 13.7H8.30329M8.29431 16.7H8.30329"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="date"
                  placeholder="إلى تاريخ"
                  value={dateTo}
                  onChange={handleDateToChange}
                  className="date-input"
                  title="إلى تاريخ"
                />
              </div>
            </div>
            <select
              value={academyFilter}
              onChange={handleAcademyFilterChange}
              className="filter-select"
              title="الأكاديمية"
            >
              <option value="">جميع الأكاديميات</option>
              {academies.map((academy) => (
                <option key={academy.id} value={academy.id}>
                  {academy.name}
                </option>
              ))}
            </select>
            <select
              value={offerFilter}
              onChange={handleOfferFilterChange}
              className="filter-select"
              title="العرض"
            >
              <option value="">جميع العروض</option>
              {offers.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="البحث عن مشترك..."
              value={subscriberFilter}
              onChange={handleSubscriberFilterChange}
              className="search-input"
              title="البحث عن مشترك"
            />
            <button
              className="clear-filters-btn"
              onClick={clearAllFilters}
              disabled={
                !dateFrom &&
                !dateTo &&
                !academyFilter &&
                !offerFilter &&
                !subscriberFilter
              }
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalAttendance || 0}</div>
            <div className="stat-label">إجمالي الحضور</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8M16 4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4M16 4C16 5.10457 15.1046 6 14 6H10C8.89543 6 8 5.10457 8 4"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalSubscriptions || 0}</div>
            <div className="stat-label">إجمالي الاشتراكات</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {Math.round(stats.averageAttendance || 0)}%
            </div>
            <div className="stat-label">متوسط نسبة الحضور</div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <DataTable
          data={attendanceData}
          columns={columns}
          loading={loading}
          actions={actions}
          emptyMessage={
            dateFrom ||
            dateTo ||
            academyFilter ||
            offerFilter ||
            subscriberFilter
              ? 'لم يتم العثور على بيانات حضور تطابق البحث'
              : 'لا توجد بيانات حضور'
          }
        />
      </div>

      {/* Attendance Details Modal */}
      {showDetailsModal && selectedAttendance && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailsModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-info">
                <h2>تفاصيل الحضور</h2>
                <p className="subscriber-name">
                  {selectedAttendance?.subscription?.subscriber?.full_name}
                </p>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="stat-item">
                  <div className="stat-number">
                    {selectedAttendance?.attendance_count || 0}
                  </div>
                  <div className="stat-label">حضور</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {(() => {
                      const totalClasses =
                        selectedAttendance?.subscription?.offer
                          ?.classes_count || 0;
                      const attendedClasses =
                        selectedAttendance?.attendance_count || 0;
                      const percentage =
                        totalClasses > 0
                          ? Math.round((attendedClasses / totalClasses) * 100)
                          : 0;
                      return `${percentage}%`;
                    })()}
                  </div>
                  <div className="stat-label">نسبة الحضور</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {selectedAttendance?.subscription?.offer?.classes_count ||
                      0}
                  </div>
                  <div className="stat-label">إجمالي الحصص</div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="details-section">
                <h3>معلومات الاشتراك</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">الأكاديمية</span>
                    <span className="detail-value">
                      {selectedAttendance?.subscription?.offer?.academy?.name ||
                        'غير محدد'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">العرض</span>
                    <span className="detail-value">
                      {selectedAttendance?.subscription?.offer?.name ||
                        'غير محدد'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">رقم الهاتف</span>
                    <span className="detail-value">
                      {selectedAttendance?.subscription?.subscriber?.phone ||
                        'غير محدد'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">تاريخ الاشتراك</span>
                    <span className="detail-value">
                      {formatDate(selectedAttendance?.subscription?.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendance Records */}
              <div className="details-section">
                <h3>
                  سجل الحضور (
                  {selectedAttendance?.attendance_records?.length || 0} حصة)
                </h3>
                <div className="attendance-records">
                  {selectedAttendance?.attendance_records?.map(
                    (record, index) => (
                      <div key={index} className="attendance-record">
                        <div className="record-info">
                          <div className="record-date">
                            {formatDateTime(record.check_in_date)}
                          </div>
                          <div className="record-day">{record.day_of_week}</div>
                        </div>
                        <div className="record-status">
                          <span className="status-dot"></span>
                          <span className="status-text">حضر</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
