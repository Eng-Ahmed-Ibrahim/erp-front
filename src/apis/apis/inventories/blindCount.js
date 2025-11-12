import axios from "axios";
import { message } from "antd";
import { API_ENDPOINT } from "../../../../config";

const domain = API_ENDPOINT;

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export async function getBlindCountItems({ departmentId, search }) {
  try {
    const response = await axios.get(
      `${domain}/api/v1/store/inventory/blind-count/items`,
      {
        params: {
          department_id: departmentId,
          search,
        },
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response.data?.data ?? response.data;
  } catch (error) {
    message.error(
      error?.response?.data?.error?.message ??
        "تعذر تحميل أصناف الجرد، برجاء المحاولة مرة أخرى."
    );
    throw error;
  }
}

export async function submitBlindCount(payload) {
  try {
    const response = await axios.post(
      `${domain}/api/v1/store/inventory/blind-count`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    message.success("تم حفظ الجرد بنجاح");
    return response.data?.data ?? response.data;
  } catch (error) {
    message.error(
      error?.response?.data?.error?.message ??
        "تعذر حفظ الجرد، برجاء مراجعة البيانات والمحاولة مرة أخرى."
    );
    throw error;
  }
}

export async function getBlindCountReports(filters = {}) {
  try {
    const response = await axios.get(
      `${domain}/api/v1/store/inventory/blind-count`,
      {
        params: filters,
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    message.error(
      error?.response?.data?.error?.message ??
        "تعذر تحميل تقارير الجرد ."
    );
    throw error;
  }
}

export async function downloadBlindCountPdf(id) {
  try {
    const response = await axios.get(
      `${domain}/api/v1/store/inventory/blind-count/${id}/download`,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    message.error(
      error?.response?.data?.error?.message ?? "ملف الـ PDF غير متاح حالياً."
    );
    throw error;
  }
}

export async function getBlindCountById(id) {
  try {
    const response = await axios.get(
      `${domain}/api/v1/store/inventory/blind-count/${id}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return response.data?.data ?? response.data;
  } catch (error) {
    message.error(
      error?.response?.data?.error?.message ??
        "تعذر تحميل تفاصيل الجرد المحدد."
    );
    throw error;
  }
}

export async function getAllWaiters() {
  try {
    const response = await axios.get(`${domain}/api/v1/store/waiter/all`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    return response.data?.data ?? response.data;
  } catch (error) {
    message.error(
      error?.response?.data?.error?.message ?? "تعذر تحميل بيانات الويتر."
    );
    throw error;
  }
}

export async function approveBlindCount(id) {
  try {
    const response = await axios.post(
      `${domain}/api/v1/store/inventory/blind-count/${id}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    message.success("تم الموافقة على الجرد وإنشاء فاتورة التسوية بنجاح");
    return response.data?.data ?? response.data;
  } catch (error) {
    message.error(
      error?.response?.data?.error?.message ??
        "تعذر الموافقة على الجرد، برجاء المحاولة مرة أخرى."
    );
    throw error;
  }
}

