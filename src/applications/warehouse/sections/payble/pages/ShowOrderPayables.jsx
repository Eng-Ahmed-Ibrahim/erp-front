import Table from "../../../../../components/shared/table/Table";
import { useAuth } from "../../../../../context/AuthContext";
import {
  deleteOrderPayable,
  getOrderPayables,
} from "../../../../../apis/orderPayables";

const ShowOrderPayables = () => {
  const { user } = useAuth();

  const tableHeaders = [
    { key: "order", value: "كود الأوردر", nestedKey: "code" },
    { key: "order", value: "العميل", nestedKey: "client_name" },
    { key: "order", value: "قيمة الأوردر", nestedKey: "total_price" },
    { key: "amount", value: "قيمة المدفوعة" },
    { key: "receipt_number", value: "رقم الإيصال" },
    { key: "note", value: "الملاحظة" },
    { key: "registration_date", value: "تاريخ الدفع" },
  ];

  const actions = [
    {
      type: `${
        user?.permissions?.some((permission) => permission.name === "add payable")
          ? "add"
          : ""
      }`,
      label: "إضافة مدفوعة أوردر",
      route: "/warehouse/payable/add-order-payable",
    },
    {
      type: `${
        user?.permissions?.some((permission) => permission.name === "edit payable")
          ? "edit"
          : ""
      }`,
      label: "تعديل",
      route: "/warehouse/payable/order-payable/:id/edit",
    },
    {
      type: `${
        user?.permissions?.some((permission) => permission.name === "delete payable")
          ? "delete"
          : ""
      }`,
      label: "حذف",
    },
  ];

  const filters = [
    { key: "from_date", type: "date", id: "من تاريخ" },
    { key: "to_date", type: "date", id: "إلى تاريخ" },
    {
      key: "order_code",
      type: "text",
      id: "كود الأوردر",
      placeholder: "ابحث بكود الأوردر",
    },
    {
      key: "receipt_number",
      type: "text",
      id: "رقم الإيصال",
      placeholder: "ابحث برقم الإيصال",
    },
  ];

  return (
    <div>
      <Table
        headers={tableHeaders}
        filters={filters}
        title="مدفوعات الأوردرات"
        actions={actions}
        fetchData={(filterValues, id, setIsLoading) =>
          getOrderPayables(filterValues, id, setIsLoading)
        }
        deleteFn={deleteOrderPayable}
      />
    </div>
  );
};

export default ShowOrderPayables;

