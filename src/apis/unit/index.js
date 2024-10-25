import axios from "axios";
import { API_ENDPOINT } from "../../../config";
const domain = API_ENDPOINT;

import { message } from "antd";
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
export async function getUnits(
    filteredValues = { name: "", page: "" },
    id,
    setIsLoading
) {
    try {
        setIsLoading(true);
        const { name, page } = filteredValues;

        const res = await axios.get(`${domain}/api/v1/store/unit`, {
            params: {
                name: name,
                Deaprtment_category_id: id,
                page,
            },
            headers: {
                Authorization: `Bearer ${Token}`,
            },
        });
        // console.log(res.data);
        setIsLoading(false);
        return res.data;
    } catch (error) {
        // console.log("Error fetching data:", error);
        setIsLoading(false);
        message.error("حدث خطأ الرجاء المحاولة مرة أخرى");
    }
}

// export async function getUnits() {
//     try {
//         const res = await axios.get(`${domain}/api/v1/store/unit`);
//         // console.log(res.data);
//         return res.data;
//     } catch (error) {
//         // console.log("Error fetching data:", error);
//     }
// }

export async function addUnits(name) {
    try {
        const formData = new FormData();
        formData.append("name", name);
        // formData.append('quantity', quantity);

        // formData.append("days_before_expire", day_before_expire);

        const res = await axios.post(
            `${domain}/api/v1/store/unit/create`,
            formData,
            {
                headers: {
                    Accept: "application/json",
                },
                headers: {
                    Authorization: `Bearer ${Token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        // message.error(error.response.data.error.message)
        message.error(error.response.data.error.message);

        // console.log("Error fetching data:", error);
        throw error; // Rethrow the error to handle it in the calling code if necessary
    }
}
export async function eidtUnits(
    name,

    id
) {
    try {
        const formData = new FormData();
        formData.append("name", name);

        const res = await axios.post(
            `${domain}/api/v1/store/unit/update/${id}`,
            formData,
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${Token}`,
                },
            }
        );
        return res.data;
    } catch (error) {
        message.error(error.response.data.error.message);

        // console.log("Error fetching data:", error);
        throw error;
    }
}

export async function getUnitsById(id) {
    try {
        const res = await axios.get(`${domain}/api/v1/store/unit/${id}`, {
            headers: {
                Authorization: `Bearer ${Token}`,
            },
        });
        // console.log(res.data);
        return res.data;
    } catch (error) {
        message.error(error.response.data.error.message);

        // console.log("Error fetching data:", error);
    }
}

export async function getUnitsFilterById(
    filteredValues = { name: "", page: "" },
    id
) {
    const { name, page } = filteredValues;
    try {
        const res = await axios.get(
            `${domain}/api/v1/store/Deaprtment/filter_by_category/${id}`,
            {
                params: {
                    name: name,
                    page,
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

export async function deleteUint(id) {
    try {
        const res = await axios.delete(`${domain}/api/v1/store/unit/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${Token}`,
            },
        });
        return res.data;
    } catch (error) {
        message.error(error.response.data.error.message);

        // console.log("Error fetching data:", error);
    }
}
