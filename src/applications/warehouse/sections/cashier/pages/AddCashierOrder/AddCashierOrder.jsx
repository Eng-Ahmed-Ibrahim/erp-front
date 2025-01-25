import React, { useState, useEffect, useCallback, useRef } from "react";
import TotalAmount from "../../../../../../components/shared/totalAmount/TotalAmount";
import LogoDAR from "../../../../../../../public/assets/images/Dar_logo.svg";
import "./AddCashierOrder.scss";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../../config";
import { message, Select, Modal } from "antd";
import { useAuth } from "../../../../../../context/AuthContext";
import { checkTableNumber } from "../../../../../../apis/orders";
import CashierOrderDetailes from "../../../../../../components/shared/CashierOrderDetails/CashierOrderDetailes";
import CashierItemList from "../../../../../../components/shared/CashierItemList/CashierItemList";
import { getClientTypeById } from "../../../../../../apis/clients/ClientType";
import Table from "../../../../../../components/shared/oneElementTable/Table";
import { changeOrderStatus, getOrders } from "../../../../../../apis/orders";
import { getOrderById, deleteOrder } from "../../../../../../apis/orders";
import { getRoles } from "../../../../../../apis/roles";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print"; // Import the hook
import {
  Br,
  Cut,
  Line,
  Printer,
  Text,
  Row,
  render,
} from "react-thermal-printer";
import { is } from "date-fns/locale";

