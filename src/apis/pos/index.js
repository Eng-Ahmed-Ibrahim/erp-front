import axios from "axios";
import { API_ENDPOINT } from "../../../config";
import { message } from "antd";

const domain = API_ENDPOINT;
const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

// Fetch all departments
export const getDepartments = async () => {
  try {
    const Token = getToken();
    const response = await axios.get(`${domain}/api/v1/store/department`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    message.error("حدث خطأ في جلب الأقسام");
    throw error;
  }
};

// Fetch products from a specific department
export const getProductsByDepartment = async (departmentId, filters = {}) => {
  try {
    const Token = getToken();
    const { name = "", page = 1, sub_category_id = "" } = filters;
    
    const response = await axios.get(
      `${domain}/api/v1/store/products/department/${departmentId}`,
      {
        params: {
          name,
          page,
          sub_category_id,
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching products by department:", error);
    message.error("حدث خطأ في جلب المنتجات");
    throw error;
  }
};

// Fetch subcategories for a department
export const getSubCategoriesForDepartment = async (departmentId) => {
  try {
    const Token = getToken();
    const response = await axios.get(
      `${domain}/api/v1/store/products/subcategories/department`,
      {
        params: {
          department_id: departmentId,
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    message.error("حدث خطأ في جلب الفئات الفرعية");
    throw error;
  }
};

// Fetch all categories
export const getCategories = async () => {
  try {
    const Token = getToken();
    const response = await axios.get(`${domain}/api/v1/store/categories`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    message.error("حدث خطأ في جلب الفئات");
    throw error;
  }
};

// Create order (for payment processing)
export const createOrder = async (orderData) => {
  try {
    const Token = getToken();
    const response = await axios.post(
      `${domain}/api/v1/store/orders`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    message.error("حدث خطأ في إنشاء الطلب");
    throw error;
  }
};

// Get customers
export const getCustomers = async (filters = {}) => {
  try {
    const Token = getToken();
    const { name = "", page = 1 } = filters;
    
    const response = await axios.get(`${domain}/api/v1/store/clients`, {
      params: {
        name,
        page,
      },
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    message.error("حدث خطأ في جلب العملاء");
    throw error;
  }
};

// Get payment methods
export const getPaymentMethods = async () => {
  try {
    const Token = getToken();
    const response = await axios.get(`${domain}/api/v1/store/payment-methods`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    message.error("حدث خطأ في جلب طرق الدفع");
    throw error;
  }
}; 

// Add these new functions to handle categories
export const getProductCategories = async () => {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await fetch(`${API_ENDPOINT}/api/v1/product/subcategories/department`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch product categories');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching product categories:', error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await fetch(`${API_ENDPOINT}/api/v1/product/subcategory/${categoryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch products by category');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
}; 