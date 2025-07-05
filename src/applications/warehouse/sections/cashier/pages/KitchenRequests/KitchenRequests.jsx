import Table from "../../../../../../components/shared/table/Table";
import { changeOrderStatus, getOrders } from "../../../../../../apis/orders";
import { API_ENDPOINT } from "../../../../../../../config";
import { getOrderById, deleteOrder } from "../../../../../../apis/orders";
import { getAllDepartments } from "../../../../../../apis/departments";
import "../../../../../../components/shared/table/Table.scss";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../../context/AuthContext";

const KitchenRequests = () => {
  const [departments, setDepartments] = useState([]);
  const { user } = useAuth();
  const MalahiDepartment = "01jn3wntk7sh5gsq3d9r0et4yf";

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
    };
    fetchDepartments();
  }, []);
  const tableHeaders = [
    { key: "client_type", value: "نوع العميل" },
    { key: "table_number", value: "رقم الترابيزة" },
    { key: "status", value: "الحالة" },
    { key: "code", value: "كود الأوردر" },
    { key: "order_date", value: "التاريخ" },
    { key: "client", value: "إسم العميل" },
  ];
  const filters = [
    { key: "code", type: "text", id: "كود الفاتورة" },
    { key: "from_date", type: "date", id: "من تاريخ" },
    { key: "to_date", type: "date", id: "إلى تاريخ" },

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
        {
          value: "printed",
          label: "تم الطباعة",
        },
      ],
    },

    {
      key: "selected_department",
      type: "selection",
      id: "القسم",
      placeholder: "اختر القسم",

      options: departments,
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
  const ordersRecieveCol = user?.department?.id != MalahiDepartment ?  [
    {
      type: `${
        user?.permissions.some(
          (permission) =>
            permission.name === "add order" ||
            permission.name === "change order status cashier" ||
            permission.name === "change order status kitchen"
        ) 
          ? "print"
          : ""
      }`,
      label: "طباعة نسخة التشغيل",
    },
  ] : null ;
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
            {
              ...filterValues,
              user_id: user.id,
              department_id: user?.department.id,
            },
            user?.department.type === "reciver" ? user?.department.id : null,
            setIsLoading
          )
        }
        actions={actions}
        ordersRecieve={ordersRecieveCol}
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
