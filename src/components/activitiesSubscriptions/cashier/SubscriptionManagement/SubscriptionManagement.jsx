import React, { useState, useEffect } from 'react';
import {
  getSubscriptions,
  getSubscribers,
  getOffers,
  getAcademies,
  getCashiers,
  createSubscription,
  generateQRCode,
  getQRCodeSVG,
  getBarcodeSVG,
  generateAllQRCodes,
  searchSubscriberByIdentifier,
} from '../../../../apis/activitiesSubscriptions';
import FormField from '../../shared/FormField/FormField';
import Modal from '../../shared/Modal/Modal';
import DataTable from '../../shared/DataTable/DataTable';
import './SubscriptionManagement.scss';

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [createdByFilter, setCreatedByFilter] = useState('');
  const [academyFilter, setAcademyFilter] = useState('');
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });
  const [formData, setFormData] = useState({
    subscriber_id: '',
    subscriber_identifier: '', // For searching
    subscriber_full_name: '',
    subscriber_phone: '',
    subscriber_type: 'civilian', // عسكري or مدني
    subscriber_national_id: '',
    subscriber_military_id: '',
    offer_id: '',
    academy_id: '',
    start_date: '',
    end_date: '',
    chosen_days: [],
  });
  const [academies, setAcademies] = useState([]);
  const [academyOffers, setAcademyOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  // Helper function to show notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000); // Auto-hide after 4 seconds
  };

  const daysOfWeek = [
    { value: 'Monday', label: 'الاثنين' },
    { value: 'Tuesday', label: 'الثلاثاء' },
    { value: 'Wednesday', label: 'الأربعاء' },
    { value: 'Thursday', label: 'الخميس' },
    { value: 'Friday', label: 'الجمعة' },
    { value: 'Saturday', label: 'السبت' },
    { value: 'Sunday', label: 'الأحد' },
  ];

  const subscriberTypes = [
    { value: 'civilian', label: 'مدني' },
    { value: 'infantry', label: 'عسكري' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  // Debounced filtering effect - triggers API call when filters change
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for debounced API call
    const timer = setTimeout(() => {
      loadData();
    }, 500); // 500ms debounce delay

    setDebounceTimer(timer);

    // Cleanup timer on unmount
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [dateFrom, dateTo, createdByFilter, academyFilter]);

  const loadData = async (page = pagination.current_page, perPage = pagination.per_page) => {
    setLoading(true);
    try {
      // Prepare filter parameters
      const filters = {
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        createdBy: createdByFilter || undefined,
        academyId: academyFilter || undefined,
        page,
        perPage,
      };

      const [
        subscriptionsRes,
        subscribersRes,
        offersRes,
        academiesRes,
        cashiersRes,
      ] = await Promise.all([
        getSubscriptions(filters),
        getSubscribers(),
        getOffers(),
        getAcademies(),
        getCashiers(),
      ]);

      setSubscriptions(subscriptionsRes.data || []);
      setPagination(subscriptionsRes.pagination || pagination);
      setSubscribers(subscribersRes.data || []);
      setOffers(offersRes.data || []);
      setAcademies(academiesRes.data || []);
      setCashiers(cashiersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    // Handle subscriber identifier auto-search
    if (name === 'subscriber_identifier') {
      if (value.trim().length >= 1) {
        // Auto-search when typing 3+ characters
        handleSubscriberSearch(value);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }

    // Handle subscriber type change - clear ID fields
    if (name === 'subscriber_type') {
      setFormData((prev) => ({
        ...prev,
        subscriber_national_id: '',
        subscriber_military_id: '',
      }));
    }

    // Handle academy selection - load offers for selected academy
    if (name === 'academy_id') {
      const academyOffers = offers.filter((offer) => offer.academy_id == value);
      setAcademyOffers(academyOffers);
      setFormData((prev) => ({
        ...prev,
        offer_id: '', // Reset offer selection
        chosen_days: [], // Reset chosen days
      }));
      setSelectedOffer(null);
    }

    // Handle offer selection - set available days and calculate end date
    if (name === 'offer_id') {
      const offer = academyOffers.find((o) => o.id == value);
      if (offer) {
        setSelectedOffer(offer);
        setFormData((prev) => ({
          ...prev,
          academy_id: offer.academy_id, // Set academy_id from the selected offer
          chosen_days: [], // Reset chosen days
          end_date: prev.start_date
            ? calculateEndDate(prev.start_date, offer.duration_days)
            : '',
        }));
      }
    }

    // Handle start date change - recalculate end date if offer is selected
    if (name === 'start_date' && selectedOffer) {
      setFormData((prev) => ({
        ...prev,
        end_date: calculateEndDate(value, selectedOffer.duration_days),
      }));
    }
  };

  const calculateEndDate = (startDate, durationDays) => {
    if (!startDate || !durationDays) return '';
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(durationDays));
    return end.toISOString().split('T')[0];
  };

  const handleSubscriberSearch = async (identifier) => {
    if (!identifier || !identifier.trim()) return;

    try {
      const response = await searchSubscriberByIdentifier(identifier);
      if (response.success && response.data) {
        setSearchResults([response.data]);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching subscriber:', error);
      setSearchResults([]);
      setShowSearchResults(true);
    }
  };

  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value);
  };

  const handleDateToChange = (e) => {
    setDateTo(e.target.value);
  };

  const handleCreatedByFilterChange = (e) => {
    setCreatedByFilter(e.target.value);
  };

  const handleAcademyFilterChange = (e) => {
    setAcademyFilter(e.target.value);
  };

  const clearAllFilters = () => {
    setDateFrom('');
    setDateTo('');
    setCreatedByFilter('');
    setAcademyFilter('');
  };

  const handlePageChange = (page, perPage = pagination.per_page) => {
    loadData(page, perPage);
  };

  const handleSelectSubscriber = (subscriber) => {
    setFormData((prev) => ({
      ...prev,
      subscriber_id: subscriber.id,
      subscriber_full_name: subscriber.full_name,
      subscriber_phone: subscriber.phone || '',
      subscriber_identifier: subscriber.identifier || '',
      subscriber_type: subscriber.type || 'civilian',
      subscriber_national_id: subscriber.national_id || '',
      subscriber_military_id: subscriber.military_id || '',
    }));
    setShowSearchResults(false);
  };

  const handleCreateSubscriber = () => {
    // Clear subscriber_id to indicate this is a new subscriber
    setFormData((prev) => ({
      ...prev,
      subscriber_id: '',
      subscriber_full_name: '',
      subscriber_phone: '',
      subscriber_type: 'civilian',
      subscriber_national_id: '',
      subscriber_military_id: '',
    }));
    setShowSearchResults(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      // Prepare submission data
      const submissionData = {
        subscriber_id: formData.subscriber_id,
        offer_id: formData.offer_id,
        academy_id: formData.academy_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        chosen_days: formData.chosen_days,
      };

      // If no subscriber_id, include subscriber data for creation
      if (!formData.subscriber_id) {
        submissionData.subscriber_data = {
          full_name: formData.subscriber_full_name,
          type: formData.subscriber_type,
          phone: formData.subscriber_phone,
          national_id:
            formData.subscriber_type === 'civilian'
              ? formData.subscriber_national_id
              : null,
          military_id:
            formData.subscriber_type === 'infantry'
              ? formData.subscriber_military_id
              : null,
        };
      }

      setLoading(true);
      const response = await createSubscription(submissionData);
      if (response.success) {
        setShowCreateModal(false);
        resetForm();
        loadData();
        showNotification('تم إنشاء الاشتراك بنجاح! 🎉', 'success');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        const errorMessage =
          error.response?.data?.message || 'حدث خطأ أثناء إنشاء الاشتراك';
        setErrors({
          general: errorMessage,
        });
        showNotification(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subscriber_id: '',
      subscriber_identifier: '',
      subscriber_full_name: '',
      subscriber_phone: '',
      subscriber_type: 'civilian',
      subscriber_national_id: '',
      subscriber_military_id: '',
      offer_id: '',
      academy_id: '',
      start_date: '',
      end_date: '',
      chosen_days: [],
    });
    setAcademyOffers([]);
    setSelectedOffer(null);
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleGenerateQR = async (subscription) => {
    try {
      // First generate the QR code to ensure it exists
      const response = await generateQRCode(subscription.id);
      if (response.success) {
        setQrCode(response.data.qr_code);

        // Now fetch both QR code and barcode SVG directly from the backend
        try {
          const [qrSvgContent, barcodeSvgContent] = await Promise.all([
            getQRCodeSVG(subscription.id),
            getBarcodeSVG(subscription.id),
          ]);

          // Update subscription with both QR code and barcode SVG data
          const updatedSubscription = {
            ...subscription,
            qr_code_image: {
              svg_data: qrSvgContent,
              filename: `subscription_${subscription.id}_qr.svg`,
            },
            barcode_image: {
              svg_data: barcodeSvgContent,
              filename: `subscription_${subscription.id}_barcode.svg`,
            },
          };

          setSelectedSubscription(updatedSubscription);
          setShowQRModal(true);

          console.log('QR Code SVG fetched successfully');
          console.log('QR SVG Content Length:', qrSvgContent.length);
          console.log('Barcode SVG fetched successfully');
          console.log('Barcode SVG Content Length:', barcodeSvgContent.length);
          console.log(
            'QR SVG Content Preview:',
            qrSvgContent.substring(0, 100) + '...'
          );
        } catch (svgError) {
          console.error('Error fetching SVG:', svgError);
          // Fallback to the original approach
          const updatedSubscription = {
            ...subscription,
            qr_code_image: response.data.qr_code_image,
          };
          setSelectedSubscription(updatedSubscription);
          setShowQRModal(true);
        }
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleGenerateAllQRCodes = async () => {
    try {
      setLoading(true);
      const response = await generateAllQRCodes();
      if (response.success) {
        console.log('All QR codes generated:', response.data);
        showNotification(
          'تم إنشاء رموز QR لجميع الاشتراكات بنجاح! 🎉',
          'success'
        );

        // Refresh subscriptions to show updated QR codes
        fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error generating all QR codes:', error);
      showNotification(
        'حدث خطأ في إنشاء رموز QR. يرجى المحاولة مرة أخرى',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const getSubscriberName = (subscriberId) => {
    const subscriber = subscribers.find((s) => s.id === subscriberId);
    return subscriber ? subscriber.full_name : 'Unknown';
  };

  const getOfferName = (offerId) => {
    const offer = offers.find((o) => o.id === offerId);
    return offer ? offer.name : 'Unknown';
  };

  const getAcademyName = (academyId) => {
    const academy = academies.find((a) => a.id === academyId);
    return academy ? academy.name : 'غير محدد';
  };

  const getCreatedByUsers = () => {
    // Use cashiers data to show actual cashier names
    return cashiers.map((cashier) => ({
      value: cashier.id,
      label: cashier.name || `كاشير ${cashier.id}`,
    }));
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'status-badge--active',
      expired: 'status-badge--expired',
      cancelled: 'status-badge--cancelled',
    };

    const statusLabels = {
      active: 'نشط',
      expired: 'منتهي',
      cancelled: 'ملغي',
    };

    return (
      <span className={`status-badge ${statusColors[status] || ''}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const columns = [
    {
      key: 'id',
      header: 'رقم الاشتراك',
    },
    {
      key: 'subscriber_id',
      header: 'المشترك',
      render: (value) => getSubscriberName(value),
    },
    {
      key: 'offer_id',
      header: 'العرض',
      render: (value) => getOfferName(value),
    },
    {
      key: 'start_date',
      header: 'تاريخ البداية',
    },
    {
      key: 'end_date',
      header: 'تاريخ النهاية',
    },
    {
      key: 'remaining_classes',
      header: 'المتبقي',
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (value) => getStatusBadge(value),
    },
  ];

  const actions = (row) => (
    <div className="table-actions">
      <button
        className="action-btn action-btn--primary"
        onClick={() => handleGenerateQR(row)}
        title="إنشاء رمز QR"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 3H7V7H3V3Z" stroke="currentColor" strokeWidth="2" />
          <path d="M17 3H21V7H17V3Z" stroke="currentColor" strokeWidth="2" />
          <path d="M3 17H7V21H3V17Z" stroke="currentColor" strokeWidth="2" />
          <path d="M17 17H21V21H17V17Z" stroke="currentColor" strokeWidth="2" />
          <path d="M7 3H17V7" stroke="currentColor" strokeWidth="2" />
          <path d="M7 17H17V21" stroke="currentColor" strokeWidth="2" />
          <path d="M3 7V17" stroke="currentColor" strokeWidth="2" />
          <path d="M21 7V17" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="subscription-management">
      <div className="page-header">
        <h1 className="page-title"> الاشتراكات</h1>
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
              value={createdByFilter}
              onChange={handleCreatedByFilterChange}
              className="filter-select"
              title="أنشأ بواسطة"
            >
              <option value="">جميع الكاشيرات</option>
              {getCreatedByUsers().map((cashier) => (
                <option key={cashier.value} value={cashier.value}>
                  {cashier.label}
                </option>
              ))}
            </select>
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
            <button
              className="clear-filters-btn"
              onClick={clearAllFilters}
              disabled={
                !dateFrom && !dateTo && !createdByFilter && !academyFilter
              }
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="action-buttons">
            <button
              className="add-btn"
              onClick={() => setShowCreateModal(true)}
            >
              إنشاء اشتراك جديد
            </button>
            <button
              className="qr-refresh-btn"
              onClick={handleGenerateAllQRCodes}
              disabled={loading}
              title="إنشاء رموز QR لجميع الاشتراكات"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 3H7V7H3V3Z" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M17 3H21V7H17V3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M3 17H7V21H3V17Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M17 17H21V21H17V17Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M7 3H17V7" stroke="currentColor" strokeWidth="2" />
                <path d="M7 17H17V21" stroke="currentColor" strokeWidth="2" />
                <path d="M3 7V17" stroke="currentColor" strokeWidth="2" />
                <path d="M21 7V17" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Component */}
      {notification.show && (
        <div className={`notification notification--${notification.type}`}>
          <div className="notification__content">
            <div className="notification__icon">
              {notification.type === 'success' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="notification__message">
              {notification.message}
            </span>
            <button
              className="notification__close"
              onClick={() =>
                setNotification({ show: false, message: '', type: 'success' })
              }
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="content-section">
        <DataTable
          data={subscriptions}
          columns={columns}
          loading={loading}
          actions={actions}
          pagination={pagination}
          onPageChange={handlePageChange}
          emptyMessage={
            dateFrom || dateTo || createdByFilter || academyFilter
              ? 'لم يتم العثور على اشتراكات تطابق البحث'
              : 'لا توجد اشتراكات'
          }
        />
      </div>

      {/* Create Subscription Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="إنشاء اشتراك جديد"
        size="extra-large"
      >
        <form onSubmit={handleSubmit} className="subscription-form">
          {errors.general && <div className="form-error">{errors.general}</div>}

          {/* Subscriber Search Section */}
          <div className="form-section">
            <div className="form-row">
              <FormField
                label="رقم المشترك"
                type="text"
                name="subscriber_identifier"
                value={formData.subscriber_identifier}
                onChange={handleInputChange}
                placeholder="أدخل رقم المشترك للبحث (البحث تلقائي)"
                error={errors.subscriber_identifier}
              />
            </div>

            {/* Search Results */}
            {showSearchResults && (
              <div className="search-results">
                {searchResults.length > 0 ? (
                  <div className="search-result-item">
                    <div className="subscriber-info">
                      <strong>{searchResults[0].full_name}</strong>
                      <span>{searchResults[0].identifier}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => handleSelectSubscriber(searchResults[0])}
                    >
                      اختيار
                    </button>
                  </div>
                ) : (
                  <div className="no-results">
                    <p>لم يتم العثور على مشترك بهذا الرقم</p>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={handleCreateSubscriber}
                    >
                      إنشاء مشترك جديد
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subscriber Information Section */}
          <div className="form-section">
            <div className="form-row">
              <FormField
                label="الاسم الكامل"
                type="text"
                name="subscriber_full_name"
                value={formData.subscriber_full_name}
                onChange={handleInputChange}
                required
                error={errors.subscriber_full_name}
              />

              <FormField
                label="رقم الهاتف"
                type="tel"
                name="subscriber_phone"
                value={formData.subscriber_phone}
                onChange={handleInputChange}
                error={errors.subscriber_phone}
              />
            </div>
            <div className="form-row">
              <FormField
                label="نوع المشترك"
                type="select"
                name="subscriber_type"
                value={formData.subscriber_type}
                onChange={handleInputChange}
                options={subscriberTypes}
                required
                error={errors.subscriber_type}
              />

              {formData.subscriber_type === 'civilian' ? (
                <FormField
                  label="الرقم القومي"
                  type="text"
                  name="subscriber_national_id"
                  value={formData.subscriber_national_id}
                  onChange={handleInputChange}
                  placeholder="أدخل الرقم القومي"
                  required
                  error={errors.subscriber_national_id}
                />
              ) : (
                <FormField
                  label="الرقم العسكري"
                  type="text"
                  name="subscriber_military_id"
                  value={formData.subscriber_military_id}
                  onChange={handleInputChange}
                  placeholder="أدخل الرقم العسكري"
                  required
                  error={errors.subscriber_military_id}
                />
              )}
            </div>
          </div>

          {/* Academy and Offer Selection */}
          <div className="form-section">
            <h4 className="section-title">اختيار العرض</h4>
            <div className="form-row">
              <FormField
                label="الأكاديمية"
                type="select"
                name="academy_id"
                value={formData.academy_id}
                onChange={handleInputChange}
                options={academies.map((a) => ({
                  value: a.id,
                  label: a.name,
                }))}
                required
                error={errors.academy_id}
              />

              <FormField
                label="العرض"
                type="select"
                name="offer_id"
                value={formData.offer_id}
                onChange={handleInputChange}
                options={academyOffers.map((o) => ({
                  value: o.id,
                  label: `${o.name} (${
                    o.num_classes
                      ? o.num_classes + ' حصة'
                      : o.num_hours + ' ساعة'
                  })`,
                }))}
                required
                error={errors.offer_id}
                disabled={academyOffers.length === 0}
              />
            </div>

            {/* Offer Details */}
            {selectedOffer && (
              <div className="offer-details">
                <h5>تفاصيل العرض المختار:</h5>
                <p>
                  <strong>المدة:</strong> {selectedOffer.duration_days} يوم
                </p>
                <p>
                  <strong>الأيام المتاحة:</strong>{' '}
                  {selectedOffer.available_days
                    .map((day) => {
                      const dayLabel =
                        daysOfWeek.find((d) => d.value === day)?.label || day;
                      return dayLabel;
                    })
                    .join(', ')}
                </p>
                <p>
                  <strong>السعر:</strong> مشاة ${selectedOffer.price_infantry}|
                  أسلحة أخرى ${selectedOffer.price_other} | مدنيين $
                  {selectedOffer.price_civilian}
                </p>
              </div>
            )}

            <div className="form-row">
              <FormField
                label="تاريخ البداية"
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                error={errors.start_date}
              />

              <FormField
                label="تاريخ النهاية"
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                error={errors.end_date}
                disabled={selectedOffer} // Auto-calculated when offer is selected
              />
            </div>
            {selectedOffer && (
              <p className="date-note">
                تاريخ النهاية محسوب تلقائياً: تاريخ البداية +{' '}
                {selectedOffer.duration_days} يوم
              </p>
            )}
          </div>

          {/* Available Days Selection */}
          {selectedOffer && (
            <div className="form-section">
              <FormField
                label="الأيام المختارة"
                type="checkbox"
                name="chosen_days"
                value={formData.chosen_days}
                onChange={handleInputChange}
                options={selectedOffer.available_days.map((day) => {
                  const dayLabel =
                    daysOfWeek.find((d) => d.value === day)?.label || day;
                  return { value: day, label: dayLabel };
                })}
                required
                error={errors.chosen_days}
              />
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setShowCreateModal(false)}
            >
              إلغاء
            </button>
            <button type="submit" className="btn btn--primary">
              إنشاء الاشتراك
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="رمز QR"
        size="small"
      >
        <div className="qr-code-display">
          <div className="qr-code-info">
            <h4>تفاصيل الاشتراك</h4>
            <p>
              <strong>المشترك:</strong>{' '}
              {selectedSubscription &&
                getSubscriberName(selectedSubscription.subscriber_id)}
            </p>
            <p>
              <strong>العرض:</strong>{' '}
              {selectedSubscription &&
                getOfferName(selectedSubscription.offer_id)}
            </p>
            <p>
              <strong>الحالة:</strong>{' '}
              {selectedSubscription &&
                getStatusBadge(selectedSubscription.status)}
            </p>
          </div>

          <div className="qr-code-container">
            {selectedSubscription &&
            selectedSubscription.qr_code_image &&
            (selectedSubscription.qr_code_image.svg_data ||
              selectedSubscription.qr_code_image.image_data) ? (
              <div className="qr-code-image-wrapper">
                {/* QR Code */}
                <div className="qr-code-section">
                  {selectedSubscription.qr_code_image.svg_data ? (
                    <div
                      className="qr-code-svg-modal"
                      dangerouslySetInnerHTML={{
                        __html:
                          typeof selectedSubscription.qr_code_image.svg_data ===
                          'string'
                            ? selectedSubscription.qr_code_image.svg_data
                            : JSON.stringify(
                                selectedSubscription.qr_code_image.svg_data
                              ),
                      }}
                    />
                  ) : selectedSubscription.qr_code_image.image_data ? (
                    <img
                      src={`data:image/svg+xml;base64,${selectedSubscription.qr_code_image.image_data}`}
                      alt="QR Code"
                      className="qr-code-image-modal"
                    />
                  ) : (
                    <div className="qr-code-debug">
                      <p>Debug Info:</p>
                      <pre>
                        {JSON.stringify(
                          selectedSubscription.qr_code_image,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                  <p className="qr-code-text">
                    رمز QR للاشتراك #{selectedSubscription.id}
                  </p>
                </div>

                {/* Barcode */}
                {selectedSubscription.barcode_image &&
                  selectedSubscription.barcode_image.svg_data && (
                    <div className="barcode-section">
                      <div
                        className="barcode-svg-modal"
                        dangerouslySetInnerHTML={{
                          __html: selectedSubscription.barcode_image.svg_data,
                        }}
                      />
                      <p className="barcode-text">
                        باركود للاشتراك #{selectedSubscription.id}
                      </p>
                    </div>
                  )}
              </div>
            ) : (
              <div className="qr-code-placeholder">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 3H7V7H3V3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M17 3H21V7H17V3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M3 17H7V21H3V17Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M17 17H21V21H17V17Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M7 3H17V7" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 17H17V21" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 7V17" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 7V17" stroke="currentColor" strokeWidth="2" />
                </svg>
                <p className="qr-code-text">جاري تحميل رمز QR...</p>
              </div>
            )}
          </div>

          <div className="qr-code-actions">
            <button
              className="btn btn--secondary"
              onClick={() => {
                if (
                  selectedSubscription &&
                  selectedSubscription.qr_code_image &&
                  selectedSubscription.qr_code_image.image_data
                ) {
                  navigator.clipboard.writeText(
                    selectedSubscription.qr_code_image.data
                  );
                } else {
                  navigator.clipboard.writeText(qrCode);
                }
              }}
            >
              نسخ بيانات QR
            </button>
            <button
              className="btn btn--primary"
              onClick={() => setShowQRModal(false)}
            >
              إغلاق
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionManagement;
