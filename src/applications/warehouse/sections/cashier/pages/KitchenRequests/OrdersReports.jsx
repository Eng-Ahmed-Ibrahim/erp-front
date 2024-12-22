import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../../../context/AuthContext";
import { message, Modal } from "antd";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../../config";
import { changeOrderStatus, getOrders } from "../../../../../../apis/orders";
import "./styles.css";

const OrdersReports = () => {
  const [data, setData] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectID, setSelectId] = useState();
  const [selectedUser, setSelectUser] = useState();
  const [selectStats, setSelectedStatus] = useState();
  const [department, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectWatier, setSelectedWatier] = useState();
  const [isAdmin, setIsAdmin] = useState(false);

  const [isAdminRole, setIsAdminRole] = useState(false);


  const [clientTypes, setClientTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedPaymentMethodName, setSelectedPaymentMethodName] =
    useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [waiterName, setWaiterName] = useState([]);
  const [selectedPaymentMethodNakdy, setSelectedPaymentMethodNakdy] =
    useState("");
  const [selectedClientType, setSelectedClientType] = useState("");
  const [selectedClientName, setSelectedClientName] = useState(`guest`);
  const [clientData, setClientData] = useState();
  const [selectedClientsName, setSelectedClientsName] = useState("");
  const [isTalaat, setIsTalaat] = useState(false);
  const talaatId = "9d7b0996-857f-4a59-997b-64d605af07c0";

  const { user } = useAuth();
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const domain = API_ENDPOINT;
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
  const reInitializeStates = () => {
    setWaiterName([]);
    setSelectedWatier();
    setData([]);
  };
  const handleGettingReports = async () => {
    try {
      if (fromDate && toDate) {
        const fromDateObj = new Date(fromDate + "T00:00:00Z");
        const toDateObj = new Date(toDate + "T00:00:00Z");

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const isFromDateToday = fromDateObj.getTime() === today.getTime();

        const timeDiff = toDateObj.getTime() - fromDateObj.getTime();
        const dayDiff = timeDiff / (1000 * 3600 * 24);

        console.log('lllllllllllllllllll',user)
        setIsAdminRole(false)

        if (user.department.type === "reciver") {
          setIsAdmin(false);
          if (!isFromDateToday || dayDiff !== 1) {
            const modal = Modal.error({
              title: "error",
              content: (
                <div style={{ fontSize: "24px", textAlign: "center" }}>
                  يرجى ملئ جميع البيانات بشكل صحيح. يجب أن تكون الفترة بين
                  التاريخين يوم واحد
                </div>
              ),
              centered: true,
              width: 400,
            });

            setTimeout(() => {
              modal.destroy();
            }, 4000);
            return;
          }
        } else if (user.department.type === "master") {
          setIsAdmin(true);

          if(user.roleName == 'admin'){
            setIsAdminRole(true)
          }
          
        }

        console.log({
          fromDate,
          toDate,
          fromDateObj,
          toDateObj,
          isFromDateToday,
          dayDiff,
        });

        await getAllWaiters();
      } else {
        message.info("يرجى ملئ جميع السبيانات بشكل صحيح");
      }
    } catch (err) {}
  };

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
    if (user.roles[0] == talaatId) {
      setIsTalaat(true);
    }
  }, [newUserValues["client_type_id"]]);
  const handleClientTypeChange = async (value) => {
    const selectedClient = clientTypes.find((ele) => ele.id == value)?.name;
    setSelectedClientsName(selectedClient);
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
    } catch (error) {
      console.error("Error fetching clients for client type:", error);
    }
  };
  const fetchClientType = async (id) => {
    try {
      const recipeData = await getClientTypeById(id);
      setDiscount(recipeData.data.discount);
      setResedent(recipeData.data.name);
    } catch (error) {}
  };

  const handleDeleteOrder = async (id, status) => {
    const data = await changeOrderStatus(id, status);
    if (data) {
      message.success("تم حذف الاورد بنجاح");
    }else (
      message.error(' حدث خطأ أثناء الحذف')
    )
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
      if (user.department.type === "reciver") {
        const res = await axios.get(
          `${domain}/api/v1/store/department/orders/${user.department.id}`,
          {
            params: {
              from: fromDate,
              to: toDate,
              user_id: user.id,
              waiter_id: selectWatier,
            },
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        );
        console.log(`ress`, res);
        if (!res.data.success) {
          message.info(res?.data?.error?.message);
          console.log(`res?.data?.error?.message`, res);
          reInitializeStates();

          return;
        }
        setData(res.data);
      }
      if (user.department.type === "master") {
        const res = await axios.get(
          `${domain}/api/v1/store/department/orders/${selectID}`,
          {
            params: {
              from: fromDate,
              to: toDate,
              user_id: selectedUser,
              waiter_id: selectWatier,
              status: selectStats,
              store_id: selectID,
              client_id: selectedClients,
              client_type_id: selectedClientType,
              payment_method_id: selectedPaymentMethodNakdy,
            },
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        );
        setData(res.data);
      }
    } catch (error) {
      const modal = Modal.error({
        title: "error",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center" }}>
            {" "}
            {error.response.data.error.message}
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 3500);

      message.info(error);
    }
  }

  return (
    <div>
      <div
        className="shadow p-3 my-5 text-light text-center rounded"
        style={{ backgroundColor: "rgb(128, 61, 59)" }}
      >
        <h3>تقرير المبيعات</h3>
      </div>
      <div className="container text-center text-xl">
        <div className="row align-items-center">
          {user.department.type === "reciver" ? null : user.department.type ===
            "master" ? (
            <>
              <div className="col">
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    الحاله
                  </label>
                  <select
                    className="form-control"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option>اختر نوع الحاله</option>
                    <option value="processing">تحت النجهيز</option>
                    <option value="returned">مرتجع</option>
                    <option value="paid">مدفوع</option>
                    <option value="completed">تم التجهيز</option>
                    <option value="closed">منتهية</option>
                  </select>
                </div>
              </div>
              <div className="col">
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    اسم المنفذ
                  </label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      setSelectId(e.target.value);
                    }}
                  >
                    <option>اختر اسم المنفذ</option>
                    {department?.data?.map((method) =>
                      method.type === "reciver" ? (
                        <option value={method.id} key={method.id}>
                          {method.name}
                        </option>
                      ) : null
                    )}
                  </select>
                </div>
              </div>
              <div className="col">
                <div className="mb-3">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    اسم الكاشير
                  </label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      setSelectUser(e.target.value);
                    }}
                  >
                    <option>اختر اسم كاشير</option>
                    {users?.data?.map((method) => (
                      <option value={method.id} key={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : null}
          <div className="col">
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                اسم الويتر:
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value === "اختر اسم الويتر") {
                    setSelectedWatier(null);
                    setData([]);
                    return;
                  }
                  setSelectedWatier(e.target.value);
                }}
                className="form-control"
                aria-label=".form-select-lg example"
              >
                <option>اختر اسم الويتر</option>
                {waiterName.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col">
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                من
              </label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="col">
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                الى
              </label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value.toString().split("T")[0]);
                }}
              />
            </div>
          </div>

          <div className="col">
            <div className="mb-3">
              <button
                className="form-cashier-btn"
                onClick={() => handleGettingReports()}
                style={{
                  width: "100%",
                  marginTop: `27%`,
                  transition: `all 0.3s`,
                }}
              >
                تأكيد
              </button>
            </div>
          </div>
          {user.department.type === "master" ? (
            <>
              <div>
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
                      onChange={(e) =>
                        handlePaymentMethodChange(e.target.value)
                      }
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
                      value={clientTypes}
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

                {/* Client Dropdown */}
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
                        const clientName = selectedClient
                          ? selectedClient.name
                          : "";
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
              </div>
            </>
          ) : null}
        </div>
      </div>

      <table className="table table-hover mt-5 mb-20">
        <thead>
          <tr>
            <th scope="col"> مدفوعات الفيزا</th>
            <th scope="col"> مدفوعات الكاش</th>
            <th scope="col"> مدفوعات الاجل</th>
            <th scope="col">اجمالى المدفوعات</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{Math.round(data?.data?.totals.total_visa * 100) / 100}</td>
            <td scope="row">
              {Math.round(data?.data?.totals.total_cash * 100) / 100}
            </td>
            <td scope="row">
              {Math.round(data?.data?.totals.total_post_paid * 100) / 100}
            </td>
            <td scope="row">
              {Math.round(data?.data?.totals.total * 100) / 100}
            </td>
          </tr>
        </tbody>
      </table>
      <table className="table table-hover mt-5">
        <thead>
          <tr>
            <th scope="col">الرقم</th>
            <th scope="col">رقم الطلب</th>
            <th scope="col">الحالة</th>
            <th scope="col">تاريخ الطلب</th>
            <th scope="col">اسم العميل</th>
            <th scope="col">قيمة الفاتورة</th>
            <th scope="col">نوع العميل</th>
            {isAdmin && isAdminRole && !isTalaat && <th scope="col"> الاجرائات</th>}
            {isAdmin  && <th scope="col">المنتجات</th>}
          </tr>
        </thead>
        <tbody>
          {data?.data &&
            Object.keys(data.data).map((key, index) => {
              const order = data.data[key];
              const rowStyle =
                order.status === "returned" ? { background: "#b9aeae" } : {};
              const buttonStyle =
                order.status === "returned"
                  ? {
                      width: "100%",
                      marginTop: `27%`,
                      transition: `all 0.3s`,
                      background: "#444444",
                      color: "white",
                    }
                  : {
                      width: "100%",
                      marginTop: `27%`,
                      transition: `all 0.3s`,
                      background: "red",
                      color: "white",
                    };
              const buttonName =
                order.status === "returned" ? "تم الحذف" : "حذف الاوردر";

              return (
                <React.Fragment key={index}>
                  <tr style={rowStyle}>
                    <th style={rowStyle} scope="row">
                      {index + 1}
                    </th>
                    <td style={rowStyle}>{order.code}</td>
                    <td style={rowStyle}>{order.status}</td>
                    <td style={rowStyle}>{order.order_date}</td>
                    <td style={rowStyle}>
                      {order.client == "" ? "Guest" : order.client}
                    </td>
                    <td style={rowStyle}>
                      {Math.round(order.total_price * 100) / 100}
                    </td>
                    <td style={rowStyle}>{order.client_type}</td>
                    <td style={rowStyle}>
                      {order.products?.map((product, index) => (
                        <li key={index}>
                          {isAdmin &&
                            `${product.name} - ${product.quantity} × ${
                              product.price
                            } = ${Math.round(product.total_price * 100) / 100}`}
                        </li>
                      ))}
                    </td>
                    {isAdmin && !isTalaat && isAdminRole && (
                      <td style={rowStyle}>
                        <button
                          className="form-cashier-btn"
                          onClick={() =>
                            handleDeleteOrder(order.id, "returned")
                          }
                          style={buttonStyle}
                        >
                          {buttonName}
                        </button>
                      </td>
                    )}
                  </tr>
                </React.Fragment>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersReports;
