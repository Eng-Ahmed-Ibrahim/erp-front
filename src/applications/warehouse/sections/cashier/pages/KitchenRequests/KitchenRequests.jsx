import Table from "../../../../../../components/shared/table/Table";
import { changeOrderStatus, getOrders } from "../../../../../../apis/orders";
import { getOrderById, deleteOrder } from "../../../../../../apis/orders";
import { getAllUsers } from "../../../../../../apis/users";
import { getAllDepartments } from "../../../../../../apis/departments";
import "../../../../../../components/shared/table/Table.scss";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../../context/AuthContext";
const KitchenRequests = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setusers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDepartments = async () => {
      const res = await getAllDepartments();
      setDepartments(
        [{ label: "", value: "" }].concat(
          res.data.map((item) => {
            return { label: item.name, value: item.id };
          })
        )
      );
      // console.log(departments);
    };
    const fetchUsers = async () => {
      const res = await getAllUsers();
      setusers(
        [{ label: "", value: "" }].concat(
          res.data.map((item) => {
            return { label: item.name, value: item.id };
          })
        )
      );
      // console.log(users);
    };
    fetchDepartments();
    fetchUsers();
  }, []);

  const tableHeaders = [
    { key: "discount_name", value: "سبب الخصم" },
    { key: "table_number", value: "رقم الترابيزة" },
    { key: "status", value: "الحالة" },
    { key: "code", value: "كود الأوردر" },
    { key: "order_date", value: "التاريخ" },
    { key: "client", value: "إسم العميل" },
    { key: "client_type", value: "نوع العميل" },
  ];
  const filters = [
    { key: "code", type: "text", id: "كود الفاتورة" },
    { key: "from_date", type: "date", id: "من تاريخ" },
    { key: "to_date", type: "date", id: "إلى تاريخ" },
    // {
    //   key: "user_id",
    //   type: "selection",
    //   id: "من",
    //   placeholder: "المستخدمين",
    //   options: users,
    // },
    // {
    //   key: "department_id",
    //   type: "selection",
    //   id: "إلى",
    //   placeholder: "الأقسام",
    //   options: departments,
    // },
    {
      key: "status",
      type: "selection",
      id: "الحالة",
      placeholder: "الحالة",
      options: [
        {
          value: "",
          label: "",
        },
        {
          value: "processing",
          label: "تحت التجهيز",
        },
        {
          value: "completed",
          label: "تم التجهيز",
        },
        {
          value: "closed",
          label: "تم الدفع",
        },
      ],
    },
  ];
  const actions = [
    // {
    //   type: `${
    //     user?.permissions.some(
    //       (permission) => permission.name === "delete order"
    //     )
    //       ? "delete"
    //       : ""
    //   }`,
    //   label: "حذف",
    // },
    {
      type: `${user?.permissions.some(
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

      type: `${user?.permissions.some(
        (permission) =>
          permission.name === "create department"

      )
        ? `${"navigate"}`
        : ""
        }`,
      label: "طباعة",
      route: "/warehouse/cashier/print-order/:id",
    },
  ];
  // console.log('actions', actions, filters);
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

  return (
    <div>
      <Table
        headers={tableHeaders}
        title="الأوردرات"
        filters={filters}
        fetchData={(filterValues, id, setIsLoading) =>
          getOrders(
            filterValues,
            user?.department.type === "reciver" ? user?.department.id : null,
            setIsLoading
          )
        }
        actions={actions}
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
    </div>
  );
};

export default KitchenRequests;
