import axios from "axios";
import { API_ENDPOINT } from "../../../config";
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
const domain = API_ENDPOINT;

export async function getPermissions() {
  try {
    const res = await axios.get(`${domain}/api/v1/store/permission`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });

    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
  }
}
