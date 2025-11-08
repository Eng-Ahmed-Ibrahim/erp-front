import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { message, Modal } from "antd";
import axios from "axios";
import { API_ENDPOINT } from "../../config";
import { changeOrderStatus, getOrders } from "../apis/orders";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function DataModal({
  show,
  onHide,
  discountDetils,
  fromDate,
  toDate,
  selectedDepatrmentName,
}) {
  console.log(`orders`, discountDetils);
  const tableRef = useRef();
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
    pdf.save("تقرير المبيعات المفصل.pdf");
  };
  return (
    <Modal
      title="تفاصيل مبيعات  المنفذ "
      centered
      open={show}
      onOk={onHide}
      onCancel={onHide}
      width={1000}
    >
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
      <table className="table table-hover mt-5" ref={tableRef}>
        <thead>
          <tr>
            <th colSpan="8" className="text-center">
              <div>
                <span>الفلتر </span>
                <span> || </span>
                <span> المنافذ</span>
                <span>
                  {selectedDepatrmentName.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        justifyContent: "center",
                      }}
                    >
                      {selectedDepatrmentName.map((name, index) => (
                        <span key={index} style={{ margin: "5px" }}>
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "لا توجد منافذ محددة"
                  )}
                </span>
                <span> || </span>
                <span>التاريخ</span>
                <span> من ({fromDate}) </span>
                <span> || </span>
                <span> الي ({toDate}) </span>
              </div>
            </th>
          </tr>
          <tr>
            <th scope="col">نوع العميل</th>
            <th scope="col">اسم العميل</th>
            <th scope="col">الاجمالي الخصم</th>
          </tr>
        </thead>
        <tbody>
          {discountDetils && discountDetils.length > 0 ? (
            discountDetils.map((order, index) => (
              <tr key={order.id}>
                <td>{order.client_type_name}</td>
                <td>
                  {order.client_name == "" ? "لا يوجد" : order.client_name}
                </td>
                <td>{Math.round(Math.abs(order.discount * 100)) / 100}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                لا توجد طلبات لهذا القسم.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Modal>
  );
}
const ShowAllSalesDetails = () => {
  const [activeItemId, setActiveItemId] = useState(null);
  const [fromDate, setFromDate] = useState("2024-11-05");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState([]);
  const [isModalVisable, setIsModalVisable] = useState(false);
  const { user } = useAuth();
  const today = new Date(5 - 11 - 2024).toISOString().split("T")[0];

  const [isPending, setIsPending] = useState(false);
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [allDepartment, setAllDepartment] = useState([]);
  const [discountDetils, setDiscountDetils] = useState([]);
  const [returnedData, setReturnedData] = useState([]);
  const tableRef = useRef();
  const [selectedDepatrmentName, setSelectedDepartmentName] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
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
    pdf.save("تقرير المبيعات المفصل.pdf");
  };
  const toggleDepartmentSelection = (departmentId) => {
    setSelectedDepartments((prevSelected) =>
      prevSelected.includes(departmentId)
        ? prevSelected.filter((id) => id !== departmentId)
        : [...prevSelected, departmentId]
    );
  };
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          `${API_ENDPOINT}/api/v1/store/department`,
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        );
        console.log(`response`, response);
        setAllDepartment(
          Array.isArray(response.data.data) ? response.data.data : []
        );
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);
  const handleGettingReports = async () => {
    const selectedDeptNames = allDepartment
      .filter((department) => selectedDepartments.includes(department.id))
      .map((department) => department.name);

    setSelectedDepartmentName(selectedDeptNames);
    try {
      const response = await axios.get(
        `${API_ENDPOINT}/api/v1/payment_report`,
        {
          params: {
            data: {
              from: fromDate,
              to: toDate,
              departments: selectedDepartments,
            },
          },
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      console.log(`response`, response);
      setReturnedData(response.data.data);
      console.log(returnedData, `jshh`);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };
  const handleClick = async () => {
    console.log("Returned data:", returnedData);
    const discount = await returnedData.clients;
    console.log("Discount:", discount);
    setDiscountDetils(discount);
    setIsModalVisable(true);
  };

  return (
    <div>
      <h1
        className="heading"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        تقرير الايرادات المفصل
      </h1>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #f0f0f0",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 12px 24px rgba(0,0,0,0.04)",
        }}
      >


        <div className="row g-3 align-items-end">
          <div className="col-lg-4 col-md-4 col-sm-12">
            <label className="form-label fw-semibold text-muted ps-1">من</label>
            <input
              onChange={(e) => {
                const selectedDay = e.target.value;
                setFromDate(selectedDay);
              }}
              min="2024-11-05"
              value={fromDate}
              type="date"
              className="form-control shadow-sm"
            />
          </div>
          <div className="col-lg-4 col-md-4 col-sm-12">
            <label className="form-label fw-semibold text-muted ps-1">إلى</label>
            <input
              onChange={(e) => {
                const selectedDay = e.target.value;
                setToDate(selectedDay);
              }}
              value={toDate}
              type="date"
              className="form-control shadow-sm"
            />
          </div>
          <div className="col-lg-4 col-md-4 col-sm-12 d-flex align-items-end">
            <button
              onClick={handleSavePDF}
              className="pdf-button"
              style={{ width: "100%", height: "48px" }}
            >
              حفظ PDF
            </button>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #f0f0f0",
            borderRadius: "14px",
            padding: "16px",
            marginTop: "24px",
            background: "#fcfcfc",
          }}
        >

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {allDepartment.map((item) => {
              const isSelected = selectedDepartments.includes(item.id);
              return (
                <button
                  onClick={() => toggleDepartmentSelection(item.id)}
                  key={item.id}
                  style={{
                    minWidth: "150px",
                    padding: "12px 18px",
                    borderRadius: "12px",
                    border: isSelected ? "2px solid #803d3b" : "1px solid #e6e6e6",
                    backgroundColor: isSelected ? "#803d3b" : "#ffffff",
                    color: isSelected ? "#fff" : "#444",
                    boxShadow: isSelected
                      ? "0 10px 20px rgba(128,61,59,0.15)"
                      : "0 6px 16px rgba(0,0,0,0.05)",
                    transition: "all 0.25s ease",
                    fontWeight: 600,
                  }}
                  className="department-pill"
                >
                  {item?.name}
                </button>
              );
            })}
          </div>
        </div>

          <button
            className="form-cashier-btn"
            onClick={() => handleGettingReports()}
          style={{
            width: "100%",
            transition: "all 0.3s",
            marginTop: "22px",
            padding: "14px",
            fontSize: "1.05rem",
            fontWeight: "bold",
          }}
          >
            تأكيد
        </button>
      </div>
      <table className="table table-hover mt-5" ref={tableRef}>
        <thead>
          {/*  */}

          <tr>
            <th scope="col">اجمالي التكلفه </th>
            <th scope="col">اجمالي الخصومات </th>
            <th scope="col">اجمالي الضريبه </th>
            <th scope="col">اجمالي الايرادات</th>
          </tr>
        </thead>
        <tbody>
          {returnedData && (
            <tr>
              <th>{Math.round(returnedData?.total_cost_price * 100) / 100}</th>
              <th
                scope="row"
                style={{ cursor: "pointer" }}
                onClick={handleClick}
              >
                {Math.round(Math.abs(returnedData?.total_discount * 100)) / 100}
              </th>
              <th scope="row">
                {Math.round(Math.abs(returnedData?.total_tax * 100)) / 100}
              </th>
              <th scope="row">
                {Math.round(Math.abs(returnedData?.total_price * 100)) / 100}
              </th>
            </tr>
          )}
        </tbody>
      </table>
      <DataModal
        show={isModalVisable}
        onHide={() => setIsModalVisable(false)}
        discountDetils={discountDetils}
        fromDate={fromDate}
        toDate={toDate}
        selectedDepatrmentName={selectedDepatrmentName}
      />
    </div>
  );
};

export default ShowAllSalesDetails;
