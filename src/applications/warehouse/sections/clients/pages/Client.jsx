import Table from "../../../../../components/shared/table/Table";
import { getClients, deleteClient } from "../../../../../apis/clients/Client";
import { useAuth } from "../../../../../context/AuthContext";
const Client = () => {
  const { user } = useAuth();
  const tableHeaders = [

    { key: "name", value: "الإسم" },
    { key: "phone", value: "رقم الموبايل" },
    { key: "military_number", value: "الرقم العسكرى" },
    // { key: "client_type", value: "نوع العميل" },
  ];
  const filters = [
    { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
    // {
    //   key: "sub_category_id",
    //   type: "selection",
    //   placeholder: "إبحث بنوع العميل",
    //   id: "نوع العميل",
    //   // options: 
    // },


  ];
  const actions = [
    {
      type: `edit`,
      label: "تعديل",
      route: "/warehouse/clients/:id/edit-client",
    },
    {
      type: `delete`,
      label: "حذف",
    },
    {
      type: `add`,
      label: "إضافة  عميل",
      route: "/warehouse/clients/add-client",
    },
  ];

  return (
    <div>
      <Table
        headers={tableHeaders}
        title="العملاء"
        filters={filters}
        fetchData={(filterValues, currentPage, setIsLoading) =>
          getClients(filterValues, currentPage, setIsLoading)
        }
        actions={actions}
        deleteFn={deleteClient}
      />
    </div>
  );
};

export default Client;
