import React from "react";
import Table from "../../../../../../components/shared/table/Table";
import { getRoles } from "../../../../../../apis/roles";
import { useAuth } from "../../../../../../context/AuthContext";
const ShowUsers = () => {
  const { user } = useAuth();
  const tableHeaders = [

    { key: "name", value: "الإسم" },
  ];
  const filters = [
    { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
  ];
  const actions = [
    {
      type: `${user?.permissions.some((permission) => permission.name === "edit role")
          ? "edit"
          : ""
        }`,
      label: "تعديل",
      route: "/warehouse/roles/:id/edit-role",
    },

    {
      type: `${user?.permissions.some((permission) => permission.name === "add role")
          ? "add"
          : ""
        }`,
      label: "إضافة أدوار",
      route: "/warehouse/roles/add-role",
    },
  ];

  return (
    <div>
      <Table
        headers={tableHeaders}
        title="الوظائف"
        filters={filters}
        fetchData={(filterValues, id, setIsLoading) =>
          getRoles(filterValues, id, setIsLoading)
        }
        actions={actions}
      />
    </div>
  );
};

export default ShowUsers;
