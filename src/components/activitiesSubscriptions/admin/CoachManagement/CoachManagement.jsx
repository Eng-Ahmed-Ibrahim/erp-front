import React, { useState, useEffect } from "react";
import {
  getCoaches,
  createCoach,
  updateCoach,
  deleteCoach,
  getAcademies,
} from "../../../../apis/activitiesSubscriptions";
import Modal from "../../shared/Modal/Modal";
import "./CoachManagement.scss";
import { useAuth } from "../../../../context/AuthContext";

const CoachManagement = () => {
  const [coaches, setCoaches] = useState([]);
  const { user } = useAuth();

  const [academies, setAcademies] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [academyFilter, setAcademyFilter] = useState("");

  const [formData, setFormData] = useState({
    academy_id: "",
    name: "",
    phone: "",
    bio: "",
    active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Filter coaches based on search query and academy filter
  useEffect(() => {
    let filtered = coaches;

    // Filter by academy
    if (academyFilter) {
      filtered = filtered.filter((coach) => coach.academy_id == academyFilter);
    }

    // Filter by search query (coach name)
    if (searchQuery.trim()) {
      filtered = filtered.filter((coach) =>
        coach.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCoaches(filtered);
  }, [coaches, searchQuery, academyFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coachesResponse, academiesResponse] = await Promise.all([
        getCoaches(),
        getAcademies(),
      ]);

      if (coachesResponse.success) {
        setCoaches(coachesResponse.data);
      }

      if (academiesResponse.success) {
        setAcademies(academiesResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrors({ general: "حدث خطأ في تحميل البيانات" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAcademyFilterChange = (e) => {
    setAcademyFilter(e.target.value);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.academy_id) {
      newErrors.academy_id = "الأكاديمية مطلوبة";
    }

    if (!formData.name.trim()) {
      newErrors.name = "اسم المدرب مطلوب";
    }

    if (formData.phone && !/^[0-9+\-\s]+$/.test(formData.phone)) {
      newErrors.phone = "رقم الهاتف غير صحيح";
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
      const coachData = {
        academy_id: parseInt(formData.academy_id),
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        bio: formData.bio.trim() || null,
        active: formData.active,
      };

      let response;
      if (editingCoach) {
        response = await updateCoach(editingCoach.id, coachData);
      } else {
        response = await createCoach(coachData);
      }

      if (response.success) {
        setSuccess(
          editingCoach ? "تم تحديث المدرب بنجاح" : "تم إنشاء المدرب بنجاح"
        );
        setIsModalOpen(false);
        setEditingCoach(null);
        resetForm();
        fetchData();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setErrors({ general: response.message || "حدث خطأ في العملية" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ general: "حدث خطأ في العملية" });
    }
  };

  const handleEdit = (coach) => {
    setEditingCoach(coach);
    setFormData({
      academy_id: coach.academy_id.toString(),
      name: coach.name,
      phone: coach.phone || "",
      bio: coach.bio || "",
      active: coach.active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (coachId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المدرب؟")) {
      return;
    }

    try {
      const response = await deleteCoach(coachId);
      if (response.success) {
        setSuccess("تم حذف المدرب بنجاح");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setErrors({ general: response.message || "حدث خطأ في الحذف" });
      }
    } catch (error) {
      console.error("Error deleting coach:", error);
      setErrors({ general: "حدث خطأ في الحذف" });
    }
  };

  const resetForm = () => {
    setFormData({
      academy_id: "",
      name: "",
      phone: "",
      bio: "",
      active: true,
    });
    setErrors({});
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCoach(null);
    resetForm();
  };

  const getAcademyName = (academyId) => {
    const academy = academies.find((a) => a.id === academyId);
    return academy ? academy.name : "غير محدد";
  };

  const columns = [
    { key: "id", label: "المعرف" },
    { key: "name", label: "اسم المدرب" },
    { key: "academy", label: "الأكاديمية" },
    { key: "phone", label: "رقم الهاتف" },
    { key: "active", label: "الحالة" },
    { key: "actions", label: "الإجراءات" },
  ];

  if (loading) {
    return (
      <div className="coach-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="coach-management">
      <div className="coach-management__header">
        <h2> المدربين</h2>
        <div className="header-actions">
          <div className="filters-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="البحث عن مدرب..."
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
            (permission) => permission.name === "add academy coach"
          ) && (
              <button className="add-btn" onClick={() => setIsModalOpen(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                إضافة مدرب جديد
              </button>
            )}
        </div>
      </div>

      {success && (
        <div className="success-notification">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {success}
        </div>
      )}

      {errors.general && (
        <div className="form-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {errors.general}
        </div>
      )}

      <div className="coach-management__content">
        {filteredCoaches.length === 0 ? (
          <div className="data-table data-table--empty">
            <div className="data-table__empty">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                className="data-table__empty-icon"
              >
                <path
                  d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="data-table__empty-message">
                {searchQuery || academyFilter
                  ? "لم يتم العثور على مدربين تطابق البحث"
                  : "لا توجد مدربين مسجلين"}
              </p>
            </div>
          </div>
        ) : (
          <div className="data-table">
            <div className="data-table__container">
              <table className="data-table__table">
                <thead className="data-table__header">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key} className="data-table__header-cell">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="data-table__body">
                  {filteredCoaches.map((coach) => (
                    <tr key={coach.id} className="data-table__row">
                      <td className="data-table__cell">{coach.id}</td>
                      <td className="data-table__cell">
                        <div className="coach-info">
                          <strong>{coach.name}</strong>
                          {coach.bio && (
                            <span className="coach-bio">{coach.bio}</span>
                          )}
                        </div>
                      </td>
                      <td className="data-table__cell">
                        {getAcademyName(coach.academy_id)}
                      </td>
                      <td className="data-table__cell">
                        {coach.phone || "غير محدد"}
                      </td>
                      <td className="data-table__cell">
                        <span
                          className={`status-badge status-badge--${coach.active ? "active" : "inactive"
                            }`}
                        >
                          {coach.active ? "نشط" : "غير نشط"}
                        </span>
                      </td>
                      <td className="data-table__cell data-table__cell--actions">
                        <div className="action-buttons">
                          {user?.permissions.some(
                            (permission) =>
                              permission.name ===
                              "edit academy coach"
                          ) && (
                              <>
                                {" "}
                                <button
                                  className="action-btn action-btn--primary"
                                  onClick={() => handleEdit(coach)}
                                  title="تعديل"
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <path
                                      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                                <button
                                  className="action-btn action-btn--danger"
                                  onClick={() => handleDelete(coach.id)}
                                  title="حذف"
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <path
                                      d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingCoach ? "تعديل المدرب" : "إضافة مدرب جديد"}
        size="extra-large"
      >
        <form onSubmit={handleSubmit} className="coach-form">
          <div className="form-section">
            <div className="form-field">
              <label htmlFor="academy_id">الأكاديمية *</label>
              <select
                id="academy_id"
                name="academy_id"
                value={formData.academy_id}
                onChange={handleInputChange}
                className={errors.academy_id ? "error" : ""}
              >
                <option value="">اختر الأكاديمية</option>
                {academies.map((academy) => (
                  <option key={academy.id} value={academy.id}>
                    {academy.name}
                  </option>
                ))}
              </select>
              {errors.academy_id && (
                <span className="error-message">{errors.academy_id}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="name">اسم المدرب *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "error" : ""}
                placeholder="أدخل اسم المدرب"
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="phone">رقم الهاتف</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? "error" : ""}
                placeholder="أدخل رقم الهاتف"
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="bio">نبذة عن المدرب</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="3"
                placeholder="أدخل نبذة عن المدرب"
              />
            </div>

            <div className="form-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                نشط
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleModalClose}
            >
              إلغاء
            </button>
            <button type="submit" className="btn btn--primary">
              {editingCoach ? "تحديث" : "إنشاء"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CoachManagement;
