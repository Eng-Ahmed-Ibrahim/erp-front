import axios from "axios";
import { API_ENDPOINT } from "../../../config";
const domain = API_ENDPOINT;
import { message } from "antd";
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
export async function getDeaprtments(
  filteredValues = { name: "", page: "" },
  id,
  setIsLoading
) {
  try {
    setIsLoading(true);
    const { name, page } = filteredValues;

    const res = await axios.get(`${domain}/api/v1/store/department`, {
      params: {
        name: name,
        Deaprtment_category_id: id,
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
    message.error("حدث خطأ الرجاء المحاولة مرة أخرى");
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

export async function addDeaprtments(name, image, code, phone) {
  try {
    const formData = new FormData();
    formData.append("name", name);
    // formData.append('quantity', quantity);
    formData.append("image", image[0].originFileObj);
    // formData.append('price', price);
    // Only send the first image
    formData.append("code", code);
    formData.append("phone", phone);
    formData.append("type", "reciver");
    // formData.append("days_before_expire", day_before_expire);

    const res = await axios.post(
      `${domain}/api/v1/store/department/create`,
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

    // message.error(error.response.data.error.message)
    // // console.log("Error fetching data:", error);
    throw error; // Rethrow the error to handle it in the calling code if necessary
  }
}
export async function eidtDeaprtments(name, image, code, phone, id) {
  try {
    const formData = new FormData();
    formData.append("name", name);
    // formData.append('quantity', quantity);

    formData.append(
      "image",
      image[0].originFileObj ? image[0].originFileObj : 0
    );
    // formData.append('price', price);
    // Only send the first image
    formData.append("code", code);
    formData.append("phone", phone);
    formData.append("type", "reciver");
    formData.append("_method", "PUT"); // Only send the first image

    const res = await axios.post(
      `${domain}/api/v1/store/department/update/${id}`,
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

    // // console.log("Error fetching data:", error);
    throw error;
  }
}

export async function getDeaprtmentsById(id) {
  try {
    const res = await axios.get(`${domain}/api/v1/store/department/${id}`, {
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

export async function getDeaprtmentsFilterById(
  filteredValues,
  id,
  setIsLoading
) {
  try {
    setIsLoading(true);
    const { name, page, sub_category_id } = filteredValues;

    const res = await axios.get(
      `${domain}/api/v1/store/products/department/${id}`,
      // `${domain}/api/v1/store/invoice/filter/get_recipes/out_going_from_to_date/${id}`, 
      {
        params: {
          name: name,
          page,
          sub_category_id,
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    // // console.log( 'dataaaaaaaaaaaaaaaaaaaaaaaaaa',res.data?.data[0]?.total_quantity);
    setIsLoading(false);
    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
    setIsLoading(false);
    message.error("حدث خطأ الرجاء المحاولة مرة أخرى");
  }
}

export async function deleteDeaprtment(id) {
  try {
    const res = await axios.delete(
      `${domain}/api/v1/store/department/delete/${id}`,
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

export async function deleteProductDeaprtment(id) {
  try {
    const res = await axios.delete(
      `${domain}/api/v1/store/products/department/delete/${id}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    // // console.log(res.data);
    return res.data;
  } catch (error) {
    message.error(error.response.data.error.message);

    // // console.log("Error fetching data:", error);
  }
}
export async function getAllDeaprtments() {
  try {
    const res = await axios.get(`${domain}/api/v1/store/department/all`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    // // console.log(res.data);
    return res.data;
  } catch (error) {
    // // console.log("Error fetching data:", error);
  }
}
