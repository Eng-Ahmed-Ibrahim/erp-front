import React, { useState, useEffect } from 'react';
import { createOfficer, updateOfficer, RANKS, WEAPON_TYPES } from '../../../../apis/membershipCards';
import './OfficerForm.scss';

const OfficerForm = ({ officer, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    national_id: '',
    full_name: '',
    rank: '',
    weapon_type: '',
    seniority_number: '',
    membership_number: '',
    age: '',
    notes: '',
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (officer) {
      setFormData({
        national_id: officer.national_id || '',
        full_name: officer.full_name || '',
        rank: officer.rank || '',
        weapon_type: officer.weapon_type || '',
        seniority_number: officer.seniority_number || '',
        membership_number: officer.membership_number || '',
        age: officer.age || '',
        notes: officer.notes || '',
        photo: null,
      });
      setPhotoPreview(officer.photo || null);
    } else {
      setPhotoPreview(null);
    }
  }, [officer]);

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
    
    if (!formData.national_id) {
      newErrors.national_id = 'الرقم القومي مطلوب';
    } else if (formData.national_id.length !== 14) {
      newErrors.national_id = 'الرقم القومي يجب أن يكون 14 رقم';
    }
    
    if (!formData.full_name) {
      newErrors.full_name = 'الاسم مطلوب';
    }
    
    if (!formData.rank) {
      newErrors.rank = 'الرتبة مطلوبة';
    }
    
    if (!formData.weapon_type) {
      newErrors.weapon_type = 'السلاح مطلوب';
    }
    
    if (!formData.membership_number) {
      newErrors.membership_number = 'رقم العضوية مطلوب';
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
        age: formData.age ? parseInt(formData.age) : null,
      };
      
      // Remove photo from payload if it's not a File (keep existing photo)
      if (officer && !(payload.photo instanceof File)) {
        delete payload.photo;
      }
      
      if (officer) {
        await updateOfficer(officer.id, payload);
      } else {
        await createOfficer(payload);
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
          <h2>{officer ? 'تعديل بيانات ضابط' : 'إضافة ضابط جديد'}</h2>
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
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="national_id">الرقم القومي *</label>
              <input
                type="text"
                id="national_id"
                name="national_id"
                value={formData.national_id}
                onChange={handleChange}
                maxLength={14}
                className={errors.national_id ? 'error' : ''}
              />
              {errors.national_id && <span className="form-error">{errors.national_id}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="membership_number">رقم العضوية *</label>
              <input
                type="text"
                id="membership_number"
                name="membership_number"
                value={formData.membership_number}
                onChange={handleChange}
                className={errors.membership_number ? 'error' : ''}
              />
              {errors.membership_number && <span className="form-error">{errors.membership_number}</span>}
            </div>
          </div>
          
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
              <label htmlFor="rank">الرتبة *</label>
              <select
                id="rank"
                name="rank"
                value={formData.rank}
                onChange={handleChange}
                className={errors.rank ? 'error' : ''}
              >
                <option value="">اختر الرتبة</option>
                {RANKS.map(rank => (
                  <option key={rank.value} value={rank.value}>{rank.label}</option>
                ))}
              </select>
              {errors.rank && <span className="form-error">{errors.rank}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="weapon_type">السلاح *</label>
              <select
                id="weapon_type"
                name="weapon_type"
                value={formData.weapon_type}
                onChange={handleChange}
                className={errors.weapon_type ? 'error' : ''}
              >
                <option value="">اختر السلاح</option>
                {WEAPON_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.weapon_type && <span className="form-error">{errors.weapon_type}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="seniority_number">رقم الأقدمية</label>
              <input
                type="text"
                id="seniority_number"
                name="seniority_number"
                value={formData.seniority_number}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="age">العمر</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="18"
                max="100"
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
              {loading ? 'جاري الحفظ...' : (officer ? 'تحديث' : 'إضافة')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfficerForm;




