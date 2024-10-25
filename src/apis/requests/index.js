import axios from "axios";
import { API_ENDPOINT } from "../../../config";
const domain = API_ENDPOINT;
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
export async function getRequests(filteredValues, id, setIsLoading) {
  try {
    setIsLoading(true);
    const { from_date, to_date, department_id, user_id, page, status } =
      filteredValues;
    const default_from = "1970-01-01";
    const default_to = new Date().toISOString().split("T")[0];
    // const default_to = new Date().toISOString().split("T")[0];
    const res = await axios.get(`${domain}/api/v1/store/request`, {
      params: {
        "date[from]": from_date,
        "date[to]": to_date,
        to_department_id: department_id,
        user_id,
        status,
        page,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    setIsLoading(false);
     console.log('res', res);
    return res.data;
  } catch (error) {
    // console.log("Error fetching data:", error);
    setIsLoading(false);
    message.error("حدث خطأ الرجاء إعادة المحاولة ");
  }
}
export async function deleteRequest(id) {
  try {
    const res = await axios.delete(
      `${domain}/api/v1/store/request/delete/${id}`,
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
export async function editRequest(name, phoneNumber, address, id) {
  try {
    const res = await axios.post(
      `${domain}/api/v1/store/request/update/${id}`,
      {
        name: name,
        phone: phoneNumber,
        address: address,
        _method: "PUT",
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    // console.log("Error fetching data:", error);
    const errors = error.response.data.error.errors;
    Object.keys(errors).map((err) => {
      message.error(errors[err][0] || "حدث خطأ الرجاء المحاولة مرة أخرى");
    });
  }
}
export async function getRequestById(id) {
  try {
    const res = await axios.get(`${domain}/api/v1/store/request/${id}`);
    return res.data;
  } catch (error) {
    // console.log("Error fetching data:", error);
  }
}
export async function updateRequests(filteredValues, itemId, parentId) {
  try {
    const formData = new FormData();
    Object.keys(filteredValues.recipes).forEach((key, index) => {
      formData.append(`recipes[${index}][id]`, filteredValues.recipes[key].id);
      formData.append(
        `recipes[${index}][quantity]`,
        filteredValues.recipes[key].quantity
      );
    });
    formData.append("_method", "PUT");

    const res = await axios.post(
      `${domain}/api/v1/store/request/update/${itemId}`,
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
export async function changeRequestStatus(id, status) {
  try {
    const res = await axios.get(
      `${domain}/api/v1/store/request/chenge_status/${id}/${status}`,
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
