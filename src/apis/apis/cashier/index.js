import { message } from "antd";
import axios from "axios";
import { API_ENDPOINT } from "../../../config";
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
export async function getProductById(id) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/product/show/${id}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
  }
}
export async function getAllTables(setIsLoading) {
  try {
    setIsLoading(true);
    const res = await axios.get(`${API_ENDPOINT}/api/v1/orders/show/tables`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    setIsLoading(false);
    return res.data;
  } catch (error) {
    setIsLoading(false);
    message.error(error.response.data.error.message);
  }
}
export async function getTableOrderById(id) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    message.error(error.response.data.error.message);

  }
}
