import { useEffect, useState, useRef } from "react";
import { API_ENDPOINT } from "../../config";
import { useLocation, useParams } from "react-router-dom";

import axios from "axios";
import { message, Modal } from "antd";
import LogoDAR from "../../public/assets/images/Dar_logo.svg";
import { usePDF } from "react-to-pdf";
import { useMemo } from "react";
import generatePDF, { Resolution, Margin } from "react-to-pdf";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "../context/AuthContext";

const ShowDepartmentProductsReport = () => {
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

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [newPrices, setNewPrices] = useState({});
  const [categoryParents, setCategoryParents] = useState([]);
  const tableRef = useRef();
  const [isAdmin, setIsAdmin] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    console.log(id);
    if (user.department.type == "master") {
      setIsAdmin(true);
    }

    const fetchCategoryParents = async () => {
      try {
        const response = await fetch(
          `${API_ENDPOINT}/api/v1/store/categories`,
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        );
        const data = await response.json();
        console.log(data);
        setCategoryParents(data.data);
      } catch (error) {
        console.error("Error fetching recipe category parents:", error);
      }
    };

    fetchCategoryParents();
  }, []);

  const fetchData = async  (parentId) => {
   await  axios
      .get(`${API_ENDPOINT}/api/v1/department_products_report`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
        params: {
          data: {
            department_id: id,
            from: fromDate,
            to: toDate,
            category_id: value,
            name :searchTerm
          },
        },
      })
      .then((res) => {
        console.log(res?.data.data);

        setData(res?.data?.data?.orders);
        setSum(res?.data?.data?.total)
        setIsDataFetched(true);

        const modal = Modal.success({
          title: "success",
          content: (
            <div style={{ fontSize: "24px", textAlign: "center" }}>
              تم عرض المنتجات بنجاح
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
    if (!id) return;
    fetchData(value);
  }, [id, fromDate, toDate, value, searchTerm]);

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
    pdf.save("تقرير_مبيعات.pdf");
  };

  if (error) return <p>{error}</p>;

  const handleRowClick = (item) => {
    setSelectedItem(item); // Set the selected item
    setIsModalVisible(true); // Open the modal
  };

  console.log(filteredData);
  return (
    <div>
      <h2 className="heading text-center">
        تقرير مبيعات المنتجات المفصل{" "}
        <span className="text-danger">{data?.name}</span>
      </h2>
      <main ref={targetRef}>
        <div id="invoice-container">
          {/* <div className="headers-wrapper">
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
          </div> */}

          {/* <div className="invoice-info">
            <div className="invoice-info-item" style={{ width: "100%" }}>
              <h2 className="text-center fw-bold fs-2">
                {" "}
                تقرير عن محتويات{" "}
                <span className="fs-1 text-danger">{data?.name}</span>
              </h2>
            </div>
          </div> */}

          <div className="row align-items-center">
            <div className="col-md-2">
              <div className="mb-3 d-flex text-center flex-column gap-small">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label ps-3 "
                >
                  من
                </label>
                <input
                  onChange={(e) => {
                    const selectedDay = e.target.value;
                    setFromDate(selectedDay);
                  }}
                  value={fromDate}
                  type="date"
                  className="form-control"
                  id="exampleFormControlInput1"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="col-md-2">
              <div className="mb-3 d-flex text-center flex-column gap-small">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label ps-3 "
                >
                  الي
                </label>
                <input
                  onChange={(e) => {
                    const selectedDay = e.target.value;
                    setToDate(selectedDay);
                  }}
                  value={toDate}
                  type="date"
                  className="form-control"
                  id="exampleFormControlInput1"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="col-md-2">
              <div className="mb-3 d-flex text-center flex-column gap-small">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label ps-3 "
                >
                  الاسم
                </label>
                <input
                  onChange={(e) => setSearchTerm(e.target.value)}
                  // className="filter-input"
                  type="text"
                  placeholder="إبحث باللإسم"
                  className="form-control"
                  id="exampleFormControlInput1"
                  value={searchTerm}
                />
              </div>
            </div>

            <div className="col-md-2">
              <label
                htmlFor="exampleInputEmail1"
                className="form-label"
                style={{
                  marginTop: "5px",
                }}
              >
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
                {categoryParents.map((parent, index) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "start",
              gap: "50px",
            }}
          >
            <button onClick={handleSubmit} className="pdf-button">
              {" "}
              فلتره
            </button>
            <button onClick={handleSavePDF} className="pdf-button">
              {" "}
              حفظ PDF
            </button>
          </div>

          <div></div>
          {/* <ItemDetailsModal
            visible={isModalVisible}
            onHide={() => setIsModalVisible(false)}
            item={selectedItem}
          /> */}

          <div className="invoice-items">
            <table ref={tableRef}>
              <thead>
                <tr>
                  <th colSpan="8" className="text-center">
                    <div>
                      {/* <span>مخزن {data?.name} الفرعي</span>
                      <span> || </span>
                      <span> القسم الرئيسي : {mainCat}</span> */}
                    </div>
                  </th>
                </tr>
                <tr>
                  <th colSpan="8" className="text-center">
                    <div>
                      <span> اجمالي المبيعات {sum}</span>
                    </div>
                  </th>
                </tr>
                <tr>
                  <th className="text-center">#</th>

                  <th className="text-center">القسم الرئيسي</th>
                  <th className="text-center">التصنيف الرئيسي</th>
                  <th className="text-right">اسم المنتج</th>
                  <th className="text-right">الكمية</th>
                  <th className="text-right"> السعر الكلي </th>
                </tr>
              </thead>
              <tbody>
                {data?.length > 0 ? (
                  data?.map((item, index) => (
                    <tr
                      className="fw-bold fs-4"
                      key={index}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRowClick(item)}
                    >
                      <td className="text-center">{index + 1}</td>
                      <td className="text-center">
                        {" "}
                        {item.category_name}
                      </td>
                      <td className="text-center">
                        {" "}
                        {item.sub_category_name}
                      </td>

                      <td className="text-right"> {item.name}</td>

                      <td className="text-right">
                        {" "}
                        {item.total_quantity} 
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
                      لا توجد منتجات مباعة
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr></tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShowDepartmentProductsReport;
