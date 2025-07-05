import React, { useEffect, useState } from "react";

import {
  //   updateInvoice,
  //   getTaintedInvoices,
  //   getTaintedInvoiceById,
  //   updateTaintedInvoice,
  getInventoryDiscrepancyReviews,
} from "../apis/apis/inventories";

import Table from "../components/shared/table/Table";
import { useAuth } from "../context/AuthContext";

function InventoryDiscrepancyReviews() {
  const { user } = useAuth();
  const [canAddTained, setCanAddTained] = useState(false);

  useEffect(() => {
    const userPermissions = user.permissions.filter(
      (permission) => permission.name === "add tainted"
    );
    if (userPermissions.length > 0) {
      setCanAddTained(true);
      console.log("okk");
    }
  }, []);
  const statusOptions = [
    { value: "", label: "" },
    { value: "approved", label: "تم المراجعة" },
    { value: "pending", label: "تحت المراجعة" },
    { value: "rejected", label: "مرفوضة" },
  ];

  const tableHeaders = [
    { key: "code", value: "  كود الفاتوره" },
    { key: "department_name", value: "  القسم" },
    { key: "cashier_name", value: " الكاشير" },
    { key: "waiter_name", value: " الويتر" },
    { key: "created_at", value: " تاريخ الفاتورة " },
    { key: "status", value: "الحالة" },
    { key: "estimated_loss_amount", value: " غرامة العجز" },
  ];

  const detailsHeaders = [
    {
      key: "recipes",
      label: "الأصناف ",
      isArray: true,
      isInput: true,
      details: [
        { key: "name", label: "الإسم", isInput: false },
        {
          key: "quantity",
          label: "الكمية",
          isInput: user?.department.type === "source" ? true : false,
        },
        {
          key: "price",
          label: "السعر",
          isInput: user?.department.type === "master" ? true : false,
        },
        { key: "expire_date", label: "تاريخ الصلاحية", isInput: false },
      ],
    },
  ];

  const filtersIncoming = [
    // {
    //   key: "supplier_id",
    //   type: "selection",
    //   id: "اختر المورد",
    //   placeholder: "المورد",
    //   options: supplier,
    // },
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

  const actionsIncoming = canAddTained
    ? [
        // {
        //   type: "add",
        //   label: "اضافة فاتورة هالك",
        //   route: "/warehouse/invoices/add-tainted-invoices",
        // },
        {
          type: "show",
          label: "مراجعة",
        },
        {
          type: "navigate",
          label: "طباعه",
          route: "/warehouse/invoices/print/:id",
        },
      ]
    : [
        {
          type: "show",
          label: "مراجعة",
        },
        // {
        //   type: "navigate",
        //   label: "طباعه",
        //   route: "/warehouse/invoices/print/:id",
        // },
      ];

  return (
    <>
      <div className="invoice-container">
        <Table
          headers={tableHeaders}
          filters={filtersIncoming}
          title="مراجعة جرد الأصناف"
          actions={actionsIncoming}
          fetchData={(filters, id, setIsLoading) =>
            getInventoryDiscrepancyReviews(filters, id, setIsLoading)
          }
          detailsHeaders={detailsHeaders}
          //   updateFn={updateTaintedInvoice}
          //   changeStatusFn={changeInvoiceStatus}
        />
      </div>
    </>
  );
}

export default InventoryDiscrepancyReviews;
