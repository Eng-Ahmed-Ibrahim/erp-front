import Table from "../../../../../components/shared/table/Table";
import { useParams } from "react-router-dom";
import { getRcipeReports } from "../../../../../apis/reports";
import React, { useEffect, useState } from "react";
import TotalAmount from "../../../../../components/shared/totalAmount/TotalAmount";
import { API_ENDPOINT } from "../../../../../../config";

const ShowRecipeReports = () => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");
  const [mainCat, setMainCat] = useState("");
  const [WarehouseSections, setWarehouseSections] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [pdfHeader, setpdfHeader] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await fetch(
          `${API_ENDPOINT}/api/v1/store/department/${id}`,
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        );
        const data = await response.json();
        setSelectedDepartment(data.data);
      } catch (error) {
        console.error("Error fetching recipe category parents:", error);
      }
    };
    const fetchWareHouseSections = async () => {
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
    fetchDepartment();
    fetchWareHouseSections();
  }, []);

  const tableHeaders = [
    { key: "name", value: "الإسم" },
    { key: "out_going", value: "اجمالي المصروف للقسم " },
    { key: "returned_to", value: "مرتجع اليه" },
    { key: "returned_from", value: "مرتجع منه" },
    { key: "tainted", value: "الهالك" },
    { key: "transfare", value: "التحويل" },
    { key: "total_quantity", value: "اجمالي الكميه بعد المرتجع والهالك" },
    { key: "total_price", value: "اجمالي السعر " },
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
      //   multi: true,
    },
  ];
  useEffect(() => {
    console.log(filters);
    setpdfHeader(["تقرير المنصرف إلي" + " " + selectedDepartment?.name ?? " "]);
  }, [selectedDepartment]);
  return (
    <div>
      <Table
        headers={tableHeaders}
        filters={filters}
        title={"تقرير المنصرف الي " + " " + selectedDepartment?.name ?? " "}
        id={id}
        fetchData={(filters, id, setIsLoading) =>
          getRcipeReports(filters, id, setIsLoading)
        }
        getTotalPrice={async (filters, id, setIsLoading) => {
          const data = await getRcipeReports(filters, id, setIsLoading);
          return data.total_price;
        }}
        pdfHeader={pdfHeader}
      />
    </div>
  );
};

export default ShowRecipeReports;
