import { useLocation, useParams } from "react-router-dom";
import {
  getSupplierById,
  getSupplierInvoices,
} from "../../../../../apis/suppliers";
import { changeInvoiceStatus, getInvoiceById, updateInvoicePrice, updateInvoiceQuintity } from "../../../../../apis/invoices";
import Table from "../../../../../components/shared/table/Table";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../context/AuthContext";
const ShowSupplierInvoices = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const { id } = useParams();

  useEffect(() => {
    const getSupplier = async () => {
      const res = await getSupplierById(id);
      setName(res.data.name);

    };
    getSupplier();
  }, []);
  // // console.log('dataaaaaaaaaaaaaaaaaaaaaaa', item);

  const tableHeaders = [
    { key: "code", value: "كود الفاتورة" },
    { key: "status", value: "الحالة" },
    { key: "invoice_date", value: "تاريخ الإصدار" },
    { key: "registration_date", value: "تاريخ التسجيل" },
    { key: "discount", value: "الخصم" },
    { key: "total_price", value: "سعر الفاتورة" },
  ];
  const actions = [
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "show supplier invoices"
      )
        ? "show"
        : ""
        }`,
      label: "تفاصيل",
    },
  ];
  const filters = [
    { key: "from_date", type: "date", id: "من تاريخ" },
    { key: "to_date", type: "date", id: "إلى تاريخ" },
    {
      key: "status",
      type: "selection",
      id: "الحالة",
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
  const detailsHeaders = [
    {
      key: "discount",
      label: "الخصم",
    },
    {
      key: "invoice_price",
      label: "سعر الفاتورة",
    },
    {
      key: "recipes",
      label: "المواد الخام",
      isArray: true,
      isInput: true,
      details: [
        { key: "name", label: "الإسم", isInput: false },
        { key: "quantity", label: "الكمية", isInput: user?.department.type === "source" ? true : false },
        { key: "price", label: "السعر", isInput: user?.department.type === "master" ? true : false },
      ],
    },
  ];

  return (
    <div>
      <Table
        headers={tableHeaders}
        id={id}
        title={`فواتير ${name}`}
        fetchData={(filterValues, currentPage, id, setIsLoading) =>
          getSupplierInvoices(filterValues, currentPage, id, setIsLoading)
        }
        filters={filters}
        actions={actions}
        detailsHeaders={detailsHeaders}
        updateFn={user?.permissions.some(
          (permission) => permission.name === "edit invoice") ? user?.department.type === "master" ? updateInvoicePrice : user?.department.type === "source" ? updateInvoiceQuintity : null : null}
        acceptTitle={user?.permissions.some(
          (permission) => permission.name === "change invoice status") ? { value: "approved", label: "قبول" } : null}
        rejectTitle={user?.permissions.some(
          (permission) => permission.name === "change invoice status") ? { value: "rejected", label: "رفض" } : null}
        changeStatusFn={
          user.permissions.some(
            (permission) =>
              permission.name === "change invoice status"
          )
            ? changeInvoiceStatus
            : null
        }
      />
    </div>
  );
};

export default ShowSupplierInvoices;
