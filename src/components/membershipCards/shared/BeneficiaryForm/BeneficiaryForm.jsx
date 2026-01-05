import React, { useState, useEffect } from 'react';
import { createBeneficiary, updateBeneficiary, RELATIONSHIP_TYPES } from '../../../../apis/membershipCards';
import './BeneficiaryForm.scss';

const BeneficiaryForm = ({ officerId, beneficiary, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    relationship_type: '',
    birth_date: '',
    national_id: '',
    family_index: '',
    notes: '',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (beneficiary) {
      setFormData({
        full_name: beneficiary.full_name || '',
        relationship_type: beneficiary.relationship_type || '',
        birth_date: beneficiary.birth_date || '',
        national_id: beneficiary.national_id || '',
        family_index: beneficiary.family_index || '',
        notes: beneficiary.notes || '',
        photo: null,
      });
      setPhotoPreview(beneficiary.photo || null);
    } else {
      setPhotoPreview(null);
    }
  }, [beneficiary]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'photo' && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.full_name) {
      newErrors.full_name = 'الاسم مطلوب';
    }
    
    if (!formData.relationship_type) {
      newErrors.relationship_type = 'صلة القرابة مطلوبة';
    }
    
    if (!formData.birth_date) {
      newErrors.birth_date = 'تاريخ الميلاد مطلوب';
    }
    
    if (!formData.family_index) {
      newErrors.family_index = 'ترتيب الأسرة مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        family_index: parseInt(formData.family_index),
      };
      
      // Remove photo from payload if it's not a File (keep existing photo)
      if (beneficiary && !(payload.photo instanceof File)) {
        delete payload.photo;
      }
      
      if (beneficiary) {
        await updateBeneficiary(officerId, beneficiary.id, payload);
      } else {
        await createBeneficiary(officerId, payload);
      }
      
      onSuccess();
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
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{beneficiary ? 'تعديل بيانات مستفيد' : 'إضافة مستفيد جديد'}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          {errors.general && (
            <div className="form-error-general">{errors.general}</div>
          )}
          
          <div className="form-group">
            <label htmlFor="full_name">الاسم الكامل *</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={errors.full_name ? 'error' : ''}
            />
            {errors.full_name && <span className="form-error">{errors.full_name}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="relationship_type">صلة القرابة *</label>
              <select
                id="relationship_type"
                name="relationship_type"
                value={formData.relationship_type}
                onChange={handleChange}
                className={errors.relationship_type ? 'error' : ''}
              >
                <option value="">اختر صلة القرابة</option>
                {RELATIONSHIP_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.relationship_type && <span className="form-error">{errors.relationship_type}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="family_index">ترتيب الأسرة *</label>
              <input
                type="number"
                id="family_index"
                name="family_index"
                value={formData.family_index}
                onChange={handleChange}
                min="1"
                className={errors.family_index ? 'error' : ''}
              />
              {errors.family_index && <span className="form-error">{errors.family_index}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birth_date">تاريخ الميلاد *</label>
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className={errors.birth_date ? 'error' : ''}
              />
              {errors.birth_date && <span className="form-error">{errors.birth_date}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="national_id">الرقم القومي</label>
              <input
                type="text"
                id="national_id"
                name="national_id"
                value={formData.national_id}
                onChange={handleChange}
                maxLength={14}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="photo">صورة شخصية</label>
            <div className="photo-upload">
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleChange}
                className="photo-input"
              />
              {photoPreview && (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Preview" />
                  <button
                    type="button"
                    className="photo-remove"
                    onClick={() => {
                      setPhotoPreview(null);
                      setFormData(prev => ({ ...prev, photo: null }));
                      document.getElementById('photo').value = '';
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            {errors.photo && <span className="form-error">{errors.photo}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">ملاحظات</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              إلغاء
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'جاري الحفظ...' : (beneficiary ? 'تحديث' : 'إضافة')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BeneficiaryForm;




