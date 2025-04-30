import Table from "../../../../../components/shared/table/Table";
import { useParams } from "react-router-dom";
import { getReportOfRecipe } from "../../../../../apis/reports";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../context/AuthContext";

const OneRecipeReport = () => {
  const [reportData, setReportData] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);

  const tableHeaders = [
    { key: "code", value: "الكود" },
    { key: "type", value: "نوع الفاتوره" },
    { key: "date", value: " تاريخ الفاتورة" },
    { key: "supplier", nestedKey: "name", value: "اسم المورد " },
    { key: "from", nestedKey: "name", value: "من " },
    { key: "to", nestedKey: "name", value: "الى " },
    { key: "quantity", value: " الكميه فى الفاتورة" },
    { key: "price", value: "  سعر الوحدة" },
    { key: "total_price", value: " اجمالى السعر" },
  ];

  const filters = [
    { key: "from_date", type: "date", id: "من تاريخ" },
    { key: "to_date", type: "date", id: "إلى تاريخ" },
    {
      key: "invoice_type",
      type: "selection",
      id: "نوع الفاتورة ",
      placeholder: "نوع الفاتورة ",
      options: [
        {
          value: "",
          label: "",
        },
        {
          value: "in_coming",
          label: "فاتورة مورد ",
        },
        {
          value: "out_going",
          label: "إذن صرف",
        },
        // {
        //   value: "transfare",
        //   label: "فاتورة تحويل",
        // },
        // {
        //   value: "returned",
        //   label: "فاتورة مرتجع",
        // },
      ],
    },
  ];

  const { id } = useParams();
  const { user } = useAuth();

  return (
    <div>
      <Table
        headers={tableHeaders}
        title=" تقرير المكون"
        id={id}
        filters={filters}
        fetchData={(filters, id, setIsLoading) => {
          return getReportOfRecipe(
            filters,
            id,
            setIsLoading,
            user.department.id
          );
        }}
        getTotalPrice={async (filters, id, setIsLoading) => {
          const data = await getReportOfRecipe(
            filters,
            id,
            setIsLoading,
            user.department.id
          );
          return data?.data[0]?.totalQuantity ?? 0;
        }}
      />
    </div>
  );
};

export default OneRecipeReport;
