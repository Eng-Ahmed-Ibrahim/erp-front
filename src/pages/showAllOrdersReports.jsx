import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { message, Modal, Button } from "antd";
import axios from "axios";
import { API_ENDPOINT } from "../../config";
import { changeOrderStatus, getOrders } from "../apis/orders";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function DataModal({
  show,
  onHide,
  itemId,
  orders,
  selectedPaymentMethodName,
  selectedClientTypeName,
  selectedClientsName,
  overrideClientTypeName,
  overrideClientName,
}) {
  const tableRef = useRef();
  const handleSavePDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 190;
    const pageHeight = 297;
    const rows = Array.from(tableRef.current.querySelectorAll("tr"));
    let position = 10;
    pdf.setFontSize("32px");

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
  const modalFooter = (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "12px",
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      <Button onClick={handleSavePDF} key="pdf">
        حفظ PDF
      </Button>
      <Button onClick={onHide} key="cancel">
        إلغاء
      </Button>
      <Button type="primary" onClick={onHide} key="ok">
        تم
      </Button>
    </div>
  );
  return (
    <Modal
      title="تقرير مبيعات المفصل "
      centered
      open={show}
      onOk={onHide}
      onCancel={onHide}
      width={1400}
      className="detailed-report-modal"
      style={{ fontFamily: "'Cairo', sans-serif" }}
      bodyStyle={{ fontFamily: "'Cairo', sans-serif" }}
      footer={modalFooter}
    >
      <table
        className="table table-hover mt-5"
        style={{ fontSize: "24px" }}
        ref={tableRef}
      >
        <thead>
          <tr>
            <th colSpan="8" className="text-center">
              <div>
                <span>الفلتر </span>
                <span> || </span>
                <span>({overrideClientTypeName || selectedClientTypeName})</span>
                <span> || </span>
                <span>({overrideClientName || selectedClientsName})</span>
              </div>
            </th>
          </tr>
          <tr>
            <th scope="col">نوع العميل</th>
            <th scope="col">اسم العميل</th>
            <th scope="col">تاريخ الطلب</th>
            <th scope="col">اجمالي سعر الطلب</th>
            <th scope="col">الاجمالي بعد الخصم</th>
            <th scope="col"> المنتجات</th>
          </tr>
        </thead>
        <tbody>
          {orders && orders.length > 0 ? (
            orders.map((order, index) => (
              <tr key={order.id}>
                <td>{order.client_type_name}</td>
                <td>
                  {order.client_name == "" ? "لا يوجد" : order.client_name}
                </td>
                <td>{order.order_date}</td>
                <td>{Math.round(order.price * 100) / 100}</td>
                <td>{Math.round(order.total_price * 100) / 100}</td>
                <td>
                  <ul>
                    {order.products?.map((product, index) => (
                      <li key={index}>
                        {product.name} - {product.quantity} ×{" "}
                        {product.price / product.quantity} = {product.price}
                      </li>
                    ))}
                  </ul>
                </td>
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
const ShowAllOrderReports = () => {
  const [data, setData] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectID, setSelectId] = useState();
  const [selectedUser, setSelectUser] = useState();
  const [selectStats, setSelectedStatus] = useState();
  const [selectedItemId, setSelectedItemId] = useState(null); // To store the selected item ID
  const [department, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectWatier, setSelectedWatier] = useState();
  const [clients, setClients] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [waiterName, setWaiterName] = useState([]);
  const [selectedPaymentMethodNakdy, setSelectedPaymentMethodNakdy] =
    useState("");
  const [sum, setSum] = useState(0);
  const [selectedClientType, setSelectedClientType] = useState("");
  const [selectedClients, setSelectedClients] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedClientTypeName, setSelectedClientTypeName] = useState("");
  const [selectedClientsName, setSelectedClientsName] = useState("");
  const [selectedPaymentMethodName, setSelectedPaymentMethodName] =
    useState("");
  const [clientTypes, setClientTypes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [modalOverrides, setModalOverrides] = useState({
    clientTypeName: "",
    clientName: "",
  });
  const { user } = useAuth();
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const domain = API_ENDPOINT;
  const tableRef = useRef();
  const [newCosts, setNewCosts] = useState({});
  const [isModalVisable, setIsModalVisable] = useState(false);
  const isClientSummaryView = !selectedClients;

  const clientSummary = useMemo(() => {
    if (!data?.data) {
      return [];
    }

    const summaryMap = new Map();

    Object.values(data.data).forEach((department) => {
      department?.orders?.forEach((order) => {
        const normalizedName =
          order.client_name && order.client_name.trim() !== ""
            ? order.client_name.trim()
            : "unknown";
        const clientKey = String(order.client_id ?? normalizedName);

        if (!summaryMap.has(clientKey)) {
          summaryMap.set(clientKey, {
            clientId: order.client_id ?? null,
            clientName:
              order.client_name && order.client_name.trim() !== ""
                ? order.client_name
                : "لا يوجد",
            clientTypeName: order.client_type_name || "—",
            totalOrderPrice: 0,
            totalOrderCount: 0,
            orders: [],
          });
        }

        const entry = summaryMap.get(clientKey);
        entry.totalOrderPrice += Number(order.total_price) || 0;
        entry.totalOrderCount += 1;
        entry.orders.push(order);
      });
    });

    return Array.from(summaryMap.values()).sort(
      (a, b) => b.totalOrderPrice - a.totalOrderPrice
    );
  }, [data]);

  const departmentRows = useMemo(
    () => (data?.data ? Object.values(data.data) : []),
    [data]
  );

  const totalClientOrderPrice = useMemo(
    () =>
      clientSummary.reduce(
        (acc, item) => acc + (Number(item.totalOrderPrice) || 0),
        0
      ),
    [clientSummary]
  );

  const totalClientOrderCount = useMemo(
    () =>
      clientSummary.reduce(
        (acc, item) => acc + (Number(item.totalOrderCount) || 0),
        0
      ),
    [clientSummary]
  );
  const handleGettingReports = async () => {
    try {
      await getAllWaiters();
    } catch (err) { }
  };
  const [newUserValues, setNewUserValues] = useState({
    deleviery_type: "kitchen",
    name: "",
    phone: "",
    military_number: "",
    client_type_id: "",
    discount_reason_id: "",
    payment_method_id: "",
    table_number: "",
    comment: "",
    client_id: "",
    waiter_id: "",
  });
  const fetchPaymentMethods = async () => {
    try {
      const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/store/payment_method`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const data = await response.json();
      setPaymentMethods(data.data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const handlePaymentMethodChange = async (value) => {
    const selectedPaymentMethod = paymentMethods.find(
      (method) => method.id === value
    );
    const PaymentMethodName = selectedPaymentMethod
      ? selectedPaymentMethod.name
      : "";
    setSelectedPaymentMethodName(PaymentMethodName);
    setSelectedPaymentMethodNakdy(value);
    setNewUserValues((prevState) => ({
      ...prevState,
      payment_method_id: value,
    }));
    try {
      const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.get(
        `${API_ENDPOINT}/api/v1/store/client_type/payment_method/${value}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      setClientTypes(response.data.data);
    } catch (error) {
      console.error("Error fetching client types for payment method:", error);
    }
  };
  const handleNewUserFormChange = (key, value) => {
    setNewUserValues((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
  useEffect(() => {
    fetchClientType(newUserValues["client_type_id"]);
  }, [newUserValues["client_type_id"]]);
  const handleClientTypeChange = async (value) => {
    const selectedClient = clientTypes.find((ele) => ele.id == value)?.name;
    setSelectedClientTypeName(selectedClient);

    setSelectedClientType(value);
    setNewUserValues((prevState) => ({
      ...prevState,
      client_type_id: value,
    }));
    handleNewUserFormChange("client_id", ``);
    try {
      const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.get(
        `${API_ENDPOINT}/api/v1/orders/clients/${value}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      setClients(response.data.data);
      fetchClientType(newUserValues["client_type_id"]);
      setSelectedClients("");
      setSelectedClientsName("");
    } catch (error) {
      console.error("Error fetching clients for client type:", error);
    }
  };
  const fetchClientType = async (id) => {
    try {
      const recipeData = await getClientTypeById(id);
      setDiscount(recipeData.data.discount);
      setResedent(recipeData.data.name);
    } catch (error) { }
  };
  const getAllWaiters = async () => {
    try {
      const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.get(
        `${API_ENDPOINT}/api/v1/store/waiter/all`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      setWaiterName(response.data.data);
      if (Array.isArray(waiterName) && waiterName?.length > 0) {
        getOrdersReportes();
      }
    } catch (error) {
      message.error("لايوجد واتر");
    }
  };
  useEffect(() => {
    fetchPaymentMethods();
    getAllWaiters();
  }, []);

  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/store/department/all`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        setDepartments(res?.data);
      });
    const addOneDay = () => {
      const currentDate = new Date(toDate);
      currentDate.setDate(currentDate.getDate() + 1);
      setToDate(currentDate.toISOString().split("T")[0]);
    };
    addOneDay();
  }, [selectID]);

  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/shifts/cashiers`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        setUsers(res?.data);
      });
  }, [selectedUser, selectStats, selectWatier]);

  async function getOrdersReportes() {
    try {
      const res = await axios.get(`${domain}/api/v1/detailed_reports`, {
        params: {
          data: {
            from: fromDate,
            to: toDate,
            client_id: selectedClients,
            client_type_id: selectedClientType,
            payment_method_id: selectedPaymentMethodNakdy,
          },
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      });
      setData(res.data);
    } catch (error) {
      message.info(error);
    }
  }

  const handleSavePDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 190;
    const pageHeight = 297;
    const rows = Array.from(tableRef.current.querySelectorAll("tr"));
    let position = 10;
    const tableStyle = {
      fontSize: 24, // Increase the font size
      cellPadding: 5, // Padding inside each cell
      tableWidth: pageWidth - 20, // Adjust the table width
    };

    // Set font size for the whole document (title, content, etc.)
    pdf.setFontSize("32px");
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
  const handleRowClick = (row) => {
    if (!row) {
      return;
    }

    if (isClientSummaryView) {
      setSelectedItemId(row.clientId ?? null);
      setOrders(row.orders || []);
      setModalOverrides({
        clientTypeName: row.clientTypeName || "",
        clientName: row.clientName || "",
      });
    } else {
      setSelectedItemId(row.department_id);
      setOrders(row.orders || []);
      setModalOverrides({
        clientTypeName: "",
        clientName: "",
      });
    }

    setIsModalVisable(true);
  };

  const handleCloseModal = () => {
    setIsModalVisable(false);
    setModalOverrides({
      clientTypeName: "",
      clientName: "",
    });
  };

  return (
    <div>
      <div
        className="shadow p-3 my-5 text-light text-center rounded"
        style={{ backgroundColor: "rgb(128, 61, 59)" }}
      >
        <h3>تقرير المبيعات المفصل</h3>
      </div>

      <div className="container text-center text-xl">
        <div className="row align-items-center">
          <div className="col">
            <div className="mb-3">
              <label htmlFor="payment-method" className="form-label">
                طريقة الدفع
              </label>
              <select
                id="payment-method"
                required
                className="form-cashier-select"
                placeholder="اختر طريقة دفع"
                value={selectedPaymentMethodNakdy}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                showSearch
                filterOption={(input, option) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                optionFilterProp="children"
              >
                <option value="">اختر طريقة الدفع</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Client Type Dropdown */}
          <div className="col">
            <div className="mb-3">
              <label className="form-cashier-label">نوع العميل</label>
              <select
                required
                className="form-cashier-select"
                placeholder="اختر نوع العميل"
                value={selectedClientType}
                onChange={(e) => handleClientTypeChange(e.target.value)}
                showSearch
                filterOption={(input, option) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                optionFilterProp="children"
              >
                <option value="">اختر نوع العميل</option>
                {clientTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col">
            <div className="mb-3">
              <label className="form-cashier-label">العميل</label>
              <select
                required
                className="form-cashier-select"
                placeholder="اختر العميل"
                value={selectedClients}
                onChange={(e) => {
                  const selectedClient = clients.find(
                    (client) => client.id === e.target.value
                  );
                  const clientName = selectedClient ? selectedClient.name : ""; // Get the selected client's name
                  setSelectedClientsName(clientName);
                  setSelectedClients(e.target.value);
                }}
                showSearch
                filterOption={(input, option) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                optionFilterProp="children"
              >
                <option value="">اختر اسم العميل</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col">
            <div className="mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-cashier-label "
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
                className="form-control shadow-sm form-cashier-select"
                id="exampleFormControlInput1"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="col">
            <div className="mb-3">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-cashier-label "
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
                className="form-control shadow-sm form-cashier-select "
                id="exampleFormControlInput1"
                placeholder="name@example.com"
              />
            </div>
          </div>

        </div>
      </div>
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: "25px",
            alignItems: "center",
          }}
        >
          <button
            className="form-cashier-btn"
            onClick={() => handleGettingReports()}
          // style={{ width: "100%", transition: `all 0.3s` }}
          >
            فلترة
          </button>

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
        </div>
      </div>
      {/* <div
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
      </div> */}

      {/* <table
        className="table table-hover mt-5"
        style={{ fontSize: "24px" }}
        ref={tableRef}
      >
        <thead>
          <tr>
            <th colSpan="8" className="text-center">
              <div>
               
                <span> {selectedPaymentMethodName}</span>
                <span>  |   </span>
                <span>{selectedClientTypeName}</span>
                <span> |  </span>
                <span>{selectedClientsName}</span> 
                <span> |  </span>
                <span>{new Date().toISOString().split("T")[0]}</span>
              </div>
            </th>
          </tr>
          <tr>
            <th scope="col">المنفذ</th>
            <th scope="col">الاجمالي :  </th>
          </tr>
        </thead>
        <tbody>
          {data?.data &&
            Object.keys(data.data).map((key, index) => {
              const order = data.data[key];
              return (
                <React.Fragment key={index}>
                  <tr>
                    <th
                      scope="row"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleClick(order.department_id)}
                    >
                      {order.department_name}
                    </th>
                    <th scope="row">
                      {Math.round(order.total_order_price * 100) / 100}
                    </th>
                  </tr>
                </React.Fragment>
              );
            })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="8" className="text-center">
              <div>
                <span>{sum}</span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table> */}

      <table
        className="table table-bordered table-striped mt-5"
        style={{ fontSize: "20px", textAlign: "center" }}
        ref={tableRef}
      >
        <thead style={{ backgroundColor: "#80403b", color: "white" }}>
          <tr>
            <th colSpan={isClientSummaryView ? 4 : 2} className="text-center p-3">
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                <span>طريقة الدفع: {selectedPaymentMethodName || "الكل"}</span>
                <span style={{ margin: "0 10px" }}>|</span>
                <span>نوع العميل: {selectedClientTypeName || "الكل"}</span>
                <span style={{ margin: "0 10px" }}>|</span>
                <span>العميل: {selectedClientsName || "الكل"}</span>
                <span style={{ margin: "0 10px" }}>|</span>
                <span>
                  من {fromDate || "—"} إلى {toDate || "—"}
                </span>
              </div>
            </th>
          </tr>
          <tr style={{ backgroundColor: "#e8e8e8" }}>
            <th
              scope="col"
              style={{
                width: isClientSummaryView ? "35%" : "70%",
                textAlign: "right",
              }}
            >
              {isClientSummaryView ? "اسم العميل" : "المنفذ"}
            </th>
            {isClientSummaryView && (
              <>
                <th scope="col" style={{ width: "20%", textAlign: "center" }}>
                  نوع العميل
                </th>
                <th scope="col" style={{ width: "15%", textAlign: "center" }}>
                  عدد الطلبات
                </th>
              </>
            )}
            <th
              scope="col"
              style={{
                width: isClientSummaryView ? "30%" : "30%",
                textAlign: "center",
              }}
            >
              {isClientSummaryView ? "إجمالي قيمة الطلبات" : "الإجمالي"}
            </th>
          </tr>
        </thead>

        <tbody>
          {isClientSummaryView ? (
            clientSummary.length > 0 ? (
              clientSummary.map((client) => (
                <tr
                  key={client.clientId ?? client.clientName}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRowClick(client)}
                >
                  <td style={{ textAlign: "right" }}>{client.clientName}</td>
                  <td style={{ textAlign: "center" }}>
                    {client.clientTypeName}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {client.totalOrderCount}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: "bold" }}>
                    {Number(client.totalOrderPrice).toFixed(2)} ج.م
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  لا توجد بيانات لعرضها.
                </td>
              </tr>
            )
          ) : departmentRows.length > 0 ? (
            departmentRows.map((order, index) => (
              <tr
                key={order.department_id ?? index}
                style={{ cursor: "pointer" }}
                onClick={() => handleRowClick(order)}
              >
                <td style={{ textAlign: "right" }}>{order.department_name}</td>
                <td style={{ textAlign: "center", fontWeight: "bold" }}>
                  {Math.round(order.total_order_price * 100) / 100} ج.م
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} style={{ textAlign: "center" }}>
                لا توجد بيانات لعرضها.
              </td>
            </tr>
          )}
        </tbody>

        <tfoot>
          {isClientSummaryView ? (
            <>
              <tr style={{ backgroundColor: "#d4edda", fontWeight: "bold" }}>
                <td colSpan={3} style={{ textAlign: "right" }}>
                  إجمالي قيمة الطلبات
                </td>
                <td style={{ textAlign: "center" }}>
                  {Number(totalClientOrderPrice).toFixed(2)} ج.م
                </td>
              </tr>
              <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}>
                <td colSpan={3} style={{ textAlign: "right" }}>
                  إجمالي عدد الطلبات
                </td>
                <td style={{ textAlign: "center" }}>{totalClientOrderCount}</td>
              </tr>
            </>
          ) : (
            <tr style={{ backgroundColor: "#d4edda", fontWeight: "bold" }}>
              <td style={{ textAlign: "right" }}>الإجمالي الكلي</td>
              <td style={{ textAlign: "center" }}>
                {departmentRows
                  .reduce(
                    (acc, item) => acc + (item.total_order_price || 0),
                    0
                  )
                  .toFixed(2)}{" "}
                ج.م
              </td>
            </tr>
          )}
        </tfoot>
      </table>

      <DataModal
        show={isModalVisable}
        onHide={handleCloseModal}
        itemId={selectedItemId}
        orders={orders}
        selectedPaymentMethodName={selectedPaymentMethodName}
        selectedClientTypeName={selectedClientTypeName}
        selectedClientsName={selectedClientsName}
        overrideClientTypeName={modalOverrides.clientTypeName}
        overrideClientName={modalOverrides.clientName}
      />
    </div>
  );
};

export default ShowAllOrderReports;
