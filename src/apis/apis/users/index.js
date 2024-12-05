import axios from "axios";
import { API_ENDPOINT } from "../../../config";
const domain = API_ENDPOINT;
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
export async function getAllUsers(filteredValues = { name: "" }) {
  try {
    const { name } = filteredValues;
    const res = await axios.get(`${domain}/api/v1/store/user/all/users`, {
      params: {
        name,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    // console.log("Error fetching data:", error);
  }
}

export async function getUsers(filteredValues, id, setIsLoading) {
  try {
    setIsLoading(true);
    const { name, phone, page } = filteredValues;
    const res = await axios.get(`${domain}/api/v1/store/user`, {
      params: {
        name,
        phone,
        page
      },
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    setIsLoading(false);
    console.log("res.data", res.data);
    return res.data;
  } catch (error) {
    console.log("Error fetching data:", error);
    setIsLoading(false);
  }
}


export async function getUserById(id) {
  try {
    const res = await axios.get(`${domain}/api/v1/store/user/${id}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });

    return res.data;
  } catch (error) {
    // console.log("Error fetching data:", error);
  }
}
export async function deleteUser(id) {
  try {
    const res = await axios.delete(`${domain}/api/v1/store/user/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    // console.log("Error fetching data:", error);
  }
}
export async function AddUsers(data) {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("username", data.username);
  formData.append("password", data.password);
  formData.append("phone", data.phone);
  formData.append("role", data.role);
  formData.append("department_id", data.department);
  data.permissions.map((permission, index) => {
    formData.append(`permissions[ids][${index}]`, permission.id);
  });
  try {
    const res = await axios.post(
      `${domain}/api/v1/store/user/create`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    // console.log("Error fetching data:", error);
    return error;
  }
}
export async function updateUser(data, id) {
  const formData = new FormData();
  formData.append("role", data.role);
  formData.append("_method", "PUT");
  data.permissions.map((permission, index) => {
    formData.append(`permissions[ids][${index}]`, permission.id);
  });
  try {
    const res = await axios.post(
      `${domain}/api/v1/store/user/${id}/update_role`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    // console.log("Error fetching data:", error);
    return error;
  }
}
