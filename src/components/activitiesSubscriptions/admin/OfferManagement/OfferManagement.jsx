import React, { useState, useEffect } from 'react';
import {
  getOffers,
  getAcademies,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../../../../apis/activitiesSubscriptions';
import FormField from '../../shared/FormField/FormField';
import Modal from '../../shared/Modal/Modal';
import DataTable from '../../shared/DataTable/DataTable';
import './OfferManagement.scss';
import { useAuth } from "../../../../context/AuthContext";

const OfferManagement = () => {
  const { user } = useAuth();

  const [offers, setOffers] = useState([]);
  const [academies, setAcademies] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [academyFilter, setAcademyFilter] = useState('');
  const [formData, setFormData] = useState({
    academy_id: '',
    name: '',
    num_classes: '',
    num_hours: '',
    duration_days: '',
    available_days: [],
    price_infantry: '',
    price_civilian: '',
    price_other: '',
    active: true,
  });
  const [errors, setErrors] = useState({});

  const daysOfWeek = [
    { value: 'Monday', label: 'الإثنين' },
    { value: 'Tuesday', label: 'الثلاثاء' },
    { value: 'Wednesday', label: 'الأربعاء' },
    { value: 'Thursday', label: 'الخميس' },
    { value: 'Friday', label: 'الجمعة' },
    { value: 'Saturday', label: 'السبت' },
    { value: 'Sunday', label: 'الأحد' },
  ];

  const offerTypeOptions = [
    { value: 'classes', label: 'قائم على الحصص' },
    { value: 'hours', label: 'بالساعات' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  // Filter offers based on search query and academy filter
  useEffect(() => {
    let filtered = offers;

    // Filter by academy
    if (academyFilter) {
      filtered = filtered.filter((offer) => offer.academy_id == academyFilter);
    }

    // Filter by search query (offer name)
    if (searchQuery.trim()) {
      filtered = filtered.filter((offer) =>
        offer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOffers(filtered);
  }, [offers, searchQuery, academyFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [offersRes, academiesRes] = await Promise.all([
        getOffers(),
        getAcademies(),
      ]);
      console.log('Offers data:', offersRes);
      console.log('Academies data:', academiesRes);
      setOffers(offersRes.data || []);
      setAcademies(academiesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // If academy changes, reset available days to empty array
      if (name === 'academy_id') {
        newData.available_days = [];
      }

      return newData;
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleOfferTypeChange = (e) => {
    const offerType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      num_classes: offerType === 'classes' ? prev.num_classes : '',
      num_hours: offerType === 'hours' ? prev.num_hours : '',
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAcademyFilterChange = (e) => {
    setAcademyFilter(e.target.value);
  };

  const validateForm = () => {
    const newErrors = {};
    console.log('Validating form with data:', formData);

    if (!formData.academy_id) {
      newErrors.academy_id = 'الأكاديمية مطلوبة';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'اسم العرض مطلوب';
    }

    if (!formData.num_classes && !formData.num_hours) {
      newErrors.num_classes = 'يجب تحديد عدد الحصص أو الساعات';
      newErrors.num_hours = 'يجب تحديد عدد الحصص أو الساعات';
    }

    // if (formData.num_classes && formData.num_hours) {
    //   newErrors.num_classes = 'لا يمكن تحديد الحصص والساعات معاً';
    //   newErrors.num_hours = 'لا يمكن تحديد الحصص والساعات معاً';
    // }

    if (!formData.duration_days || formData.duration_days <= 0) {
      newErrors.duration_days = 'مدة العرض بالأيام مطلوبة';
    }

    if (formData.available_days.length === 0) {
      newErrors.available_days = 'يجب اختيار يوم واحد متاح على الأقل';
    }

    if (!formData.price_infantry || formData.price_infantry <= 0) {
      newErrors.price_infantry = 'سعر المشاة يجب أن يكون أكبر من 0';
    }

    if (!formData.price_civilian || formData.price_civilian <= 0) {
      newErrors.price_civilian = 'سعر المدنيين يجب أن يكون أكبر من 0';
    }

    if (!formData.price_other || formData.price_other <= 0) {
      newErrors.price_other = 'السعر الآخر يجب أن يكون أكبر من 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = { ...formData };

      // Clean up the data - remove empty values
      if (!submitData.num_classes) delete submitData.num_classes;
      if (!submitData.num_hours) delete submitData.num_hours;

      if (selectedOffer) {
        const response = await updateOffer(selectedOffer.id, submitData);
        if (response.success) {
          setShowEditModal(false);
          loadData();
        }
      } else {
        const response = await createOffer(submitData);
        if (response.success) {
          setShowCreateModal(false);
          resetForm();
          loadData();
        }
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'حدث خطأ' });
      }
    }
  };

  const handleEdit = (offer) => {
    setSelectedOffer(offer);
    setFormData({
      academy_id: offer.academy_id,
      name: offer.name,
      num_classes: offer.num_classes || '',
      num_hours: offer.num_hours || '',
      duration_days: offer.duration_days || '',
      available_days: offer.available_days,
      price_infantry: offer.price_infantry,
      price_civilian: offer.price_civilian,
      price_other: offer.price_other,
      active: offer.active,
    });
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteOffer(selectedOffer.id);
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedOffer(null);
        loadData();
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      academy_id: '',
      name: '',
      num_classes: '',
      num_hours: '',
      duration_days: '',
      available_days: [],
      price_infantry: '',
      price_civilian: '',
      price_other: '',
      active: true,
    });
    setErrors({});
    setSelectedOffer(null);
  };

  const getAcademyName = (academyId) => {
    if (!academyId) return 'غير محدد';
    const academy = academies.find((a) => a.id == academyId);
    return academy ? academy.name : 'غير معروف';
  };

  const getAvailableDaysForAcademy = (academyId) => {
    // Handle both string and number academy IDs
    const academy = academies.find((a) => a.id == academyId);
    if (!academy || !academy.working_days) {
      return daysOfWeek;
    }

    return daysOfWeek.filter((day) => academy.working_days.includes(day.value));
  };

  const getStatusBadge = (active) => {
    return (
      <span
        className={`status-badge ${
          active ? 'status-badge--active' : 'status-badge--inactive'
        }`}
      >
        {active ? 'نشط' : 'غير نشط'}
      </span>
    );
  };

  const getOfferType = (offer) => {
    if (!offer) return 'غير محدد';
    if (offer.num_classes && offer.num_classes > 0) {
      return `${offer.num_classes} حصة`;
    } else if (offer.num_hours && offer.num_hours > 0) {
      return `${offer.num_hours} ساعة`;
    }
    return 'غير محدد';
  };

  const columns = [
    {
      key: 'id',
      header: '#',
      render: (value) => value || 'غير محدد',
    },
    {
      key: 'academy_id',
      header: 'الأكاديمية',
      render: (value) => getAcademyName(value),
    },
    {
      key: 'name',
      header: 'اسم العرض',
      render: (value) => value || 'غير محدد',
    },
    {
      key: 'num_classes',
      header: 'النوع',
      render: (value, row) => getOfferType(row),
    },
    {
      key: 'duration_days',
      header: 'المدة بالأيام',
      render: (value) => (value ? `${value} يوم` : 'غير محدد'),
    },
    {
      key: 'price_infantry',
      header: 'سعر المشاة',
      render: (value) => (value ? `${value}` : 'غير محدد'),
    },
    {
      key: 'price_other',
      header: 'سعر أسلحة أخرى',
      render: (value) => (value ? `${value}` : 'غير محدد'),
    },
    {
      key: 'price_civilian',
      header: 'سعر المدنيين',
      render: (value) => (value ? `${value}` : 'غير محدد'),
    },

    {
      key: 'active',
      header: 'الحالة',
      render: (value) => getStatusBadge(value),
    },
  ];

  const actions = (row) => (
    <div className="table-actions">
            {user?.permissions.some(
            (permission) => permission.name === "edit academy offer"
          ) && (

      <button
        className="action-btn action-btn--primary"
        onClick={() => handleEdit(row)}
        title="تعديل العرض"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </button>
          )}
           {user?.permissions.some(
            (permission) => permission.name === "remove academy offer"
          ) && (
      <button
        className="action-btn action-btn--danger"
        onClick={() => {
          setSelectedOffer(row);
          setShowDeleteModal(true);
        }}
        title="حذف العرض"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" />
          <path
            d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </button>
          )}
    </div>
  );

  return (
    <div className="offer-management">
      <div className="page-header">
        <h1 className="page-title"> العروض</h1>
        <div className="header-actions">
          <div className="filters-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="البحث عن عرض..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
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
            </div>
            <select
              value={academyFilter}
              onChange={handleAcademyFilterChange}
              className="academy-filter"
            >
              <option value="">جميع الأكاديميات</option>
              {academies.map((academy) => (
                <option key={academy.id} value={academy.id}>
                  {academy.name}
                </option>
              ))}
            </select>
          </div>
          {user?.permissions.some(
            (permission) => permission.name === "add academy offer"
          ) && (
          <button
            className="add-btn"
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            إنشاء عرض جديد
          </button>
          )}
        </div>
      </div>

      <div className="content-section">
        <DataTable
          data={filteredOffers}
          columns={columns}
          loading={loading}
          actions={actions}
          emptyMessage={
            searchQuery || academyFilter
              ? 'لم يتم العثور على عروض تطابق البحث'
              : 'لم يتم العثور على عروض'
          }
        />
      </div>

      {/* Create Offer Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="إنشاء عرض جديد"
        size="extra-large"
      >
        <form onSubmit={handleSubmit} className="offer-form">
          {errors.general && <div className="form-error">{errors.general}</div>}

          <div className="form-row">
            <FormField
              label="الأكاديمية"
              type="select"
              name="academy_id"
              value={formData.academy_id}
              onChange={handleInputChange}
              options={academies.map((a) => ({ value: a.id, label: a.name }))}
              required
              error={errors.academy_id}
            />
            <FormField
              label="اسم العرض"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="أدخل اسم العرض"
              required
              error={errors.name}
            />
          </div>

          <div className="form-row">
            <FormField
              label="عدد الحصص"
              type="number"
              name="num_classes"
              value={formData.num_classes}
              onChange={handleInputChange}
              min="1"
              placeholder="أدخل عدد الحصص"
              error={errors.num_classes}
            />
            <FormField
              label="عدد الساعات"
              type="number"
              name="num_hours"
              value={formData.num_hours}
              onChange={handleInputChange}
              min="1"
              placeholder="أدخل عدد الساعات"
              error={errors.num_hours}
            />
          </div>

          <div className="form-row">
            <FormField
              label="مدة العرض (بالأيام)"
              type="number"
              name="duration_days"
              value={formData.duration_days}
              onChange={handleInputChange}
              min="1"
              placeholder="أدخل مدة العرض بالأيام"
              required
              error={errors.duration_days}
            />
          </div>

          <FormField
            label="الأيام المتاحة"
            type="checkbox"
            name="available_days"
            value={formData.available_days}
            onChange={handleInputChange}
            options={getAvailableDaysForAcademy(formData.academy_id)}
            required
            error={errors.available_days}
          />

          <div className="pricing-section">
            <div className="pricing-inputs">
              <FormField
                label="سعر المشاة "
                type="number"
                name="price_infantry"
                value={formData.price_infantry}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                error={errors.price_infantry}
              />
              <FormField
                label="سعر أسلحة أخرى "
                type="number"
                name="price_other"
                value={formData.price_other}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                error={errors.price_other}
              />

              <FormField
                label="سعر المدنيين "
                type="number"
                name="price_civilian"
                value={formData.price_civilian}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                error={errors.price_civilian}
              />
            </div>
          </div>

          <FormField
            label="نشط"
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleInputChange}
            options={[{ value: true, label: 'هذا العرض نشط' }]}
          />

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setShowCreateModal(false)}
            >
              إلغاء
            </button>
            <button type="submit" className="btn btn--primary">
              إنشاء العرض
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Offer Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="تعديل العرض"
        size="extra-large"
      >
        <form onSubmit={handleSubmit} className="offer-form">
          {errors.general && <div className="form-error">{errors.general}</div>}

          <div className="form-row">
            <FormField
              label="الأكاديمية"
              type="select"
              name="academy_id"
              value={formData.academy_id}
              onChange={handleInputChange}
              options={academies.map((a) => ({ value: a.id, label: a.name }))}
              required
              error={errors.academy_id}
            />
            <FormField
              label="اسم العرض"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="أدخل اسم العرض"
              required
              error={errors.name}
            />
          </div>

          <div className="form-row">
            <FormField
              label="عدد الحصص"
              type="number"
              name="num_classes"
              value={formData.num_classes}
              onChange={handleInputChange}
              min="1"
              placeholder="أدخل عدد الحصص"
              error={errors.num_classes}
            />

            <FormField
              label="عدد الساعات"
              type="number"
              name="num_hours"
              value={formData.num_hours}
              onChange={handleInputChange}
              min="1"
              placeholder="أدخل عدد الساعات"
              error={errors.num_hours}
            />
          </div>

          <div className="form-row">
            <FormField
              label="مدة العرض (بالأيام)"
              type="number"
              name="duration_days"
              value={formData.duration_days}
              onChange={handleInputChange}
              min="1"
              placeholder="أدخل مدة العرض بالأيام"
              required
              error={errors.duration_days}
            />
          </div>

          <FormField
            label="الأيام المتاحة"
            type="checkbox"
            name="available_days"
            value={formData.available_days}
            onChange={handleInputChange}
            options={getAvailableDaysForAcademy(formData.academy_id)}
            required
            error={errors.available_days}
          />

          <div className="pricing-section">
            <div className="pricing-inputs">
              <FormField
                label="سعر المشاة "
                type="number"
                name="price_infantry"
                value={formData.price_infantry}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                error={errors.price_infantry}
              />
              <FormField
                label="سعر أسلحة أخرى "
                type="number"
                name="price_other"
                value={formData.price_other}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                error={errors.price_other}
              />
              <FormField
                label="سعر المدنيين "
                type="number"
                name="price_civilian"
                value={formData.price_civilian}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                error={errors.price_civilian}
              />
            </div>
          </div>

          <FormField
            label="نشط"
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleInputChange}
            options={[{ value: true, label: 'هذا العرض نشط' }]}
          />

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setShowEditModal(false)}
            >
              إلغاء
            </button>
            <button type="submit" className="btn btn--primary">
              تحديث العرض
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOffer(null);
        }}
        title="حذف العرض"
        size="small"
      >
        <div className="delete-confirmation">
          <p>
            هل أنت متأكد من حذف العرض <strong>{selectedOffer?.name}</strong>؟
          </p>
          <p className="warning-text">لا يمكن التراجع عن هذا الإجراء.</p>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedOffer(null);
              }}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={handleDelete}
            >
              حذف العرض
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OfferManagement;
