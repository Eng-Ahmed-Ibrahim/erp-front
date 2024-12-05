import React, { useState, useEffect } from "react";
import TotalAmount from "../../../../../../components/shared/totalAmount/TotalAmount";
import "./AddCashierOrder.scss";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../../config";
import { message, Select } from "antd";
import { useAuth } from "../../../../../../context/AuthContext";
import { checkTableNumber } from "../../../../../../apis/orders";
import CashierOrderDetailes from "../../../../../../components/shared/CashierOrderDetails/CashierOrderDetailes";
import CashierItemList from "../../../../../../components/shared/CashierItemList/CashierItemList";
import { getClientTypeById } from "../../../../../../apis/clients/ClientType";
import PrintAfterSubmit from "../KitchenRequests/PrintAfterSubmit";
import Table from "../../../../../../components/shared/oneElementTable/Table";
import { changeOrderStatus, getOrders } from "../../../../../../apis/orders";
import { getOrderById, deleteOrder } from "../../../../../../apis/orders";
import { getRoles } from "../../../../../../apis/roles";

const { Option } = Select;

const AddCashierOrder = () => {
  const { user } = useAuth();
  const [clientTypes, setClientTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [errors, setErrors] = useState({});
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [discountReasons, setDiscountReasons] = useState([]);
  const [flag, setFlag] = useState(false);
  const [printData, setPrintData] = useState();
  const [selectedPaymentMethodNakdy, setSelectedPaymentMethodNakdy] = useState("نقدي");

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("dc2a3eb5-0efd-4bed-a297-8f5b43e8dc13");
  const [selectedClientName, setSelectedClientName] = useState(`guest`)
  const [items, setItems] = useState([]);
  const [showTable, setShowTable] = useState(false); // Controls table display
  const [showDetails, setShowDetails] = useState(false);
  const [orderID, setOrderID] = useState("");
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

  useEffect(() => {
    console.log('user in this component ', user);
    const fetchData = async () => {
      await fetchPaymentMethods();
      await fetchDiscountReasons();
    };
    fetchData();
  }, []);

  const validateCustomerName = (value) => {
    if (!value.trim()) {
      return "يجب أن تدخل اسم العميل";
    }
    return "";
  };

  const validateDiscount = (value) => {
    if (value < 0) {
      return "نسبة الخصم يجب أن تكون أكبر من أو تساوي صفر";
    }
    return "";
  };

  const validateDiscountReason = (value) => {
    if (!value) {
      return "يجب أن تدخل سبب الخصم";
    }
    return "";
  };

  const validateSelection = (value) => {
    if (!value && newUserValues["client_id"] !== "") {
      return "يجب اختيار قيمة";
    }

    return "";
  };
  const validateTableNumber = (value) => {
    if (value <= 0 || !value) {
      return "رقم التربيزة يجب أن يكون أكبر من صفر";
    }
    return "";
  };
  const validateUser = () => {
    if (newUserValues["client_id"] === "add-new") {
      if (
        !newUserValues["name"] ||
        !newUserValues["phone"] ||
        !newUserValues["military_number"] ||
        !newUserValues["client_type_id"] ||
        !newUserValues["waiter_id"] ||
        !newUserValues["discount_reason_id"] ||
        !newUserValues["payment_method_id"]
      )
        return "يجب اختيار قيم للمستخدم الجديد";
    } else {
      return "";
    }
  };

  const validateForm = () => {
    const errors = {};
    if (clients.length > 0 && !newUserValues.client_id) {
      message.error("يجب اختيار اسم العميل");
      errors.mustChooseClientName = "يجب اختيار اسم العميل"
    }
    if (selectedClientName == "ظابط مشاه" && !newUserValues.military_number) {
      message.error("يجب اضافة رقم العضوية");
      errors.mustHaveMilitryNumber = "يجب اضافة رقم العضوية"

    }
    if (selectWaiter == "اختر اسم الويتر" || selectWaiter == "") {
      message.error("يجب اختيار اسم الويتر");

    }
    errors.userError = validateUser();
    errors.tableNumber = validateTableNumber(newUserValues["table_number"]);
    // if(newUserValues.client_id != ""){
    //   errors.discountReason = validateDiscountReason(
    //     newUserValues["discount_reason_id"]
    //   );
    // }


    errors.selectedClient = validateSelection(newUserValues["client_id"]);
    errors.clientType = validateSelection(newUserValues["client_type_id"]);
    errors.deliveryType = validateSelection(newUserValues["deleviery_type"]);
    errors.paymentMethod = validateSelection(
      newUserValues["payment_method_id"]
    );
    setErrors(errors);
    return Object.values(errors).every((error) => error === "");
  };

  const fetchDiscountReasons = async () => {
    try {
      const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/orders/discount/reasons`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const data = await response.json();
      setDiscountReasons(data.data);
    } catch (error) {
      console.error("Error fetching Product categories:", error);
    }
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
  useEffect(() => {
    const fetchPaymentMethodsAndInitialClientType = async () => {
      try {
        const Token = localStorage.getItem("token") || sessionStorage.getItem("token");

        // Fetch payment methods
        const response = await axios.get(`${API_ENDPOINT}/api/v1/store/payment_method`, {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        });
        setPaymentMethods(response.data.data);
        const clientTypeResponse = await axios.get(
          `${API_ENDPOINT}/api/v1/store/client_type/payment_method/${selectedPaymentMethod}`,
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        );
        setNewUserValues((prevState) => ({
          ...prevState,
          client_type_id: "01j49hpdjbqher813xrp68ejz1",
        }));
        setNewUserValues((prevState) => ({
          ...prevState,
          payment_method_id: selectedPaymentMethod,
        }));
        setClientTypes(clientTypeResponse.data.data);
      } catch (error) {
        console.error("Error fetching payment methods or client types:", error);
      }
    };

    fetchPaymentMethodsAndInitialClientType();
  }, [selectedPaymentMethod]);
  const handlePaymentMethodChange = async (value) => {
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
  const [selectedClientType, setSelectedClientType] = useState("Guest");
  const fetchNakdyPaymentType = async () => {
    try {
      const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.get(
        `${API_ENDPOINT}/api/v1/orders/clients/dc2a3eb5-0efd-4bed-a297-8f5b43e8dc13`,
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
  const handleClientTypeChange = async (value) => {
    const selectedClient = clientTypes.find(ele => ele.id == value)?.name;
    setSelectedClientName(selectedClient);
    if (selectedClient == "ظابط مشاه") {
      setAddFormVisible(true)
    } else {
      setAddFormVisible(false)
      setSelectedClientType(false);
    }
    setSelectedClientType(value)
    setNewUserValues((prevState) => ({
      ...prevState,
      client_type_id: value,
    }));
    handleNewUserFormChange("client_id", ``)
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
  const handleNewUserFormChange = (key, value) => {
    setNewUserValues((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const [waiterName, setWaiterName] = useState([]);

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
    } catch (error) {
      message.error("لايوجد واتر");
    }
  };

  const [clientData, setClientData] = useState();
  const [discount, setDiscount] = useState();
  const [reseditType, setResedent] = useState();
  const [selectWaiter, setSelectedWatier] = useState(
    localStorage.getItem("DefaultWaiterId") || ""
  );

  const fetchClientType = async (id) => {
    try {
      const recipeData = await getClientTypeById(id);
      setClientData(recipeData?.data);
      setDiscount(recipeData.data.discount);
      setResedent(recipeData.data.name);
    } catch (error) {
    }
  };

  useEffect(
    () => {
      fetchClientType(newUserValues["client_type_id"]);
      getAllWaiters();
    },
    [newUserValues["client_type_id"]],
    selectWaiter
  );

  const handleAddItem = (item) => {
    setItems([...items, item]);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const calculateTotalAmount = () => {
    return items?.reduce(
      (total, item) => total + item?.quantity * item?.price,
      0
    );
  };
  /*

  */
  const handleFinish = async () => {

    const formData = new FormData();

    items.forEach((item, index) => {
      formData.append(`products[${index}][product_id]`, item.ProductId);
      formData.append(`products[${index}][product_type]`, item.productType);
      formData.append(`products[${index}][quantity]`, item.quantity);
    });
    const date = new Date();
    const datetype = new Date(date.toLocaleString()); // Assuming this is your date string
    const year = datetype.getFullYear();
    const month = String(datetype.getMonth() + 1).padStart(2, "0");
    const day = String(datetype.getDate()).padStart(2, "0");
    const hours = String(datetype.getHours()).padStart(2, "0");
    const minutes = String(datetype.getMinutes()).padStart(2, "0");
    const seconds = String(datetype.getSeconds()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    formData.append("order_date", formattedDate);
    formData.append("discount", discount);
    formData.append("table_number", newUserValues["table_number"]);
    formData.append("comment", newUserValues["comment"]);
    formData.append("deleviery_type", newUserValues["deleviery_type"]);
    formData.append("payment_method_id", newUserValues["payment_method_id"]);
    formData.append(
      "client_id",
      newUserValues["client_id"] === "add-new" ? "" : newUserValues["client_id"]
    );
    formData.append("client_type_id", newUserValues["client_type_id"]);
    formData.append("military_number", newUserValues["military_number"]);
    formData.append("department_id", user?.department.id);
    formData.append("waiter_id", selectWaiter);
    formData.append("name", newUserValues["name"]);
    formData.append("phone", newUserValues["phone"]);
    formData.append("tax", 0);

    try {
      const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/orders/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-cashier-data",
            Authorization: `Bearer ${Token}`,
          },
        }
      );

      // console.log(response.data);
      setFlag(true);
      setPrintData(response.data.data);
      message.success("لقد تم اضافة الاوردر بنجاح");
      setItems([]);
      setShowDetails(true);
      setOrderID(response.data.data.id)
    } catch (error) {
      console.error("Error creating invoice:", error);
      message.error(error.response.data.error.message);
    }
    // setShowTable(true); // Show the Table component when button is clicked

  };

  const detailsHeaders = [
    {
      key: "products",
      label: "المنتجات",
      isArray: true,
      isInput: true,
      details: [
        { key: "name", label: "الإسم", isInput: false },
        { key: "price", label: "السعر", isInput: false },
        { key: "quantity", label: "الكمية", isInput: false },
      ],
    },
  ];


  /*
  */
  const handleSubmit = async () => {

    const resMessage = await checkTableNumber(newUserValues["table_number"]);
    if (resMessage === false) {
      message.error("هذه الترابيزة مشغولة");
      return;
    }

    if (!validateForm()) return;
    const formData = new FormData();

    items.forEach((item, index) => {
      formData.append(`products[${index}][product_id]`, item.ProductId);
      formData.append(`products[${index}][product_type]`, item.productType);
      formData.append(`products[${index}][quantity]`, item.quantity);
    });
    const date = new Date();
    const datetype = new Date(date.toLocaleString()); // Assuming this is your date string
    const year = datetype.getFullYear();
    const month = String(datetype.getMonth() + 1).padStart(2, "0");
    const day = String(datetype.getDate()).padStart(2, "0");
    const hours = String(datetype.getHours()).padStart(2, "0");
    const minutes = String(datetype.getMinutes()).padStart(2, "0");
    const seconds = String(datetype.getSeconds()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    formData.append("order_date", formattedDate);

    formData.append("discount", discount);
    formData.append("table_number", newUserValues["table_number"]);
    formData.append("comment", newUserValues["comment"]);
    formData.append("deleviery_type", newUserValues["deleviery_type"]);
    formData.append("payment_method_id", newUserValues["payment_method_id"]);
    formData.append(
      "client_id",
      newUserValues["client_id"] === "add-new" ? "" : newUserValues["client_id"]
    );
    formData.append("client_type_id", newUserValues["client_type_id"]);
    formData.append("military_number", newUserValues["military_number"]);
    formData.append("department_id", user?.department.id);
    formData.append("waiter_id", selectWaiter);
    formData.append("name", newUserValues["name"]);
    formData.append("phone", newUserValues["phone"]);
    formData.append("tax", 0);

    try {
      const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/orders/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-cashier-data",
            Authorization: `Bearer ${Token}`,
          },
        }
      );

      setFlag(true);
      setPrintData(response.data.data);
      message.success("لقد تم اضافة الاوردر بنجاح");
      setItems([]);
    } catch (error) {
      console.error("Error creating invoice:", error);
      message.error(error.response.data.error.message);
    }
  };
  const [militryIdInputValue, setMilitryIdInputValue] = useState('');
  const [militryIdGotClicked, setMilitryIdGotClicked] = useState(false);
  const [timer, setTimer] = useState(null);
  const [messageVisible, setMessageVisible] = useState(false);

  useEffect(() => {
    // Clear previous timer on input change
    // if (timer) {
    //   clearTimeout(timer);
    // }

    const newTimer = setTimeout(() => {
      if (militryIdInputValue.length < 2 && militryIdGotClicked) {
        if (!messageVisible) {
          setMilitryIdInputValue('');
          message.info('يجب استعمال الاسكانر');
          setMessageVisible(true);
        }
      } else {
        handleNewUserFormChange("military_number", militryIdInputValue);
      }
    }, 20);

    setTimer(newTimer);

    // Cleanup timer on component unmount or input change
    return () => clearTimeout(newTimer);
  }, [militryIdInputValue, militryIdGotClicked]);


  const handleInputChange = (e) => {
    const value = e.target.value;
    setMilitryIdInputValue(value);
    setMilitryIdGotClicked(true);
  };

  useEffect(() => {
    const resetMessageVisibility = () => setMessageVisible(false);
    return () => resetMessageVisibility();
  }, [messageVisible]);



  return (
    <div className="form-cashier-container fs-5">
      <h1 className="form-cashier-title">فاتورة الكاشير</h1>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ width: "100%" }}>
          <label className="form-cashier-label fw-bold">اسم الكاشير:</label>
          <input
            className="form-cashier-name-input"
            type="text"
            disabled={true}
            style={{ cursor: "not-allowed" }}
            value={user?.name}
          />
        </div>

        <div style={{ width: "100%" }}>
          <label className="form-cashier-label">اسم الويتر:</label>
          <select
            onChange={(e) => {
              setSelectedWatier(e.target.value);
              // local storage
              localStorage.setItem("DefaultWaiterId", e.target.value);
            }}
            className="form-cashier-name-input"
            aria-label=".form-select-lg example"
          >
            <option>اختر اسم الويتر</option>
            {waiterName.map((method) => {
              if (selectWaiter == method.id) {
                return (
                  <option selected key={selectWaiter} value={selectWaiter}>
                    {method.name}
                  </option>
                );
              }
              return (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              );
            })}
          </select>

          {/* <input
            className="form-cashier-name-input"
            type="text"
            value={"محمد احمد"}
          /> */}
        </div>
      </div>
      <div className="form-cashier-product-category-parent">
        {/*////////////////////////////// الكاشير //////////////////////////  */}
        <div className="form-cashier-product-category">
          <div className="form-cashier-select-wrraper">
            <label className="form-cashier-label">طرق الدفع</label>
            <Select
              required
              showSearch
              className="form-cashier-select"
              placeholder="اختر طريقة دفع"
              value={selectedPaymentMethodNakdy}
              onChange={handlePaymentMethodChange}
              filterOption={(input, option) => {
                return (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
              optionFilterProp="children"
            >
              {paymentMethods.map((method) => (
                <Option key={method.id} value={method.id}>
                  {method.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="form-cashier-select-wrraper">
            <label className="form-cashier-label">نوع العميل</label>
            <Select
              required
              showSearch
              className="form-cashier-select"
              placeholder="اختر نوع العميل"
              value={selectedClientType}
              onChange={handleClientTypeChange}
              filterOption={(input, option) => {
                return (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
              optionFilterProp="children"
            >
              {clientTypes.map((type) => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>)

              )}
            </Select>

            {/* <button
              className="form-cashier-btn"
              onClick={() => setAddFormVisible(!addFormVisible)}
              style={{ width: "100%" }}
            >
              أضف جديد
            </button> */}
          </div>
          <div className="form-cashier-select-wrraper">
            <label className="form-cashier-label">العميل</label>
            <Select
              required
              showSearch
              className="form-cashier-select"
              placeholder="اختر العميل"
              onChange={(value) => {
                handleNewUserFormChange("client_id", value)
              }}
              filterOption={(input, option) => {
                return (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
              optionFilterProp="children"
              value={newUserValues.client_id}
            >
              <option>اختر اسم العميل</option>
              {clients.map((client) => (
                <Option key={client.id} value={client.id}>
                  {client.name}
                </Option>
              ))}
            </Select>
            {errors.tableNumber && (
              <span className="error cashier-input-error ">
                {errors.tableNumber}
              </span>
            )}
          </div>
        </div>

        {/* //////////////////////////////////////////////// */}

        {addFormVisible && (
          <div className="form-cashier-details-parent">
            <div>
              <label className="form-cashier-label"> الرقم العضوية:</label>
              <input
                className="form-cashier-input"
                type="password"
                value={militryIdInputValue}
                onWheel={(event) => event.currentTarget.blur()}
                autoComplete="new-password"
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}
      </div>

      <div className="form-cashier-details-parent">
        <div>
          <label className="form-cashier-label"> رقم التربيزة:</label>
          <input
            required
            className="form-cashier-input"
            type="number"
            min={1}
            value={newUserValues["table_number"]}
            onChange={(e) =>
              handleNewUserFormChange("table_number", e.target.value)
            }
            onWheel={(event) => event.currentTarget.blur()}
          />
          {errors.tableNumber && (
            <span className="error cashier-input-error ">
              {errors.tableNumber}
            </span>
          )}
        </div>
        <div>
          <label className="form-cashier-label">ملاحظة : </label>
          <textarea
            className="form-cashier-txt-area"
            onChange={(e) => handleNewUserFormChange("comment", e.target.value)}
          ></textarea>
        </div>
      </div>
      <CashierOrderDetailes
        onAddItem={handleAddItem}
        clientTypePrice={newUserValues["client_type_id"]}
      />
      <CashierItemList items={items} onDeleteItem={handleDeleteItem} />
      <TotalAmount total={calculateTotalAmount()} />
      <div className="btns">
        <button className="form-cashier-btn" onClick={handleSubmit}>
          حفظ البيانات
        </button>
        <button className="finish-cashier" onClick={() => handleFinish()}>
          إنهاء الأوردر
        </button>

      </div>
      {showDetails && (
        <Table
          title="الأوردرات"
          fetchData={() => getOrderById(orderID)}

          deleteFn={deleteOrder}
          changeStatusFn={changeOrderStatus}
          detailsHeaders={detailsHeaders}
          acceptTitle={
            user?.permissions.some(
              (permission) => permission.name === "change order status kitchen"
            )
              ? { value: "completed", label: "جهز" }
              : null
          }
          rejectTitle={
            user?.permissions.some(
              (permission) => permission.name === "change order status cashier"
            )
              ? { value: "closed", label: "إنهاء الأوردر" }
              : null
          }
          isRequests
        />
      )}
    </div>
  );
};

export default AddCashierOrder;
