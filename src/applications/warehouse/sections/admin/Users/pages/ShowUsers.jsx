import React from "react";
import Table from "../../../../../../components/shared/table/Table";
import { getUsers, deleteUser, adminUserLogin } from "../../../../../../apis/users";
import { useAuth } from "../../../../../../context/AuthContext";
import { message } from "antd";
const ShowUsers = () => {
  const tableHeaders = [
    { key: "name", value: "اسم المستخدم" },
    { key: "username", value: "# #" },
    { key: "phone", value: "الرقم" },
  ];

  const { user } = useAuth();
  const filters = [
    { key: "name", type: "text", placeholder: "إبحث بإسم المستخدم", id: "الإسم" },
    {
      key: "phone",
      type: "text",
      placeholder: "إبحث برقم الموبايل",
      id: "رقم الموبايل",
    },
  ];
  const actions = [
    {
      type: `${
        user?.permissions.some((permission) => permission.name === "edit user")
          ? "edit"
          : ""
      }`,
      label: "تعديل",
      route: "/warehouse/users/:id/edit-user",
    },
    {
      type: `${
        user?.permissions.some(
          (permission) => permission.name === "delete user"
        )
          ? "delete"
          : ""
      }`,
      label: "حذف",
    },
    {
      type: "admin-login",   
      label: "تسجيل دخول",
    },

    {
      type: `${
        user?.permissions.some((permission) => permission.name === "add user")
          ? "add"
          : ""
      }`,
      label: "إضافة مستخدمين",
      route: "/warehouse/users/add-user",
    },
  ];

  const adminLogin = async (user) => {
    const res =await adminUserLogin(user.id);
    if (!(res instanceof Error)) {
       localStorage.setItem("token", res.data.token)
       sessionStorage.setItem("token", res.data.token);
    } else {
      message.error(res.response.error.message);
      return;
    }

    window.location.href = "/warehouse/home";
  };

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
        adminlogin={adminLogin}
      />
    </div>
  );
};

export default ShowUsers;
