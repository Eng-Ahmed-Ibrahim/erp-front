import React, { useState, useEffect } from "react";
import {
  getAcademies,
  createAcademy,
  updateAcademy,
  deleteAcademy,
  getCoaches,
  createCoach,
  updateCoach,
  deleteCoach,
} from "../../../../apis/activitiesSubscriptions";
import FormField from "../../shared/FormField/FormField";
import Modal from "../../shared/Modal/Modal";
import DataTable from "../../shared/DataTable/DataTable";
import "./AcademyManagement.scss";
import { useAuth } from "../../../../context/AuthContext";

const AcademyManagement = () => {
  const { user } = useAuth();

  const [academies, setAcademies] = useState([]);
  const [filteredAcademies, setFilteredAcademies] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    contracted: false,
    revenue_share_infantry: 60,
    revenue_share_academy: 40,
    working_days: [],
    status: "active",
    coaches: [],
  });
  const [errors, setErrors] = useState({});

  const daysOfWeek = [
    { value: "Saturday", label: "السبت" },
    { value: "Sunday", label: "الأحد" },
    { value: "Monday", label: "الإثنين" },
    { value: "Tuesday", label: "الثلاثاء" },
    { value: "Wednesday", label: "الأربعاء" },
    { value: "Thursday", label: "الخميس" },
    { value: "Friday", label: "الجمعة" },
  ];

  const statusOptions = [
    { value: "active", label: "نشط" },
    { value: "inactive", label: "غير نشط" },
  ];

  useEffect(() => {
    loadAcademies();
  }, []);

  useEffect(() => {
    // Filter academies based on search query
    if (searchQuery.trim() === "") {
      setFilteredAcademies(academies);
    } else {
      const filtered = academies.filter((academy) =>
        academy.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAcademies(filtered);
    }
  }, [academies, searchQuery]);

  const loadAcademies = async () => {
    setLoading(true);
    try {
      const response = await getAcademies();
      setAcademies(response.data || []);
    } catch (error) {
      console.error("Error loading academies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "working_days") {
      // Handle working days checkbox array
      setFormData((prev) => ({
        ...prev,
        [name]: value, // value is already an array from FormField
      }));
    } else if (type === "checkbox") {
      // Handle single checkbox
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      // Handle other input types
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم الأكاديمية مطلوب";
    }

    if (
      Number(formData.revenue_share_infantry) +
        Number(formData.revenue_share_academy) !==
      100
    ) {
      newErrors.revenue_share_infantry =
        "يجب أن يكون مجموع النسب المئوية للإيرادات 100%";
      newErrors.revenue_share_academy =
        "يجب أن يكون مجموع النسب المئوية للإيرادات 100%";
    }

    if (formData.working_days.length === 0) {
      newErrors.working_days = "يجب اختيار يوم عمل واحد على الأقل";
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
      if (selectedAcademy) {
        const response = await updateAcademy(selectedAcademy.id, formData);
        if (response.success) {
          setShowEditModal(false);
          loadAcademies();
        }
      } else {
        const response = await createAcademy(formData);
        if (response.success) {
          setShowCreateModal(false);
          resetForm();
          loadAcademies();
        }
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || "حدث خطأ" });
      }
    }
  };

  const handleEdit = (academy) => {
    setSelectedAcademy(academy);
    setFormData({
      name: academy.name,
      contracted: academy.contracted,
      revenue_share_infantry: academy.revenue_share_infantry,
      revenue_share_academy: academy.revenue_share_academy,
      working_days: academy.working_days,
      status: academy.status,
    });
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteAcademy(selectedAcademy.id);
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedAcademy(null);
        loadAcademies();
      }
    } catch (error) {
      console.error("Error deleting academy:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      contracted: false,
      revenue_share_infantry: 60,
      revenue_share_academy: 40,
      working_days: [],
      status: "active",
    });
    setErrors({});
    setSelectedAcademy(null);
  };

  // Debug: Log formData changes
  React.useEffect(() => {
    console.log("formData changed:", formData);
  }, [formData]);

  const getStatusBadge = (status) => {
    const statusColors = {
      active: "status-badge--active",
      inactive: "status-badge--inactive",
    };

    const statusText = {
      active: "نشط",
      inactive: "غير نشط",
    };

    return (
      <span className={`status-badge ${statusColors[status] || ""}`}>
        {statusText[status] || status}
      </span>
    );
  };

  const getContractBadge = (contracted) => {
    return (
      <span
        className={`contract-badge ${
          contracted
            ? "contract-badge--contracted"
            : "contract-badge--not-contracted"
        }`}
      >
        {contracted ? "متعاقد" : "غير متعاقد"}
      </span>
    );
  };

  const formatWorkingDays = (workingDays) => {
    if (!Array.isArray(workingDays)) return "غير محدد";

    const dayNames = {
      Saturday: "السبت",
      Sunday: "الأحد",
      Monday: "الإثنين",
      Tuesday: "الثلاثاء",
      Wednesday: "الأربعاء",
      Thursday: "الخميس",
      Friday: "الجمعة",
    };

    const arabicDays = workingDays.map((day) => dayNames[day] || day);
    return arabicDays.join("، ");
  };

  // Coach management functions
  const addCoach = () => {
    setFormData((prev) => ({
      ...prev,
      coaches: [
        ...(prev.coaches || []),
        {
          name: "",
          phone: "",
          bio: "",
          active: true,
        },
      ],
    }));
  };

  const removeCoach = (index) => {
    setFormData((prev) => ({
      ...prev,
      coaches: (prev.coaches || []).filter((_, i) => i !== index),
    }));
  };

  const updateCoach = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      coaches: (prev.coaches || []).map((coach, i) =>
        i === index ? { ...coach, [field]: value } : coach
      ),
    }));
  };

  const columns = [
    {
      key: "id",
      header: "#",
    },
    {
      key: "name",
      header: "الاسم",
    },
    {
      key: "contracted",
      header: "حالة العقد",
      render: (value) => getContractBadge(value),
    },
    {
      key: "revenue_share_infantry",
      header: "حصة دار المشاة",
      render: (value) => `${value || 0}%`,
    },
    {
      key: "revenue_share_academy",
      header: "حصة الأكاديمية",
      render: (value) => `${value || 0}%`,
    },
    {
      key: "working_days",
      header: "أيام العمل",
      render: (value) => formatWorkingDays(value),
    },
    {
      key: "status",
      header: "الحالة",
      render: (value) => getStatusBadge(value),
    },
  ];

  const actions = (row) => (
    <div className="table-actions">
      {user?.permissions.some(
        (permission) => permission.name === "edit academy"
      ) && (
        <button
          className="action-btn action-btn--primary"
          onClick={() => handleEdit(row)}
          title="تعديل الأكاديمية"
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
        (permission) => permission.name === "remove academy"
      ) && (
        <button
          className="action-btn action-btn--danger"
          onClick={() => {
            setSelectedAcademy(row);
            setShowDeleteModal(true);
          }}
          title="حذف الأكاديمية"
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
    <div className="academy-management">
      <div className="page-header">
        <h1 className="page-title"> الأكاديميات</h1>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="البحث عن أكاديمية..."
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
          {user?.permissions.some(
            (permission) => permission.name === "add academy"
          ) && (
            <button
              className="add-btn"
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
            >
              إنشاء أكاديمية جديدة
            </button>
          )}
        </div>
      </div>

      <div className="content-section">
        <DataTable
          data={filteredAcademies}
          columns={columns}
          loading={loading}
          actions={actions}
          emptyMessage={
            searchQuery
              ? "لم يتم العثور على أكاديميات تطابق البحث"
              : "لم يتم العثور على أكاديميات"
          }
        />
      </div>

      {/* Create Academy Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="إنشاء أكاديمية جديدة"
        size="extra-large"
      >
        <form onSubmit={handleSubmit} className="academy-form">
          {errors.general && <div className="form-error">{errors.general}</div>}

          <FormField
            label="اسم الأكاديمية"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="أدخل اسم الأكاديمية"
            required
            error={errors.name}
          />

          <FormField
            label="متعاقد"
            type="checkbox"
            name="contracted"
            checked={formData.contracted}
            onChange={handleInputChange}
            options={[{ value: true, label: "هذه الأكاديمية متعاقدة" }]}
          />

          {formData.contracted && (
            <div className="revenue-share-section">
              <div className="revenue-inputs">
                <FormField
                  label="حصة دار المشاة (%)"
                  type="number"
                  name="revenue_share_infantry"
                  value={formData.revenue_share_infantry}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
                  error={errors.revenue_share_infantry}
                />
                <FormField
                  label="حصة الأكاديمية (%)"
                  type="number"
                  name="revenue_share_academy"
                  value={formData.revenue_share_academy}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
                  error={errors.revenue_share_academy}
                />
              </div>
              <div className="revenue-total">
                المجموع:{" "}
                {Number(formData.revenue_share_infantry) +
                  Number(formData.revenue_share_academy)}
                %
              </div>
            </div>
          )}

          <FormField
            label="أيام العمل"
            type="checkbox"
            name="working_days"
            value={formData.working_days}
            onChange={handleInputChange}
            options={daysOfWeek}
            required
            error={errors.working_days}
          />

          <FormField
            label="الحالة"
            type="select"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            options={statusOptions}
            required
          />

          {/* Coaches Section */}
          <div className="coaches-section">
            <div className="coaches-header">
              <h4>المدربين</h4>
              <button
                type="button"
                onClick={addCoach}
                className="add-coach-btn"
              >
                + إضافة مدرب
              </button>
            </div>

            {(formData.coaches || []).map((coach, index) => (
              <div key={index} className="coach-item">
                <div className="coach-header">
                  <h5>مدرب #{index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeCoach(index)}
                    className="remove-coach-btn"
                  >
                    حذف
                  </button>
                </div>

                <div className="coach-fields">
                  <FormField
                    label="اسم المدرب"
                    type="text"
                    name={`coach_${index}_name`}
                    value={coach.name}
                    onChange={(e) => updateCoach(index, "name", e.target.value)}
                    required
                  />

                  <FormField
                    label="رقم الهاتف"
                    type="text"
                    name={`coach_${index}_phone`}
                    value={coach.phone}
                    onChange={(e) =>
                      updateCoach(index, "phone", e.target.value)
                    }
                  />

                  <FormField
                    label="نبذة عن المدرب"
                    type="textarea"
                    name={`coach_${index}_bio`}
                    value={coach.bio}
                    onChange={(e) => updateCoach(index, "bio", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setShowCreateModal(false)}
            >
              إلغاء
            </button>
            <button type="submit" className="btn btn--primary">
              إنشاء الأكاديمية
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Academy Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="تعديل الأكاديمية"
        size="extra-large"
      >
        <form onSubmit={handleSubmit} className="academy-form">
          {errors.general && <div className="form-error">{errors.general}</div>}
          <FormField
            label="اسم الأكاديمية"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="أدخل اسم الأكاديمية"
            required
            error={errors.name}
          />
          <FormField
            label="متعاقد"
            type="checkbox"
            name="contracted"
            checked={formData.contracted}
            onChange={handleInputChange}
            options={[{ value: true, label: "هذه الأكاديمية متعاقدة" }]}
          />
          {formData.contracted && (
            <div className="revenue-share-section">
              <div className="revenue-inputs">
                <FormField
                  label="حصة دار المشاة (%)"
                  type="number"
                  name="revenue_share_infantry"
                  value={formData.revenue_share_infantry}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
                  error={errors.revenue_share_infantry}
                />
                <FormField
                  label="حصة الأكاديمية (%)"
                  type="number"
                  name="revenue_share_academy"
                  value={formData.revenue_share_academy}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
                  error={errors.revenue_share_academy}
                />
              </div>
              <div className="revenue-total">
                المجموع:{" "}
                {Number(formData.revenue_share_infantry) +
                  Number(formData.revenue_share_academy)}
                %
              </div>
            </div>
          )}
          <FormField
            label="أيام العمل"
            type="checkbox"
            name="working_days"
            value={formData.working_days}
            onChange={handleInputChange}
            options={daysOfWeek}
            required
            error={errors.working_days}
          />
          <FormField
            label="الحالة"
            type="select"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            options={statusOptions}
            required
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
              تحديث الأكاديمية
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAcademy(null);
        }}
        title="حذف الأكاديمية"
        size="large"
      >
        <div className="delete-confirmation">
          <p>
            هل أنت متأكد من حذف الأكاديمية{" "}
            <strong>{selectedAcademy?.name}</strong>؟
          </p>
          <p className="warning-text">لا يمكن التراجع عن هذا الإجراء.</p>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedAcademy(null);
              }}
            >
              إلغاء
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={handleDelete}
            >
              حذف الأكاديمية
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AcademyManagement;
