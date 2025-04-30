import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../../../context/AuthContext";
import { message, Modal } from "antd";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../../config";
import { changeOrderStatus, getOrders } from "../../../../../../apis/orders";
import "./styles.css";
import { set } from "date-fns";
import { TbBorderRadius } from "react-icons/tb";
import { ConsoleSqlOutlined } from "@ant-design/icons";

function DeleteOrderModel({ show, onHide, orderId, status }) {
  const [deletionNote, setNewDeletionNote] = useState("");
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleDeleteOrder = async () => {
    if (!deletionNote || deletionNote.length < 10) {
      message.error("لا يمكن حذف الأوردر بدون توضيح السبب");
    }

    const data = await changeOrderStatus(orderId, status, deletionNote);

    if (data) {
      message.success("تم حذف الاورد بنجاح");
    } else {
      message.error(" حدث خطأ أثناء الحذف");
    }
    setNewDeletionNote("");
    onHide();
  };

  return (
    <Modal
      // title={"إضافة ملاحظة"}
      centered
      open={show}
      onCancel={onHide}
      onOk={onHide}
      width={900}
      footer={null}
    >
      <div
        className="payable-container"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <div className="mb-4" style={{ textAlign: "center", width: "100%" }}>
          <h4 className="form-label"> أضف سبب حذف الأوردر </h4>
          <input
            type="text"
            value={deletionNote}
            onChange={(e) => setNewDeletionNote(e.target.value)}
            placeholder=" أضف سبب حذف الأوردر"
            className="form-input"
            style={{
              height: "120px",
              marginTop: "20px",
              width: "98%",
            }}
          />
        </div>

        <button
          className="pdf-button"
          style={{
            width: "20%",
            transition: `all 0.3s`,
            background: "#ef0606",
            color: "white",
            alignSelf: "center",
            marginTop: "20px",
          }}
          onClick={handleDeleteOrder}
        >
          حذف الأوردر
        </button>
      </div>
    </Modal>
  );
}

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
  const [isDeleteModelVisible, setIsDeleteModelVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(false);

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

  const isTodayOrYesterday = (dateInput)=>{
    const formatedInputDate = new Date(dateInput)
    formatedInputDate.setHours(0,0,0,0);
    
    const today =  new Date()
    today.setHours (0,0,0,0);
    
    const yesterday =  new Date()
    yesterday.setDate(today.getDate() -1 )
    yesterday.setHours(0,0,0,0);

    return (formatedInputDate.getTime() === today.getTime() ||
         formatedInputDate.getTime() === yesterday.getTime());
    
    }
    
    const handleGettingReports = async () => {
    try {
      if (fromDate && toDate) {
        // const fromDateObj = new Date(fromDate );
        // const toDateObj = new Date(toDate );

        // const today = new Date();
        // today.setUTCHours(0, 0, 0, 0);

        // const isFromDateToday = fromDateObj.getTime() === today.getTime();

        // const timeDiff = toDateObj.getTime() - fromDateObj.getTime();
        // const dayDiff = timeDiff / (1000 * 3600 * 24);

        
        setIsAdminRole(false);

        if (user.department.type === "reciver") {
          setIsAdmin(false);

          if ( ! (isTodayOrYesterday(fromDate) && isTodayOrYesterday(toDate))) {
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
          if (user.roleName === "admin") {
            setIsAdminRole(true);
          }
        }

        await getAllWaiters();
      } else {
        message.info("يرجى ملئ جميع البيانات بشكل صحيح");
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
    setSelectedOrderId(id);
    setIsDeleteModelVisible(true);
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

    const today = new Date();
    const year =  today.getFullYear();
    const month = String(today.getMonth()+1).padStart(2,'0')
    const day = String(today.getDate()).padStart(2,'0')
    setToDate(`${year}-${month}-${day}T23:59:59`);

    console.log('ttttttt', today.toISOString())
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
        if (!res.data.success) {
          message.info(res?.data?.error?.message);
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
      <div
        className="text-xl"
        style={{ alignSelf: "center", justifySelf: "center", style: "70%" }}
      >
        <div
          className="row align-items-center"
          style={{
            width: "100%",
            display: "flex",
            gap: "20px",
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          {user.department.type === "reciver" ? null : user.department.type ===
            "master" ? (
            <>
              <div className="col">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  الحاله
                </label>
                <select
                  className="form-cashier-select"
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

              <div className="col">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  اسم المنفذ
                </label>
                <select
                  className="form-cashier-select"
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
              <div className="col">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label"
                >
                  اسم الكاشير
                </label>
                <select
                  className="form-cashier-select"
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
            </>
          ) : null}

          <div className="col">
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
              className="form-cashier-select"
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

          <div className="col">
            <label htmlFor="exampleFormControlInput1" className="form-label">
              من
            </label>
            <input
              type="datetime-local"
              className="form-cashier-select"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
              }}
            />
          </div>

          <div className="col">
            <label htmlFor="exampleFormControlInput1" className="form-label">
              الى
            </label>
            <input
              type="datetime-local"
              className="form-cashier-select"
              value={toDate}
              onChange={(e) => {
                console.log(e.target.value)
                setToDate(e.target.value);
                // setToDate(e.target.value.toString().split("T")[0]);

              }}
            />
          </div>
          <div
            style={{
              marginTop: "0px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "30px",
            }}
          >
            {user.department.type === "master" ? (
              <>
                <div className="col">
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

                <div className="col">
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

                <div className="col">
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
              </>
            ) : null}
            <>
              <div className="col">
                <button
                  className="form-cashier-btn"
                  onClick={() => handleGettingReports()}
                  style={{
                    width: "100%",
                    marginTop: "50px",
                    transition: `all 0.3s`,
                  }}
                >
                  تأكيد
                </button>
              </div>
            </>
          </div>
        </div>
      </div>

      {data?.data && (
        <>
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
                <th scope="col">ملاحظات</th>
                {isAdmin && <th scope="col">المنتجات</th>}
                {isAdmin && !isTalaat && isAdminRole && <th scope="col"> الاجرائات</th>}
              </tr>
            </thead>

            <tbody>
              {data?.data &&
                Object.keys(data.data).map((key, index) => {
                  const order = data.data[key];
                  const rowStyle =
                    order.status === "returned"
                      ? { background: "#b9aeae" }
                      : {};
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
                          {order?.comment?.split(",")?.map((c) => {
                            return (
                              <>
                                <li>{c}</li>
                              </>
                            );
                          })}
                        </td>
                        <td style={rowStyle}>
                          {order.products?.map((product, index) => (
                            <li key={index}>
                              {isAdmin &&
                                `${product.name} - ${product.quantity} × ${
                                  product.price
                                } = ${
                                  Math.round(product.total_price * 100) / 100
                                }`}
                            </li>
                          ))}
                        </td>
                        {isAdmin && !isTalaat && isAdminRole &&(
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
        </>
      )}
      <DeleteOrderModel
        show={isDeleteModelVisible}
        onHide={() => setIsDeleteModelVisible(false)}
        orderId={selectedOrderId}
        status={"returned"}
      />
    </div>
  );
};

export default OrdersReports;
