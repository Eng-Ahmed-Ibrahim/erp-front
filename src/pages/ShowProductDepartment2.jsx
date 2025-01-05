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

  const imageurl = "/assets/images/Screenshot (1).png";
  const [recipeCategoryParents, setRecipeCategoryParents] = useState([]);
  const [base64Image, setBase64Image] = useState("");
  const tableRef = useRef();
  const [isAdmin, setIsAdmin] = useState(false);

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

  const fetchData = (parentId) => {
    axios
      .get(`${API_ENDPOINT}/api/v1/search`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
        params: {
          data: {
            parent_id: parentId,
            department_id: item?.id,
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
    fetchData(value);
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

    return sortedItems;
  }, [data]);

  const handleSubmit = () => {
    console.log(`Filtering with parent_id: `, value);
    fetchData(value);
  };
  useEffect(() => {
    if (sortedDepartmentStore.length > 0) {
      const filtered = sortedDepartmentStore.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
      console.log("Filtered Data:", filtered);
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

  const handlePriceChange = (id, value) => {
    setNewPrices((prevPrices) => ({
      ...prevPrices,
      [id]: value,
    }));
  };

  const handleBlur = async (recipeId) => {
    const newUnitPrice = newPrices[recipeId];
    const departmentId = item?.id;

    if (newUnitPrice !== undefined) {
      try {
        await axios.post(
          `${API_ENDPOINT}/api/v1/store/department/update_recipe_price`,
          {
            recipe_id: recipeId,
            unit_price: newUnitPrice,
            department_id: departmentId,
          },
          { headers: { Authorization: `Bearer ${Token}` } }
        );
        const modal = Modal.success({
          title: "success",
          content: (
            <div style={{ fontSize: "24px", textAlign: "center" }}>
              Unit price updated successfully
            </div>
          ),
          centered: true,
          width: 400,
        });

        setTimeout(() => {
          modal.destroy();
        }, 2000);
      } catch (error) {
        const modal = Modal.error({
          title: "success",
          content: (
            <div style={{ fontSize: "24px", textAlign: "center" }}>
              Error updating unit price
            </div>
          ),
          centered: true,
          width: 400,
        });

        setTimeout(() => {
          modal.destroy();
        }, 3000);
        console.error("Error:", error);
      }
    }
  };

  const ItemDetailsModal = ({ visible, onHide, item }) => {
    if (!item) return null;
    console.log(item);
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

  const handleSavePDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 190;
    const pageHeight = 297;
    const rows = Array.from(tableRef.current.querySelectorAll("tr"));
    let position = 10;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowCanvas = await html2canvas(row, { scale: 2 });
      const rowImgData = rowCanvas.toDataURL("image/png");
      const rowHeight = (rowCanvas.height * pageWidth) / rowCanvas.width;
      if (position + rowHeight > pageHeight - 10) {
        pdf.addPage();
        position = 10;
      }
      pdf.addImage(rowImgData, "PNG", 10, position, pageWidth, rowHeight);
      position += rowHeight;
    }
    pdf.save("تقرير_المخازن.pdf");
  };

  if (error) return <p>{error}</p>;

  const handleRowClick = (item) => {
    setSelectedItem(item); // Set the selected item
    setIsModalVisible(true); // Open the modal
  };

  /**
 * se3r el we7da update 
 *            {isAdmin?(<td className="text-right">
  <input
    type="number"
    style={{
      width: "100px",       
      textAlign: "right",    
      padding: "5px",         
      borderRadius: "4px",  
      border: "1px solid #ccc", 
      fontWeight: "600",  
      fontSize: "24px",       
      color: "#333",         
      backgroundColor: "#f9f9f9" 
    }}      value={newPrices[item.id] || Math.round((item.price / item.quantity) * 100) / 100}
  
  /> جنيه
</td>):(                      <td className="text-right"> {Math.round((item.price/item.quantity)* 100) / 100} جنيه</td>
)}
    
 * 
 */

  console.log(filteredData);
  return (
    <div>
      <h2 className="heading text-center">
        مخزن <span className="text-danger">{data?.name}</span> الفرعي
      </h2>
      <main ref={targetRef}>
        <div id="invoice-container">
          <div className="headers-wrapper">
            <div className="header-img">
              <img
                src={LogoDAR}
                alt=""
                style={{
                  width: "64px",
                  marginBottom: "5px",
                  marginLeft: "5px",
                }}
              />
            </div>
          </div>
          <div className="invoice-info">
            <div className="invoice-info-item" style={{ width: "100%" }}>
              <h2 className="text-center fw-bold fs-2">
                {" "}
                تقرير عن محتويات{" "}
                <span className="fs-1 text-danger">{data?.name}</span>
              </h2>
            </div>
          </div>
          <div className="center" style={{ margin: "20px 0" }}>
            <input
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
              type="text"
              placeholder="إبحث باللإسم"
              value={searchTerm}
            />
          </div>
          <div className="mb-3">
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
            <button onClick={handleSubmit} className="pdf-button">
              {" "}
              فلتره
            </button>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "start",
            }}
          >
            <button onClick={handleSavePDF} className="pdf-button">
              {" "}
              حفظ PDF
            </button>
          </div>
          <ItemDetailsModal
            visible={isModalVisible}
            onHide={() => setIsModalVisible(false)}
            item={selectedItem}
          />

          <div className="invoice-items">
            <table ref={tableRef}>
              <thead>
                <tr>
                  <th colSpan="8" className="text-center">
                    <div>
                      <span>مخزن {data?.name} الفرعي</span>
                      <span> || </span>
                      <span> القسم الرئيسي : {mainCat}</span>
                    </div>
                  </th>
                </tr>
                <tr>
                  <th colSpan="8" className="text-center">
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
                  <th className="text-right"> الأوفر</th>
                  <th className="text-right">كميه الجرد الفعلي</th>
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
                      <td className="text-right">
                        {item.over_quantity ?? "لا يوجد"}
                      </td>
                      <td className="text-right"></td>
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
                    <td className="text-center fw-bold fs-4" colSpan="8">
                      لا توجد مواد مصروفة للمخزن
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="8" className="text-center">
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
