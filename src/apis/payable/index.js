import axios from "axios";
import { API_ENDPOINT } from "../../../config";
import { message } from "antd";
const domain = API_ENDPOINT;
const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
export async function getPayable(filteredValues, id, setIsLoading) {
    try {
        setIsLoading(true);
        const { from_date, to_date, page, type } = filteredValues;
        const default_from = "1970-01-01";
        const default_to = new Date().toISOString().split("T")[0];

        const res = await axios.get(`${domain}/api/v1/store/payable`, {
            params: {
                "date[from]": from_date,
                "date[to]": to_date,
                type,
                page,
            },
            headers: {
                Authorization: `Bearer ${Token}`,
            },
        });
        // // console.log(res.data);
        setIsLoading(false);
        return res.data;
    } catch (error) {
        // // console.log("Error fetching data:", error);
        setIsLoading(false);
        message.error("حدث خطأ الرجاء إعادة المحاولة");
    }
}

export async function addPayable(
    amount,
    note,
    type,
    invoice_id,
    image,
    selectedPayableType

) {
    try {
        const formData = new FormData();
        formData.append("amount", amount);
        formData.append("note", note);
        formData.append("type", type);
        { selectedPayableType === "invoices" ? formData.append("invoice_id", invoice_id) : null }
        { selectedPayableType === "expenses" ? formData.append("image", image[0].originFileObj) : null }

        // formData.append("image", image[0].originFileObj); // Only send the first image


        const res = await axios.post(
            `${domain}/api/v1/store/payable/create`,
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
        // // console.log("Error fetching data:", error?.response?.data);

        throw error; // Rethrow the error to handle it in the calling code if necessary
    }
}
export async function eidtPayable(
    name,
    description,
    image,
    category_id,
    id
) {
    try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);

        formData.append(
            "image",
            image[0].originFileObj ? image[0].originFileObj : 0
        );
        formData.append("category_id", category_id);
        formData.append("_method", "PUT"); // Only send the first image

        const res = await axios.post(
            `${domain}/api/v1/store/payable/update/${id}`,
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
        // // console.log("Error fetching data:", error.response.data.error.message);
        throw error; // Rethrow the error to handle it in the calling code if necessary
    }
}
export async function getPayableById(id) {
    try {
        const res = await axios.get(`${domain}/api/v1/store/payable/${id}`, {
            headers: {
                Authorization: `Bearer ${Token}`,
            }
        });
        // // console.log(res.data);
        return res.data;
    } catch (error) {
        // // console.log("Error fetching data:", error);
        message.error(error.response.data.error.message);

    }
}

export async function getAllSuppliersInvoices() {
    try {
        const res = await axios.get(`${domain}/api/v1/store/invoice/suppliers/invoices`, {
            headers: {
                Authorization: `Bearer ${Token}`,
            }
        });
        // // console.log(res.data);
        return res.data;
    } catch (error) {
        // // console.log("Error fetching data:", error);
        message.error(error.response.data.error.message);

    }
}

export async function getPayableFilterById(
    filteredValues = { name: "", page: "" },
    id
) {
    const { name, page } = filteredValues;
    try {
        const res = await axios.get(
            `${domain}/api/v1/store/payable/filter_by_parent/${id}`,
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
        // // console.log(res.data);
        return res.data;
    } catch (error) {
        // // console.log("Error fetching data:", error);
        message.error(error.response.data.error.message);

    }
}

export async function deletePayable(id) {
    try {
        const res = await axios.delete(
            `${domain}/api/v1/store/payable/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${Token}`,
            },
        }
        );
        return res.data;
    } catch (error) {
        // // console.log("Error fetching data:", error);
        message.error(error.response.data.error.message);

    }
}
