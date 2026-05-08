import { message } from "antd";
import axios from "axios";
import { API_ENDPOINT } from "../../../config";
const domain = API_ENDPOINT;
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");

export async function getOrders(filteredValues, id, setIsLoading) {
  try {
    setIsLoading(true);
    const {
      from_date,
      to_date,
      department_id,
      user_id,
      page,
      status,
      code,
      show_history,
      selected_department,
    } = filteredValues;
    const default_from = "1970-01-01";
    const default_to = new Date().toISOString().split("T")[0];
    const res = await axios.get(`${domain}/api/v1/orders`, {
      params: {
        "date[from]": from_date,
        "date[to]": to_date,
        to_department_id: department_id,
        user_id: user_id,
        status,
        page,
        code,
        department_id,
        show_history,
        selected_department,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    setIsLoading(false);
    return res.data;
  } catch (error) {
    setIsLoading(false);
    message.error("حدث خطأ الرجاء إعادة المحاولة ");
  }
}
export async function getOrdersReportes(filteredValues, id, setIsLoading) {
  try {
    setIsLoading(true);
    const { from_date, to_date, department_id, user_id, page, status, code } =
      filteredValues;
    const default_from = "1970-01-01";
    const default_to = new Date().toISOString().split("T")[0];
    const res = await axios.get(
      `${domain}/api/v1/store/department/orders/${id}`,
      {
        params: {
          from: from_date,
          to: to_date,
          user_id,
          status,
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );

    setIsLoading(false);

    return res.data;
  } catch (error) {
    setIsLoading(false);
    message.error("حدث خطأ الرجاء إعادة المحاولة ");
  }
}
export async function getOrderById(id) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    //message.error(error.response.data.error.message);
  }
}
export async function deleteOrder(id) {
  try {
    const res = await axios.delete(
      `${API_ENDPOINT}/api/v1/orders/delete/${id}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    message.error(error.response.data.error.message);
  }
}
export async function checkTableNumber(tableNumber) {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/orders/check_table_num/${tableNumber}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data.data.message;
  } catch (error) {
    message.error(error.response.data.error.message);

    // //
  }
}
export async function updateProductQuantityInOrder(editedData, id) {
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/orders/product/update/${editedData["product_id_in_order"]}`,
      { quantity: editedData.quantity },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    message.error(error.response.data.error.message);
    // //
  }
}
export async function deleteProductQuantityInOrder(id) {
  try {
    const res = await axios.delete(
      `${API_ENDPOINT}/api/v1/orders/product/delete/${id}`,

      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    message.success("تم حذف المنتج بنجاح");
    return res.data;
  } catch (error) {
    message.error(error.response.data.error.message);
    // //
  }
}
export async function changeOrderStatus(id, status, message = "") {
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/orders/update/status/${id}`,
      { status, message },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    message.error(`حدث خطأ في الانهاء`);
  }
}

export async function getDeletedOrders(filteredValues) {
  try {
    const {
      from_date,
      to_date,
      department_id,
      user_id,
      page,
      status,
      code,
      selected_department,
    } = filteredValues;

    const default_from = "1970-01-01";
    const default_to = new Date().toISOString().split("T")[0];

    const res = await axios.get(`${domain}/api/v1/orders/deleted`, {
      params: {
        "date[from]": from_date,
        "date[to]": to_date,
        to_department_id: department_id,
        user_id: user_id,
        status,
        page,
        code,
        department_id,
        selected_department,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.log(error);
    message.error("حدث خطأ الرجاء إعادة المحاولة ");
  }
}

export async function changeDeletedOrderStatus(orderId, status) {
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/orders/deleted/update/status/${orderId}`,
      {
        status,
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.log(error);
    message.error("حدث خطأ الرجاء إعادة المحاولة ");
  }
}

export async function reviewOrderPrice(
  items,
  clientType,
  client,
  department_id
) {
  try {
    if (items.length == 0) {
      return;
    }
    console.log(items)
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/orders/review-price`,
      {
        products: items,
        client_type_id: clientType,
        client_id: client,
        department_id: department_id,
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    message.error(`حدث خطأ في الانهاء`);
  }
}

/** Laravel responder / axios error shapes (validation_error vs message). */
export function getApiErrorMessage(error, fallback = "حدث خطأ") {
  const errObj = error?.response?.data?.error;
  if (errObj && typeof errObj === "object") {
    if (typeof errObj.message === "string") return errObj.message;
    if (typeof errObj.validation_error === "string")
      return errObj.validation_error;
    const firstString = Object.values(errObj).find(
      (v) => typeof v === "string"
    );
    if (firstString) return firstString;
  }
  if (typeof error?.response?.data?.message === "string") {
    return error.response.data.message;
  }
  return fallback;
}

/**
 * Preview monthly discount cap vs cart (same rules as order create).
 * Payload: { products: [{ product_id, quantity }], client_type_id, department_id, client_id?, name? }
 */
export async function fetchMonthlyDiscountStatus(payload) {
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/orders/monthly-discount-status`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data?.data ?? res.data;
  } catch {
    return null;
  }
}
