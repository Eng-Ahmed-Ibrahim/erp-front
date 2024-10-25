import Table from "../../../../../components/shared/table/Table";
import { getSuppliers, deleteSupplier } from "../../../../../apis/suppliers";
import "../../../../../components/shared/table/Table.scss";
import { useAuth } from "../../../../../context/AuthContext";
const ShowSuppliers = () => {
  const { user } = useAuth();
  const tableHeaders = [

    { key: "name", value: "الإسم" },
    { key: "phone", value: "الرقم" },
    { key: "type", value: "النوع" },
  ];
  const filters = [
    { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
    {
      key: "phone",
      type: "text",
      placeholder: "إبحث برقم الموبايل",
      id: "رقم الموبايل",
    },
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
  ];
  const actions = [
    {
      type: `${user?.permissions.some((permission) => permission.name === 'edit supplier')
        ? "edit"
        : ""
        }`,
      label: "تعديل",
      route: "/warehouse/suppliers/:id/edit-supplier",
    },
    {
      type: `${user?.permissions.some((permission) => permission.name === 'delete supplier')
        ? "delete"
        : ""
        }`,
      label: "حذف",
    },
    {
      type: `${user?.permissions.some((permission) => permission.name === 'show supplier invoices')
        ? "navigate"
        : ""
        }`,
      label: "فواتير",
      route: "/warehouse/suppliers/:id/show-invoices",
    },

    {
      type: `${user?.permissions.some((permission) => permission.name === 'add supplier')
        ? "add"
        : ""
        }`,
      label: "إضافة موردين",
      route: "/warehouse/suppliers/add-supplier",
    },
  ];
  // console.log('tableHeaders',actions)
  return (
    <div>
      <Table
        headers={tableHeaders}
        title="الموردين"
        filters={filters}
        fetchData={(filterValues, currentPage, setIsLoading) =>
          getSuppliers(filterValues, currentPage, setIsLoading)
        }
        actions={actions}
        deleteFn={deleteSupplier}
      />
    </div>
  );
};

export default ShowSuppliers;
