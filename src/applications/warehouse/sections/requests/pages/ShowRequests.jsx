import Table from "../../../../../components/shared/table/Table";
import {
  getRequests,
  deleteRequest,
  getRequestById,
  updateRequests,
  changeRequestStatus,
} from "../../../../../apis/requests";
import { getAllUsers } from "../../../../../apis/users";
import { getAllDepartments } from "../../../../../apis/departments";
import "../../../../../components/shared/table/Table.scss";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../context/AuthContext";
const ShowRequests = () => {
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
    { key: "title", value: "العنوان" },
    { key: "user", value: "من", nestedKey: "name" },
    { key: "to_department", value: "إلى", nestedKey: "name" },
    { key: "status", value: "الحالة" },
    { key: "date", value: "التاريخ" },
  ];
  const filters = [
    { key: "from_date", type: "date", id: "من تاريخ" },
    { key: "to_date", type: "date", id: "إلى تاريخ" },
    {
      key: "user_id",
      type: "selection",
      id: "من",
      placeholder: "المستخدمين",
      options: users,
    },
    {
      key: "department_id",
      type: "selection",
      id: "إلى",
      placeholder: "الأقسام",
      options: departments,
    },
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
          value: "done",
          label: "تم الصرف",
        },
        {
          value: "rejected",
          label: "مرفوض",
        },
      ],
    },
  ];
  const actions = [
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "delete request"
      )
        ? "delete"
        : ""
        }`,
      label: "حذف",
    },
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "view requests"
      )
        ? "show"
        : ""
        }`,
      label: "مراجعة",
    },
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "add request"
      )
        ? "add"
        : ""
        }`,
      label: "إضافة طلبات",
      route: "/warehouse/requests/add-request",
    },
  ];

  const tableHeadersDetailes = [
    {
      key: "recipes",
      label: "المكونات",
      isArray: true,
      isInput: true,
      details: [
        { key: "name", label: "الاسم", isInput: false },
        // { key: "price", label: "السعر", isInput: false },
        {
          key: "quantity",
          label: "الكمية",
          isInput: user.permissions.some(
            (permission) => permission.name === "edit request"
          )
            ? true
            : false,
        },
      ],
    },
  ];

  return (
    <div>
      <Table
        headers={tableHeaders}
        title="الطلبات"
        filters={filters}
        fetchData={(filterValues, id, setIsLoading) =>
          getRequests(filterValues, id, setIsLoading)
        }
        actions={actions}
        deleteFn={deleteRequest}
        acceptTitle={{ value: "approved", label: "قبول" }}
        rejectTitle={{ value: "rejected", label: "رفض" }}
        updateFn={
          user.permissions.some(
            (permission) => permission.name === "edit request"
          )
            ? updateRequests
            : null
        }
        changeStatusFn={
          user.permissions.some(
            (permission) => permission.name === "change request status"
          )
            ? changeRequestStatus
            : null
        }
        isRequests={true}
        detailsHeaders={tableHeadersDetailes}
      />
    </div>
  );
};

export default ShowRequests;
