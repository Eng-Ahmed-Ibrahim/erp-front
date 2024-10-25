import axios from "axios";
import { API_ENDPOINT } from "../../../../config";
import { message } from "antd";
const domain = API_ENDPOINT;
const Token = localStorage.getItem('token') || sessionStorage.getItem('token')
export async function getRecipeCategoryParent(
  filteredValues,
  id,
  setIsLoading
) {
  try {
    setIsLoading(true);
    const { name, page } = filteredValues;
    const res = await axios.get(
      `${domain}/api/v1/store/recipe_category_parent`,
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
    setIsLoading(false);
    // console.log(res.data);
    return res.data;
  } catch (error) {
    setIsLoading(false);
    // console.log("Error fetching data:", error);
    message.error("حدث خطأ الرجاء إعادة المحاولة");
    message.error(error.response.data.error.message);

  }
}

export async function addRecipe(name, description, image) {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", image[0].originFileObj); // Only send the first image

    const res = await axios.post(
      `${domain}/api/v1/store/recipe_category_parent/create`,
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
    // console.log("Error fetching data:", error);
    message.error(error.response.data.error.message);

    throw error; // Rethrow the error to handle it in the calling code if necessary
  }
}
export async function eidtRecipe(name, description, image, id) {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    formData.append(
      "image",
      image[0].originFileObj ? image[0].originFileObj : 0
    );
    formData.append("_method", "PUT"); // Only send the first image

    const res = await axios.post(
      `${domain}/api/v1/store/recipe_category_parent/update/${id}`,
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
    // console.log("Error fetching data:", error);
    message.error(error.response.data.error.message);

    throw error; // Rethrow the error to handle it in the calling code if necessary
  }
}
export async function getRecipeById(id) {
  try {
    const res = await axios.get(
      `${domain}/api/v1/store/recipe_category_parent/${id}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    // console.log(res.data);
    return res.data.data;
  } catch (error) {
    // console.log("Error fetching data:", error);
    message.error(error.response.data.error.message);

  }
}

export async function deleteRecipeSubCategoryParent(id) {
  try {
    const res = await axios.delete(
      `${domain}/api/v1/store/recipe_category_parent/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    }
    );
    return res.data;
  } catch (error) {
    // console.log("Error fetching data:", error);
    message.error(error.response.data.error.message);
  }
}
