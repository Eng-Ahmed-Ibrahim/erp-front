import React, { useState, useEffect } from 'react';
import { getBeneficiaries, deleteBeneficiary, RELATIONSHIP_TYPES } from '../../../../apis/membershipCards';
import BeneficiaryForm from '../../shared/BeneficiaryForm/BeneficiaryForm';
import './BeneficiariesTable.scss';

const BeneficiariesTable = ({ selectedOfficer, onSelectOfficer }) => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedOfficer?.id) {
      fetchBeneficiaries();
    } else {
      setBeneficiaries([]);
    }
  }, [selectedOfficer?.id]);

  const fetchBeneficiaries = async () => {
    if (!selectedOfficer?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getBeneficiaries(selectedOfficer.id);
      setBeneficiaries(response.data || []);
    } catch (err) {
      setError('حدث خطأ في تحميل البيانات');
      console.error('Error fetching beneficiaries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستفيد؟')) return;
    
    try {
      await deleteBeneficiary(selectedOfficer.id, id);
      fetchBeneficiaries();
    } catch (err) {
      setError('حدث خطأ في الحذف');
    }
  };

  const handleEdit = (beneficiary) => {
    setEditingBeneficiary(beneficiary);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBeneficiary(null);
  };

  const handleFormSuccess = () => {
    fetchBeneficiaries();
    handleFormClose();
  };

  const getRelationshipLabel = (value) => {
    const rel = RELATIONSHIP_TYPES.find(r => r.value === value);
    return rel ? rel.label : value;
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (!selectedOfficer) {
    return (
      <div className="beneficiaries-table beneficiaries-table--empty">
        <div className="no-selection">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h3>اختر ضابط لعرض المستفيدين</h3>
          <p>قم باختيار ضابط من جدول الضباط لعرض المستفيدين المرتبطين به</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="beneficiaries-table beneficiaries-table--loading">
        <div className="loading-spinner"></div>
        <span>جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="beneficiaries-table">
      {/* Officer Info Bar */}
      <div className="beneficiaries-table__officer-info">
        <div className="officer-badge">
          <span className="officer-name">{selectedOfficer.full_name}</span>
          <span className="officer-number">({selectedOfficer.membership_number})</span>
        </div>
        <button className="clear-btn" onClick={() => onSelectOfficer(null)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          إلغاء التحديد
        </button>
      </div>

      {/* Toolbar */}
      <div className="beneficiaries-table__toolbar">
        <h3 className="beneficiaries-table__title">
          المستفيدين ({beneficiaries.length})
        </h3>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          إضافة مستفيد
        </button>
      </div>

      {error && <div className="beneficiaries-table__error">{error}</div>}

      {/* Table */}
      <div className="beneficiaries-table__container">
        <table className="data-table">
          <thead>
            <tr>
              <th>م</th>
              <th>الاسم</th>
              <th>صلة القرابة</th>
              <th>تاريخ الميلاد</th>
              <th>العمر</th>
              <th>الرقم القومي</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-message">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <p>لا يوجد مستفيدين مسجلين لهذا الضابط</p>
                </td>
              </tr>
            ) : (
              beneficiaries.map((beneficiary, index) => (
                <tr key={beneficiary.id}>
                  <td>{beneficiary.family_index || index + 1}</td>
                  <td>{beneficiary.full_name}</td>
                  <td>
                    <span className={`relationship-badge relationship-badge--${beneficiary.relationship_type}`}>
                      {getRelationshipLabel(beneficiary.relationship_type)}
                    </span>
                  </td>
                  <td>{beneficiary.birth_date}</td>
                  <td>{calculateAge(beneficiary.birth_date)} سنة</td>
                  <td className="national-id">{beneficiary.national_id || '-'}</td>
                  <td className="actions">
                    <button
                      className="action-btn action-btn--edit"
                      onClick={() => handleEdit(beneficiary)}
                      title="تعديل"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                    <button
                      className="action-btn action-btn--delete"
                      onClick={() => handleDelete(beneficiary.id)}
                      title="حذف"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <BeneficiaryForm
          officerId={selectedOfficer.id}
          beneficiary={editingBeneficiary}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default BeneficiariesTable;




