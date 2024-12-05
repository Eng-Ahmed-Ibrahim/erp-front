import axios from "axios";
import { API_ENDPOINT } from "../../../config";
import { message } from "antd";
const Token =
  localStorage.getItem("token") || sessionStorage.getItem("token"); export async function getSuppliers(filteredValues, id, setIsLoading) {
    try {
      setIsLoading(true);
      const { name, phone, page, type } = filteredValues;
      const res = await axios.get(`${API_ENDPOINT}/api/v1/store/supplier`, {
        params: {
          name,
          phone,
          page,
          type,
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      });
      setIsLoading(false);
      return res.data;
    } catch (error) {
      // console.log("Error fetching data:", error);
      setIsLoading(false);
      message.error("حدث خطأ الرجاء إعادة المحاولة ");
    }
  }
export async function getSupplierById(id) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/store/supplier/${id}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    // console.log("Error fetching data:", error);
  }
}
export async function editSupplier(name, phoneNumber, address, type, id) {
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/store/supplier/update/${id}`,
      {
        name: name,
        phone: phoneNumber,
        address: address,
        type: type,
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
export async function deleteSupplier(id) {
  // console.log(`${API_ENDPOINT}/api/v1/store/supplier/delete/${id}`);
  try {
    const res = await axios.delete(
      `${API_ENDPOINT}/api/v1/store/supplier/delete/${id}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    // console.log("Error fetching data:", error);
    message.error(error.response.data.error.message)

  }
}
export async function addSupplier(formData) {
  const { type, name, address, phone } = formData;
  // console.log(type, name, address, phone, formData);
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/store/supplier/create`,
      {
        type,
        name,
        address,
        phone,
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
export async function getSupplierInvoices(filteredValues, id, setIsLoading) {
  const { from_date, to_date, status, page } = filteredValues;
  const default_from = "1970-01-01";
  const default_to = new Date().toISOString().split("T")[0];
  try {
    setIsLoading(true);

    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/store/supplier/${id}/invoices`,
      {
        params: {
          "date[from]": from_date || default_from,
          "date[to]": to_date || default_to,
          status,
          page,
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      },
    );
    setIsLoading(false);
    return res.data;
  } catch (error) {
    setIsLoading(false);
    // console.log("Error fetching data:", error);
    const errors = error.response.data.error.errors;
    Object.keys(errors).map((err) => {
      message.error(errors[err][0] || "حدث خطأ الرجاء المحاولة مرة أخرى");
    });
  }
}
