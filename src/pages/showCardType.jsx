import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINT } from "../../config";
import { Pagination, Select, Modal } from "antd";

const ShowCardTypeReport = () => {
  const item = useLocation()?.state?.item;
  const [isPending, setIsPending] = useState(false);
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [data, setData] = useState([]);
  const [department, setDepartment] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [invoiceImage, setInvoiceImage] = useState(""); // State to store image URL

  useEffect(() => {
    axios
      ?.get(`${API_ENDPOINT}/api/v1/store/department`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        setIsPending(false);
        setDepartment(res?.data);
      })
      .catch((err) => {
        setIsPending(false);
      });
  }, []);
  const getInitialState = () => {
    const value = "department";
    return value;
  };
  const [value, setValue] = useState(getInitialState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFilterData = () => {
    setIsPending(true);
    axios
      .get(`${API_ENDPOINT}/api/v1/store/recipes/invoices`, {
        headers: { Authorization: `Bearer ${Token}` },
        params: {
          data: {
            recipe_name: searchTerm,
            date: {
              from: fromDate,
              to: toDate,
            },
          },
        },
      })
      .then((res) => {
        setIsPending(false);
        setData(res?.data.data);
      })
      .catch((err) => {
        setIsPending(false);
        console.error("Error fetching data:", err);
      });
  };

  useEffect(() => {
    handleFilterData(); // Fetch initial data
  }, []);

  const mapInvoiceType = (type) => {
    switch (type) {
      case "in_coming":
        return "فاتورة مورد";
      case "out_going":
        return "مستند صرف";
      case "returned":
        return "مرتجع";
      case "transfare":
        return "تحويل";
      case "tainted":
        return "هالك";
        tainted;
      default:
        return type;
    }
  };
  useEffect(() => {
    setIsPending(true);
    axios
      ?.get(`${API_ENDPOINT}/api/v1/store/recipes/invoices`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
        params: {
          recipe_name: searchTerm,
          date: [fromDate, toDate],
        },
      })
      .then((res) => {
        setIsPending(false);
        console.log(`dksods`, res.data.data[0].recipe.name);
        setData(res?.data.data);
      })
      .catch((err) => {
        setIsPending(false);
        console.log("error", err);
      });
  }, [value]);
  const showModal = (image) => {
    setInvoiceImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setInvoiceImage("");
  };
  const renderModal = () => (
    <Modal
      title="عرض فاتورة المورد"
      open={isModalOpen}
      onCancel={closeModal}
      footer={null}
    >
      <img src={invoiceImage} alt="invoice_image" style={{ width: "100%" }} />
    </Modal>
  );
  return (
    <div>
      <div className="my-5 ">
        <h1 className="heading text-center p-3">كارت الصنف</h1>
      </div>

      <div className="row-display">
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            الصنف :
          </label>
          <div className="center">
            <input
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              type="text"
              placeholder="إبحث بأسم الصنف"
              value={searchTerm}
            />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="exampleFormControlInput1" className="form-label">
            من
          </label>
          <input
            type="date"
            className="form-input"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
            }}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleFormControlInput1" className="form-label">
            الى
          </label>
          <input
            type="date"
            className="form-input"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value.toString().split("T")[0]);
            }}
          />
        </div>

        <div className="center">
          <button
            onClick={handleFilterData}
            className="pdf-button white-space-nowrap"
          >
            {" "}
            فلتره
          </button>
        </div>
      </div>

      <table
        className="table table table-hover mt-5"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: "var(--text-color-inverted)",
        }}
      >
        <thead>
          <tr className="fw-bold fs-5 my-3">
            <th scope="col" style={{ background: "#edede9" }}>
              ##
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              الصنف
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              {" "}
              نوع الفاتوره
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              {" "}
              تاريخ الفاتوره
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              الكمية{" "}
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              سعر الوحده{" "}
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              كود الفاتوره
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              اسم المورد{" "}
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              صوره الفاتوره{" "}
            </th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr className="content-area-table" key={index}>
              <td
                className="clickable-cell"
                style={{
                  padding: "14px 12px",
                  border: "1px solid #E4C59E",
                  color: "#803D3B",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {index}
              </td>

              <td
                className="clickable-cell"
                style={{
                  padding: "14px 12px",
                  border: "1px solid #E4C59E",
                  color: "#803D3B",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {item.recipe?.name}
              </td>

              <td
                className="clickable-cell"
                style={{
                  padding: "14px 12px",
                  border: "1px solid #E4C59E",
                  color: "#803D3B",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {mapInvoiceType(item.type)}
              </td>
              <td
                className="clickable-cell"
                style={{
                  padding: "14px 12px",
                  border: "1px solid #E4C59E",
                  color: "#803D3B",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {item.invoice_date}
              </td>
              <td
                className="clickable-cell"
                style={{
                  padding: "14px 12px",
                  border: "1px solid #E4C59E",
                  color: "#803D3B",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {item.quantity}
              </td>
              <td
                className="clickable-cell"
                style={{
                  padding: "14px 12px",
                  border: "1px solid #E4C59E",
                  color: "#803D3B",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {item.recipe_price}
              </td>

              <td
                className="clickable-cell"
                style={{
                  padding: "14px 12px",
                  border: "1px solid #E4C59E",
                  color: "#803D3B",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {item.invoice_code}
              </td>

              <td
                className="clickable-cell"
                style={{
                  padding: "14px 12px",
                  border: "1px solid #E4C59E",
                  color: "#803D3B",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {item.supplier?.name}
              </td>

              <td
                className="clickable-cell"
                style={{
                  padding: "14px 12px",
                  border: "1px solid #E4C59E",
                  color: "#803D3B",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {item.supplier?.name}
              </td>

              <td
                className="clickable-cell"
                style={{
                  padding: "14px 12px",
                  border: "1px solid #E4C59E",
                  color: "#803D3B",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                <button
                  onClick={() => showModal(item.invoice_image)}
                  className="pdf-button"
                >
                  {" "}
                  عرض الفاتورة
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data?.data?.length > 0 && (
        <Pagination
          className="pagination"
          current={currentPage}
          onChange={handlePageChange}
          total={data?.pagination?.total || 1}
          showSizeChanger={false}
        />
      )}
      {isModalOpen && renderModal()}
    </div>
  );
};

export default ShowCardTypeReport;
