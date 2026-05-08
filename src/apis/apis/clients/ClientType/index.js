import axios from "axios";
import { API_ENDPOINT } from "../../../../config";
import { message } from "antd";
const Token =
  localStorage.getItem("token") || sessionStorage.getItem("token");
export async function getClientTypes(filteredValues, id, setIsLoading) {
  try {
    setIsLoading(true);
    const { page } = filteredValues;
    const res = await axios.get(`${API_ENDPOINT}/api/v1/store/client_type`, {
      params: {
        page,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    setIsLoading(false);
    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
    setIsLoading(false);
    message.error("حدث خطأ الرجاء إعادة المحاولة ");
  }
}
export async function deleteClientType(id) {
  try {
    const res = await axios.delete(
      `${API_ENDPOINT}/api/v1/store/client_type/delete/${id}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    message.success("تم الحذف بنجاح");
    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
    message.error("حدث خطأ الرجاء إعادة المحاولة ");
  }
}
export async function getClientTypeById(id) {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/store/client_type/${id}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
    message.error("حدث خطأ الرجاء إعادة المحاولة ");
  }
}
export async function updateClientType(id, editValues) {
  const formData = new FormData();
  formData.append("name", editValues.name);
  formData.append("discount", editValues.discount ? editValues.discount : 0);
  formData.append("tax", editValues.tax ? editValues.tax : 0);
  const monthlyLimit = editValues.monthly_discount_limit;
  formData.append(
    "monthly_discount_limit",
    monthlyLimit === undefined || monthlyLimit === null || monthlyLimit === ""
      ? ""
      : monthlyLimit
  );
  editValues.methods.map((method, index) =>
    formData.append(`payment_methods[${index}]`, method.id)
  );
  formData.append("_method", "PUT");
  const Token = localStorage.getItem("token");
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/store/client_type/update/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    message.success("تم التعديل بنجاح");

    // console.log(res.data)
    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
    message.error("حدث خطأ الرجاء إعادة المحاولة ");
  }
}
export async function addClientType(values) {
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("discount", values.discount);
  formData.append("tax", values.tax);
  if (
    values.monthly_discount_limit !== undefined &&
    values.monthly_discount_limit !== null &&
    values.monthly_discount_limit !== ""
  ) {
    formData.append(
      "monthly_discount_limit",
      values.monthly_discount_limit
    );
  }
  values.methods.map((method, index) =>
    formData.append(`payment_methods[${index}]`, method.id)
  );
  const Token = localStorage.getItem("token");
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/store/client_type/create`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    message.success("تم الإضافة بنجاح");
    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
    message.error("حدث خطأ الرجاء إعادة المحاولة ");
  }
}
