import axios from "axios";
import { API_ENDPOINT } from "../../../config";
import { message } from "antd";
import { useState } from "react";
const domain = API_ENDPOINT;

const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
export async function getRecipes(filteredValues = { name: "", page: "" }) {
  try {
    const { name, page } = filteredValues;

    const res = await axios.get(`${domain}/api/v1/store/recipe_category`, {
      params: {
        name: name,
        page,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    // // console.log(res.data);
    return res.data;
  } catch (error) {
    message.error(error.response.data.error.message);

    // // console.log("Error fetching data:", error);
  }
}

export async function getUnits() {
  try {
    const res = await axios.get(`${domain}/api/v1/store/unit`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    // // console.log(res.data);
    return res.data;
  } catch (error) {
    message.error(error.response.data.error.message);

    // // console.log("Error fetching data:", error);
  }
}

export async function addRecipes(
  name,
  quantity,
  image,
  price,
  recipe_category_id,
  unit_id,
  minimum_limt,
  day_before_expire
) {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("quantity", quantity);
    formData.append("image", image[0].originFileObj);
    formData.append("price", price);
    // Only send the first image
    formData.append("recipe_category_id", recipe_category_id);
    formData.append("unit_id", unit_id);
    formData.append("minimum_limt", minimum_limt);
    formData.append("days_before_expire", day_before_expire);

    const res = await axios.post(
      `${domain}/api/v1/store/recipe/create`,
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
    message.error(error.response.data.error.message);

    // // console.log("Error fetching data:", error);
    throw error;
  }
}
export async function eidtRecipes(
  name,
  quantity,
  image,
  price,
  recipe_category_id,
  unit_id,
  minimum_limt,
  day_before_expire,
  id
) {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("quantity", quantity);
    formData.append("image", image[0].originFileObj);
    formData.append("price", price);
    // Only send the first image
    formData.append("recipe_category_id", recipe_category_id);
    formData.append("unit_id", unit_id);
    formData.append("minimum_limt", minimum_limt);
    formData.append("day_before_expire", day_before_expire);
    formData.append("_method", "PUT"); // Only send the first image

    const res = await axios.post(
      `${domain}/api/v1/store/recipe/update/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
          Accept: "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    message.error(error.response.data.error.message);

    // // console.log("Error fetching data:", error);
    throw error; // Rethrow the error to handle it in the calling code if necessary
  }
}
export async function getRecipesById(id, departmentId) {
  try {
    const res = await axios.get(`${domain}/api/v1/store/recipe/${id}`, {
      params: {
        department_id: departmentId,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    // // console.log(res.data);
    return res.data.data;
  } catch (error) {
    // message.error(error.response.data.error.message);

    // // console.log("Error fetching data:", error);
  }
}


export async function getRecipesInRetuendById(id, departmentId) {
  try {
    const res = await axios.get(`${domain}/api/v1/store/recipe/${id}`, {
      params: {
        department_id: departmentId,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    // // console.log(res.data);
    return res.data.data;
  } catch (error) {
    // message.error(error.response.data.error.message);

    // // console.log("Error fetching data:", error);
  }
}

export async function getIncomingInvoiceByType(
  filteredValues,
  id,
  setIsLoading
) {
  const {
    from_date,
    to_date,
    supplier_id,
    invoice_price,
    page,
    code,
    status,
    department_id,
    created_by,
  } = filteredValues;
  const default_from = "1970-01-01";
  const default_to = new Date().toISOString().split("T")[0];
  try {
    setIsLoading(true);
    const res = await axios.get(
      `${domain}/api/v1/store/invoice/get_invoices_based_on_type/in_coming`,
      {
        params: {
          "date[from]": from_date || default_from,
          "date[to]": to_date || default_to,
          code,
          invoice_price,
          supplier_id,
          status,
          department_id,
          created_by,
          page,
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    )
    
    setIsLoading(false);
    console.log("DATA: ", res.data.data.invoices);
    return res.data.data
  } catch (error) {
    setIsLoading(false);
    // // console.log("Error fetching data:", error);
    message.error("حدث خطأ الرجاء إعادة المحاولة");
  }
  // // console.log('getStatus', getStatus);

}

export async function getOutgoingInvoiceByType(
  filteredValues,
  id,
  setIsLoading
) {
  const {
    from_date,
    to_date,
    supplier_id,
    invoice_price,
    page,
    code,
    status,
    department_id,
    created_by,
  } = filteredValues;
  // const default_from = "1970-01-01";
  // const default_to = new Date().toISOString().split("T")[0];
  try {
    setIsLoading(true);
    const res = await axios.get(
      `${domain}/api/v1/store/invoice/get_invoices_based_on_type/out_going`,
      {
        params: {
          "date[from]": from_date,
          "date[to]": to_date,
          code,
          invoice_price,
          supplier_id,
          status,
          department_id,
          created_by,
          page,
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    setIsLoading(false);
    // // console.log(res);
    return res.data;
  } catch (error) {
    setIsLoading(false);
    // // console.log("Error fetching data:", error);
    message.error("حدث خطأ الرجاء إعادة المحاولة");
  }
}

export async function getReturndInvoiceByType(
  filteredValues,
  id,
  setIsLoading
) {
  const {
    from_date,
    to_date,
    supplier_id,
    invoice_price,
    page,
    code,
    status,
    department_id,
    created_by,
  } = filteredValues;

  try {
    setIsLoading(true);
    const res = await axios.get(
      `${domain}/api/v1/store/invoice/get_invoices_based_on_type/returned`,
      {
        params: {
          "date[from]": from_date,
          "date[to]": to_date,
          code,
          invoice_price,
          supplier_id,
          status,
          department_id,
          created_by,
          page,
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    setIsLoading(false);
    // // console.log(res);
    return res.data;
  } catch (error) {
    setIsLoading(false);
    // // console.log("Error fetching data:", error);
    message.error("حدث خطأ الرجاء إعادة المحاولة");
  }
}

export async function getTaintedInvoices(filteredValues, id, setIsLoading) {
  const { from_date, to_date, supplier_id, invoice_price, page, code, status, created_by } =
    filteredValues;

  try {
    setIsLoading(true);
    const res = await axios.get(`${domain}/api/v1/store/tainted-invoices`, {
      params: {
        "date[from]": from_date,
        "date[to]": to_date,
        code,
        invoice_price,
        supplier_id,
        status,
        created_by,
        page,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    setIsLoading(false);
    // // console.log(res);
    return res.data;
  } catch (error) {
    setIsLoading(false);
    // // console.log("Error fetching data:", error);
    message.error("حدث خطأ الرجاء إعادة المحاولة");
  }
}


export async function getInvoiceById(id) {
  try {
    const res = await axios.get(`${domain}/api/v1/store/invoice/${id}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    message.error(error.response.data.error.message);

    // // console.log("Error fetching data:", error);
  }
}

export async function getTaintedInvoiceById(id) {
  try {
    const res = await axios.get(
      `${domain}/api/v1/store/tainted-invoices/${id}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    message.error(error.response.data.error.message);

    // // console.log("Error fetching data:", error);
  }
}
export async function updateInvoice(filteredValues, id) {
  // // console.log(typeof filteredValues.recipes);
  const formData = new FormData();
  Object.keys(filteredValues.recipes).map((key, index) => {
    formData.append(
      `recipes[${index}][recipe_id]`,
      filteredValues.recipes[key].id
    );
    formData.append(
      `recipes[${index}][price]`,
      filteredValues.recipes[key].price
    );
    // Add other fields as needed, for example quantity, expire_date, etc.
    formData.append(
      `recipes[${index}][quantity]`,
      filteredValues.recipes[key].quantity);
    formData.append(
      `recipes[${index}][expire_date]`,
      filteredValues.recipes[key].expire_date);
  });
  formData.append("_method", "PUT");
  try {
    const res = await axios.post(
      `${domain}/api/v1/store/invoice/update/${filteredValues.id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    message.success("تم التعديل بنجاح");
    // // console.log(res);
    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
  }
}

export async function updateInvoiceQuintity(filteredValues, id) {
  // // console.log(filteredValues);
  const formData = new FormData();
  Object.keys(filteredValues.recipes).map((key, index) => {
    formData.append(
      `recipes[${index}][recipe_id]`,
      filteredValues.recipes[key].id
    );
    formData.append(
      `recipes[${index}][price]`,
      filteredValues.recipes[key].price
    );
    // Add other fields as needed, for example quantity, expire_date, etc.
    formData.append(
      `recipes[${index}][quantity]`,
      filteredValues.recipes[key].quantity
    );
    formData.append(
      `recipes[${index}][expire_date]`,
      filteredValues.recipes[key].expire_date
    );
  });
  formData.append("_method", "PUT");
  try {
    const res = await axios.post(
      `${domain}/api/v1/store/invoice/update_quantity/${filteredValues.id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    message.success("تم التعديل بنجاح");
    // // console.log(res);
    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
    message.error(error.response.data.error.message);
  }
}


export async function updateInvoicePrice(filteredValues, id) {
  // // console.log(filteredValues);
  const formData = new FormData();
  Object.keys(filteredValues.recipes).map((key, index) => {
    formData.append(
      `recipes[${index}][recipe_id]`,
      filteredValues.recipes[key].id
    );
    formData.append(
      `recipes[${index}][price]`,
      filteredValues.recipes[key].price
    );
    // Add other fields as needed, for example quantity, expire_date, etc.
    formData.append(
      `recipes[${index}][quantity]`,
      filteredValues.recipes[key].quantity
    );
    formData.append(
      `recipes[${index}][expire_date]`,
      filteredValues.recipes[key].expire_date
    );
  });
  formData.append("_method", "PUT");
  try {
    const res = await axios.post(
      `${domain}/api/v1/store/invoice/update/${filteredValues.id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    message.success("تم التعديل بنجاح");
    // // console.log(res);
    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
    message.error(error.response.data.error.message);
  }
}

export async function updateTaintedInvoice(filteredValues, id) {
  const { inputValues } = filteredValues;
  const formData = new FormData();
  Object.keys(inputValues).forEach((inputValueID, index) => {
    formData.append(`recipes[${index}][recipe_id]`, inputValueID);
    formData.append(
      `recipes[${index}][price]`,
      inputValues[inputValueID].price
    );
    // Add other fields as needed, for example quantity, expire_date, etc.
    formData.append(
      `recipes[${index}][quantity]`,
      inputValues[inputValueID].quantity
    );
    formData.append(
      `recipes[${index}][expire_date]`,
      inputValues[inputValueID].expire_date
    );
  });
  formData.append("_method", "PUT");
  try {
    const res = await axios.post(
      `${domain}/api/v1/store/tainted-invoices/update/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    // // console.log(res);
    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
  }
}
export async function changeInvoiceStatus(id, status) {
  try {
    const res = await axios.get(
      `${domain}/api/v1/store/invoice/chenge_status/${id}/${status}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    message.error(error.response.data.error.message);

    // // console.log("Error fetching data:", error);
  }
}

export async function getStockUsers() {
  try {
    const res = await axios.get(`${domain}/api/v1/store/user/stocks`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    message.error("حدث خطأ في جلب المستخدمين");
    console.error("Error fetching stock users:", error);
  }
}
