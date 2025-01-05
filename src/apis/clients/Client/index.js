import axios from "axios";
import { API_ENDPOINT } from "../../../../config";
import { message } from "antd";
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
export async function getClients(filteredValues, id, setIsLoading) {
  try {
    setIsLoading(true);
    const { page, name } = filteredValues;
    const res = await axios.get(`${API_ENDPOINT}/api/v1/store/client`, {
      params: {
        page,
        name,
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
export async function deleteClient(id) {
  try {
    const res = await axios.delete(
      `${API_ENDPOINT}/api/v1/store/client/delete/${id}`,
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
export async function getClientById(id) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/store/client/${id}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
    message.error("حدث خطأ الرجاء إعادة المحاولة ");
  }
}
export async function updateClient(editValues, id) {
  const formData = new FormData();
  formData.append("name", editValues.name);
  formData.append("phone", editValues.phone ? editValues.phone : "");
  formData.append(
    "military_number",
    editValues.military_number ? editValues.military_number : ""
  );
  formData.append("sallary", editValues.salary ? editValues.salary : "");
  formData.append(
    "incentives",
    editValues.incentives ? editValues.incentives : ""
  );
  formData.append("client_type_id", editValues.client_type_id);
  formData.append("tax", editValues.tax ?? "");
  formData.append("discount", editValues.discount ?? "");
  formData.append("_method", "PUT");
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/store/client/update/${id}`,
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
export async function addClient(values) {
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("phone", values.phone ? values.phone : "");
  formData.append(
    "military_number",
    values.military_number ? values.military_number : ""
  );
  // formData.append("is_worker", values.is_worker);
  formData.append("tax", values.tax ? values.tax : "");
  formData.append("discount", values.discount ? values.discount : "");
  formData.append("sallary", values.salary ? values.salary : "");
  formData.append("incentives", values.incentives ? values.incentives : "");
  formData.append("client_type_id", values.client_type_id);
  // // console.log(formData);
  const Token = localStorage.getItem("token");
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/store/client/create`,
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
