import axios from "axios";
import { API_ENDPOINT } from "../../../config";
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
const domain = API_ENDPOINT;
// export async function getAllUsers(filteredValues = { name: "" }) {
//   try {
//     const { name } = filteredValues;
//     const res = await axios.get(`${domain}/api/v1/store/user/all/users`, {
//       params: {
//         name,
//       },
//     });
//     return res.data;
//   } catch (error) {
//     // console.log("Error fetching data:", error);
//   }
// }
export async function getRoles(filteredValues) {
  try {
    const res = await axios.get(`${domain}/api/v1/store/role`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });

    return res.data;
  } catch (error) {
    // console.log("Error fetching data:", error);
  }
}
export async function AddRoles(data) {
  const formData = new FormData();
  formData.append("role", data.name);
  data.permissions.map((permission, index) => {
    formData.append(`permissions[ids][${index}]`, permission.value);
  });
  try {
    const res = await axios.post(
      `${domain}/api/v1/store/role/create`,
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
  }
}
export async function editRoles(data, id) {
  // console.log(data);
  const formData = new FormData();
  formData.append("role", data.name);

  data.type.map((permission, index) => {
    // console.log(permission);
    formData.append(`permissions[ids][${index}]`, permission);
  });
  formData.append("_method", "PUT");
  try {
    const res = await axios.post(
      `${domain}/api/v1/store/role/update/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    return error;
  }
}
export async function getRoleById(id) {
  try {
    const res = await axios.get(`${domain}/api/v1/store/role/${id}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    // console.log(res.data);
    return res.data;
  } catch (error) {
    // console.log("Error fetching data:", error);
  }
}
