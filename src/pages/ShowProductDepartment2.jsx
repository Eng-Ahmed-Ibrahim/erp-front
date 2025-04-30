import { useEffect, useState, useRef } from "react";
import { API_ENDPOINT } from "../../config";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { message, Modal } from "antd";
import LogoDAR from "../../public/assets/images/Dar_logo.svg";
import { usePDF } from "react-to-pdf";
import { useMemo } from "react";
import generatePDF, { Resolution, Margin } from "react-to-pdf";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "../context/AuthContext";
import "../fonts/Amiri-Regular-normal.js";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

const ShowProductDepartment2 = () => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const item = useLocation()?.state?.item;
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [newCosts, setNewCosts] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [error, setError] = useState(null);
  const { toPDF, targetRef } = usePDF({ filename: "page.pdf" });
  const [searchTerm, setSearchTerm] = useState("");
  const [value, setValue] = useState("");
  const [mainCat, setMainCat] = useState("");
  const [sum, setSum] = useState(0);
  const { user } = useAuth();

  const [newPrices, setNewPrices] = useState({});

  const imageurl = "/assets/images/store.png";
  const [recipeCategoryParents, setRecipeCategoryParents] = useState([]);
  const [recipeCategories, setRecipeCategories] = useState([]);
  const [selectedRecipeCategory, setSelectedRecipeCategory] = useState([]);
  const [base64Image, setBase64Image] = useState("");
  const tableRef = useRef();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [actualQuantities, setActualQuantities] = useState({});

  useEffect(() => {
    const fetchRecipeCategories = async (value) => {
      if (!value) return;
      try {
        const response = await fetch(
          `${API_ENDPOINT}/api/v1/store/recipe_category?category_id=${value}`,
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        );
        const data = await response.json();
        setRecipeCategories(data.data);
      } catch (error) {
        console.error("Error fetching recipe category parents:", error);
      }
    };

    fetchRecipeCategories(value);
  }, [value]);

  useEffect(() => {
    if (user.department.type == "master") {
      setIsAdmin(true);
    }

    const fetchRecipeCategoryParents = async () => {
      try {
        const response = await fetch(
          `${API_ENDPOINT}/api/v1/store/recipe_category_parent/all`,
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        );
        const data = await response.json();
        setRecipeCategoryParents(data.data);
      } catch (error) {
        console.error("Error fetching recipe category parents:", error);
      }
    };

    const fetchImage = async () => {
      const response = await fetch(imageurl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
      };
      reader.readAsDataURL(blob);
    };

    fetchImage();
    fetchRecipeCategoryParents();
  }, [imageurl]);

  const fetchData = (parentId, category) => {
    axios
      .get(`${API_ENDPOINT}/api/v1/store/department-recipe-search`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
        params: {
          data: {
            parent_id: parentId,
            department_id: item?.id,
            category_id: category,
          },
        },
      })
      .then((res) => {
        setData(res?.data?.data);
        setIsDataFetched(true);
        const modal = Modal.success({
          title: "success",
          content: (
            <div style={{ fontSize: "24px", textAlign: "center" }}>
              تم عرض المواد الخام بنجاح
            </div>
          ),
          centered: true,
          width: 400,
        });

        setTimeout(() => {
          modal.destroy();
        }, 2000);
      })
      .catch((err) => {
        setError("Failed to load data");
        const modal = Modal.error({
          title: "success",
          content: (
            <div style={{ fontSize: "24px", textAlign: "center" }}>
              {" "}
              حدث خطا ما
            </div>
          ),
          centered: true,
          width: 400,
        });

        setTimeout(() => {
          modal.destroy();
        }, 4000);
        console.log(err);
      });
  };

  useEffect(() => {
    if (!item?.id) return;
    fetchData(value, selectedRecipeCategory);
  }, [item?.id]);

  const sortedDepartmentStore = useMemo(() => {
    if (!data?.department_store) return [];

    const sortedItems = Object.values(data.department_store)
      .flat()
      .sort((a, b) => {
        const parentComparison = a.recipe_category?.parent.localeCompare(
          b.recipe_category?.parent,
          "ar",
          { sensitivity: "base" }
        );
        if (parentComparison !== 0) return parentComparison;
        return a.name.localeCompare(b.name, "ar", { sensitivity: "base" });
      });
    // console.log('soeterere', sortedItems)
    return sortedItems;
  }, [data]);

  const handleSubmit = () => {
    fetchData(value, selectedRecipeCategory);
  };
  useEffect(() => {
    if (sortedDepartmentStore.length > 0) {
      const filtered = sortedDepartmentStore.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, sortedDepartmentStore]);

  const calculateSum = useMemo(() => {
    if (!sortedDepartmentStore.length) return 0;
    return sortedDepartmentStore
      .reduce((total, item, index) => {
        const itemCost = newCosts[index] || item.price;
        return total + itemCost;
      }, 0)
      .toFixed(4);
  }, [sortedDepartmentStore, newCosts]);

  useEffect(() => {
    setSum(calculateSum);
  }, [calculateSum]);

  const handleCheckboxChange = (itemId) => {
    setSelectedRows((prevSelectedRows) => {
      const newSelectedRows = new Set(prevSelectedRows);
      if (newSelectedRows.has(itemId)) {
        newSelectedRows.delete(itemId);
      } else {
        newSelectedRows.add(itemId);
      }
      return newSelectedRows;
    });
  };

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      const allFilteredIds = filteredData.map(
        (item) => item.department_store_id
      );
      setSelectedRows(new Set(allFilteredIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleEliminateOverQuantity = async () => {
    const localToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const selectedIdsArray = Array.from(selectedRows);

    if (selectedIdsArray.length === 0) {
      message.warning("يرجى تحديد صف واحد على الأقل أولاً.", 3);
      return;
    }

    Modal.confirm({
      title: "تأكيد الحذف",
      content: `هل أنت متأكد من حذف الكميات الإضافية للعناصر المحددة (${selectedIdsArray.length})؟`,
      okText: " حذف",
      cancelText: "إلغاء",
      width:"800",
      height:"600",
      centered: true,
      fontSize:"20px",
      onOk: async () => {
        try {
          const response = await axios.post(
            `${API_ENDPOINT}/api/v1/store/department/eliminate-over-quantity`,
            {
              department_store_ids: selectedIdsArray,
            },
            {
              headers: {
                Authorization: `Bearer ${localToken}`,
              },
            }
          );

          if (response.status === 200 || response.data?.status === "success") {
            Modal.success({
              title: "نجاح",
              content: "تم حذف الكميات الإضافية بنجاح.",
              centered: true,
              width: 600,
              onOk: () => {
                setSelectedRows(new Set());
                fetchData(value, selectedRecipeCategory);
              },
            });
            setTimeout(() => {
              Modal.destroyAll();
              setSelectedRows(new Set());
              fetchData(value, selectedRecipeCategory);
            }, 2000);
          } else {
            throw new Error(
              response.data?.message || "فشل في حذف الكميات الإضافية"
            );
          }
        } catch (error) {
          console.error("Error eliminating over quantity:", error);
          Modal.error({
            title: "خطأ",
            content: `حدث خطأ: ${error.message || "يرجى المحاولة مرة أخرى."}`,
            centered: true,
            width: 400,
          });
          setTimeout(Modal.destroyAll, 4000);
        }
      },
      onCancel() {
        console.log("Elimination cancelled");
      },
    });
  };

  const ItemDetailsModal = ({ visible, onHide, item }) => {
    if (!item) return null;
    return (
      <Modal
        visible={visible}
        title="تفاصيل فواتيرالمكون "
        // open={show}
        onOk={onHide}
        onCancel={onHide}
        width={1200}
        centered
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            alignItems: "start",
          }}
        ></div>
        <table
          className="table table-hover mt-5"
          style={{ fontSize: "24px" }}
          ref={tableRef}
        >
          <thead>
            <tr>
              <th scope="col">كود الفاتورة</th>
              <th scope="col">تاريخ الفاتورة</th>
              <th scope="col">اسم المنتج</th>
              <th scope="col">الكمية </th>
              <th scope="col">سعر الوحده </th>
              <th scope="col">اجمالي السعر</th>
              <th scope="col"> المتبقى</th>
            </tr>
          </thead>
          <tbody>
            {item.invoices && item.invoices.length > 0 ? (
              item.invoices.map((invoice, index) => (
                <tr key={invoice.id}>
                  <td>{invoice.code}</td>
                  <td>{invoice.invoice_date}</td>
                  <td>{item.name}</td>
                  <td> {invoice.pivot.quantity} </td>
                  <td>{invoice.pivot.price}</td>
                  <td>{invoice.pivot.total_price}</td>
                  <td>{invoice.remaining ?? 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  لا توجد فواتير لهذا المكون.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Modal>
    );
  };

  const handleActualQuantityChange = (itemId, value) => {
    console.log("itititititi", itemId, value);
    const numericValue = value === "" ? "" : Number(value);

    if (value !== "" && (isNaN(numericValue) || numericValue < 0)) {
      console.warn(`Invalid input for item ${itemId}: ${value}`);
      return;
    }

    setActualQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemId]: numericValue,
    }));
  };

  const handleSubmitActualQuantities = async () => {
    const localToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const changedItems = Object.entries(actualQuantities)
      .filter(([itemId, value]) => value !== "")
      .map(([itemId, value]) => ({
        id: itemId,
        actual_quantity: Number(value),
      }));

    if (changedItems.length === 0) {
      message.error("لم يتم إجراء أي تغييرات للحفظ.", 3);
      return;
    }
    Modal.confirm({
      title: "تأكيد الحفظ",
      content: `سيتم تحديث الكميات الفعلية لـ ${changedItems.length} عنصر. هل تريد المتابعة؟`,
      okText: "نعم، حفظ",
      cancelText: "إلغاء",
      centered: true,
      width:"800",
      height:"600",
      onOk: async () => {
        try {
          const response = await axios.post(
            `${API_ENDPOINT}/api/v1/store/department/update-actual-quantities`,
            {
              items: changedItems,
              department_id : department_id
            },
            {
              headers: {
                Authorization: `Bearer ${localToken}`,
              },
            }
          );
          if (response.status === 200 || response.data?.status === "success") {
            Modal.success({
              title: "نجاح",
              content: "تم حفظ الكميات الفعلية بنجاح.",
              centered: true,
              width: 400,
              onOk: () => {
                setActualQuantities({}); // Clear the changes state
                // Refetch data to show updated values (like calculated over_quantity)
                fetchData(value, selectedRecipeCategory);
              },
            });
            // Auto close modal after delay
            setTimeout(() => {
              Modal.destroyAll();
              setActualQuantities({});
              fetchData(value, selectedRecipeCategory);
            }, 2000);
          } else {
            throw new Error(response.data?.message || "فشل في حفظ التغييرات");
          }
        } catch (error) {
          console.error("Error saving actual quantities:", error);
          let errorMessage = "حدث خطأ أثناء حفظ التغييرات.";
          if (
            error.response &&
            error.response.data &&
            error.response.data.message
          ) {
            errorMessage += ` ${error.response.data.message}`;
          } else if (error.message) {
            errorMessage = error.message;
          }
          Modal.error({
            title: "خطأ",
            content: errorMessage,
            centered: true,
            width: 400,
          });
          setTimeout(Modal.destroyAll, 4000);
        }
      }, // end onOk
      onCancel() {
        console.log("Save cancelled");
      },
    }); // end Modal.confirm
  };

  // const handleSavePDF = async () => {
  //   const pdf = new jsPDF("p", "mm", "a4");
  //   const pageWidth = 190;
  //   const pageHeight = 297;
  //   const rows = Array.from(tableRef?.current?.querySelectorAll("tr"));

  //   let position = 20;
  //   for (let i = 0; i < rows.length; i++) {
  //     const row = rows[i];
  //     const rowCanvas = await html2canvas(row, { scale: 2 });

  //     const rowImgData = rowCanvas.toDataURL("image/png");
  //     const rowHeight = (rowCanvas.height * pageWidth) / rowCanvas.width;

  //     if (position + rowHeight > pageHeight - 10) {
  //       pdf.addPage();
  //       position = 10;
  //     }
  //     pdf.addImage(rowImgData, "PNG", 10, position, pageWidth, rowHeight);
  //     position += rowHeight;
  //   }
  //   pdf.save("تقرير_المخازن.pdf");
  // };

  // 001

  const handleSavePDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 190;
      const pageHeight = 277;
      const leftMargin = 10;
      const topMargin = 5;

      const table = tableRef.current;

      const canvas = await html2canvas(table, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowHeight: table.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.85);

      const imgWidth = pageWidth;
      const totalHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = totalHeight;
      let position = topMargin;
      let pageNumber = 1;
      pdf.setFont("Amiri-Regular");
      pdf.setFontSize(11);
      // pdf.text("تقرير المخازن", 105, 10, { align: "center" });

      pdf.addImage(
        imgData,
        "JPEG",
        leftMargin,
        position,
        imgWidth,
        totalHeight
      );
      heightLeft -= pageHeight - position;
      while (heightLeft > 0) {
        pdf.addPage();
        pageNumber++;
        position = -(totalHeight - heightLeft);

        pdf.text("تقرير المخازن (استمرار)", leftMargin, 15);

        pdf.addImage(
          imgData,
          "JPEG",
          leftMargin,
          position,
          imgWidth,
          totalHeight
        );
        heightLeft -= pageHeight;
      }

      const totalPages = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        pdf.setFontSize(10);

        const text = `الصفحة ${i} من ${totalPages}`;
        const textWidth = 190;
        const textHeight = 5;

        const textX = pageWidth + leftMargin - 5;
        const textY = pageHeight + 12;
        const bgX = textX - textWidth;
        const bgY = textY - textHeight;

        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, bgY, textWidth + 10, textHeight + 15, "F");

        if (i) {
          pdf.rect(0, 0, textWidth + 10, 5, "F");
        }

        pdf.text(text, 105, textY, { align: "right" });
      }

      pdf.save("تقرير_المخازن.pdf");
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("حدث خطأ أثناء إنشاء ملف PDF");
    }
  };

  if (error) return <p>{error}</p>;

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  return (
    <div>
      <h2 className="heading text-center">
        مخزن <span className="text-danger">{data?.name}</span> الفرعي
      </h2>
      <main ref={targetRef}>
        <div id="invoice-container">
          <div className="mb-3">
            <div style={{ display: "flex", alignItems: "center", gap: "50px" }}>
              <div style={{ width: "30%" }}>
                <label htmlFor="exampleInputEmail1" className="form-label">
                  القسم :
                </label>

                <select
                  className="form-select"
                  aria-label="المنفذ"
                  value={value}
                  onChange={(e) => {
                    const selectedText = e.target.selectedOptions[0].text;
                    setValue(e.target.value);
                    setMainCat(selectedText);
                  }}
                >
                  <option value=""> من فضلك اختر القسم</option>
                  {recipeCategoryParents.map((parent, index) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ width: "30%" }}>
                <label htmlFor="exampleInputEmail1" className="form-label">
                  التصنيف الرئيسي :
                </label>

                <select
                  className="form-select"
                  aria-label="المنفذ"
                  value={selectedRecipeCategory}
                  onChange={(e) => {
                    setSelectedRecipeCategory(e.target.value);
                  }}
                >
                  <option value=""> من فضلك اختر التصنيف الرئيسي </option>
                  {recipeCategories.map((parent, index) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ width: "30%" }}>
                <label htmlFor="exampleInputEmail1" className="form-label">
                  ابحث بالاسم
                </label>

                <input
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  type="text"
                  placeholder="إبحث باللإسم"
                  value={searchTerm}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "20px" }}>
              <button onClick={handleSubmit} className="pdf-button">
                {" "}
                فلتره
              </button>

              {user?.permissions.some(
                (permission) => permission.name === "eliminate_over_quantity"
              ) && (
                <button
                  onClick={handleEliminateOverQuantity}
                  className="pdf-button"
                  disabled={selectedRows.size === 0} // Disable if no rows are selected
                >
                  حذف الكميات الإضافية
                </button>
              )}

              {user?.permissions.some(
                (permission) => permission.name === "submit_actual_quantities"
              ) && (
                <button
                  onClick={handleSubmitActualQuantities}
                  className="pdf-button"
                  // disabled={Object.keys(actualQuantities).length === 0}
                >
                  حفظ الجرد 
                </button>
              )}
              <button onClick={handleSavePDF} className="pdf-button">
                {" "}
                حفظ PDF
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "start",
            }}
          ></div>
          <ItemDetailsModal
            visible={isModalVisible}
            onHide={() => setIsModalVisible(false)}
            item={selectedItem}
          />

          <div className="invoice-items">
            <table ref={tableRef}>
              <thead>
                <tr>
                  <th colSpan="11" className="text-center">
                    <div>
                      <span>مخزن {data?.name} الفرعي</span>
                      <span> || </span>
                      <span> القسم الرئيسي : {mainCat}</span>
                    </div>
                  </th>
                </tr>
                <tr>
                  <th colSpan="11" className="text-center">
                    <div>
                      <span className="fs-5 fw-bold">
                        {new Date().toLocaleDateString()} -{" "}
                        {new Date().toLocaleTimeString()}
                      </span>{" "}
                      -<span> || </span>
                      <span>سعر الفاتوره الكلي {sum}</span>
                    </div>
                  </th>
                </tr>
                <tr>

                  <th className="text-center">#</th>
                  <th className="text-center">القسم الرئيسي</th>
                  <th className="text-center">التصنيف الرئيسي</th>
                  <th className="text-right">اسم المنتج</th>
                  <th className="text-right">الكمية</th>
                  <th
                    className="text-center align-middle"
                    style={{ width: "40px" }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      onChange={handleSelectAllChange}
                      checked={
                        filteredData.length > 0 &&
                        selectedRows.size === filteredData.length
                      }
                      aria-label="Select all items"
                    />
                  </th>
                  <th className="text-right"> الأوفر</th>
                  <th className="text-right"> العجز</th>
                  <th className="text-right">الجرد الفعلي</th>
                  <th className="text-right">سعر الوحده</th>
                  <th className="text-right"> السعر الكلي </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr
                      className="fw-bold fs-4"
                      key={index}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRowClick(item)}
                    >
                     
                      <td className="text-center">{index + 1}</td>
                      <td className="text-center">
                        {" "}
                        {item.recipe_category?.parent}
                      </td>
                      <td className="text-center">
                        {" "}
                        {item.recipe_category?.name}
                      </td>
                      <td className="text-right"> {item.name}</td>
                      <td className="text-right">
                        {" "}
                        {item.quantity} {item.unit}
                      </td>
                      <td
                        className="text-center align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedRows.has(item.department_store_id)}
                          onChange={() =>
                            handleCheckboxChange(item.department_store_id)
                          }
                          style={{ cursor: "pointer" }}
                          aria-label={`Select item ${item.name}`}
                        />
                      </td>

                      <td className="text-right">
                        {item.over_quantity ?? "لا يوجد"}
                      </td>
                      
                      <td className="text-right">
                        {item.under_quantity ?? "لا يوجد"}
                      </td>
                      <td
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="number"
                          min="0"
                          className="form-control form-control-sm"
                          style={{
                            fontSize: "20px",
                            fontWeight: "600",
                          }}
                          value={
                            actualQuantities[item.department_store_id] ?? ""
                          }
                          onChange={(e) =>
                            handleActualQuantityChange(
                              item.department_store_id,
                              e.target.value
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="text-right">
                        {" "}
                        {Math.round((item.price / item.quantity) * 100) /
                          100}{" "}
                        جنيه
                      </td>
                      <td className="text-right">
                        {" "}
                        {Math.round(item.price * 100) / 100} جنيه
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="text-center fw-bold fs-4" colSpan="11">
                      لا توجد مواد مصروفة للمخزن
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="11" className="text-center">
                    <div>
                      <img src={base64Image} alt="Product" width={"100%"} />
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShowProductDepartment2;
