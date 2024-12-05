import React, { useEffect, useState } from "react";
import "./InvoiceCategory.scss";
import Button from "./Button/Button";
import {
  getIncomingInvoiceByType,
  getOutgoingInvoiceByType,
  getReturndInvoiceByType,
  getInvoiceById,
  updateInvoice,
  changeInvoiceStatus,
  updateInvoiceQuintity,
  updateInvoicePrice,
} from "../../../../../apis/invoices";
import Table from "../../../../../components/shared/table/Table";
import { getSuppliers } from "../../../../../apis/suppliers";
import { useAuth } from "../../../../../context/AuthContext";
import { getAllDeaprtments } from "../../../../../apis/department";
function Categories(props) {
  const [selectedCategory, setSelectedCategory] = useState("inComing"); 
  const [supplier, setAllSupplier] = useState([]);
  const [departments, setDepartments] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    const fetchSupplier = async () => {
      const res = await getSuppliers({}, "", () => { });
      setAllSupplier(
        [{ label: "", value: "" }].concat(
          res.data.map((item) => {
            return { label: item.name, value: item.id };
          })
        )
      );
    };

    fetchSupplier();
    const fetchDepartments = async () => {
      const res = await getAllDeaprtments();
      setDepartments(res.data);
    };
    fetchDepartments();
  }, []);
  const statusOptions = [
    { value: "", label: "الحاله" },
    { value: "approved", label: "تم المراجعة" },
    { value: "pending", label: "تحت المراجعة" },
    { value: "rejected", label: "مرفوضة" },
  ];
  // user?.department.type != "both"?(
  //   ):null
  const tableHeadersIncoming = [
    { key: "code", value: "  كود الفاتوره", },
    { key: "created_at", value: "تاريخ الإصدار" },
    { key: "created_by", value: "اسم مدخل البيانات", nestedKey: "name" },
    { key: "supplier", value: "اسم المورد", nestedKey: "name" },
    { key: "status", value: "الحالة" },
    { key: "total_price", value: "السعر" },
  ]
  const tableHeadersOutGoing = [
    
    { key: "code", value: "  كود الفاتوره",isInput: user?.department.type === "master" ? true : false},
    { key: "created_at", value: "تاريخ الإصدار",isInput: user?.department.type === "master" ? true : false ,type:"date"},
    { key: "created_by", value: "اسم مدخل البيانات", nestedKey: "name" },
    { key: "to", value: "القسم المنصرف اليه", nestedKey: "name" },
    { key: "status", value: "الحالة" },
    { key: "total_price", value: "السعر" },
  ];
  const tableHeadersReterned = [
    { key: "code", value: "  كود الفاتوره" },
    { key: "created_at", value: "تاريخ الإصدار" },
    { key: "from", value: "مرتجع من", nestedKey: "name" },
    { key: "status", value: "الحالة" },
    { key: "total_price", value: "السعر" },
  ];
  const detailsHeaders = [
    {
      key: "recipes",
      label: "المواد الخام",
      isArray: true,
      isInput: true,
      details: [
        { key: "category", label: "التصنيف الرئيسي", isInput: false },
        { key: "sub_category", label: "التصنيف الفرعى", isInput: false },
        { key: "name", label: "الإسم", isInput: false },
        { key: "quantity", label: "الكمية", isInput: user?.department.type === "source" ? true : false },
        { key: "price", label: "السعر", isInput: user?.department.type === "master" ? true : false },
        { key: "expire_date", label: "تاريخ الصلاحية", isInput: false },
      ],
    }
  ];
  const filtersIncoming = [
    {
      key: "code",
      type: "text",
      placeholder: "إبحث بكود الفاتورة",
      id: "كود فاتورة",
    },
    {
      key: "invoice_price",
      type: "text",
      placeholder: "إبحث بسعر الفاتورة",
      id: "سعر الفاتورة",
    },
    {
      key: "supplier_id",
      type: "selection",
      id: "اختر المورد",
      placeholder: "المورد",
      options: supplier,
    },
    user?.department.type === "master"
      ? {
        key: "department_id",
        type: "selection",
        id: "نوع القسم",
        placeholder: "إختار قسم لإظهار نتائج",
        options: departments.map((department) => {
          return { value: department.id, label: department.name };
        }),
      }
      : null,
    {
      key: "status",
      type: "selection",
      id: "اختر الحالة",
      placeholder: "الحالة",
      options: statusOptions,
    },
    { key: "from_date", type: "date", id: "من تاريخ" },
    { key: "to_date", type: "date", id: "إلى تاريخ" },
  ];
  const filtersOutcoming = [
    { key: "code", type: "text", placeholder: "إبحث بالكود", id: "الكود" },
    {
      key: "invoice_price",
      type: "text",
      placeholder: "إبحث بسعر الفاتورة",
      id: "سعر الفاتورة",
    },
    {
      key: "status",
      type: "selection",
      id: "اختر الحالة",
      placeholder: "الحالة",
      options: statusOptions,
    },
    user?.department.type === "master"
      ? {
        key: "department_id",
        type: "selection",
        id: "نوع القسم",
        placeholder: "إختار قسم لإظهار نتائج",
        options: departments.map((department) => {
          return { value: department.id, label: department.name };
        }),
      }
      : null,
    { key: "from_date", type: "date", id: "من تاريخ" },
    { key: "to_date", type: "date", id: "إلى تاريخ" },
  ];
  const filtersReturn = [
    { key: "code", type: "text", placeholder: "إبحث بالكود", id: "الكود" },
    {
      key: "invoice_price",
      type: "text",
      placeholder: "إبحث بسعر الفاتورة",
      id: "سعر الفاتورة",
    },
    user?.department.type === "master"
      ? {
        key: "department_id",
        type: "selection",
        id: "نوع القسم",
        placeholder: "إختار قسم لإظهار نتائج",
        options: departments.map((department) => {
          return { value: department.id, label: department.name };
        }),
      }
      : null,
    {
      key: "status",
      type: "selection",
      id: "اختر الحالة",
      placeholder: "الحالة",
      options: statusOptions,
    },
    { key: "from_date", type: "date", id: "من تاريخ" },
    { key: "to_date", type: "date", id: "إلى تاريخ" },
  ];

  const actionsIncoming = [
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "create invoice"
      )
        ? "add"
        : ""
        }`,
      label: "اضافة فاتورة مورد",
      route: "/warehouse/invoices/incoming/add-Invoices/in_coming",
    },
    {
      type: `${
        // statusOptions[1]?.value!='approved'?(
        user?.permissions.some(
          (permission) => permission.name === "edit invoice"
        )
          ? "show"
          : ""
        // ):null
        }`,
      label: "مراجعة",
    },
    {
      type: "navigate",
      // type: `${user?.permissions.some(
      //   (permission) => permission.name === "print invoice"
      // )
      //     ? "show"
      //     : ""
      //   }`,
      label: " طباعه",
      route: "/warehouse/invoices/print/:id",
    },
  ];

  const actionsOutComing = [
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "create invoice"
      )
        ? "add"
        : ""
        }`,
      label: "اضافة فاتورة صرف القسم",
      route: "/warehouse/invoices/incoming/add-Invoices/out_going",
    },
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "edit invoice"
      )
        ? "show"
        : ""
        }`,

      label: "مراجعة",
    },
    {
      type: "navigate",
      label: " طباعه",
      route: "/warehouse/invoices/print/:id",
    },
    {
      type: "edit-inv",
      label: " حفظ",
    },
  ];

  const actionsReturnd = [
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "create invoice"
      )
        ? "add"
        : ""
        }`,
      label: "إضافة   فاتورة مرتجع من القسم",
      route: "/warehouse/invoices/incoming/add-Invoices/returned",
    },
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "edit invoice"
      )
        ? "show"
        : ""
        }`,
      label: "مراجعة",
    },
    {
      type: "navigate",
      label: " طباعه",
      route: "/warehouse/invoices/print/:id",
    },
  ];

  // const CategoriesData = [
  //   {
  //     cat: `${user?.department.type === "master"
  //       ? "فاتورة مورد"
  //       : ""
  //       }`, type: `${user?.department.type === "master"
  //         ? "inComing"
  //         : ""
  //         }`
  //   },
  //   { cat: "فاتورة صرف القسم", type: "outGoing" },
  //   { cat: "فاتورة مرتجع من القسم", type: "returnd" },
  // ];

  const CategoriesData = [
    // ...(user?.department.type === "source" || user?.department.type === "master"
    // ? [{ cat: "فاتورة مورد", type: "inComing" }]
    { cat: "فاتورة مورد", type: "inComing" },
    // : []),
    { cat: "فاتورة صرف القسم", type: "outGoing" },
    { cat: "فاتورة مرتجع من القسم", type: "returnd" },
  ];

  const handleCategoryClick = (type) => {
    setSelectedCategory(type);
    // console.log(type);
  };

  return (
    <>   
    {/* AND HENE  */}
      <div className="invoice-container">
        <h1 className="heading text-center p-3">الفواتير </h1>
        <div className="row">
          {CategoriesData.map((category, index) => (
            <Button
              key={index}
              title={category.cat}
              isActive={selectedCategory === category.type}
              onClick={() => handleCategoryClick(category.type)}
            />
          ))}
        </div>
        <div className="invoice-table">
          {user?.department.type != "both" ? (
            selectedCategory === "inComing" && (
              <Table
                headers={tableHeadersIncoming}
                filters={filtersIncoming}
                title="فاتورة مورد"
                actions={actionsIncoming}
                fetchData={async (filters, id, setIsLoading, status) =>
                  (await getIncomingInvoiceByType(filters, id, setIsLoading, status))
                }
                getTotalPrice={async (filters, id, setIsLoading, status) => {
                  const data = await getIncomingInvoiceByType(filters, id, setIsLoading, status)
                  return data.total;
                }
                }
                detailsHeaders={detailsHeaders}
                updateFn={user?.permissions.some(
                  (permission) => permission.name === "edit invoice") ? user?.department.type === "master" ? updateInvoicePrice : user?.department.type === "source" ? updateInvoiceQuintity : null : null}
                acceptTitle={user?.permissions.some(
                  (permission) => permission.name === "change invoice status") ? { value: "approved", label: "قبول" } : null}
               changeStatusFn={
                  user.permissions.some(
                    (permission) =>
                      permission.name === "change invoice status"
                  )
                    ? changeInvoiceStatus
                    : null
                }
              />
            )
          ) : null}
{/** rafd mowared sarf
 * 
 * rejectTitle={user?.permissions.some(
                (permission) => permission.name === "change invoice status") ? { value: "rejected", label: "رفض" } : null}
           
 */}
          {selectedCategory === "outGoing" && (
            <Table
              headers={tableHeadersOutGoing}
              filters={filtersOutcoming}
              title="فاتورة صرف القسم"
              actions={actionsOutComing}
              fetchData={(filters, id, setIsLoading) =>
                getOutgoingInvoiceByType(filters, id, setIsLoading)
              }
              
              detailsHeaders={detailsHeaders}
              updateFn={user?.permissions.some(
                (permission) => permission.name === "edit invoice") ? user?.department.type === "master" ? updateInvoicePrice : user?.department.type === "source" ? updateInvoiceQuintity : null : null}
              acceptTitle={user?.permissions.some(
                (permission) => permission.name === "change invoice status") ? { value: "approved", label: "قبول" } : null}
                 changeStatusFn={
                user.permissions.some(
                  (permission) =>
                    permission.name === "change invoice status"
                )
                  ? changeInvoiceStatus
                  : null
              }
            />
          )}
          {selectedCategory === "returnd" && (
            <Table
              headers={tableHeadersReterned}
              filters={filtersReturn}
              title="فاتورة مرتجع من القسم"
              actions={actionsReturnd}
              fetchData={(filters, id, setIsLoading) =>
                getReturndInvoiceByType(filters, id, setIsLoading)
              }
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
          )}
        </div>
      </div>
    </>
  );
}

export default Categories;
