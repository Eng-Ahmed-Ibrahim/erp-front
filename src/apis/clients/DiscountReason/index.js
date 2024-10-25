import axios from "axios";
import { API_ENDPOINT } from "../../../../config";
import { message } from "antd";
const Token =
  localStorage.getItem("token") || sessionStorage.getItem("token");
export async function getDiscountReasons(filteredValues, id, setIsLoading) {
  try {
    setIsLoading(true);
    const { page } = filteredValues;
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/store/discount_reason`,
      {
        params: {
          page,
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    setIsLoading(false);
    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
    setIsLoading(false);
    message.error("حدث خطأ الرجاء إعادة المحاولة ");
  }
}
export async function deleteDiscountReason(id) {
  try {
    const res = await axios.delete(
      `${API_ENDPOINT}/api/v1/store/discount_reason/delete/${id}`,
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
export async function getDiscountReasonById(id) {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/store/discount_reason/${id}`,
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
export async function updateDiscountReason(id, editValues) {
  const formData = new FormData();
  formData.append("discount_reason", editValues.discount_reason);
  formData.append("discount", editValues.discount);
  formData.append("_method", "PUT");
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/store/discount_reason/update/${id}`,
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
export async function addDiscountReason(values) {
  const formData = new FormData();
  formData.append("discount_reason", values.discount_reason);
  formData.append("discount", values.discount);
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/store/discount_reason/create`,
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
