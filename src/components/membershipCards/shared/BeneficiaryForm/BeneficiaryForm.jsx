import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { 
  createBeneficiary, 
  updateBeneficiary, 
  RELATIONSHIP_TYPES,
  getBeneficiaryAttachments,
  uploadBeneficiaryAttachment,
  deleteAttachment
} from '../../../../apis/membershipCards';
import { hasPermission } from '../../../../utils/permissions';
import './BeneficiaryForm.scss';

const BeneficiaryForm = ({ officerId, beneficiary, onClose, onSuccess }) => {
  const { user } = useAuth();
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
  
  // Attachments state
  const [attachments, setAttachments] = useState([]); // Uploaded attachments (for edit mode)
  const [pendingAttachments, setPendingAttachments] = useState([]); // Files waiting to be uploaded (for create mode)
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentDescription, setAttachmentDescription] = useState('');

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
      // Load attachments for existing beneficiary
      loadAttachments(beneficiary.id);
      setPendingAttachments([]);
    } else {
      setPhotoPreview(null);
      setAttachments([]);
      setPendingAttachments([]);
    }
  }, [beneficiary]);

  const loadAttachments = async (beneficiaryId) => {
    try {
      setAttachmentsLoading(true);
      const response = await getBeneficiaryAttachments(officerId, beneficiaryId);
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

    if (beneficiary) {
      // Edit mode: upload immediately
      try {
        setUploadingAttachment(true);
        const response = await uploadBeneficiaryAttachment(officerId, beneficiary.id, file, attachmentDescription);
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
      // Create mode: store file locally to upload after beneficiary creation
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
    
    // Check permissions
    if (beneficiary && !hasPermission(user, 'edit membership card beneficiary')) {
      setErrors({ general: 'ليس لديك صلاحية لتعديل المستفيدين' });
      return;
    }
    if (!beneficiary && !hasPermission(user, 'create membership card beneficiary')) {
      setErrors({ general: 'ليس لديك صلاحية لإضافة مستفيدين' });
      return;
    }
    
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
      
      let createdBeneficiaryId = null;
      
      if (beneficiary) {
        await updateBeneficiary(officerId, beneficiary.id, payload);
      } else {
        // Create beneficiary first
        const response = await createBeneficiary(officerId, payload);
        createdBeneficiaryId = response.data?.id;
        
        // Upload pending attachments after beneficiary creation
        if (createdBeneficiaryId && pendingAttachments.length > 0) {
          for (const pending of pendingAttachments) {
            try {
              await uploadBeneficiaryAttachment(officerId, createdBeneficiaryId, pending.file, pending.description);
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
  const allAttachments = beneficiary ? attachments : pendingAttachments;
  const hasAttachments = allAttachments.length > 0;

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
          
          {/* Attachments Section */}
          <div className="attachments-section">
            <h3 className="attachments-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
              المرفقات
              {!beneficiary && pendingAttachments.length > 0 && (
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
                  <div key={attachment.id} className={`attachment-item ${!beneficiary ? 'pending' : ''}`}>
                    <span className="attachment-icon">{getFileIcon(attachment.mime_type)}</span>
                    <div className="attachment-info">
                      {beneficiary ? (
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
                      onClick={() => beneficiary ? handleDeleteAttachment(attachment.id) : handleRemovePendingAttachment(attachment.id)}
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
              {loading ? 'جاري الحفظ...' : (beneficiary ? 'تحديث' : 'إضافة')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BeneficiaryForm;
