import { message } from "antd";
import axios from "axios";
import { API_ENDPOINT } from "../../../../config";
const domain = API_ENDPOINT;
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");

export async function getInventoryDiscrepancyReviews(
  filteredValues = { name: "" }
) {
  try {
    const { from_date, to_date, department_id } = filteredValues;
    const res = await axios.get(
      `${domain}/api/v1/store/inventory/get-discrepance-reviews`,
      {
        params: {
          from_date: from_date,
          to_date: to_date,
          department_id: department_id,
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    message.error(error.response.data.error.message);
    // console.log("Error fetching data:", error);
  }
}
