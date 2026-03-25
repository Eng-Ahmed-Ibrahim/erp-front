import axios from "axios";
import { API_ENDPOINT } from "../../../config";
import { message } from "antd";

const domain = API_ENDPOINT;
const Token =
  localStorage.getItem("token") || sessionStorage.getItem("token");

export async function getOrderPayables(filteredValues, id, setIsLoading) {
  try {
    setIsLoading(true);
    const { from_date, to_date, page, order_code, receipt_number } =
      filteredValues || {};

    const res = await axios.get(`${domain}/api/v1/store/order-payable`, {
      params: {
        "date[from]": from_date,
        "date[to]": to_date,
        page,
        order_code,
        receipt_number,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });

    setIsLoading(false);
    return res.data;
  } catch (error) {
    setIsLoading(false);
    message.error("حدث خطأ أثناء جلب مدفوعات الأوردرات");
  }
}

export async function getOrderPayableById(id) {
  const res = await axios.get(`${domain}/api/v1/store/order-payable/${id}`, {
    headers: {
      Authorization: `Bearer ${Token}`,
    },
  });
  return res.data;
}

export async function addOrderPayable(data) {
  const res = await axios.post(
    `${domain}/api/v1/store/order-payable/create`,
    data,
    {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    }
  );
  return res.data;
}

export async function updateOrderPayable(id, data) {
  const res = await axios.put(
    `${domain}/api/v1/store/order-payable/update/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    }
  );
  return res.data;
}

export async function deleteOrderPayable(id) {
  const res = await axios.delete(
    `${domain}/api/v1/store/order-payable/delete/${id}`,
    {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    }
  );
  return res.data;
}

export async function getOrderPayableOrdersOptions() {
  const res = await axios.get(
    `${domain}/api/v1/store/order-payable/orders/options`,
    {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    }
  );
  return res.data;
}

