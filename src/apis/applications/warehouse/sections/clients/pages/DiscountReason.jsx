import Table from "../../../../../components/shared/table/Table";
import {
  getDiscountReasons,
  deleteDiscountReason,
} from "../../../../../apis/clients/DiscountReason";
import { useAuth } from "../../../../../context/AuthContext";
const DiscountReason = () => {
  const { user } = useAuth();
  const tableHeaders = [

    { key: "discount_reason", value: "سبب الخصم" },
    { key: "discount", value: "قيمة الخصم ج.م" },
  ];
  const filters = [
    // { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
  ];
  const actions = [
    {
      type: `edit`,
      label: "تعديل",
      route: "/warehouse/clients/:id/edit-discount-reason",
    },
    {
      type: `delete`,
      label: "حذف",
    },
    {
      type: `add`,
      label: "إضافة سبب خصم",
      route: "/warehouse/clients/add-discount-reason",
    },
  ];

  return (
    <div>
      <Table
        headers={tableHeaders}
        title="أسباب الخصم"
        filters={filters}
        fetchData={(filterValues, currentPage, setIsLoading) =>
          getDiscountReasons(filterValues, currentPage, setIsLoading)
        }
        actions={actions}
        deleteFn={deleteDiscountReason}
      />
    </div>
  );
};

export default DiscountReason;
