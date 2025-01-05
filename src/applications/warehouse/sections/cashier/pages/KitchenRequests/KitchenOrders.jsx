import Table from "../../../../../../components/shared/table/Table";
import { changeOrderStatus, getOrders } from "../../../../../../apis/orders";
import { getAllUsers } from "../../../../../../apis/users";
import { getAllDepartments } from "../../../../../../apis/departments";
import "../../../../../../components/shared/table/Table.scss";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../../../../context/AuthContext";
import OrderCard from "../KitchenRequests/OrderCard";
import soundFile from "./beem.mp3";

const KitchenRequests = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [orderCount, setOrderCount] = useState("");
  const [playSound, setPlaySound] = useState(false);
  const [isKitchien, setIsKitchien] = useState(false);
  const [data, setData] = useState([]);

  const KITCHEN_DEPARTMENTS = [
    "3d1e1d26-91ff-40b8-9b2c-139aa79430e9",
    "01j45gtesjz0mm3qf0sz6bzvn9",
  ];

  const [filterValues, setFilterValues] = useState({
    code: "",
    status: "",
    show_history: 0,
  });

  const SoundPlayer = ({ play }) => {
    const audioRef = useRef(null);

    useEffect(() => {
      if (play && audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing sound:", error);
        });
      }
    }, [play]);

    return <audio ref={audioRef} src={soundFile} />;
  };

  useEffect(() => {
    if (
      user.department.type == "both" ||
      KITCHEN_DEPARTMENTS.includes(user.department.id)
    ) {
      setIsKitchien(true);
    }

    const fetchDepartments = async () => {
      const res = await getAllDepartments();
      setDepartments(
        [{ label: "", value: "" }].concat(
          res.data.map((item) => ({
            label: item.name,
            value: item.id,
          }))
        )
      );
    };

    const fetchUsers = async () => {
      const res = await getAllUsers();
      setUsers(
        [{ label: "", value: "" }].concat(
          res.data.map((item) => ({
            label: item.name,
            value: item.id,
          }))
        )
      );
    };

    // Fetch orders whenever filter values change
    const fetchOrders = async () => {
      const res = await getOrders(
        {
          ...filterValues,
          user_id: user.id,
          department_id: user?.department.id,
        },
        user?.department.type === "reciver" ? user?.department.id : null,
        setIsLoading
      );

      setOrders(res.data);
    };
    fetchDepartments();
    fetchUsers();
    fetchOrders(); // Call fetch orders on first render
  }, [filterValues]); // Re-fetch orders when filter values change

  useEffect(() => {
    let intervalId;
    intervalId = setInterval(() => {
      getOrders(
        {
          ...filterValues,
          user_id: user.id,
          department_id: user?.department.id,
        },
        user?.department.type === "reciver" ? user?.department.id : null,
        setIsLoading
      ).then((result) => {
        console.log("result", result);

        if (result?.orders_count >  data?.orders_count || result?.pagination?.total > data?.pagination?.total) {
          setPlaySound(true);
          setTimeout(() => {
            setPlaySound(false);
          }, 5000);
        }
        setOrders(result.data);
        setData(result);
      });
    }, 20000);
    return () => clearInterval(intervalId); // Cleanup
  }, [filterValues, orders]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const refreshOrders = async () => {
    const res = await getOrders(
      {
        ...filterValues,
        user_id: user.id,
        department_id: user?.department.id,
      },
      user?.department.type === "reciver" ? user?.department.id : null,
      setIsLoading
    );
    setOrders(res.data);
  };

  const tableHeaders = [
    { key: "client_type", value: "نوع العميل" },
    { key: "table_number", value: "رقم الترابيزة" },
    { key: "status", value: "الحالة" },
    { key: "code", value: "كود الأوردر" },
    { key: "order_date", value: "التاريخ" },
    { key: "client", value: "إسم العميل" },
  ];

  const filters = [
    {
      key: "code",
      type: "text",
      id: "كود الفاتورة",
      value: filterValues.code,
      onChange: handleFilterChange,
    },
    {
      key: "status",
      type: "selection",
      id: "الحالة",
      placeholder: "اختر حالة الأوردر",
      value: filterValues.status,
      onChange: handleFilterChange,
      options: [
        { value: "", label: "إختر حالة الاوردر" },
        { value: "processing", label: "تحت التجهيز" },
        { value: "completed", label: "تم التجهيز" },
        { value: "closed", label: "تم الدفع" },
        { value: "printed", label: "تم الطباعة" },
      ],
    },
  ];

  const actions = [
    {
      type: `${
        user?.permissions.some(
          (permission) =>
            permission.name === "add order" ||
            permission.name === "change order status cashier" ||
            permission.name === "change order status kitchen"
        )
          ? "show"
          : ""
      }`,
      label: "تعديل الحالة",
    },
    {
      type: `${
        user?.permissions.some(
          (permission) => permission.name === "create department"
        )
          ? `${"navigate"}`
          : ""
      }`,
      label: "طباعة",
      route: "/warehouse/cashier/print-order/:id",
    },
  ];

  return (
    <div>
      <h2 className="heading text-center">أوردرات المطبخ</h2>

      <div
        style={{ display: "flex", gap: "20px", flexWrap: "wrap"  ,   alignItems: "center",
          justifyContent: "center",}}
        className="filters-container"
      >
        <label
          className="form-label"
          style={{
            fontWeight: "bold",
            marginBottom: "8px",
            display: "block",
          }}
        >
          كود الفاتورة
        </label>
        <input
          type="text"
          name="code"
          value={filterValues.code}
          onChange={handleFilterChange}
          placeholder="أدخل كود الأوردر"
          className="form-input"
          style={{ width: "200px" }}
        />
        <label
          className="form-label"
          style={{
            fontWeight: "bold",
            marginBottom: "8px",
            display: "block",
          }}
        >
          الحالة
        </label>

        <select
          name="status"
          value={filterValues.status}
          onChange={handleFilterChange}
          className="form-select"
          style={{ width: "200px", height: "45px" }}

        >
          {filters[1].options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="order-cards-container">
        <div className="cards">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              actions={actions}
              changeStatusFn={changeOrderStatus}
              user={user}
              refreshOrders={refreshOrders}
            />
          ))}
        </div>
      </div>
      {isKitchien && <SoundPlayer play={playSound} />}
    </div>
  );
};

export default KitchenRequests;
