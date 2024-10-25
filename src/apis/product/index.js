import axios from "axios";
import { API_ENDPOINT } from "../../../config";
const domain = API_ENDPOINT;
import { message } from "antd";
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
export async function getProducts(filteredValues = { name: "", page: "" }, id) {
  try {
    const { name, page } = filteredValues;

    const res = await axios.get(`${domain}/api/v1/store/recipe`, {
      params: {
        name: name,
        recipe_category_id: id,
        page,
      },
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

export async function getUnits() {
  try {
    const res = await axios.get(`${domain}/api/v1/store/unit`, {
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

export async function addProducts(
  name,
  description,
  price,
  image,
  category_id,
  sub_category_id
) {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    // formData.append('quantity', quantity);
    formData.append("image", image[0].originFileObj);
    // formData.append('price', price);
    // Only send the first image
    formData.append("category_id", category_id);
    formData.append("price", price);

    formData.append("sub_category_id", sub_category_id);
    // formData.append('unit_id', unit_id);
    // formData.append('minimum_limt', minimum_limt);
    // formData.append('days_before_expire', day_before_expire);

    const res = await axios.post(
      `${domain}/api/v1/store/products/create`,
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
    // console.log("Error fetching data:", error);
    throw error; // Rethrow the error to handle it in the calling code if necessary
  }
}
export async function eidtProduct(
  name,
  description,
  image,
  price,
  category_id,
  sub_category_id,
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
    formData.append("price", price);

    formData.append("sub_category_id", sub_category_id);
    formData.append("_method", "PUT");
    const res = await axios.post(
      `${domain}/api/v1/store/products/update/${id}`,
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

    // console.log("Error fetching data:", error);
    throw error; // Rethrow the error to handle it in the calling code if necessary
  }
}

export async function getProductsById(id) {
  try {
    const res = await axios.get(`${domain}/api/v1/store/products/${id}`, {
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

export async function getProductsFilterById(
  filteredValues = { name: "", page: "" },
  id
) {
  const { name, page } = filteredValues;
  try {
    const res = await axios.get(
      `${domain}/api/v1/store/products/subcategory/${id}`,
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

export async function deleteProduct(id) {
  try {
    const res = await axios.delete(
      `${domain}/api/v1/store/products/delete/${id}`,
      {
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
export async function editProductByDepartment(editValues) {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append(
      "image",
      image[0].originFileObj ? image[0].originFileObj : 0
    );

    formData.append("category_id", category_id);
    formData.append("price", price);

    formData.append("sub_category_id", sub_category_id);
    formData.append("_method", "PUT");
    const res = await axios.post(
      `${domain}/api/v1/store/products/update/${id}`,
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

    // console.log("Error fetching data:", error);
    throw error; // Rethrow the error to handle it in the calling code if necessary
  }
}
export async function editProductsToDepartment(editValues, id) {
  try {
    const formData = new FormData();
    formData.append("department_id", id);
    formData.append("quantity", editValues.quantity);

    formData.append("_method", "PUT");
    const res = await axios.post(
      `${domain}/api/v1/store/products/department/update/${editValues.id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
          Accept: "application/json",
        },
      }
    );
    message.success("تم التعديل بنجاح");

    return res.data;
  } catch (error) {
    message.error(error.response.data.error.message);

    // console.log("Error fetching data:", error);
    throw error; // Rethrow the error to handle it in the calling code if necessary
  }
}
export async function getSubCategoriesForDepartment(id) {
  try {
    const res = await axios.get(
      `${domain}/api/v1/store/products/subcategories/department`,
      {
        params: {
          department_id: id,
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
