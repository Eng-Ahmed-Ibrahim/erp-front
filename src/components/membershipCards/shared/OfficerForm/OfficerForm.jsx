import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { 
  createOfficer, 
  updateOfficer, 
  RANKS, 
  WEAPON_TYPES,
  SERVICE_STATUSES,
  getOfficerAttachments,
  uploadOfficerAttachment,
  deleteAttachment
} from '../../../../apis/membershipCards';
import { hasPermission } from '../../../../utils/permissions';
import './OfficerForm.scss';

const OfficerForm = ({ officer, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    national_id: '',
    full_name: '',
    rank: '',
    weapon_type: '',
    seniority_number: '',
    military_number: '',
    membership_id: '',
    age: '',
    notes: '',
    photo: null,
    service_status: '',
    is_staff_officer: false,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Extract birth date from Egyptian National ID
  const extractBirthDateFromNationalId = (nationalId) => {
    if (!nationalId || nationalId.length !== 14 || !/^\d{14}$/.test(nationalId)) {
      return null;
    }
    
    const centuryDigit = parseInt(nationalId[0]);
    const year = parseInt(nationalId.substring(1, 3));
    const month = parseInt(nationalId.substring(3, 5));
    const day = parseInt(nationalId.substring(5, 7));
    
    // Determine century
    let fullYear;
    if (centuryDigit === 2) {
      fullYear = 1900 + year;
    } else if (centuryDigit === 3) {
      fullYear = 2000 + year;
    } else {
      return null; // Invalid century digit
    }
    
    // Validate month and day
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    
    // Format as YYYY-MM-DD
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    
    return `${fullYear}-${formattedMonth}-${formattedDay}`;
  };

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (isNaN(birth.getTime())) return null;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : null;
  };
  
  // Attachments state
  const [attachments, setAttachments] = useState([]); // Uploaded attachments (for edit mode)
  const [pendingAttachments, setPendingAttachments] = useState([]); // Files waiting to be uploaded (for create mode)
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentDescription, setAttachmentDescription] = useState('');

  useEffect(() => {
    if (officer) {
      setFormData({
        national_id: officer.national_id || '',
        full_name: officer.full_name || '',
        rank: officer.rank || '',
        weapon_type: officer.weapon_type || '',
        seniority_number: officer.seniority_number || '',
        military_number: officer.military_number || '',
        membership_id: officer.membership_id || '',
        age: officer.age || '',
        notes: officer.notes || '',
        photo: null,
        service_status: officer.service_status || '',
        is_staff_officer: officer.is_staff_officer || false,
      });
      setPhotoPreview(officer.photo || null);
      // Load attachments for existing officer
      loadAttachments(officer.id);
      setPendingAttachments([]);
    } else {
      setPhotoPreview(null);
      setAttachments([]);
      setPendingAttachments([]);
    }
  }, [officer]);

  const loadAttachments = async (officerId) => {
    try {
      setAttachmentsLoading(true);
      const response = await getOfficerAttachments(officerId);
      if (response.success) {
        setAttachments(response.data || []);
      }
    } catch (err) {
      console.error('Error loading attachments:', err);
    } finally {
      setAttachmentsLoading(false);
    }
  };

  // Handle attachment selection - for both create and edit modes
  const handleAttachmentSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (officer) {
      // Edit mode: upload immediately
      try {
        setUploadingAttachment(true);
        const response = await uploadOfficerAttachment(officer.id, file, attachmentDescription);
        if (response.success) {
          setAttachments(prev => [response.data, ...prev]);
          setAttachmentDescription('');
        }
      } catch (err) {
        console.error('Error uploading attachment:', err);
        setErrors(prev => ({ ...prev, attachment: 'حدث خطأ أثناء رفع المرفق' }));
      } finally {
        setUploadingAttachment(false);
      }
    } else {
      // Create mode: store file locally to upload after officer creation
      const pendingFile = {
        id: Date.now(), // Temporary ID for UI
        file: file,
        original_name: file.name,
        description: attachmentDescription,
        file_size_formatted: formatFileSize(file.size),
        mime_type: file.type,
      };
      setPendingAttachments(prev => [pendingFile, ...prev]);
      setAttachmentDescription('');
    }
    
    e.target.value = ''; // Reset file input
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المرفق؟')) return;

    try {
      const response = await deleteAttachment(attachmentId);
      if (response.success) {
        setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      }
    } catch (err) {
      console.error('Error deleting attachment:', err);
    }
  };

  const handleRemovePendingAttachment = (pendingId) => {
    setPendingAttachments(prev => prev.filter(a => a.id !== pendingId));
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝';
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊';
    return '📎';
  };

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
    } else if (name === 'national_id') {
      // Only allow digits
      const cleanValue = value.replace(/\D/g, '').substring(0, 14);
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
      
      // Auto-calculate age when national ID is complete
      if (cleanValue.length === 14) {
        const birthDate = extractBirthDateFromNationalId(cleanValue);
        if (birthDate) {
          const age = calculateAge(birthDate);
          if (age !== null) {
            setFormData(prev => ({ ...prev, national_id: cleanValue, age: age.toString() }));
          }
        }
      }
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
    } else if (!/^\d{14}$/.test(formData.national_id)) {
      newErrors.national_id = 'الرقم القومي يجب أن يكون 14 رقم';
    } else {
      // Validate that the national ID contains a valid date
      const birthDate = extractBirthDateFromNationalId(formData.national_id);
      if (!birthDate) {
        newErrors.national_id = 'الرقم القومي غير صحيح';
      }
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
    
    if (!formData.military_number) {
      newErrors.military_number = 'الرقم العسكري مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check permissions
    if (officer && !hasPermission(user, 'edit membership card officer')) {
      setErrors({ general: 'ليس لديك صلاحية لتعديل الضباط' });
      return;
    }
    if (!officer && !hasPermission(user, 'create membership card officer')) {
      setErrors({ general: 'ليس لديك صلاحية لإضافة ضباط' });
      return;
    }
    
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
      
      let createdOfficerId = null;
      
      if (officer) {
        await updateOfficer(officer.id, payload);
      } else {
        // Create officer first
        const response = await createOfficer(payload);
        createdOfficerId = response.data?.id;
        
        // Upload pending attachments after officer creation
        if (createdOfficerId && pendingAttachments.length > 0) {
          for (const pending of pendingAttachments) {
            try {
              await uploadOfficerAttachment(createdOfficerId, pending.file, pending.description);
            } catch (err) {
              console.error('Error uploading attachment:', err);
              // Continue with other attachments even if one fails
            }
          }
        }
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

  // Combine uploaded and pending attachments for display
  const allAttachments = officer ? attachments : pendingAttachments;
  const hasAttachments = allAttachments.length > 0;

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
                placeholder="أدخل 14 رقم"
                className={errors.national_id ? 'error' : ''}
              />
              {errors.national_id && <span className="form-error">{errors.national_id}</span>}
              {formData.national_id && formData.national_id.length === 14 && !errors.national_id && (
                <span className="form-hint success">تم حساب العمر تلقائياً</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="military_number">الرقم العسكري *</label>
              <input
                type="text"
                id="military_number"
                name="military_number"
                value={formData.military_number}
                onChange={handleChange}
                className={errors.military_number ? 'error' : ''}
              />
              {errors.military_number && <span className="form-error">{errors.military_number}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="membership_id">رقم العضوية</label>
              <input
                type="text"
                id="membership_id"
                name="membership_id"
                value={formData.membership_id}
                onChange={handleChange}
                placeholder="رقم العضوية على الكارت"
                className={errors.membership_id ? 'error' : ''}
              />
              {errors.membership_id && <span className="form-error">{errors.membership_id}</span>}
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
              <label htmlFor="service_status">حالة الخدمة</label>
              <select
                id="service_status"
                name="service_status"
                value={formData.service_status}
                onChange={handleChange}
              >
                <option value="">اختر حالة الخدمة</option>
                {SERVICE_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_staff_officer"
                  checked={formData.is_staff_officer}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_staff_officer: e.target.checked }))}
                />
                <span>اركان حرب</span>
              </label>
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
          
          {/* Attachments Section */}
          <div className="attachments-section">
            <h3 className="attachments-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              المرفقات
              {!officer && pendingAttachments.length > 0 && (
                <span className="attachments-pending-badge">
                  {pendingAttachments.length} سيتم رفعها بعد الحفظ
                </span>
              )}
            </h3>
            
            {/* Upload new attachment */}
            <div className="attachment-upload">
              <div className="attachment-upload-row">
                <input
                  type="text"
                  placeholder="وصف المرفق (اختياري)"
                  value={attachmentDescription}
                  onChange={(e) => setAttachmentDescription(e.target.value)}
                  className="attachment-description-input"
                />
                <label className="attachment-upload-btn">
                  <input
                    type="file"
                    onChange={handleAttachmentSelect}
                    disabled={uploadingAttachment}
                    style={{ display: 'none' }}
                  />
                  {uploadingAttachment ? (
                    <span className="uploading-text">جاري الرفع...</span>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      إضافة مرفق
                    </>
                  )}
                </label>
              </div>
              {errors.attachment && <span className="form-error">{errors.attachment}</span>}
            </div>
            
            {/* Attachments list */}
            {attachmentsLoading ? (
              <div className="attachments-loading">جاري تحميل المرفقات...</div>
            ) : hasAttachments ? (
              <div className="attachments-list">
                {allAttachments.map((attachment) => (
                  <div key={attachment.id} className={`attachment-item ${!officer ? 'pending' : ''}`}>
                    <span className="attachment-icon">{getFileIcon(attachment.mime_type)}</span>
                    <div className="attachment-info">
                      {officer ? (
                        <a 
                          href={attachment.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="attachment-name"
                        >
                          {attachment.original_name}
                        </a>
                      ) : (
                        <span className="attachment-name">{attachment.original_name}</span>
                      )}
                      {attachment.description && (
                        <span className="attachment-desc">{attachment.description}</span>
                      )}
                      <span className="attachment-size">{attachment.file_size_formatted}</span>
                    </div>
                    <button
                      type="button"
                      className="attachment-delete"
                      onClick={() => officer ? handleDeleteAttachment(attachment.id) : handleRemovePendingAttachment(attachment.id)}
                      title="حذف المرفق"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="attachments-empty">لا توجد مرفقات</div>
            )}
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
