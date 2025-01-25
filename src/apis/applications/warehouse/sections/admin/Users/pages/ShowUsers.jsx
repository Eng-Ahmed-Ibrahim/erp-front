import React from "react";
import Table from "../../../../../../components/shared/table/Table";
import { getUsers, deleteUser } from "../../../../../../apis/users";
import { useAuth } from "../../../../../../context/AuthContext";
const ShowUsers = () => {
  const tableHeaders = [

    { key: "name", value: "اسم المستخدم" },
    { key: "username", value: "اسم المستخدم" },
    { key: "phone", value: "الرقم" },
  ];

  const { user } = useAuth();
  const filters = [
    { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
    {
      key: "phone",
      type: "text",
      placeholder: "إبحث برقم الموبايل",
      id: "رقم الموبايل",
    },
  ];
  const actions = [
    {
      type: `${user?.permissions.some((permission) => permission.name === "edit user")
        ? "edit"
        : ""
        }`,
      label: "تعديل",
      route: "/warehouse/users/:id/edit-user",
    },
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "delete user"
      )
        ? "delete"
        : ""
        }`,
      label: "حذف",
    },

    {
      type: `${user?.permissions.some((permission) => permission.name === "add user")
        ? "add"
        : ""
        }`,
      label: "إضافة مستخدمين",
      route: "/warehouse/users/add-user",
    },
  ];

  return (
    <div>
      <Table
        headers={tableHeaders}
        title="المستخدمين"
        filters={filters}
        fetchData={(filterValues, currentPage, id, setIsLoading) =>
          getUsers(filterValues, currentPage, id, setIsLoading)
        }
        actions={actions}
        deleteFn={deleteUser}
      />
    </div>
  );
};

export default ShowUsers;
