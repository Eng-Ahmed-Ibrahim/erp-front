import axios from "axios";
import { API_ENDPOINT } from "../../../../config";
import { message } from "antd";
const Token =
  localStorage.getItem("token") || sessionStorage.getItem("token");
export async function getPaymentMethods(filteredValues, id, setIsLoading) {
  try {
    setIsLoading(true);
    const { page } = filteredValues;
    const res = await axios.get(`${API_ENDPOINT}/api/v1/store/payment_method`, {
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
export async function deletePaymentMethod(id) {
  try {
    const res = await axios.delete(
      `${API_ENDPOINT}/api/v1/store/payment_method/delete/${id}`,
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
export async function getPaymentMethodById(id) {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/store/payment_method/${id}`,
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
export async function updatePaymentMethod(id, editValues) {
  const formData = new FormData();
  formData.append("name", editValues.name);
  // formData.append("label", editValues.label);
  // formData.append("image", editValues.image[0].originFileObj ? editValues.image[0].originFileObj : 0);
  // formData.append("status", editValues.status);
  // formData.append("type", editValues.type);
  formData.append("_method", "PUT");
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/store/payment_method/update/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    message.success("تم التعديل بنجاح");
    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
    message.error("حدث خطأ الرجاء إعادة المحاولة ");
  }
}
export async function addPaymentMethod(values) {
  const formData = new FormData();
  formData.append("name", values.name);
  // formData.append("label", values.label);
  // formData.append("image", values.image[0].originFileObj);
  // formData.append("status", values.status);
  // formData.append("type", values.type);
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/store/payment_method/create`,
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
