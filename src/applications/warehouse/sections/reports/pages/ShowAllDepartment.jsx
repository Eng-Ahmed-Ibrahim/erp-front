import Table from "../../../../../components/shared/table/Table";
import "../../../../../components/shared/table/Table.scss";
import {
  deleteDeaprtment,
  getDeaprtments,
} from "../../../../../apis/department";
import { useLocation } from "react-router-dom";

import React, { useEffect, useState } from "react";
import { API_ENDPOINT } from "../../../../../../config";
import { number } from "yup";

const ShowAllDepartments = () => {
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
    { key: "code", value: "الكود" },
    {
      key: "name",
      value: " الاسم ",
      clickable: true,
      route: "/warehouse/reports/show-reports/department/recipe/:id",
    },
    { key: "total_invoices_price", value: "إجمالي سعر الفواتير" },
  ];
  const filters = [
    { key: "from_date", type: "date", id: "من تاريخ" },
    { key: "to_date", type: "date", id: "إلى تاريخ" },
    { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
    {
      key: "warehouse_section_id",
      type: "selection",
      id: "نوع القسم",
      placeholder: "إختار قسم لإظهار نتائج",
      options: WarehouseSections.map((category) => {
        return { value: category.id, label: category.name };
      }),
    },
  ];

  const pdfHeader = "OutGoing Report from Department";
  // const actions = [
  //     {
  //         type: "edit",
  //         label: "تعديل",
  //         route: "/warehouse/departments/:id/edit-departments",
  //     },
  //     {
  //         type: "delete",
  //         label: "حذف",
  //     },

  //     {
  //         type: "add",
  //         label: "إضافة قسم ",
  //         route: "/warehouse/departments/add-departments",
  //     },
  // ];

  return (
    <div>
      <Table
        headers={tableHeaders}
        title=" الاقسام"
        filters={filters}
        fetchData={(filters, currentPage, setIsLoading) =>
          getDeaprtments(filters, currentPage, setIsLoading)
        }
        pdfHeader={pdfHeader}
        getTotalPrice={async (filters, currentPage, setIsLoading) => {
          const data = await getDeaprtments(filters, currentPage, setIsLoading);

          // return data?.data?.reduce((sum, obj) => {
          //   console.log( "sum now ", sum, obj.total_invoices_price, Number(obj.total_invoices_price))
          //   return sum + Number(obj.total_invoices_price || 0) || 0;
          // });
          return data?.data?.reduce((sum, obj) => {
            console.log("sum now", sum, obj.total_invoices_price, Number(obj.total_invoices_price));
            return sum + Number(obj.total_invoices_price || 0);
          }, 0); // Explicitly set initial sum value
          
        }}
      />
    </div>
  );
};

export default ShowAllDepartments;
