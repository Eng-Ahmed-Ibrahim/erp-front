

import axios from "axios";
import { API_ENDPOINT } from "../../../config";
import { message } from "antd";
const domain = API_ENDPOINT;

const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
export async function getRcipeReports(filteredValues, id, setIsLoading) {
    try {
        setIsLoading(true);
        const { name, page } = filteredValues;

        const res = await axios.get(`${domain}/api/v1/store/invoice/filter/get_recipes/out_going_from_to_date/${id}`, {
            params: {
                //   name: name,
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
        message.error("حدث خطأ الرجاء إعادة المحاولة");
    }
}




export async function getTotalStores(filteredValues, id, setIsLoading) {
    try {
        setIsLoading(true);
        const { name, page } = filteredValues;

        const res = await axios.get(`${domain}/api/v1/store/recipe/store/totals`, {
            params: {
                //   name: name,
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
        message.error("حدث خطأ الرجاء إعادة المحاولة");
    }
}

export async function getTotalForSupplierReports(filteredValues, id, setIsLoading) {
    try {
        setIsLoading(true);
        const { name, page, from_date, to_date, } = filteredValues;

        const res = await axios.get(`${domain}/api/v1/store/invoice/filter/get_recipes/supplier_from_to_date/${id}`, {
            params: {
                "date[from]": from_date,
                "date[to]": to_date,
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
        message.error("حدث خطأ الرجاء إعادة المحاولة");
    }
}




export async function getReportOfRecipe(filteredValues, id, setIsLoading, department_id) {
    try {
        setIsLoading(true);
        const { name, page, from_date, to_date, } = filteredValues;
        const default_from = "1970-01-01";
        const default_to = new Date().toISOString().split("T")[0];

        const res = await axios.get(`${domain}/api/v1/store/recipe/recipe-invoices-report/statistics/${id}`, {
            params: {
                "date[from]": from_date || default_from,
                "date[to]": to_date || default_to,
                department_id: department_id,
                page,
            },
            headers: {
                Authorization: `Bearer ${Token}`,
            },
        });
        // console.log(res?.data);
        setIsLoading(false);
        return res.data;
    } catch (error) {
        // console.log("Error fetching data:", error);
        setIsLoading(false);
        message.error("حدث خطأ الرجاء إعادة المحاولة");
    }
}


export async function getAllRicipes(
    filteredValues = { name: "", page: "" },
    id,
    setIsLoading
) {
    try {
        setIsLoading(true);
        const { name, page } = filteredValues;

        const res = await axios.get(`${domain}/api/v1/store/recipe/all/paginated`, {
            params: {
                name: name,

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








export async function getSupplierInvoicesReport(filteredValues, id, setIsLoading) {
    try {
        setIsLoading(true);
        const { name, page, from_date, to_date, } = filteredValues;

        const res = await axios.get(`${domain}/api/v1/store/invoice/suppliers/invoices`, {
            params: {
                "date[from]": from_date,
                "date[to]": to_date,
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
        message.error("حدث خطأ الرجاء إعادة المحاولة");
    }
}