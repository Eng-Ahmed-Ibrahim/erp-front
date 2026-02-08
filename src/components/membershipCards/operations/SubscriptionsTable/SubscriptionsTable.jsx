import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { 
  getSubscriptions, 
  getOfficerSubscriptions,
  suspendSubscription, 
  activateSubscription,
  deleteSubscription,
  renewSubscription,
  calculateFees,
  issueCard,
  issueReplacementCard,
  getReplacementCardFee,
  getCardBySubscription,
  getCardSerialId,
  SUBSCRIPTION_STATUSES 
} from '../../../../apis/membershipCards';
import SubscriptionForm from '../../shared/SubscriptionForm/SubscriptionForm';
import { hasPermission } from '../../../../utils/permissions';
import './SubscriptionsTable.scss';

const SubscriptionsTable = ({ selectedOfficer }) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [error, setError] = useState(null);
  
  // Permission checks
  const canCreateSubscription = hasPermission(user, 'create membership card subscription');
  const canDeleteSubscription = hasPermission(user, 'delete membership card subscription');
  const canIssueCard = hasPermission(user, 'issue membership card');
  const canIssueReplacementCard = hasPermission(user, 'issue replacement membership card');
  const canRenewSubscription = hasPermission(user, 'renew membership card subscription');
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    perPage: 15,
  });
  const [pagination, setPagination] = useState(null);

  // Card issue modal state
  const [showCardIssueModal, setShowCardIssueModal] = useState(false);
  const [issuingForSubscription, setIssuingForSubscription] = useState(null);
  const [isReplacement, setIsReplacement] = useState(false);
  const [replacementFee, setReplacementFee] = useState(null);
  const [cardFormData, setCardFormData] = useState({
    card_uid: '',
    expiry_date: '',
    serial_id: '',
    show_expiry_date: true,
  });
  const [cardFormLoading, setCardFormLoading] = useState(false);
  const [cardFormError, setCardFormError] = useState(null);
  const [scanningCard, setScanningCard] = useState(false);

  // Renewal modal state
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewingSubscription, setRenewingSubscription] = useState(null);
  const [renewalFormData, setRenewalFormData] = useState({
    new_end_date: '',
    paid_annual_fee: 0,
    paid_issuance_fee: 0,
    notes: '',
  });
  const [renewalFees, setRenewalFees] = useState(null);
  const [renewalFormLoading, setRenewalFormLoading] = useState(false);
  const [renewalFormError, setRenewalFormError] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, [selectedOfficer?.id, filters]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (selectedOfficer?.id) {
        response = await getOfficerSubscriptions(selectedOfficer.id);
      } else {
        response = await getSubscriptions(filters);
      }
      
      setSubscriptions(response.data || []);
      setPagination(response.meta || null);
    } catch (err) {
      setError('حدث خطأ في تحميل البيانات');
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, action) => {
    try {
      if (action === 'suspend') {
        await suspendSubscription(id);
      } else if (action === 'activate') {
        await activateSubscription(id);
      }
      fetchSubscriptions();
    } catch (err) {
      setError('حدث خطأ في تغيير الحالة');
    }
  };

  const handleDelete = async (id) => {
    if (!canDeleteSubscription) {
      setError('ليس لديك صلاحية لحذف الاشتراكات');
      return;
    }
    
    if (!window.confirm('هل أنت متأكد من حذف هذا الاشتراك؟')) return;
    
    try {
      await deleteSubscription(id);
      fetchSubscriptions();
    } catch (err) {
      setError('حدث خطأ في الحذف');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSubscription(null);
  };

  const handleFormSuccess = () => {
    fetchSubscriptions();
    handleFormClose();
  };

  // Card Issue Modal handlers
  const handleOpenCardIssueModal = async (subscription, isReplacementCard = false) => {
    setIssuingForSubscription(subscription);
    setIsReplacement(isReplacementCard);

    // Fetch replacement fee if it's a replacement
    if (isReplacementCard) {
      try {
        const feeResponse = await getReplacementCardFee();
        setReplacementFee(feeResponse.data?.fee || 0);
        
        // Fetch existing card to get its expiry date
        try {
          const cardResponse = await getCardBySubscription(subscription.id);
          if (cardResponse.success && cardResponse.data) {
            const existingCard = cardResponse.data;
            // Use the existing card's expiry date and show_expiry_date setting
            setCardFormData({
              card_uid: '',
              expiry_date: existingCard.expiry_date || subscription.end_date || '',
              serial_id: '',
              show_expiry_date: existingCard.show_expiry_date !== false,
            });
          } else {
            setCardFormData({
              card_uid: '',
              expiry_date: subscription.end_date || '',
              serial_id: '',
              show_expiry_date: true,
            });
          }
        } catch (cardErr) {
          console.error('Error fetching existing card:', cardErr);
          // Fallback to subscription end date
          setCardFormData({
            card_uid: '',
            expiry_date: subscription.end_date || '',
            serial_id: '',
            show_expiry_date: true,
          });
        }
      } catch (err) {
        console.error('Error fetching replacement fee:', err);
        setReplacementFee(50); // Default fee
        setCardFormData({
          card_uid: '',
          expiry_date: subscription.end_date || '',
          serial_id: '',
          show_expiry_date: true,
        });
      }
    } else {
      setReplacementFee(null);
      // Set default expiry date to the subscription end date
      setCardFormData({
        card_uid: '',
        expiry_date: subscription.end_date || '',
        serial_id: '',
        show_expiry_date: true,
      });
    }
    setCardFormError(null);
    setShowCardIssueModal(true);
  };

  const handleCloseCardIssueModal = () => {
    setShowCardIssueModal(false);
    setIssuingForSubscription(null);
    setIsReplacement(false);
    setReplacementFee(null);
    setCardFormData({ card_uid: '', expiry_date: '', serial_id: '', show_expiry_date: true });
    setCardFormError(null);
  };

  const handleCardFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Prevent editing expiry_date if it's a replacement card
    if (isReplacement && name === 'expiry_date') {
      return;
    }
    setCardFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleScanCard = async () => {
    try {
      setScanningCard(true);
      setCardFormError(null);
      
      // Call Laravel API which will call the device
      const response = await getCardSerialId();
      
      if (response.success && response.data) {
        const cardData = response.data;
        if (cardData.status === 'success' && cardData.serial_id) {
          // Update the card_uid and serial_id fields with the scanned serial ID
          setCardFormData(prev => ({
            ...prev,
            card_uid: cardData.serial_id,
            serial_id: cardData.serial_id,
          }));
        } else if (cardData.status === 'not_found') {
          setCardFormError('لم يتم العثور على بطاقة. يرجى التأكد من وضع البطاقة على القارئ.');
        } else {
          setCardFormError(cardData.message || 'حدث خطأ في قراءة البطاقة');
        }
      } else {
        setCardFormError(response.message || 'حدث خطأ في قراءة البطاقة');
      }
    } catch (err) {
      console.error('Error scanning card:', err);
      setCardFormError(
        err.response?.data?.message || 
        err.message || 
        'حدث خطأ في الاتصال بقارئ البطاقات. يرجى التأكد من أن الجهاز متصل.'
      );
    } finally {
      setScanningCard(false);
    }
  };

  const handleIssueCard = async (e) => {
    e.preventDefault();

    // Check permissions
    if (isReplacement && !canIssueReplacementCard) {
      setCardFormError('ليس لديك صلاحية لإصدار بطاقات بديلة');
      return;
    }
    if (!isReplacement && !canIssueCard) {
      setCardFormError('ليس لديك صلاحية لإصدار بطاقات');
      return;
    }

    if (!cardFormData.card_uid.trim()) {
      setCardFormError('يرجى إدخال رقم البطاقة (Card UID)');
      return;
    }

    if (!cardFormData.expiry_date && !isReplacement) {
      setCardFormError('يرجى إدخال تاريخ انتهاء البطاقة');
      return;
    }

    try {
      setCardFormLoading(true);
      setCardFormError(null);

      const cardData = {
        subscription_id: issuingForSubscription.id,
        card_uid: cardFormData.card_uid.trim(),
        expiry_date: cardFormData.expiry_date, // Backend will use existing card's expiry date for replacement
        serial_id: cardFormData.serial_id || cardFormData.card_uid.trim(),
        show_expiry_date: !!cardFormData.show_expiry_date,
      };

      if (isReplacement) {
        await issueReplacementCard(cardData);
      } else {
        await issueCard(cardData);
      }

      handleCloseCardIssueModal();
      fetchSubscriptions(); // Refresh subscriptions to update has_card status
      // Refresh the page to see the card in the queue
      window.location.reload();
    } catch (err) {
      setCardFormError(err.response?.data?.message || 'حدث خطأ في إصدار البطاقة');
    } finally {
      setCardFormLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusInfo = SUBSCRIPTION_STATUSES.find(s => s.value === status);
    return (
      <span 
        className={`status-badge status-badge--${status}`}
        style={{ backgroundColor: statusInfo?.color }}
      >
        {statusInfo?.label || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const isExpiringSoon = (endDate) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  // Renewal Modal handlers
  const handleOpenRenewalModal = async (subscription) => {
    if (!canRenewSubscription) {
      setError('ليس لديك صلاحية لتجديد الاشتراكات');
      return;
    }
    
    setRenewingSubscription(subscription);
    setRenewalFormError(null);

    // Calculate default new end date (1 year from current end date)
    const currentEndDate = new Date(subscription.end_date);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    // Fetch renewal fees
    try {
      const beneficiaryType = subscription.beneficiary ? 
        (subscription.beneficiary.relationship_type || 'officer') : 'officer';
      const feesResponse = await calculateFees(beneficiaryType, true);
      setRenewalFees(feesResponse.data);
      
      setRenewalFormData({
        new_end_date: newEndDate.toISOString().split('T')[0],
        paid_annual_fee: feesResponse.data?.annual_subscription_fee || 0,
        paid_issuance_fee: feesResponse.data?.issuance_fee || 0,
        notes: '',
      });
    } catch (err) {
      console.error('Error fetching renewal fees:', err);
      setRenewalFees(null);
      setRenewalFormData({
        new_end_date: newEndDate.toISOString().split('T')[0],
        paid_annual_fee: 0,
        paid_issuance_fee: 0,
        notes: '',
      });
    }

    setShowRenewalModal(true);
  };

  const handleCloseRenewalModal = () => {
    setShowRenewalModal(false);
    setRenewingSubscription(null);
    setRenewalFormData({
      new_end_date: '',
      paid_annual_fee: 0,
      paid_issuance_fee: 0,
      notes: '',
    });
    setRenewalFees(null);
    setRenewalFormError(null);
  };

  const handleRenewalFormChange = (e) => {
    const { name, value } = e.target;
    setRenewalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRenewSubscription = async (e) => {
    e.preventDefault();

    if (!canRenewSubscription) {
      setRenewalFormError('ليس لديك صلاحية لتجديد الاشتراكات');
      return;
    }

    if (!renewalFormData.new_end_date) {
      setRenewalFormError('يرجى إدخال تاريخ الانتهاء الجديد');
      return;
    }

    try {
      setRenewalFormLoading(true);
      setRenewalFormError(null);

      await renewSubscription(renewingSubscription.id, {
        new_end_date: renewalFormData.new_end_date,
        paid_annual_fee: parseFloat(renewalFormData.paid_annual_fee) || 0,
        paid_issuance_fee: parseFloat(renewalFormData.paid_issuance_fee) || 0,
        notes: renewalFormData.notes || null,
      });

      handleCloseRenewalModal();
      fetchSubscriptions();
    } catch (err) {
      setRenewalFormError(err.response?.data?.message || 'حدث خطأ في تجديد الاشتراك');
    } finally {
      setRenewalFormLoading(false);
    }
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="subscriptions-table subscriptions-table--loading">
        <div className="loading-spinner"></div>
        <span>جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="subscriptions-table">
      {/* Toolbar */}
      <div className="subscriptions-table__toolbar">
        <div className="subscriptions-table__filters">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="filter-select"
          >
            <option value="">جميع الحالات</option>
            {SUBSCRIPTION_STATUSES.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
        
        {selectedOfficer && (
          <div className="officer-context">
            <span>اشتراكات: {selectedOfficer.full_name}</span>
          </div>
        )}
        
        {canCreateSubscription && (
          <button className="add-btn" onClick={() => setShowForm(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            إضافة اشتراك
          </button>
        )}
      </div>

      {error && <div className="subscriptions-table__error">{error}</div>}

      {/* Table */}
      <div className="subscriptions-table__container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>الضابط / المستفيد</th>
              <th>خطة الرسوم</th>
              <th>تاريخ البدء</th>
              <th>تاريخ الانتهاء</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-message">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <p>لا يوجد اشتراكات</p>
                </td>
              </tr>
            ) : (
              subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td>{subscription.id}</td>
                  <td>
                    <div className="subscriber-info">
                      <span className="subscriber-name">
                        {subscription.officer?.full_name || '-'}
                      </span>
                      {subscription.beneficiary && (
                        <span className="beneficiary-name">
                          ({subscription.beneficiary.full_name})
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{subscription.fee_plan?.name || '-'}</td>
                  <td>{formatDate(subscription.start_date)}</td>
                  <td className={isExpiringSoon(subscription.end_date) ? 'expiring-soon' : ''}>
                    {formatDate(subscription.end_date)}
                    {isExpiringSoon(subscription.end_date) && (
                      <span className="expiring-badge">قريب الانتهاء</span>
                    )}
                  </td>
                  <td className="status-cell" style={{ textAlign: 'left' }}>{getStatusBadge(subscription.status)}</td>
                  <td className="actions">
                    {/* Issue Card Button - only for active subscriptions */}
                    {subscription.status === 'active' && !subscription.has_card && canIssueCard && (
                      <button
                        className="action-btn action-btn--issue-card"
                        onClick={() => handleOpenCardIssueModal(subscription, false)}
                        title="إصدار بطاقة"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                          <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
                          <path d="M12 15L12 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M12 12L12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                    {/* Issue Replacement Card Button - only for active subscriptions with existing card */}
                    {subscription.status === 'active' && subscription.has_card && canIssueReplacementCard && (
                      <button
                        className="action-btn action-btn--suspend replacement-card-btn"
                        onClick={() => handleOpenCardIssueModal(subscription, true)}
                        title="إصدار بطاقة بديلة (بطاقة مفقودة)"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                    {/* Renewal Button - show when can_renew is true */}
                    {subscription.can_renew && canRenewSubscription && (
                      <button
                        className="action-btn action-btn--renew"
                        onClick={() => handleOpenRenewalModal(subscription)}
                        title="تجديد الاشتراك"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                    {subscription.status === 'active' && (
                      <button
                        className="action-btn action-btn--suspend"
                        onClick={() => handleStatusChange(subscription.id, 'suspend')}
                        title="إيقاف"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="6" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
                          <rect x="14" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    )}
                    {subscription.status === 'suspended' && (
                      <button
                        className="action-btn action-btn--activate"
                        onClick={() => handleStatusChange(subscription.id, 'activate')}
                        title="تفعيل"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <polygon points="5,3 19,12 5,21" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </button>
                    )}
                    {canDeleteSubscription && (
                      <button
                        className="action-btn action-btn--delete"
                        onClick={() => handleDelete(subscription.id)}
                        title="حذف"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="subscriptions-table__pagination">
          <button
            className="pagination-btn"
            disabled={pagination.current_page <= 1}
            onClick={() => setFilters({ ...filters, page: pagination.current_page - 1 })}
          >
            السابق
          </button>
          <span className="pagination-info">
            صفحة {pagination.current_page} من {pagination.last_page}
          </span>
          <button
            className="pagination-btn"
            disabled={pagination.current_page >= pagination.last_page}
            onClick={() => setFilters({ ...filters, page: pagination.current_page + 1 })}
          >
            التالي
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <SubscriptionForm
          subscription={editingSubscription}
          defaultOfficer={selectedOfficer}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Card Issue Modal */}
      {showCardIssueModal && issuingForSubscription && (
        <div className="modal-overlay" onClick={handleCloseCardIssueModal}>
          <div className="card-issue-modal" onClick={e => e.stopPropagation()}>
            <div className="card-issue-modal__header">
              <h3>{isReplacement ? 'إصدار بطاقة بديلة (بطاقة مفقودة)' : 'إصدار بطاقة جديدة'}</h3>
              <button className="close-btn" onClick={handleCloseCardIssueModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {isReplacement && replacementFee !== null && (
              <div className="card-issue-modal__fee-notice">
                <div className="fee-notice">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="fee-notice__content">
                    <span className="fee-notice__label">رسوم إصدار بطاقة بديلة:</span>
                    <span className="fee-notice__value">{replacementFee.toFixed(2)} ج.م</span>
                  </div>
                </div>
              </div>
            )}

            <div className="card-issue-modal__info">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-item__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div className="info-item__content">
                    <span className="info-item__label">رقم الاشتراك</span>
                    <span className="info-item__value">#{issuingForSubscription.id}</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-item__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="info-item__content">
                    <span className="info-item__label">الضابط</span>
                    <span className="info-item__value">{issuingForSubscription.officer?.full_name || '-'}</span>
                  </div>
                </div>

                {issuingForSubscription.beneficiary && (
                  <div className="info-item">
                    <div className="info-item__icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div className="info-item__content">
                      <span className="info-item__label">المستفيد</span>
                      <span className="info-item__value">{issuingForSubscription.beneficiary.full_name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {cardFormError && (
              <div className="card-issue-modal__error">{cardFormError}</div>
            )}

            <form onSubmit={handleIssueCard} className="card-issue-modal__form">
              <div className="form-group">
                <label htmlFor="card_uid">رقم البطاقة (Card UID) *</label>
                <div className="card-uid-input-wrapper">
                  <input
                    type="text"
                    id="card_uid"
                    name="card_uid"
                    value={cardFormData.card_uid}
                    onChange={handleCardFormChange}
                    placeholder="مثال: A1B2C3D4 أو A1B2C3D4E5F6G7"
                    dir="ltr"
                    className={cardFormError && !cardFormData.card_uid ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="scan-card-btn"
                    onClick={handleScanCard}
                    disabled={scanningCard}
                    title="قراءة رقم البطاقة من القارئ"
                  >
                    {scanningCard ? (
                      <span className="loading-spinner-small"></span>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        <circle cx="10" cy="10" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <small className="form-hint">أدخل رقم MIFARE UID للبطاقة أو انقر على الأيقونة لقراءته من القارئ</small>
              </div>

              <div className="form-group">
                <label htmlFor="expiry_date">تاريخ انتهاء البطاقة *</label>
                <input
                  type="date"
                  id="expiry_date"
                  name="expiry_date"
                  value={cardFormData.expiry_date}
                  onChange={handleCardFormChange}
                  disabled={isReplacement}
                  title={isReplacement ? 'تاريخ انتهاء البطاقة البديلة يكون نفس تاريخ البطاقة الأصلية' : ''}
                />
                {isReplacement && (
                  <small className="form-hint" style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                    تاريخ انتهاء البطاقة البديلة يكون نفس تاريخ البطاقة الأصلية
                  </small>
                )}
              </div>

              <div className="form-group form-group--checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="show_expiry_date"
                    checked={cardFormData.show_expiry_date}
                    onChange={handleCardFormChange}
                  />
                  <span className="checkbox-text">طباعة تاريخ الانتهاء على البطاقة</span>
                </label>
              </div>

              <div className="card-issue-modal__actions">
                <button type="button" className="btn btn--secondary" onClick={handleCloseCardIssueModal}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn--primary" disabled={cardFormLoading}>
                  {cardFormLoading
                    ? (isReplacement ? 'جاري إصدار البطاقة البديلة...' : 'جاري كتابة البيانات على البطاقة...')
                    : (isReplacement ? `إصدار بطاقة بديلة (${replacementFee ? replacementFee.toFixed(2) : '0.00'} ج.م)` : 'إصدار البطاقة')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renewal Modal */}
      {showRenewalModal && renewingSubscription && (
        <div className="modal-overlay" onClick={handleCloseRenewalModal}>
          <div className="card-issue-modal renewal-modal" onClick={e => e.stopPropagation()}>
            <div className="card-issue-modal__header">
              <h3>تجديد الاشتراك</h3>
              <button className="close-btn" onClick={handleCloseRenewalModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {renewalFees && (
              <div className="card-issue-modal__fee-notice">
                <div className="fee-notice">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="fee-notice__content">
                    <span className="fee-notice__label">رسوم التجديد:</span>
                    <span className="fee-notice__value">{renewalFees.total?.toFixed(2) || '0.00'} ج.م</span>
                  </div>
                </div>
                <div className="fee-breakdown">
                  <div className="fee-item">
                    <span>رسوم الاشتراك السنوي:</span>
                    <span>{renewalFees.annual_subscription_fee?.toFixed(2) || '0.00'} ج.م</span>
                  </div>
                  <div className="fee-item">
                    <span>رسوم الإصدار:</span>
                    <span>{renewalFees.issuance_fee?.toFixed(2) || '0.00'} ج.م</span>
                  </div>
                </div>
              </div>
            )}

            <div className="card-issue-modal__info">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-item__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div className="info-item__content">
                    <span className="info-item__label">رقم الاشتراك</span>
                    <span className="info-item__value">#{renewingSubscription.id}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-item__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="info-item__content">
                    <span className="info-item__label">
                      {renewingSubscription.beneficiary ? 'المستفيد' : 'الضابط'}
                    </span>
                    <span className="info-item__value">
                      {renewingSubscription.beneficiary?.full_name || renewingSubscription.officer?.full_name || '-'}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-item__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="info-item__content">
                    <span className="info-item__label">تاريخ الانتهاء الحالي</span>
                    <span className="info-item__value">{formatDate(renewingSubscription.end_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleRenewSubscription}>
              {renewalFormError && (
                <div className="form-error-message">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {renewalFormError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="new_end_date">تاريخ الانتهاء الجديد *</label>
                <input
                  type="date"
                  id="new_end_date"
                  name="new_end_date"
                  value={renewalFormData.new_end_date}
                  onChange={handleRenewalFormChange}
                  min={renewingSubscription.end_date}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="paid_annual_fee">رسوم الاشتراك السنوي (ج.م) *</label>
                  <input
                    type="number"
                    id="paid_annual_fee"
                    name="paid_annual_fee"
                    value={renewalFormData.paid_annual_fee}
                    onChange={handleRenewalFormChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="paid_issuance_fee">رسوم الإصدار (ج.م) *</label>
                  <input
                    type="number"
                    id="paid_issuance_fee"
                    name="paid_issuance_fee"
                    value={renewalFormData.paid_issuance_fee}
                    onChange={handleRenewalFormChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">ملاحظات (اختياري)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={renewalFormData.notes}
                  onChange={handleRenewalFormChange}
                  rows="3"
                  placeholder="أضف أي ملاحظات حول التجديد..."
                />
              </div>

              <div className="card-issue-modal__actions">
                <button type="button" className="btn btn--secondary" onClick={handleCloseRenewalModal}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn--primary" disabled={renewalFormLoading}>
                  {renewalFormLoading ? 'جاري التجديد...' : 'تجديد الاشتراك'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsTable;




