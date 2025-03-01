import Table from "../../../../../components/shared/table/Table";
import { getSuppliers, deleteSupplier } from "../../../../../apis/suppliers";
import "../../../../../components/shared/table/Table.scss";
import { useAuth } from "../../../../../context/AuthContext";
import React, { useEffect, useState } from "react";
import { API_ENDPOINT } from "../../../../../../config";

const ShowSuppliers = () => {
  const { user } = useAuth();
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [WarehouseSections, setWarehouseSections] = useState([]);

  useEffect(() => {
    const fetchWarehouseSections = async () => {
      try {
        const response = await fetch(
          `${API_ENDPOINT}/api/v1/store/warehouse_sections`,
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        );
        const data = await response.json();
        setWarehouseSections(data.data);
      } catch (error) {
        console.error("Error fetching recipe category parents:", error);
      }
    };

    fetchWarehouseSections();
  }, []);

  const tableHeaders = [
    { key: "name", value: "الإسم" },
    { key: "phone", value: "الرقم" },
    { key: "type", value: "النوع" },
    { key: "total_invoices_price", value: "إجمالي سعر الفواتير" },
  ];
  const filters = [
    { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
    // { key: "phone", type: "text",  placeholder: "إبحث برقم الموبايل", id: "رقم الموبايل", },
    {
      key: "type",
      type: "selection",
      id: "نوع المورد",
      placeholder: "نوع المورد",
      options: [
        {
          value: "",
          label: "الحاله",
        },
        {
          value: "contracted",
          label: "متعاقد",
        },
        {
          value: "local",
          label: "سوق محلى",
        },
      ],
    },
    {
      key: "warehouse_section_id",
      type: "selection",
      id: "نوع القسم",
      placeholder: "إختار قسم لإظهار نتائج",
      options: WarehouseSections.map((category) => {
        return { value: category.id, label: category.name };
      }),
    },
    { key: "from_date", type: "date", id: "من تاريخ" },
    { key: "to_date", type: "date", id: "إلى تاريخ" },
  ];
  const actions = [
    {
      type: `${
        user?.permissions.some(
          (permission) => permission.name === "edit supplier"
        )
          ? "edit"
          : ""
      }`,
      label: "تعديل",
      route: "/warehouse/suppliers/:id/edit-supplier",
    },
    {
      type: `${
        user?.permissions.some(
          (permission) => permission.name === "delete supplier"
        )
          ? "delete"
          : ""
      }`,
      label: "حذف",
    },
    {
      type: `${
        user?.permissions.some(
          (permission) => permission.name === "show supplier invoices"
        )
          ? "navigate"
          : ""
      }`,
      label: "فواتير",
      route: "/warehouse/suppliers/:id/show-invoices",
    },

    {
      type: `${
        user?.permissions.some(
          (permission) => permission.name === "add supplier"
        )
          ? "add"
          : ""
      }`,
      label: "إضافة موردين",
      route: "/warehouse/suppliers/add-supplier",
    },
  ];
  return (
    <div>
      <Table
        headers={tableHeaders}
        title="الموردين"
        filters={filters}
        fetchData={(filterValues, currentPage, setIsLoading) =>
          getSuppliers(filterValues, currentPage, setIsLoading)
        }
        getTotalPrice={async (filterValues, currentPage, setIsLoading) => {
          const suppliers = await getSuppliers(
            filterValues,
            currentPage,
            setIsLoading
          );
          let sum = 0;
          suppliers?.data?.forEach((element) => {
            sum += Number(element.total_invoices_price);
          });
          return sum;
        }}
        actions={actions}
        deleteFn={deleteSupplier}
      />
    </div>
  );
};

export default ShowSuppliers;
