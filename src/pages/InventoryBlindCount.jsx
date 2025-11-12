import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Button,
  Divider,
  Empty,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import {
  DownloadOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  downloadBlindCountPdf,
  getAllWaiters,
  getBlindCountItems,
  submitBlindCount,
} from "../apis/apis/inventories";
import { useAuth } from "../context/AuthContext";
import useCashiers from "../lib/services/hooks/useCashier.jsx";

const { Title, Text } = Typography;

const InventoryBlindCount = () => {
  const { user } = useAuth();
  const departmentId = user?.department?.id;
  const tableRef = useRef();

  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [items, setItems] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [quantities, setQuantities] = useState({});

  const [waiterOldId, setWaiterOldId] = useState(null);
  const [waiterNewId, setWaiterNewId] = useState(null);
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [resultModal, setResultModal] = useState({
    open: false,
    data: null,
  });

  const { data: cashiersData } = useCashiers();

  useEffect(() => {
    const fetchWaiters = async () => {
      try {
        const response = await getAllWaiters();
        const waiterList = Array.isArray(response?.waiters)
          ? response.waiters
          : response;
        setWaiters(waiterList ?? []);
      } catch (error) {
        // handled in api helper
      }
    };

    fetchWaiters();
  }, []);

  const fetchItems = async () => {
    if (!departmentId) return;
    setIsLoadingItems(true);
    try {
      const response = await getBlindCountItems({
        departmentId,
        search: searchTerm || undefined,
      });

      const itemList = Array.isArray(response?.items)
        ? response.items
        : response;

      setItems(itemList ?? []);
      setQuantities({});
    } catch (error) {
      // handled in api helper
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    if (departmentId) {
      fetchItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  const departmentHead = useMemo(() => {
    if (!departmentId || !Array.isArray(cashiersData)) {
      return null;
    }

    const departmentCashiers = cashiersData.filter((cashier) => {
      return (
        cashier?.department_id === departmentId ||
        cashier?.department?.id === departmentId
      );
    });

    if (!departmentCashiers.length) {
      return null;
    }

    const headKeywords = ["head", "رئيس", "مسؤول", "manager"];
    const preferred = departmentCashiers.find((cashier) => {
      const label = `${cashier?.role_name ?? cashier?.job_title ?? ""}`.toLowerCase();
      return headKeywords.some((keyword) => label.includes(keyword));
    });

    return preferred ?? departmentCashiers[0];
  }, [cashiersData, departmentId]);

  const sortedItems = useMemo(() => {
    if (!items || items.length === 0) return [];

    return [...items].sort((a, b) => {
      // First sort by parent category (if available)
      const parentA = a.category?.parent || a.category || "";
      const parentB = b.category?.parent || b.category || "";

      const parentComparison = parentA.localeCompare(
        parentB,
        "ar",
        { sensitivity: "base" }
      );

      if (parentComparison !== 0) return parentComparison;

      // Then sort by item name
      return (a.name || "").localeCompare(b.name || "", "ar", { sensitivity: "base" });
    });
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) {
      return sortedItems;
    }

    return sortedItems.filter((item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedItems, searchTerm]);

  const handleQuantityChange = (departmentStoreId, value) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (value === null || value === undefined || value === "") {
        delete next[departmentStoreId];
      } else {
        // Convert string to number for consistent handling
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        if (!isNaN(numericValue)) {
          next[departmentStoreId] = numericValue;
        } else {
          delete next[departmentStoreId];
        }
      }
      return next;
    });
  };

  const selectedItems = useMemo(() => {
    return Object.entries(quantities)
      .filter(([_, value]) => value !== null && value !== undefined && value !== "")
      .map(([departmentStoreId, value]) => ({
        department_store_id: departmentStoreId,
        actual_quantity: Number(value),
      }));
  }, [quantities]);

  const handleSubmit = async () => {
    if (!departmentId) {
      return;
    }

    if (!waiterOldId || !waiterNewId) {
      Modal.warning({
        title: "برجاء اختيار الويتر",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center", fontFamily: "Cairo, sans-serif" }}>
            يجب اختيار ويتر الشفت السابق والجديد قبل حفظ الجرد.
          </div>
        ),
        centered: true,
        width: 600,
      });
      return;
    }

    if (waiterOldId === waiterNewId) {
      Modal.warning({
        title: "اختيارات غير صحيحة",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center", fontFamily: "Cairo, sans-serif" }}>
            لا يمكن اختيار نفس الويتر للشفتين.
          </div>
        ),
        centered: true,
        width: 600,
      });
      return;
    }

    if (selectedItems.length === 0) {
      Modal.info({
        title: "لا توجد قيم مدخلة",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center", fontFamily: "Cairo, sans-serif" }}>
            من فضلك أدخل الكميات الفعلية للأصناف التي ترغب في مراجعتها.
          </div>
        ),
        centered: true,
        width: 600,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        department_id: departmentId,
        waiter_old_id: waiterOldId,
        waiter_new_id: waiterNewId,
        notes: notes || undefined,
        items: selectedItems,
      };

      const response = await submitBlindCount(payload);
      
      const modal = Modal.success({
        title: "نجاح",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center", fontFamily: "Cairo, sans-serif" }}>
            تم حفظ الجرد بنجاح
          </div>
        ),
        centered: true,
        width: 600,
      });

      setTimeout(() => {
        modal.destroy();
        setResultModal({
          open: true,
          data: response,
        });
      }, 2000);

      setQuantities({});
      setNotes("");
      setWaiterOldId(null);
      setWaiterNewId(null);
      fetchItems();
    } catch (error) {
      // errors handled in helper
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setQuantities({});
    setNotes("");
    setWaiterOldId(null);
    setWaiterNewId(null);
  };

  const handleDownloadPdf = async () => {
    if (!resultModal.data?.id) return;
    setIsDownloading(true);
    try {
      const response = await downloadBlindCountPdf(resultModal.data.id);
      const blob =
        response instanceof Blob ? response : new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventory-blind-count-${resultModal.data.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // handled in helper
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      <h2 className="heading text-center">
        جرد مخزون <span className="text-danger">{user?.department?.name}</span> 
      </h2>
      <main>
        <div id="invoice-container">
          <div className="mb-3">
            <div style={{ display: "flex", alignItems: "center", gap: "50px" }}>
              <div style={{ width: "30%" }}>
                <label htmlFor="waiterOld" className="form-label">
                  ويتر الشفت السابق
                </label>
                <select
                  id="waiterOld"
                  className="form-select"
                  value={waiterOldId || ""}
                  onChange={(e) => setWaiterOldId(e.target.value)}
                >
                  <option value="">اختر الويتر</option>
                  {waiters.map((waiter) => (
                    <option key={waiter.id} value={waiter.id}>
                      {waiter.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ width: "30%" }}>
                <label htmlFor="waiterNew" className="form-label">
                  ويتر الشفت الحالي
                </label>
                <select
                  id="waiterNew"
                  className="form-select"
                  value={waiterNewId || ""}
                  onChange={(e) => setWaiterNewId(e.target.value)}
                >
                  <option value="">اختر الويتر</option>
                  {waiters.map((waiter) => (
                    <option key={waiter.id} value={waiter.id}>
                      {waiter.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ width: "30%" }}>
                <label htmlFor="searchTerm" className="form-label">
                  ابحث بالاسم
                </label>
                <input
                  id="searchTerm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  type="text"
                  placeholder="إبحث بالإسم"
                  value={searchTerm}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
              <button onClick={fetchItems} className="pdf-button">
                فلترة
              </button>
              <button
                onClick={handleSubmit}
                className="pdf-button"
                disabled={
                  selectedItems.length === 0 ||
                  !waiterOldId ||
                  !waiterNewId ||
                  waiterOldId === waiterNewId
                }
                style={{
                  opacity:
                    isSubmitting ||
                    selectedItems.length === 0 ||
                    !waiterOldId ||
                    !waiterNewId ||
                    waiterOldId === waiterNewId
                      ? 0.5
                      : 1,
                  cursor:
                    isSubmitting ||
                    selectedItems.length === 0 ||
                    !waiterOldId ||
                    !waiterNewId ||
                    waiterOldId === waiterNewId
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isSubmitting ? "جاري الحفظ..." : "حفظ الجرد"}
              </button>
            </div>
          </div>

          <div
            className="invoice-items"
            style={{
              height: "100vh",
              overflow: "hidden",
              padding: "20px",
              backgroundColor: "#f8f9fa",
            }}
          >
            <div
              style={{
                height: "calc(100vh - 40px)",
                overflow: "auto",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e9ecef",
                position: "relative",
              }}
            >
              <table
                ref={tableRef}
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                  margin: 0,
                }}
              >
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  <tr>
                    <th
                      colSpan="5"
                      className="text-center"
                      style={{ padding: "10px" }}
                    >
                      <div>
                        <span>جرد مخزون {user?.department?.name}</span>
                        <span> || </span>
                        <span>الكاشير: {user?.name}</span>
                      </div>
                    </th>
                  </tr>
                  <tr>
                    <th
                      colSpan="5"
                      className="text-center"
                      style={{ padding: "10px" }}
                    >
                      <div>
                        <span className="fs-5 fw-bold">
                          {new Date().toLocaleDateString()} -{" "}
                          {new Date().toLocaleTimeString()}
                        </span>
                        <span> || </span>
                        <span>عدد الأصناف: {filteredItems.length}</span>
                        <span> || </span>
                        <span>تم تسجيل: {selectedItems.length} صنف</span>
                      </div>
                    </th>
                  </tr>
                  <tr
                    style={{
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                      borderBottom: "3px solid #007bff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    <th
                      className="text-center"
                      style={{
                        padding: "15px 8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      #
                    </th>
                    <th
                      className="text-center"
                      style={{
                        padding: "15px 8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      اسم الصنف
                    </th>
                    <th
                      className="text-center"
                      style={{
                        padding: "15px 8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      التصنيف
                    </th>
                    <th
                      className="text-center"
                      style={{
                        padding: "15px 8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      الوحدة
                    </th>
                    <th
                      className="text-center"
                      style={{
                        padding: "15px 8px",
                        fontWeight: "bold",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      الكمية الفعلية
                    </th>
                  </tr>
                </thead>
                <tbody style={{ verticalAlign: "top" }}>
                  {isLoadingItems ? (
                    <tr>
                      <td className="text-center fw-bold fs-4" colSpan="5">
                        <Spin size="large" />
                      </td>
                    </tr>
                  ) : filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => {
                      const value = quantities[item.department_store_id];
                      const isActive =
                        value !== undefined && value !== null && value !== "";

                      return (
                        <tr
                          className="fw-bold fs-4"
                          key={item.department_store_id || item.id || index}
                          style={{
                            cursor: "pointer",
                            backgroundColor: isActive
                              ? "#e3f2fd"
                              : index % 2 === 0
                              ? "#ffffff"
                              : "#f8f9fa",
                            transition: "background-color 0.2s ease",
                            borderBottom: "1px solid #e9ecef",
                            height: "60px",
                            maxHeight: "60px",
                          }}
                          onMouseEnter={(e) =>
                            !isActive &&
                            (e.target.closest("tr").style.backgroundColor =
                              "#e3f2fd")
                          }
                          onMouseLeave={(e) =>
                            !isActive &&
                            (e.target.closest("tr").style.backgroundColor =
                              index % 2 === 0 ? "#ffffff" : "#f8f9fa")
                          }
                        >
                          <td
                            className="text-center"
                            style={{ 
                              padding: "12px 8px", 
                              height: "60px",
                              maxHeight: "60px",
                              overflow: "hidden",
                              verticalAlign: "middle"
                            }}
                          >
                            {index + 1}
                          </td>
                          <td
                            className="text-right"
                            style={{ 
                              padding: "12px 8px", 
                              height: "60px",
                              maxHeight: "60px",
                              overflow: "hidden",
                              verticalAlign: "middle"
                            }}
                          >
                            {item.name}
                          </td>
                          <td
                            className="text-center"
                            style={{ 
                              padding: "12px 8px", 
                              height: "60px",
                              maxHeight: "60px",
                              overflow: "hidden",
                              verticalAlign: "middle"
                            }}
                          >
                            {item.category ?? "غير محدد"}
                          </td>
                          <td
                            className="text-center"
                            style={{ 
                              padding: "12px 8px", 
                              height: "60px",
                              maxHeight: "60px",
                              overflow: "hidden",
                              verticalAlign: "middle"
                            }}
                          >
                            {item.unit ?? "غير محدد"}
                          </td>
                          <td
                            className="text-right"
                            style={{ 
                              height: "60px",
                              maxHeight: "60px",
                              overflow: "hidden",
                              verticalAlign: "middle",
                              padding: "10px 8px"
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="form-control form-control-sm"
                              style={{
                                fontSize: "20px",
                                fontWeight: "600",
                                height: "40px",
                              }}
                              value={value ?? ""}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.department_store_id,
                                  e.target.value
                                )
                              }
                              placeholder="أدخل الكمية"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="text-center fw-bold fs-4" colSpan="5">
                        لا توجد أصناف متاحة للجرد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Modal
        open={resultModal.open}
        onCancel={() => setResultModal({ open: false, data: null })}
        footer={null}
        width={900}
        centered
        destroyOnHidden
      >
        <div
          style={{
            padding: "20px 12px",
            border: "1px solid #E4C59E",
            color: "#803D3B",
            borderRadius: "15px",
            fontSize: "20px",
            fontFamily: "Cairo, sans-serif",
          }}
        >
          <h3
            style={{
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "28px",
              fontFamily: "Cairo, sans-serif",
              color: "#803D3B",
            }}
          >
            تفاصيل الجرد
          </h3>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "15px",
              fontSize: "22px",
            }}
          >
            <div>
              <strong>القسم:</strong> {resultModal.data?.department?.name}
            </div>
            <div>
              <strong>التاريخ:</strong> {resultModal.data?.submitted_at}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "15px",
              fontSize: "22px",
            }}
          >
            <div>
              <strong>إجمالي الأصناف:</strong> {resultModal.data?.items_count}
            </div>
            <div>
              <strong>كمية العجز:</strong>{" "}
              {Number(resultModal.data?.total_under_quantity ?? 0).toFixed(3)}
            </div>
            <div>
              <strong>كمية الزيادة:</strong>{" "}
              {Number(resultModal.data?.total_over_quantity ?? 0).toFixed(3)}
            </div>
          </div>

          <div
            style={{
              background: "rgba(239, 6, 6, 0.1)",
              padding: "15px",
              borderRadius: "12px",
              marginBottom: "20px",
              textAlign: "center",
              fontSize: "24px",
            }}
          >
            <strong>إجمالي الغرامة:</strong>{" "}
            <strong style={{ color: "#ef0606" }}>
              {Number(resultModal.data?.total_fine_amount ?? 0).toFixed(2)} ج.م
            </strong>
          </div>

          <hr style={{ margin: "20px 0" }} />

          <h4
            style={{
              marginBottom: "15px",
              fontSize: "24px",
              fontFamily: "Cairo, sans-serif",
              color: "#803D3B",
            }}
          >
            تفاصيل الأصناف
          </h4>

          <div
            style={{
              border: "1px solid #E4C59E",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "Cairo, sans-serif",
              }}
            >
              <thead
                style={{
                  background: "linear-gradient(135deg, #fff7f2 0%, #f8f0e9 100%)",
                }}
              >
                <tr>
                  <th
                    style={{
                      padding: "12px",
                      fontWeight: "bold",
                      fontSize: "20px",
                      color: "#803D3B",
                    }}
                  >
                    الصنف
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      fontWeight: "bold",
                      fontSize: "20px",
                      color: "#803D3B",
                    }}
                  >
                    الفرق
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      fontWeight: "bold",
                      fontSize: "20px",
                      color: "#803D3B",
                    }}
                  >
                    الحالة
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      fontWeight: "bold",
                      fontSize: "20px",
                      color: "#803D3B",
                    }}
                  >
                    الغرامة
                  </th>
                </tr>
              </thead>
              <tbody>
                {resultModal.data?.items?.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                      backgroundColor: index % 2 === 0 ? "#fff" : "#f8f9fa",
                    }}
                  >
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        fontSize: "18px",
                        color: "#803D3B",
                      }}
                    >
                      {item.recipe_name}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        fontSize: "18px",
                        color: "#803D3B",
                      }}
                    >
                      {Math.abs(item.variance_quantity).toFixed(3)}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        fontSize: "18px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "999px",
                          padding: "4px 12px",
                          fontWeight: "700",
                          fontSize: "16px",
                          backgroundColor:
                            item.variance_type === "under"
                              ? "rgba(239, 6, 6, 0.15)"
                              : "rgba(76, 225, 63, 0.2)",
                          color:
                            item.variance_type === "under" ? "#ef0606" : "#2a8c23",
                        }}
                      >
                        {item.variance_type === "under" ? "عجز" : "زيادة"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        fontSize: "18px",
                        color: "#803D3B",
                      }}
                    >
                      {Number(item.fine_amount).toFixed(2)} ج.م
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "15px",
              marginTop: "20px",
            }}
          >
            <button
              onClick={() => setResultModal({ open: false, data: null })}
              className="pdf-button"
              style={{ background: "#6c757d" }}
            >
              إغلاق
            </button>
            <button
              onClick={handleDownloadPdf}
              className="pdf-button"
              disabled={isDownloading}
            >
              {isDownloading ? "جاري التحميل..." : "تحميل PDF"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryBlindCount;

