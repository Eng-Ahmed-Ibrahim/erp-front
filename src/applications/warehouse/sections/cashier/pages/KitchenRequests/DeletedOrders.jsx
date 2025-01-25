import Table from "../../../../../../components/shared/table/Table";
import {
  changeOrderStatus,
  getDeletedOrders,
  changeDeletedOrderStatus,
} from "../../../../../../apis/orders";
import { API_ENDPOINT } from "../../../../../../../config";
import { getOrderById, deleteOrder } from "../../../../../../apis/orders";
import { getAllDepartments } from "../../../../../../apis/departments";
import "../../../../../../components/shared/table/Table.scss";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../../context/AuthContext";

const DeletedOrders = () => {
  const [departments, setDepartments] = useState([]);
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
    };

    fetchDepartments();
  }, []);

  const handleChangeDeletedOrderStatus = async (id, status) => {
    const res = await changeDeletedOrderStatus(id, status);
    if (res) {
      message.success("تم التعديل بنجاح");
    }

    console.log("hellllllllllllllllllllllllllllllllllllll", item, status);
  };
  const tableHeaders = [
    { key: "code", value: "كود الأوردر" },
    { key: "table_number", value: "رقم الترابيزة" },
    { key: "date", value: "التاريخ" },
    { key: "department", value: "القسم" },
    { key: "client_type", value: "نوع العميل" },
    { key: "client", value: "إسم العميل" },
    { key: "deleted_by", value: "المسئول" },
    { key: "deletion_note", value: "سبب الحذف" },
    { key: "status", value: "الحالة" },
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
          value: "pending",
          label: "تحت المراجعة",
        },
        {
          value: "approved",
          label: "تم المراجعة",
        },
        {
          value: "rejected",
          label: "تم الرفض",
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

  // const actions = [
  //   {
  //     type: `${
  //       user?.permissions.some(
  //         (permission) => permission.name === "view deleted_orders"
  //       )
  //         ? "review"
  //         : ""
  //     }`,
  //     label: "مراجعة",
  //   },
  // ];
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
          (permission) => permission.name === "view deleted_orders"
        )
          ? "show"
          : ""
      }`,
      label: " مراجعة",
    },
    // {
    //   type: `${
    //     user?.permissions.some(
    //       (permission) => permission.name === "view deleted_orders"
    //     )
    //       ? `${"navigate"}`
    //       : ""
    //   }`,
    //   label: "طباعة",
    //   route: "/warehouse/cashier/print-order/:id",
    // },
  ];

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
        title=" الأوردرات المحذوفة"
        filters={filters}
        fetchData={(filterValues) =>
          getDeletedOrders({
            ...filterValues,
            user_id: user.id,
            department_id: user?.department.id,
          })
        }
        actions={actions}
        changeStatusFn={handleChangeDeletedOrderStatus}
        detailsHeaders={detailsHeaders}
        rejectTitle={
          user?.permissions.some(
            (permission) => permission.name === "view deleted_orders"
          )
            ? { value: "rejected", label: " رفض" }
            : null
        }
        acceptTitle={
          user?.permissions.some(
            (permission) => permission.name === "view deleted_orders"
          )
            ? { value: "approved", label: " قبول" }
            : null
        }
        isRequests
      />
    </div>
  );
};

export default DeletedOrders;
