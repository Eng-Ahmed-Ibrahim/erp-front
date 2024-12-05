import axios from "axios";
import { API_ENDPOINT } from "../../../config";
const domain = API_ENDPOINT;
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
export async function getUderLimit(filteredValues = { name: "", page: "" }, department_id) {

    try {
        const { name, page } = filteredValues;
        const res = await axios.get(
            `${domain}/api/v1/store/recipe/get_repices/under_limt`,
            {
                params: {
                    name,
                    page,
                    department_id: department_id,


                },
                headers: {
                    Authorization: `Bearer ${Token}`,
                },
            }
        );
        // console.log(res.data);
        return res.data;
    } catch (error) {
        message.error(error.response.data.error.message);

        // console.log("Error fetching data:", error);
    }
}

export async function getExpireLimit(filteredValues = { name: "", page: "" }, department_id) {
    try {
        const { name, page } = filteredValues;
        const res = await axios.get(
            `${domain}/api/v1/store/recipe/expire-limit/expire_date_before_days`,
            {
                params: {
                    name,
                    page,
                    department_id: department_id,
                },
                headers: {
                    Authorization: `Bearer ${Token}`,
                },
            }
        );
        // console.log(res.data);
        return res.data;
    } catch (error) {
        message.error(error.response.data.error.message);

        // console.log("Error fetching data:", error);
    }
}

export async function getUnderExiperById(id, department_id) {
    // console.log(id)
    // console.log(department_id)
    try {
        const res = await axios.get(
            `${domain}/api/v1/store/recipe/expire-limit/expire_date_before_days/${id}`,
            {
                params: {
                    department_id: department_id
                },
                headers: {
                    Authorization: `Bearer ${Token}`,
                },
            }
        );
        // console.log(res.data);
        return res.data;
    } catch (error) {
        // console.log("Error fetching data:", error);
        message.error(error.response.data.error.message);
    }
}
