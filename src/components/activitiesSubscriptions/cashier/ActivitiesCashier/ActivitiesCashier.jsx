import React, { useState, useEffect } from 'react';
import {
  getAcademies,
  getOffers,
  getSubscribers,
  createSubscriber,
  createSubscription,
  searchSubscriberByIdentifier,
} from '../../../../apis/activitiesSubscriptions';
import FormField from '../../shared/FormField/FormField';
import Modal from '../../shared/Modal/Modal';
import SubscriptionReceipt from '../../shared/SubscriptionReceipt/SubscriptionReceipt';
import './ActivitiesCashier.scss';

const ActivitiesCashier = () => {
  const [academies, setAcademies] = useState([]);
  const [offers, setOffers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showSubscriberModal, setShowSubscriberModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [isNewSubscriber, setIsNewSubscriber] = useState(false);
  const [formData, setFormData] = useState({
    subscriber_id: '',
    full_name: '',
    phone: '',
    type: 'infantry',
    national_id: '',
    military_id: '',
  });
  const [subscriptionData, setSubscriptionData] = useState({
    start_date: '',
    end_date: '',
    chosen_days: [],
  });
  const [errors, setErrors] = useState({});
  const [showReceipt, setShowReceipt] = useState(false);
  const [createdSubscription, setCreatedSubscription] = useState(null);
  const [selectedAcademyFilter, setSelectedAcademyFilter] = useState('');
  const [filteredAcademies, setFilteredAcademies] = useState([]);
  const [offerSearchQuery, setOfferSearchQuery] = useState('');
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

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
    { value: 'infantry', label: 'مشاة' },
    { value: 'other', label: 'أسلحة أخرى' },
    { value: 'civilian', label: 'مدني' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAcademies();
  }, [academies, searchQuery, selectedAcademyFilter]);

  useEffect(() => {
    filterOffers();
  }, [offers, offerSearchQuery, selectedAcademy]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [academiesRes, offersRes, subscribersRes] = await Promise.all([
        getAcademies(),
        getOffers(),
        getSubscribers(),
      ]);

      setAcademies(academiesRes.data || []);
      setOffers(offersRes.data || []);
      setSubscribers(subscribersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAcademies = () => {
    let filtered = academies;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (academy) =>
          academy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (academy.description &&
            academy.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by academy status
    if (selectedAcademyFilter) {
      filtered = filtered.filter(
        (academy) => academy.status === selectedAcademyFilter
      );
    }

    setFilteredAcademies(filtered);
  };

  const filterOffers = () => {
    if (!selectedAcademy) {
      setFilteredOffers([]);
      return;
    }

    let filtered = getAcademyOffers(selectedAcademy.id);

    // Filter by search query
    if (offerSearchQuery.trim()) {
      filtered = filtered.filter(
        (offer) =>
          offer.name.toLowerCase().includes(offerSearchQuery.toLowerCase()) ||
          (offer.description &&
            offer.description
              .toLowerCase()
              .includes(offerSearchQuery.toLowerCase()))
      );
    }

    setFilteredOffers(filtered);
  };

  const handleAcademySelect = (academy) => {
    setSelectedAcademy(academy);
    setOfferSearchQuery(''); // Reset offer search when opening modal
    setShowPlanModal(true);
  };

  const handleOfferSelect = (offer) => {
    setSelectedOffer(offer);
    setShowPlanModal(false);
    setShowSubscriberModal(true);
  };

  const calculateEndDate = (startDate, durationDays) => {
    if (!startDate || !durationDays) return '';
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(durationDays));
    return end.toISOString().split('T')[0];
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length >= 1) {
      try {
        const response = await searchSubscriberByIdentifier(query);
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
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSubscriberSelect = (subscriber) => {
    setSelectedSubscriber(subscriber);
    setIsNewSubscriber(false);
    setShowSearchResults(false);
    setFormData({
      subscriber_id: subscriber.id,
      full_name: subscriber.full_name,
      phone: subscriber.phone,
      type: subscriber.type || 'civilian',
      national_id: subscriber.national_id || '',
      military_id: subscriber.military_id || '',
    });
  };

  const handleNewSubscriber = () => {
    setSelectedSubscriber(null);
    setIsNewSubscriber(true);
    setShowSearchResults(false);
    setFormData({
      subscriber_id: '',
      full_name: '',
      phone: '',
      type: 'infantry',
      national_id: '',
      military_id: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubscriptionInputChange = (e) => {
    const { name, value } = e.target;
    setSubscriptionData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-calculate end date when start date changes
    if (name === 'start_date' && selectedOffer) {
      setSubscriptionData((prev) => ({
        ...prev,
        end_date: calculateEndDate(value, selectedOffer.duration_days),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      // Prepare submission data following SubscriptionManagement format
      const submissionData = {
        subscriber_id: formData.subscriber_id,
        offer_id: selectedOffer.id,
        academy_id: selectedOffer.academy_id,
        start_date: subscriptionData.start_date,
        end_date: subscriptionData.end_date,
        chosen_days: subscriptionData.chosen_days,
      };

      // If no subscriber_id, include subscriber data for creation
      if (!formData.subscriber_id) {
        submissionData.subscriber_data = {
          full_name: formData.full_name,
          type: formData.type,
          phone: formData.phone,
          national_id:
            formData.type === 'civilian' ? formData.national_id : null,
          military_id:
            formData.type === 'infantry' ? formData.military_id : null,
        };
      }

      const response = await createSubscription(submissionData);

      if (response.success) {
        // Store the created subscription data for receipt
        console.log('ActivitiesCashier - API response data:', response.data);
        setCreatedSubscription(response.data);
        setShowReceipt(true);
        setShowSubscriberModal(false);

        // Reset form data
        setSelectedAcademy(null);
        setSelectedOffer(null);
        setSelectedSubscriber(null);
        setSearchQuery('');
        setSearchResults([]);
        setFormData({
          subscriber_id: '',
          full_name: '',
          phone: '',
          type: 'infantry',
          national_id: '',
          military_id: '',
        });
        setSubscriptionData({
          start_date: '',
          end_date: '',
          chosen_days: [],
        });

        // Reload data
        loadData();

        // Show success notification
        setErrors({ success: 'تم إنشاء الاشتراك بنجاح! سيتم طباعة الإيصال.' });

        // Clear success message after 5 seconds
        setTimeout(() => {
          setErrors((prev) => {
            const { success, ...rest } = prev;
            return rest;
          });
        }, 5000);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'حدث خطأ' });
      }
    }
  };

  const getAcademyOffers = (academyId) => {
    return offers.filter((offer) => offer.academy_id === academyId);
  };

  const getSelectedPrice = () => {
    if (!selectedOffer) return 0;

    switch (formData.type) {
      case 'civilian':
        return selectedOffer.price_civilian || 0;
      case 'infantry':
        return selectedOffer.price_infantry || 0;
      case 'other':
        return selectedOffer.price_other || 0;
      default:
        return selectedOffer.price_infantry || 0;
    }
  };

  return (
    <div className="activities-cashier">
      <div className="page-header">
        <h1 className="page-title">كاشير الأنشطة</h1>
      </div>

      {/* Success Notification */}
      {errors.success && (
        <div className="success-notification">{errors.success}</div>
      )}

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              placeholder="البحث عن أكاديمية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
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
            )}
          </div>
        </div>

        <div className="filter-container">
          <select
            value={selectedAcademyFilter}
            onChange={(e) => setSelectedAcademyFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">جميع الأكاديميات</option>
            <option value="active">الأكاديميات النشطة</option>
            <option value="inactive">الأكاديميات غير النشطة</option>
          </select>
        </div>

        <div className="results-info">
          <span className="results-count">
            عرض {filteredAcademies.length} من {academies.length} أكاديمية
          </span>
        </div>
      </div>

      <div className="academies-grid">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>جاري التحميل...</p>
          </div>
        ) : filteredAcademies.length > 0 ? (
          filteredAcademies.map((academy) => (
            <div
              key={academy.id}
              className="academy-card"
              onClick={() => handleAcademySelect(academy)}
            >
              <div className="academy-header">
                <div className="academy-image">
                  <svg width="35" height="35" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L2 7L12 12L22 7L12 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M2 17L12 22L22 17"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M2 12L12 17L22 12"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="academy-info">
                  <h3 className="academy-name">{academy.name}</h3>
                  <p className="academy-description">{academy.description}</p>
                </div>
              </div>
              <div className="academy-stats">
                <span className="stat">
                  <strong>{getAcademyOffers(academy.id).length}</strong> عرض
                  متاح
                </span>
                <span className="stat">
                  <strong>{academy.coaches_count || 0}</strong> مدرب
                </span>
                <span className="stat">
                  <strong>
                    {academy.working_days ? academy.working_days.length : 0}
                  </strong>{' '}
                  يوم عمل
                </span>
              </div>
              <div className="academy-footer">
                <span className="academy-location">{academy.location}</span>
                <div className="academy-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <div className="no-results-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>لم يتم العثور على أكاديميات</h3>
            <p>جرب البحث بكلمات مختلفة أو قم بتغيير الفلتر</p>
            <button
              className="clear-filters-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedAcademyFilter('');
              }}
            >
              مسح جميع الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Plan Selection Modal */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title={`عروض ${selectedAcademy?.name}`}
        size="extra-large"
      >
        {/* Offer Search Section */}
        <div className="offer-search-section">
          <div className="offer-search-container">
            <div className="offer-search-input-wrapper">
              <svg
                className="offer-search-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder="البحث عن عرض..."
                value={offerSearchQuery}
                onChange={(e) => setOfferSearchQuery(e.target.value)}
                className="offer-search-input"
              />
              {offerSearchQuery && (
                <button
                  className="clear-offer-search-btn"
                  onClick={() => setOfferSearchQuery('')}
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
              )}
            </div>
          </div>
          <div className="offer-results-info">
            <span className="offer-results-count">
              عرض {filteredOffers.length} من{' '}
              {getAcademyOffers(selectedAcademy?.id || 0).length} عرض
            </span>
          </div>
        </div>

        <div className="plans-container">
          {selectedAcademy && filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="plan-card"
                onClick={() => handleOfferSelect(offer)}
              >
                <div className="plan-header">
                  <h4 className="plan-name">{offer.name}</h4>
                  <div className="plan-price">
                    {offer.price} {offer.currency}
                  </div>
                </div>
                <div className="plan-details">
                  <p className="plan-description">{offer.description}</p>
                  <div className="plan-features">
                    <span className="feature">
                      <strong>{offer.duration_days}</strong>
                      يوم
                    </span>
                    <span className="feature">
                      <strong>{offer.num_classes || offer.num_hours}</strong>
                      {offer.num_classes ? ' حصة' : ' ساعة'}
                    </span>
                    <span className="feature">
                      <strong>{offer.available_days?.length || 0}</strong>
                      أيام متاحة
                    </span>
                    <span className="feature">
                      <strong>
                        {offer.price_infantry || offer.price_civilian}
                      </strong>
                      سعر
                    </span>
                  </div>
                </div>
                <div className="plan-footer">
                  <span className="plan-duration">
                    {offer.duration_days} يوم تدريب
                  </span>
                  <div className="plan-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 18L15 12L9 6"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-offers-message">
              <div className="no-offers-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>
                {offerSearchQuery
                  ? 'لم يتم العثور على عروض'
                  : 'لا توجد عروض متاحة'}
              </h3>
              <p>
                {offerSearchQuery
                  ? 'جرب البحث بكلمات مختلفة'
                  : 'هذه الأكاديمية لا تحتوي على أي عروض حالياً'}
              </p>
              {offerSearchQuery && (
                <button
                  className="clear-offer-search-btn-large"
                  onClick={() => setOfferSearchQuery('')}
                >
                  مسح البحث
                </button>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Subscriber Registration Modal */}
      <Modal
        isOpen={showSubscriberModal}
        onClose={() => setShowSubscriberModal(false)}
        title="تسجيل المشترك"
        size="extra-large"
      >
        <form onSubmit={handleSubmit} className="subscriber-form">
          {errors.general && <div className="form-error">{errors.general}</div>}

          {/* Search Section */}
          <div className="form-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="ابحث برقم الهاتف أو الاسم أو الرقم القومي..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
              {showSearchResults && (
                <div className="search-results">
                  {searchResults.length > 0 ? (
                    searchResults.map((subscriber) => (
                      <div
                        key={subscriber.id}
                        className="search-result-item"
                        onClick={() => handleSubscriberSelect(subscriber)}
                      >
                        <div className="subscriber-info">
                          <strong>{subscriber.full_name}</strong>
                          <span>{subscriber.phone}</span>
                        </div>
                        <button type="button" className="add-btn">
                          اختيار
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      <p>لم يتم العثور على مشترك</p>
                      <button
                        type="button"
                        className="new-subscriber-btn"
                        onClick={handleNewSubscriber}
                      >
                        إنشاء مشترك جديد
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subscriber Information */}
          <div className="form-section">
            <h4 className="section-title">معلومات المشترك</h4>
            <div className="form-row">
              <FormField
                label="الاسم الكامل"
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                error={errors.full_name}
              />
              <FormField
                label="رقم الهاتف"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                error={errors.phone}
              />
            </div>
            <div className="form-row">
              <FormField
                label="نوع المشترك"
                type="select"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                options={subscriberTypes}
                required
                error={errors.type}
              />
              {formData.type === 'civilian' ? (
                <FormField
                  label="الرقم القومي"
                  type="text"
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleInputChange}
                  placeholder="أدخل الرقم القومي"
                  required
                  error={errors.national_id}
                />
              ) : (
                <FormField
                  label="الرقم العسكري"
                  type="text"
                  name="military_id"
                  value={formData.military_id}
                  onChange={handleInputChange}
                  placeholder="أدخل الرقم العسكري"
                  required
                  error={errors.military_id}
                />
              )}
            </div>
          </div>

          {/* Subscription Details */}
          <div className="form-section">
            <h4 className="section-title">تفاصيل الاشتراك</h4>
            <div
              className="subscription-summary-collapsible"
              onMouseEnter={() => setIsSummaryExpanded(true)}
              onMouseLeave={() => setIsSummaryExpanded(false)}
            >
              <div className="summary-header">
                <div className="summary-title">
                  <svg
                    className="summary-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>ملخص الاشتراك</span>
                  {!isSummaryExpanded && (
                    <div className="summary-preview">
                      <span className="preview-academy">
                        {selectedAcademy?.name}
                      </span>
                      <span className="preview-separator">•</span>
                      <span className="preview-offer">
                        {selectedOffer?.name}
                      </span>
                      <span className="preview-separator">•</span>
                      <span className="preview-price">
                        {getSelectedPrice()} ج.م
                      </span>
                    </div>
                  )}
                </div>
                <div className="summary-toggle">
                  <svg
                    className={`toggle-icon ${
                      isSummaryExpanded ? 'expanded' : ''
                    }`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div
                className={`summary-content ${
                  isSummaryExpanded ? 'expanded' : 'collapsed'
                }`}
              >
                <div className="summary-items">
                  <div className="summary-item">
                    <div className="summary-label">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2L2 7L12 12L22 7L12 2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M2 17L12 22L22 17"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M2 12L12 17L22 12"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      <span>الأكاديمية</span>
                    </div>
                    <div className="summary-value">{selectedAcademy?.name}</div>
                  </div>

                  <div className="summary-item">
                    <div className="summary-label">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8M16 4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4M16 4C16 5.10457 15.1046 6 14 6H10C8.89543 6 8 5.10457 8 4"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      <span>العرض</span>
                    </div>
                    <div className="summary-value">{selectedOffer?.name}</div>
                  </div>

                  <div className="summary-item">
                    <div className="summary-label">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>نوع المشترك</span>
                    </div>
                    <div className="summary-value">
                      {
                        subscriberTypes.find((s) => s.value === formData.type)
                          ?.label
                      }
                    </div>
                  </div>

                  <div className="summary-item summary-item--price">
                    <div className="summary-label">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 1V23M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>السعر</span>
                    </div>
                    <div className="summary-value summary-value--price">
                      {getSelectedPrice()} ج.م
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <FormField
                label="تاريخ البداية"
                type="date"
                name="start_date"
                value={subscriptionData.start_date}
                onChange={handleSubscriptionInputChange}
                required
                error={errors.start_date}
              />
              <FormField
                label="تاريخ النهاية"
                type="date"
                name="end_date"
                value={subscriptionData.end_date}
                onChange={handleSubscriptionInputChange}
                required
                error={errors.end_date}
                disabled={selectedOffer}
                className="end-date-input"
              />
            </div>
            {selectedOffer && (
              <div className="end-date-note">
                <div className="note-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="note-content">
                  <span className="note-title">ملاحظة:</span>
                  <span className="note-text">
                    تاريخ النهاية محسوب تلقائياً: تاريخ البداية + 23 يوم
                  </span>
                </div>
              </div>
            )}
            <FormField
              label="الأيام المختارة"
              type="checkbox"
              name="chosen_days"
              value={subscriptionData.chosen_days}
              onChange={handleSubscriptionInputChange}
              options={
                selectedOffer
                  ? selectedOffer.available_days.map((day) => {
                      const dayLabel =
                        daysOfWeek.find((d) => d.value === day)?.label || day;
                      return { value: day, label: dayLabel };
                    })
                  : []
              }
              required
              error={errors.chosen_days}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setShowSubscriberModal(false)}
            >
              إلغاء
            </button>
            <button type="submit" className="btn btn--primary">
              إنشاء الاشتراك
            </button>
          </div>
        </form>
      </Modal>

      {/* Subscription Receipt */}
      {showReceipt && createdSubscription && (
        <Modal
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          title="إيصال الاشتراك"
          size="extra-large"
        >
          <SubscriptionReceipt
            subscription={createdSubscription}
            academy={selectedAcademy}
            offer={selectedOffer}
            subscriber={selectedSubscriber || formData}
            onAfterPrint={() => setShowReceipt(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default ActivitiesCashier;
