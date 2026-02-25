import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import {
  createSubscription,
  getFeePlans,
  getFeePlansByWeaponType,
  getBeneficiaries,
  calculateFees,
  findOfficerByIdentifier,
  BENEFICIARY_TYPES
} from '../../../../apis/membershipCards';
import { hasPermission } from '../../../../utils/permissions';
import SubscriptionReceipt from '../SubscriptionReceipt/SubscriptionReceipt';
import './SubscriptionForm.scss';

const SubscriptionForm = ({ subscription, defaultOfficer, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    officer_id: defaultOfficer?.id || '',
    beneficiary_id: '',
    fee_plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_honorary_membership: false,
    is_old_officer: true,
  });
  const [officer, setOfficer] = useState(defaultOfficer || null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [feePlans, setFeePlans] = useState([]);
  const [calculatedFees, setCalculatedFees] = useState(null);
  const [searchIdentifier, setSearchIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [subscriptionReceiptData, setSubscriptionReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (officer?.weapon_type) {
      fetchFeePlansByWeapon(officer.weapon_type);
    } else {
      fetchFeePlans();
    }
  }, [officer?.weapon_type]);

  useEffect(() => {
    if (officer?.id) {
      fetchBeneficiaries(officer.id);
      setFormData(prev => ({ ...prev, officer_id: officer.id }));
    }
  }, [officer?.id]);

  useEffect(() => {
    // Set default end date to 1 year from start date
    if (formData.start_date) {
      const startDate = new Date(formData.start_date);
      startDate.setFullYear(startDate.getFullYear() + 1);
      setFormData(prev => ({ ...prev, end_date: startDate.toISOString().split('T')[0] }));
    }
  }, [formData.start_date]);

  const fetchFeePlans = async () => {
    try {
      const response = await getFeePlans(true);
      setFeePlans(response.data || []);
    } catch (err) {
      console.error('Error fetching fee plans:', err);
    }
  };

  const fetchFeePlansByWeapon = async (weaponType) => {
    try {
      const response = await getFeePlansByWeaponType(weaponType, true);
      setFeePlans(response.data || []);
    } catch (err) {
      console.error('Error fetching fee plans by weapon type:', err);
      // Fallback to all fee plans if weapon type filter fails
      fetchFeePlans();
    }
  };

  const fetchBeneficiaries = async (officerId) => {
    try {
      const response = await getBeneficiaries(officerId);
      setBeneficiaries(response.data || []);
    } catch (err) {
      console.error('Error fetching beneficiaries:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchIdentifier.trim()) return;

    try {
      setLoading(true);
      setErrors({});
      const response = await findOfficerByIdentifier(searchIdentifier);
      if (response.data) {
        setOfficer(response.data);
      } else {
        setErrors({ search: 'لم يتم العثور على الضابط' });
      }
    } catch (err) {
      setErrors({ search: 'حدث خطأ في البحث' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Recalculate fees when dates change
      if ((name === 'start_date' || name === 'end_date') && updated.fee_plan_id) {
        const startDate = name === 'start_date' ? value : prev.start_date;
        const endDate = name === 'end_date' ? value : prev.end_date;
        if (startDate && endDate) {
          handleFeePlanChange(updated.fee_plan_id, updated.is_old_officer, startDate, endDate);
        }
      }
      return updated;
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const getYearsFromDates = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(1, Math.ceil(diffYears));
  };

  const handleFeePlanChange = async (feePlanId, isOldOfficer = formData.is_old_officer, startDate = formData.start_date, endDate = formData.end_date) => {
    setFormData(prev => ({ ...prev, fee_plan_id: feePlanId }));

    if (feePlanId) {
      const planId = parseInt(feePlanId);
      try {
        const years = getYearsFromDates(startDate, endDate);
        const response = await calculateFees(null, false, isOldOfficer, years, planId);
        setCalculatedFees(response.data);
      } catch (err) {
        console.error('Error calculating fees:', err);
      }
    } else {
      setCalculatedFees(null);
    }
  };

  const handleOldOfficerChange = async (checked) => {
    setFormData(prev => ({ ...prev, is_old_officer: checked }));
    // Recalculate fees with the new is_old_officer value
    if (formData.fee_plan_id) {
      handleFeePlanChange(formData.fee_plan_id, checked, formData.start_date, formData.end_date);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.officer_id) {
      newErrors.officer_id = 'يجب اختيار ضابط';
    }

    if (!formData.fee_plan_id) {
      newErrors.fee_plan_id = 'يجب اختيار خطة الرسوم';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'تاريخ البداية مطلوب';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'تاريخ النهاية مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasPermission(user, 'create membership card subscription')) {
      setErrors({ general: 'ليس لديك صلاحية لإنشاء اشتراكات' });
      return;
    }

    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        officer_id: parseInt(formData.officer_id),
        beneficiary_id: formData.beneficiary_id ? parseInt(formData.beneficiary_id) : null,
        fee_plan_id: parseInt(formData.fee_plan_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_honorary_membership: formData.is_honorary_membership || false,
        is_old_officer: formData.is_old_officer || false,
      };

      const response = await createSubscription(payload);
      
      // Prepare receipt data with all necessary information
      if (response.success && response.data) {
        const receiptData = {
          ...response.data,
          officer: officer,
          beneficiary: formData.beneficiary_id 
            ? beneficiaries.find(b => b.id === parseInt(formData.beneficiary_id))
            : null,
          fee_plan: feePlans.find(p => p.id === parseInt(formData.fee_plan_id)),
        };
        setSubscriptionReceiptData(receiptData);
        setShowReceipt(true);
      } else {
        onSuccess();
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: 'حدث خطأ أثناء الحفظ' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>إنشاء اشتراك جديد</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">اختيار الضابط</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">تفاصيل الاشتراك</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {errors.general && (
            <div className="form-error-general">{errors.general}</div>
          )}

          {/* Step 1: Select Officer */}
          {step === 1 && (
            <div className="step-content">
              {!officer ? (
                <>
                  <div className="search-section">
                    <label>البحث عن ضابط</label>
                    <div className="search-row">
                      <input
                        type="text"
                        placeholder="الرقم العسكري أو الرقم القومي..."
                        value={searchIdentifier}
                        onChange={(e) => setSearchIdentifier(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                      />
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={handleSearch}
                        disabled={loading}
                      >
                        بحث
                      </button>
                    </div>
                    {errors.search && <span className="form-error">{errors.search}</span>}
                  </div>
                </>
              ) : (
                <div className="selected-officer">
                  <div className="officer-card">
                    <div className="officer-card__header">
                      <span className="officer-card__title">الضابط المحدد</span>
                      <button
                        type="button"
                        className="clear-btn"
                        onClick={() => {
                          setOfficer(null);
                          setFormData(prev => ({ ...prev, officer_id: '', beneficiary_id: '' }));
                          setBeneficiaries([]);
                        }}
                      >
                        تغيير
                      </button>
                    </div>
                    <div className="officer-card__body">
                      <div className="info-item">
                        <span className="label">الاسم:</span>
                        <span className="value">{officer.full_name}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">السلاح:</span>
                        <span className="value">{officer.weapon_type === 'infantry' ? 'مشاة' : 'أسلحة أخرى'}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">الرتبة:</span>
                        <span className="value">{officer.rank}</span>
                      </div>

                    </div>
                  </div>

                  {beneficiaries.length > 0 && (
                    <div className="form-group">
                      <label>المستفيد</label>
                      <select
                        name="beneficiary_id"
                        value={formData.beneficiary_id}
                        onChange={handleChange}
                      >
                        <option value="">الضابط نفسه</option>
                        {beneficiaries.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.full_name} ({b.relationship_type})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="step-navigation">
                <button type="button" className="btn btn--secondary" onClick={onClose}>
                  إلغاء
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setStep(2)}
                  disabled={!officer}
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Subscription Details */}
          {step === 2 && (
            <div className="step-content">
              <div className="form-group">
                <label className="checkbox-label checkbox-label--highlighted">
                  <input
                    type="checkbox"
                    name="is_old_officer"
                    checked={formData.is_old_officer}
                    onChange={(e) => handleOldOfficerChange(e.target.checked)}
                  />
                  <span>ضابط قديم (إعفاء من رسم التأسيس)</span>
                </label>
                {formData.is_old_officer && (
                  <div className="info-note">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
                    </svg>
                    <span>سيتم إعفاء الضابط من رسم التأسيس لأنه ضابط قديم (منقول)</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="fee_plan_id">خطة الرسوم *</label>
                <select
                  id="fee_plan_id"
                  name="fee_plan_id"
                  value={formData.fee_plan_id}
                  onChange={(e) => handleFeePlanChange(e.target.value)}
                  className={errors.fee_plan_id ? 'error' : ''}
                >
                  <option value="">اختر خطة الرسوم</option>
                  {[...feePlans].sort((a, b) => a.name.localeCompare(b.name, 'ar')).map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.beneficiary_type}
                    </option>
                  ))}
                </select>
                {errors.fee_plan_id && <span className="form-error">{errors.fee_plan_id}</span>}
              </div>

              {calculatedFees && (
                <div className="fees-summary">
                  <h4>ملخص الرسوم {formData.is_old_officer ? '(ضابط قديم - إعفاء من رسم التأسيس)' : ''}</h4>
                  <div className={`fees-row ${formData.is_old_officer ? 'fees-row--waived' : ''}`}>
                    <span>رسم التأسيس:</span>
                    <span>{formData.is_old_officer ? '0' : (calculatedFees.establishment_fee || 0)} ج.م</span>
                  </div>
                  <div className="fees-row">
                    <span>الاشتراك السنوي ({calculatedFees.years || 1} {(calculatedFees.years || 1) > 1 ? 'سنوات' : 'سنة'} × {calculatedFees.annual_subscription_fee_per_year || calculatedFees.annual_subscription_fee || 0} ج.م):</span>
                    <span>{calculatedFees.annual_subscription_fee || 0} ج.م</span>
                  </div>
                  <div className="fees-row">
                    <span>رسم الإصدار:</span>
                    <span>{calculatedFees.issuance_fee || 0} ج.م</span>
                  </div>
                  <div className="fees-row fees-row--total">
                    <span>الإجمالي:</span>
                    <span>
                      {(
                        (formData.is_old_officer ? 0 : (parseFloat(calculatedFees.establishment_fee) || 0)) +
                        (parseFloat(calculatedFees.annual_subscription_fee) || 0) +
                        (parseFloat(calculatedFees.issuance_fee) || 0)
                      ).toFixed(2)} ج.م
                    </span>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_date">تاريخ البداية *</label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className={errors.start_date ? 'error' : ''}
                  />
                  {errors.start_date && <span className="form-error">{errors.start_date}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="end_date">تاريخ النهاية *</label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className={errors.end_date ? 'error' : ''}
                  />
                  {errors.end_date && <span className="form-error">{errors.end_date}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_honorary_membership"
                    checked={formData.is_honorary_membership}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_honorary_membership: e.target.checked }))}
                  />
                  <span>عضوية فخرية (Honorary Membership)</span>
                </label>
              </div>

              <div className="step-navigation">
                <button type="button" className="btn btn--secondary" onClick={() => setStep(1)}>
                  السابق
                </button>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? 'جاري الحفظ...' : 'إنشاء الاشتراك'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Receipt Print Component */}
      {showReceipt && subscriptionReceiptData && (
        <SubscriptionReceipt
          subscriptionData={subscriptionReceiptData}
          onPrintComplete={() => {
            setShowReceipt(false);
            setSubscriptionReceiptData(null);
            onSuccess();
          }}
        />
      )}
    </div>
  );
};

export default SubscriptionForm;




