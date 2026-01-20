import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { 
  getFeePlans, 
  createFeePlan, 
  updateFeePlan, 
  deleteFeePlan,
  getReplacementCardFee,
  updateReplacementCardFee,
  BENEFICIARY_TYPES,
  WEAPON_TYPES 
} from '../../../../apis/membershipCards';
import { hasPermission } from '../../../../utils/permissions';
import './FeePlansManagement.scss';

const FeePlansManagement = () => {
  const { user } = useAuth();
  const [feePlans, setFeePlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [error, setError] = useState(null);

  // Permission checks
  const canCreateFeePlan = hasPermission(user, 'create membership card fee plan');
  const canEditFeePlan = hasPermission(user, 'edit membership card fee plan');
  const canDeleteFeePlan = hasPermission(user, 'delete membership card fee plan');
  const canManageReplacementFee = hasPermission(user, 'manage membership card replacement fee');
  const [weaponTypeFilter, setWeaponTypeFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    beneficiary_type: '',
    weapon_type: '',
    establishment_fee: '',
    annual_subscription_fee: '',
    issuance_fee: '',
    active: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [replacementFee, setReplacementFee] = useState(null);
  const [replacementFeeEditing, setReplacementFeeEditing] = useState(false);
  const [replacementFeeValue, setReplacementFeeValue] = useState('');
  const [savingReplacementFee, setSavingReplacementFee] = useState(false);

  useEffect(() => {
    fetchFeePlans();
    fetchReplacementFee();
  }, []);

  const fetchReplacementFee = async () => {
    try {
      const response = await getReplacementCardFee();
      setReplacementFee(response.data?.fee || 0);
      setReplacementFeeValue(response.data?.fee || 0);
    } catch (err) {
      console.error('Error fetching replacement fee:', err);
    }
  };

  const handleReplacementFeeEdit = () => {
    if (!canManageReplacementFee) {
      setError('ليس لديك صلاحية لإدارة رسوم البطاقات البديلة');
      return;
    }
    setReplacementFeeEditing(true);
    setReplacementFeeValue(replacementFee || '');
  };

  const handleReplacementFeeCancel = () => {
    setReplacementFeeEditing(false);
    setReplacementFeeValue(replacementFee || '');
  };

  const handleReplacementFeeSave = async () => {
    if (!canManageReplacementFee) {
      setError('ليس لديك صلاحية لإدارة رسوم البطاقات البديلة');
      return;
    }

    if (parseFloat(replacementFeeValue) < 0) {
      alert('الرسوم يجب أن تكون أكبر من أو تساوي صفر');
      return;
    }

    try {
      setSavingReplacementFee(true);
      await updateReplacementCardFee(parseFloat(replacementFeeValue));
      setReplacementFee(parseFloat(replacementFeeValue));
      setReplacementFeeEditing(false);
      alert('تم تحديث رسوم البطاقة البديلة بنجاح');
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ في تحديث الرسوم');
    } finally {
      setSavingReplacementFee(false);
    }
  };

  useEffect(() => {
    // Filter plans by weapon type
    if (!weaponTypeFilter) {
      setFilteredPlans(feePlans);
    } else {
      setFilteredPlans(feePlans.filter(plan => plan.weapon_type === weaponTypeFilter));
    }
  }, [feePlans, weaponTypeFilter]);

  const fetchFeePlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFeePlans();
      setFeePlans(response.data || []);
    } catch (err) {
      setError('حدث خطأ في تحميل البيانات');
      console.error('Error fetching fee plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan) => {
    if (!canEditFeePlan) {
      setError('ليس لديك صلاحية لتعديل خطط الرسوم');
      return;
    }

    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      beneficiary_type: plan.beneficiary_type || '',
      weapon_type: plan.weapon_type || '',
      establishment_fee: plan.establishment_fee || '',
      annual_subscription_fee: plan.annual_subscription_fee || '',
      issuance_fee: plan.issuance_fee || '',
      active: plan.active !== false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!canDeleteFeePlan) {
      setError('ليس لديك صلاحية لحذف خطط الرسوم');
      return;
    }

    if (!window.confirm('هل أنت متأكد من حذف هذه الخطة؟')) return;
    
    try {
      await deleteFeePlan(id);
      fetchFeePlans();
    } catch (err) {
      setError('حدث خطأ في الحذف');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPlan(null);
    setFormData({
      name: '',
      beneficiary_type: '',
      weapon_type: '',
      establishment_fee: '',
      annual_subscription_fee: '',
      issuance_fee: '',
      active: true,
    });
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.name) errors.name = 'اسم الخطة مطلوب';
    if (!formData.beneficiary_type) errors.beneficiary_type = 'نوع المستفيد مطلوب';
    if (formData.establishment_fee === '' || parseFloat(formData.establishment_fee) < 0) {
      errors.establishment_fee = 'قيمة غير صحيحة';
    }
    if (formData.annual_subscription_fee === '' || parseFloat(formData.annual_subscription_fee) < 0) {
      errors.annual_subscription_fee = 'قيمة غير صحيحة';
    }
    if (formData.issuance_fee === '' || parseFloat(formData.issuance_fee) < 0) {
      errors.issuance_fee = 'قيمة غير صحيحة';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check permissions
    if (editingPlan && !canEditFeePlan) {
      setFormErrors({ general: 'ليس لديك صلاحية لتعديل خطط الرسوم' });
      return;
    }
    if (!editingPlan && !canCreateFeePlan) {
      setFormErrors({ general: 'ليس لديك صلاحية لإنشاء خطط الرسوم' });
      return;
    }

    if (!validate()) return;
    
    try {
      setSaving(true);
      
      const payload = {
        name: formData.name,
        beneficiary_type: formData.beneficiary_type,
        weapon_type: formData.weapon_type || null,
        establishment_fee: parseFloat(formData.establishment_fee),
        annual_subscription_fee: parseFloat(formData.annual_subscription_fee),
        issuance_fee: parseFloat(formData.issuance_fee),
        active: formData.active,
      };
      
      if (editingPlan) {
        await updateFeePlan(editingPlan.id, payload);
      } else {
        await createFeePlan(payload);
      }
      
      fetchFeePlans();
      handleFormClose();
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        setFormErrors({ general: 'حدث خطأ أثناء الحفظ' });
      }
    } finally {
      setSaving(false);
    }
  };

  const getBeneficiaryTypeLabel = (type) => {
    const found = BENEFICIARY_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };

  const getWeaponTypeLabel = (type) => {
    if (!type) return '-';
    const found = WEAPON_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG').format(amount || 0);
  };

  if (loading) {
    return (
      <div className="fee-plans-management fee-plans-management--loading">
        <div className="loading-spinner"></div>
        <span>جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="fee-plans-management">
      {/* Header */}
      <div className="config-header">
        <div className="config-header__title">
          <h2>إدارة خطط الرسوم</h2>
          <p>تحديد الرسوم المطبقة على كل نوع من أنواع المستفيدين</p>
        </div>
        {canCreateFeePlan && (
          <button className="add-btn" onClick={() => setShowForm(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            إضافة خطة جديدة
          </button>
        )}
      </div>

      {error && <div className="config-error">{error}</div>}

      {/* Replacement Card Fee Section */}
      <div className="replacement-fee-section">
        <div className="replacement-fee-card">
          <div className="replacement-fee-card__header">
            <div className="replacement-fee-card__title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <h3>رسوم البطاقة البديلة</h3>
                <p>الرسوم المطبقة عند إصدار بطاقة بديلة (بطاقة مفقودة)</p>
              </div>
            </div>
          </div>
          <div className="replacement-fee-card__content">
            {replacementFeeEditing ? (
              <div className="replacement-fee-edit">
                <div className="form-group">
                  <label htmlFor="replacement_fee">رسوم البطاقة البديلة (ج.م) *</label>
                  <input
                    type="number"
                    id="replacement_fee"
                    value={replacementFeeValue}
                    onChange={(e) => setReplacementFeeValue(e.target.value)}
                    min="0"
                    step="0.01"
                    className="fee-input"
                  />
                </div>
                <div className="replacement-fee-actions">
                  <button
                    className="btn btn--secondary"
                    onClick={handleReplacementFeeCancel}
                    disabled={savingReplacementFee}
                  >
                    إلغاء
                  </button>
                  <button
                    className="btn btn--primary"
                    onClick={handleReplacementFeeSave}
                    disabled={savingReplacementFee}
                  >
                    {savingReplacementFee ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="replacement-fee-display">
                <div className="replacement-fee-value">
                  <span className="replacement-fee-label">الرسوم الحالية:</span>
                  <span className="replacement-fee-amount">{formatCurrency(replacementFee || 0)} ج.م</span>
                </div>
                  {canManageReplacementFee && (
                    <button
                      className="btn btn--edit"
                      onClick={handleReplacementFeeEdit}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      تعديل الرسوم
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="fee-plans-filters">
        <div className="filter-group">
          <label htmlFor="weapon_type_filter">فلترة حسب نوع السلاح:</label>
          <select
            id="weapon_type_filter"
            value={weaponTypeFilter}
            onChange={(e) => setWeaponTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">الكل</option>
            {WEAPON_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="plans-grid">
        {filteredPlans.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M12 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h3>لا توجد خطط رسوم</h3>
            <p>قم بإضافة خطة رسوم جديدة للبدء</p>
          </div>
        ) : (
          filteredPlans.map((plan) => (
            <div key={plan.id} className={`plan-card ${!plan.active ? 'plan-card--inactive' : ''}`}>
              <div className="plan-card__header">
                <div className="plan-card__title">
                  <h3>{plan.name}</h3>
                  <span className={`status-badge ${plan.active ? 'status-badge--active' : 'status-badge--inactive'}`}>
                    {plan.active ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                <div className="plan-card__types">
                  <span className="plan-card__type">{getBeneficiaryTypeLabel(plan.beneficiary_type)}</span>
                  {plan.weapon_type && (
                    <span className="plan-card__weapon-type">{getWeaponTypeLabel(plan.weapon_type)}</span>
                  )}
                </div>
              </div>
              
              <div className="plan-card__fees">
                <div className="fee-item">
                  <span className="fee-item__label">رسم التأسيس</span>
                  <span className="fee-item__value">{formatCurrency(plan.establishment_fee)} ج.م</span>
                </div>
                <div className="fee-item">
                  <span className="fee-item__label">الاشتراك السنوي</span>
                  <span className="fee-item__value">{formatCurrency(plan.annual_subscription_fee)} ج.م</span>
                </div>
                <div className="fee-item">
                  <span className="fee-item__label">رسم الإصدار</span>
                  <span className="fee-item__value">{formatCurrency(plan.issuance_fee)} ج.م</span>
                </div>
                <div className="fee-item fee-item--total">
                  <span className="fee-item__label">الإجمالي</span>
                  <span className="fee-item__value">
                    {formatCurrency(
                      (parseFloat(plan.establishment_fee) || 0) +
                      (parseFloat(plan.annual_subscription_fee) || 0) +
                      (parseFloat(plan.issuance_fee) || 0)
                    )} ج.م
                  </span>
                </div>
              </div>
              
              <div className="plan-card__footer">
                <span className="plan-card__version">الإصدار {plan.version || 1}</span>
                <div className="plan-card__actions">
                  {canEditFeePlan && (
                    <button
                      className="action-btn action-btn--edit"
                      onClick={() => handleEdit(plan)}
                      title="تعديل"
                    >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  )}
                  {canDeleteFeePlan && (
                    <button
                      className="action-btn action-btn--delete"
                      onClick={() => handleDelete(plan.id)}
                      title="حذف"
                    >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={handleFormClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlan ? 'تعديل خطة الرسوم' : 'إضافة خطة رسوم جديدة'}</h2>
              <button className="close-btn" onClick={handleFormClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              {formErrors.general && (
                <div className="form-error-general">{formErrors.general}</div>
              )}
              
              <div className="form-group">
                <label htmlFor="name">اسم الخطة *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={formErrors.name ? 'error' : ''}
                  placeholder="مثال: خطة الضباط"
                />
                {formErrors.name && <span className="form-error">{formErrors.name}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="beneficiary_type">نوع المستفيد *</label>
                  <select
                    id="beneficiary_type"
                    name="beneficiary_type"
                    value={formData.beneficiary_type}
                    onChange={handleChange}
                    className={formErrors.beneficiary_type ? 'error' : ''}
                  >
                    <option value="">اختر نوع المستفيد</option>
                    {BENEFICIARY_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {formErrors.beneficiary_type && <span className="form-error">{formErrors.beneficiary_type}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="weapon_type">نوع السلاح</label>
                  <select
                    id="weapon_type"
                    name="weapon_type"
                    value={formData.weapon_type}
                    onChange={handleChange}
                    className={formErrors.weapon_type ? 'error' : ''}
                  >
                    <option value="">الكل</option>
                    {WEAPON_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {formErrors.weapon_type && <span className="form-error">{formErrors.weapon_type}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="establishment_fee">رسم التأسيس (ج.م) *</label>
                  <input
                    type="number"
                    id="establishment_fee"
                    name="establishment_fee"
                    value={formData.establishment_fee}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={formErrors.establishment_fee ? 'error' : ''}
                  />
                  {formErrors.establishment_fee && <span className="form-error">{formErrors.establishment_fee}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="annual_subscription_fee">الاشتراك السنوي (ج.م) *</label>
                  <input
                    type="number"
                    id="annual_subscription_fee"
                    name="annual_subscription_fee"
                    value={formData.annual_subscription_fee}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={formErrors.annual_subscription_fee ? 'error' : ''}
                  />
                  {formErrors.annual_subscription_fee && <span className="form-error">{formErrors.annual_subscription_fee}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="issuance_fee">رسم الإصدار (ج.م) *</label>
                  <input
                    type="number"
                    id="issuance_fee"
                    name="issuance_fee"
                    value={formData.issuance_fee}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={formErrors.issuance_fee ? 'error' : ''}
                  />
                  {formErrors.issuance_fee && <span className="form-error">{formErrors.issuance_fee}</span>}
                </div>
                
                <div className="form-group form-group--checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                    />
                    <span className="checkbox-text">خطة نشطة</span>
                  </label>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn--secondary" onClick={handleFormClose}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'جاري الحفظ...' : (editingPlan ? 'تحديث' : 'إضافة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
   </div>
  );
};

export default FeePlansManagement;




