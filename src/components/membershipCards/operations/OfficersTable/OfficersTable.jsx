import React, { useState, useEffect } from 'react';
import { getOfficers, deleteOfficer, RANKS, WEAPON_TYPES } from '../../../../apis/membershipCards';
import OfficerForm from '../../shared/OfficerForm/OfficerForm';
import './OfficersTable.scss';

const OfficersTable = ({ onSelectOfficer, selectedOfficer }) => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOfficers();
      setOfficers(response.data || []);
    } catch (err) {
      setError('حدث خطأ في تحميل البيانات');
      console.error('Error fetching officers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await getOfficers(searchTerm);
      setOfficers(response.data || []);
    } catch (err) {
      setError('حدث خطأ في البحث');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الضابط؟')) return;
    
    try {
      await deleteOfficer(id);
      fetchOfficers();
      if (selectedOfficer?.id === id) {
        onSelectOfficer(null);
      }
    } catch (err) {
      setError('حدث خطأ في الحذف');
    }
  };

  const handleEdit = (officer) => {
    setEditingOfficer(officer);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingOfficer(null);
  };

  const handleFormSuccess = () => {
    fetchOfficers();
    handleFormClose();
  };

  const getRankLabel = (value) => {
    const rank = RANKS.find(r => r.value === value);
    return rank ? rank.label : value;
  };

  const getWeaponLabel = (value) => {
    const weapon = WEAPON_TYPES.find(w => w.value === value);
    return weapon ? weapon.label : value;
  };

  if (loading && officers.length === 0) {
    return (
      <div className="officers-table officers-table--loading">
        <div className="loading-spinner"></div>
        <span>جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="officers-table">
      {/* Toolbar */}
      <div className="officers-table__toolbar">
        <div className="officers-table__search">
          <input
            type="text"
            placeholder="البحث بالرقم العسكري أو الرقم القومي أو الاسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          إضافة ضابط
        </button>
      </div>

      {error && <div className="officers-table__error">{error}</div>}

      {/* Table */}
      <div className="officers-table__container">
        <table className="data-table">
          <thead>
            <tr>
              <th>الرقم العسكري</th>
              <th>الاسم</th>
              <th>الرتبة</th>
              <th>السلاح</th>
              <th>الرقم القومي</th>
              <th>رقم الأقدمية</th>
              <th>ملاحظات</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {officers.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-message">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 9H9.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M15 9H15.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M8 14C8.5 15.5 10 17 12 17C14 17 15.5 15.5 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <p>لا يوجد ضباط مسجلين</p>
                </td>
              </tr>
            ) : (
              officers.map((officer) => (
                <tr
                  key={officer.id}
                  className={selectedOfficer?.id === officer.id ? 'selected' : ''}
                  onClick={() => onSelectOfficer(officer)}
                >
                  <td className="membership-number">{officer.membership_number}</td>
                  <td>{officer.full_name}</td>
                  <td>{getRankLabel(officer.rank)}</td>
                  <td>{getWeaponLabel(officer.weapon_type)}</td>
                  <td className="national-id">{officer.national_id}</td>
                  <td>{officer.seniority_number || '-'}</td>
                  <td className="notes-cell">{officer.notes || '-'}</td>
                  <td className="actions">
                    <button
                      className="action-btn action-btn--view"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOfficer(officer);
                      }}
                      title="عرض التفاصيل"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                    <button
                      className="action-btn action-btn--edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(officer);
                      }}
                      title="تعديل"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <button
                      className="action-btn action-btn--delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(officer.id);
                      }}
                      title="حذف"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
        <OfficerForm
          officer={editingOfficer}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default OfficersTable;