function PrintAfterFinish({ id, table_no }) {
  const componentRef = useRef();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // New loading state
  const [data, setData] = useState({
    code: "",
    status: "",
    client: "",
    invoice_date: "",
    client_type: "",
    recipeData: [],
    total_price: 0,
    total_price_after_discount_and_tax: 0,
    departmentName: "",
    cashier: "",
    payment: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await changeOrderStatus(id, "closed");

        const InvoiceData = await getOrderById(id);
        setData({
          code: InvoiceData.data.code,
          cashier: InvoiceData.data.casher,
          products: InvoiceData.data.products,
          payment_method: InvoiceData.data.payment_method,
          order_date: InvoiceData.data.order_date,
          client: InvoiceData.data.client,
          payment: InvoiceData.data.payment_method,
          status: InvoiceData.data.status,
          invoice_date: InvoiceData.data.order_date,
          table_number: InvoiceData.data.table_number,
          client_type: InvoiceData.data.client_type,
          recipeData: InvoiceData.data.products,
          price: InvoiceData.data.price,
          total_price: InvoiceData.data.total_price,
          waiter_name: InvoiceData.data.waiter.name,
          total_price_after_discount_and_tax:
            InvoiceData.data.total_price_after_discount_and_tax,
          departmentName: InvoiceData.data.department,
        });
      } catch (error) {
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchData();
  }, [id]);

  const generatePDF = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${data.code + "-" + "أوردر كود"}`,
    onAfterPrint: () => {
      window.location.reload();
    },
  });

  useEffect(() => {
    if (!loading && data.code) {
      generatePDF();
    }
  }, [loading, data]);

  return (
    <div
      id="invoice-container"
      ref={componentRef}
      dir="rtl"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <Printer ref={componentRef} className="main">
        <div className="headers-wrapper">
          <div className="main-title">
            <p> أوردر من {data.departmentName}</p>
          </div>
          <div className="header-img">
            <img
              src={LogoDAR}
              alt=""
              style={{ width: "64px", marginBottom: "5px", marginLeft: "5px" }}
            />
          </div>
        </div>
        <div className="invoice-info">
          <div className="invoice-info-item">
            <p>كـــــود الأوردر : {data.code}</p>
            <p>تـاريـــخ الأوردر : {data.order_date}</p>
            <p>رقم الترابيزة : {table_no}</p>
          </div>
          <div className="invoice-info-item">
            <p>اسم الكاشير : {data.cashier}</p>
            <p>اسم الويتر : {data.waiter_name}</p>
            <p>اسم العميل : {data.client === "" ? "Guest" : data.client}</p>
            <p>الفئة : {data.client_type}</p>
            <p>طريقة الدفع : {data.payment_method}</p>
          </div>
        </div>
        <div className="invoice-items">
          <h2>محــــــتويات الأوردر</h2>
          <table>
            <thead>
              <tr>
                <th className="text-center">رقم العنصر</th>
                <th className="text-center">اسم العنصر</th>
                <th className="text-center">سعر العنصر الواحد</th>
                <th className="text-right">الكمية</th>
              </tr>
            </thead>
            <tbody>
              {data.products?.map((recipe, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">{recipe.name}</td>
                  <td className="text-center">{recipe.price}</td>
                  <td className="text-right">{recipe.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="text-price" colSpan={2}>
                  السعر الكلي بالخدمة
                </td>
                <td className="text-price" colSpan={2}>
                  {data.price?.toFixed(2)} ج.م
                </td>
              </tr>
              <tr>
                <td className="text-price" colSpan={2}>
                  السعر الكلي بعد الخصم
                </td>
                <td className="text-price" colSpan={2}>
                  {data.total_price?.toFixed(2)} ج.م
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <Cut />
      </Printer>
    </div>
  );
}

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
  const [selectedPaymentMethodNakdy, setSelectedPaymentMethodNakdy] =
    useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    "dc2a3eb5-0efd-4bed-a297-8f5b43e8dc13"
  );
  const [selectedClientName, setSelectedClientName] = useState(`guest`);
  const [items, setItems] = useState([]);
  const [showTable, setShowTable] = useState(false); // Controls table display
  const [showDetails, setShowDetails] = useState(false);
  const [isTakeAway, setIsTakeAway] = useState(false);
  const [isguest, setIsGuest] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [canEndOrder, setCanEndOrder] = useState(true);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [orderID, setOrderID] = useState("");
  const [selectedClientType, setSelectedClientType] = useState("");
  const [waiterName, setWaiterName] = useState([]);
  const [clientData, setClientData] = useState();
  const [discount, setDiscount] = useState();
  const [reseditType, setResedent] = useState();
  const [selectWaiter, setSelectedWatier] = useState(
    localStorage.getItem("DefaultWaiterId") || ""
  );

  const SUPPORT_MILITARY_ID = [
    "01j593bhrndb11k7rdhtacz7ht",
    "01jat25db9xbgfbskk9zygj5kq",
    "01jepaexvvm7s2zv7d9970nf5p",
    "",
  ];

  message.config({
    duration: 3,
    top: "50%",
    maxCount: 3,
  });
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
  const ExternalOrderCashierRole = "9db56bb2-7a34-4aad-8fbd-3f9b26a93e35";

  useEffect(() => {
    const fetchData = async () => {
      await fetchPaymentMethods();
      await fetchDiscountReasons();
    };
    fetchData();
  }, []);

  const validateSelection = (value) => {
    if (!value && newUserValues["client_id"] !== "") {
      return "يجب اختيار قيمة";
    }
    return "";
  };
  const validateTableNumber = (value) => {
    if (!isTakeAway) {
      if (value <= 0 || !value) {
        return "رقم التربيزة يجب أن يكون أكبر من صفر";
      }
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
    // && !isguest

    if (clients.length > 0 && !newUserValues.client_id && !isguest) {
      setIsDisabled(false);

      const modal = Modal.error({
        title: "Error",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center" }}>
            {" "}
            يجب اختيار اسم العميل{" "}
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 4000);
      e;

      rrors.mustChooseClientName = "يجب اختيار اسم العميل";
    }
    if (selectedClientName == "ظابط مشاه" && !militryIdInputValue) {
      setIsDisabled(false);
      const modal = Modal.error({
        title: "Error",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center" }}>
            {" "}
            يجب اضافة رقم العضوية
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 4000);
      errors.mustHaveMilitryNumber = "يجب اضافة رقم العضوية";
    }
    if (selectedClientType != "01hzf60qrasrm5x2ytvyrsne1j") {
      if (selectWaiter == "اختر اسم الويتر" || selectWaiter == "") {
        setIsDisabled(false);
        const modal = Modal.error({
          title: "Error",
          content: (
            <div style={{ fontSize: "24px", textAlign: "center" }}>
              يجب اختيار اسم الويتر
            </div>
          ),
          centered: true,
          width: 400,
        });

        setTimeout(() => {
          modal.destroy();
        }, 4000);
        return Object.values(errors).every((error) => error === "");
      }
    }
    errors.userError = validateUser();
    errors.tableNumber = validateTableNumber(newUserValues["table_number"]);
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
          params: {
            department_id: user.department.id,
          },
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
  const handleClientTypeChange = async (value) => {
    const selectedClient = clientTypes.find((ele) => ele.id == value)?.id;

    setSelectedClientName(clientTypes.find((ele) => ele.id == value)?.name);

    if (SUPPORT_MILITARY_ID.includes(selectedClient)) {
      console.log(selectedClient);
      setAddFormVisible(true);
    } else {
      setAddFormVisible(false);
      setSelectedClientType(false);
    }
    setSelectedClientType(value);

    if (selectedClient == "01j593a427a3kfrrxj8bkn115k") {
      setIsTakeAway(true);
    } else {
      setIsTakeAway(false);
    }
    if (selectedClient == "01j49hpdjbqher813xrp68ejz1") {
      setIsGuest(true);
    } else {
      setIsGuest(false);
    }

    if (selectedClient == "01jedx6za4e8ra7b5777qwzs45") {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
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
  const handleNewUserFormChange = (key, value) => {
    setNewUserValues((prevState) => ({
      ...prevState,
      [key]: value,
    }));
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
    } catch (error) {
      const modal = Modal.error({
        title: "Error",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center" }}>
            لايوجد ويتر
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 4000);
    }
  };

  const fetchClientType = async (id) => {
    try {
      const recipeData = await getClientTypeById(id);
      setClientData(recipeData?.data);
      setDiscount(recipeData.data.discount);
      setResedent(recipeData.data.name);
    } catch (error) {}
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

  const handleFinish = async () => {
    if (selectedClientType == "") {
      const modal = Modal.error({
        title: "Error",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center" }}>
            ادخل نوع العميل من فضلك{" "}
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 5000);
      return;
    }
    setIsDisabled(true);

    const formData = new FormData();
    const productQuantities = new Map();
    items.forEach((item) => {
      const { ProductId, productType, quantity } = item;
      if (productQuantities.has(ProductId)) {
        const existingItem = productQuantities.get(ProductId);
        existingItem.quantity += quantity;
      } else {
        productQuantities.set(ProductId, {
          productType,
          quantity,
        });
      }
    });
    Array.from(productQuantities.entries()).forEach(
      ([productId, { productType, quantity }], index) => {
        formData.append(`products[${index}][product_id]`, productId);
        formData.append(`products[${index}][product_type]`, productType);
        formData.append(`products[${index}][quantity]`, quantity);
      }
    );
    const date = new Date();
    const datetype = new Date(date.toLocaleString());
    const year = datetype.getFullYear();
    const month = String(datetype.getMonth() + 1).padStart(2, "0");
    const day = String(datetype.getDate()).padStart(2, "0");
    const hours = String(datetype.getHours()).padStart(2, "0");
    const minutes = String(datetype.getMinutes()).padStart(2, "0");
    const seconds = String(datetype.getSeconds()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    formData.append("order_date", formattedDate);
    formData.append("discount", discount);
    formData.append("table_number", "");
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
    {
      selectedClientType != "01hzf60qrasrm5x2ytvyrsne1j" &&
        formData.append("waiter_id", selectWaiter);
    }
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
      if (response.data) {
        setPrintData(response.data.data);
        const modal = Modal.success({
          title: "success",
          content: (
            <div style={{ fontSize: "24px", textAlign: "center" }}>
              لقد تم اضافة الاوردر بنجاح
            </div>
          ),
          centered: true,
          width: 400,
        });

        setTimeout(() => {
          modal.destroy();
        }, 2000);
        setItems([]);
        setOrderID(response.data.data.id);
        getOrderById(response.data.data.id)
          .then((datsss) => {})
          .catch((error) => {
            setIsDisabled(false);
            console.error("Error fetching order by ID:", error);
          });
        setShouldPrint(true);
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      const modal = Modal.error({
        title: "Error",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center" }}>
            {error.response.data.error.message}
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 4000);
    }
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
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  const handleSubmit = async () => {
    if (newUserValues["table_number"] == "") {
      const modal = Modal.error({
        title: "Error",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center" }}>
            لقد نسيت رقم الترابيزه
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 5000);
      return;
    }

    if (selectedClientType == "") {
      const modal = Modal.error({
        title: "Error",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center" }}>
            ادخل نوع العميل من فضلك{" "}
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 5000);
      return;
    }
    setIsDisabled(true);

    if (newUserValues["client_type_id"] != "01j593a427a3kfrrxj8bkn115k") {
      const resMessage = await checkTableNumber(newUserValues["table_number"]);
      if (resMessage === false) {
        setIsDisabled(false);
        const modal = Modal.error({
          title: "Error",
          content: (
            <div style={{ fontSize: "24px", textAlign: "center" }}>
              هذه الترابيزة مشغولة
            </div>
          ),
          centered: true,
          width: 400,
        });

        setTimeout(() => {
          modal.destroy();
        }, 5000);

        return;
      }
    }
    if (selectedClientType != "01hzf60qrasrm5x2ytvyrsne1j") {
      if (selectWaiter == "اختر اسم الويتر" || selectWaiter == "") {
        setIsDisabled(false);
        const modal = Modal.error({
          title: "Error",
          content: (
            <div style={{ fontSize: "24px", textAlign: "center" }}>
              يجب اختيار اسم الويتر
            </div>
          ),
          centered: true,
          width: 400,
        });

        setTimeout(() => {
          modal.destroy();
        }, 5000);
        return;
      }
    }
    if (!validateForm()) return;

    const formData = new FormData();
    const productQuantities = new Map();

    items.forEach((item) => {
      const { ProductId, productType, quantity } = item;
      if (productQuantities.has(ProductId)) {
        const existingItem = productQuantities.get(ProductId);
        existingItem.quantity += quantity; // Sum the quantities
      } else {
        productQuantities.set(ProductId, {
          productType,
          quantity,
        });
      }
    });

    Array.from(productQuantities.entries()).forEach(
      ([productId, { productType, quantity }], index) => {
        formData.append(`products[${index}][product_id]`, productId);
        formData.append(`products[${index}][product_type]`, productType);
        formData.append(`products[${index}][quantity]`, quantity);
      }
    );

    const date = new Date();
    const datetype = new Date(date.toLocaleString());
    const year = datetype.getFullYear();
    const month = String(datetype.getMonth() + 1).padStart(2, "0");
    const day = String(datetype.getDate()).padStart(2, "0");
    const hours = String(datetype.getHours()).padStart(2, "0");
    const minutes = String(datetype.getMinutes()).padStart(2, "0");
    const seconds = String(datetype.getSeconds()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    formData.append("order_date", formattedDate);

    formData.append("discount", discount);
    if (newUserValues["client_type_id"] == "01j593a427a3kfrrxj8bkn115k") {
      formData.append("table_number", "");
    } else {
      formData.append("table_number", newUserValues["table_number"]);
    }
    //  formData.append("table_number", newUserValues["table_number"]);
    formData.append("comment", newUserValues["comment"]);
    formData.append("deleviery_type", newUserValues["deleviery_type"]);
    formData.append("payment_method_id", newUserValues["payment_method_id"]);
    formData.append(
      "client_id",
      newUserValues["client_id"] === "add-new" ? "" : newUserValues["client_id"]
    );
    formData.append("client_type_id", newUserValues["client_type_id"]);
    formData.append("military_number", militryIdInputValue);
    formData.append("department_id", user?.department.id);

    {
      selectedClientType != "01hzf60qrasrm5x2ytvyrsne1j" &&
        formData.append("waiter_id", selectWaiter);
    }

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
      setIsDisabled(false);
      setFlag(true);
      setPrintData(response.data.data);
      const modal = Modal.success({
        title: "success",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center" }}>
            لقد تم اضافة الاوردر بنجاح
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 2000);
      setItems([]);
      //}
    } catch (error) {
      setIsDisabled(false);

      console.error("Error creating invoice:", error);
      const modal = Modal.error({
        title: "Error",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center" }}>
            {error.response.data.error.message}
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 5000);
    }
  };

  const [militryIdInputValue, setMilitryIdInputValue] = useState("");
  const [militryIdGotClicked, setMilitryIdGotClicked] = useState(false);
  const [timer, setTimer] = useState(null);
  const [messageVisible, setMessageVisible] = useState(false);
  const debouncedHandleSubmit = useCallback(debounce(handleSubmit, 400), [
    handleSubmit,
  ]);

  // useEffect(() => {
  //   // Clear previous timer on input change
  //   // if (timer) {
  //   //   clearTimeout(timer);
  //   // }

  //   const newTimer = setTimeout(() => {
  //     if (militryIdInputValue.length < 2 && militryIdGotClicked) {
  //       if (!messageVisible) {
  //         setMilitryIdInputValue('');
  //         message.info('يجب استعمال الاسكانر');
  //         setMessageVisible(true);
  //       }
  //     } else {
  //       handleNewUserFormChange("military_number", militryIdInputValue);
  //     }
  //   }, 20);

  //   setTimer(newTimer);

  //   // Cleanup timer on component unmount or input change
  //   return () => clearTimeout(newTimer);
  // }, [militryIdInputValue, militryIdGotClicked]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMilitryIdInputValue(value);
    setMilitryIdGotClicked(true);
  };

  useEffect(() => {
    const resetMessageVisibility = () => setMessageVisible(false);
    return () => resetMessageVisibility();
  }, [messageVisible]);

  useEffect(() => {
    console.log("dddddddddddddddddddddddddddddddddddddddd", user);
    if (user?.roles[0] == ExternalOrderCashierRole) {
      setCanEndOrder(false);
    }
  }, []);

  return (
    <div className="form-cashier-container fs-5">
      <h1 className="form-cashier-title"> {user?.department.name}</h1>
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
                <Option
                  key={method.id}
                  value={method.id}
                  style={{ fontSize: "22px", weight: "800" }}
                >
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
                <Option
                  key={type.id}
                  value={type.id}
                  style={{ fontSize: "22px", weight: "800" }}
                >
                  {type.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="form-cashier-select-wrraper">
            <label className="form-cashier-label">العميل</label>
            <Select
              required
              showSearch
              className="form-cashier-select"
              placeholder="اختر العميل"
              onChange={(value) => {
                handleNewUserFormChange("client_id", value);
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
                <Option
                  key={client.id}
                  value={client.id}
                  style={{ fontSize: "22px", weight: "800" }}
                >
                  {client.name}
                </Option>
              ))}
            </Select>
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
          {!isTakeAway ? (
            <>
              <label className="form-cashier-label">رقم التربيزة:</label>
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
                <span className="error cashier-input-error">
                  {errors.tableNumber}
                </span>
              )}
            </>
          ) : null}
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
        {!isTakeAway ? (
          <>
            <button
              className="form-cashier-btn"
              onClick={debouncedHandleSubmit}
              disabled={isDisabled}
              style={{
                backgroundColor: isDisabled ? "#d3d3d3" : "#AF8260",
                cursor: isDisabled ? "not-allowed" : "pointer",
                color: isDisabled ? "#a9a9a9" : "white",
              }}
            >
              حفظ البيانات
            </button>
          </>
        ) : null}

        {!isguest && !isHidden && canEndOrder ? (
          <>
            <button
              className="finish-cashier"
              onClick={() => handleFinish()}
              disabled={isDisabled}
              style={{
                backgroundColor: isDisabled ? "#d3d3d3" : "#ff0000", // gray for disabled, green otherwise
                cursor: isDisabled ? "not-allowed" : "pointer",
                color: isDisabled ? "#a9a9a9" : "white", // adjust text color if needed
              }}
            >
              إنهاء الأوردر
            </button>
          </>
        ) : null}
      </div>

      {shouldPrint && <PrintAfterFinish id={orderID} />}
    </div>
  );
};

export default AddCashierOrder;
