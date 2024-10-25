// import React, { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { addProducts, eidtProduct } from '../../../../../../../apis/product';

// import { getSubCategoryById } from '../../../../../../../apis/subCategory';
// import DynamicForm from '../../../../../../../components/shared/form/Form';
// import { getClientTypes } from '../../../../../../../apis/clients/ClientType';

// const AddProduct = () => {
//     const navigate = useNavigate();

//     const { id } = useParams()

//     const handleSubmit = async (formData) => {
//         // console.log(formData);
//         await addProducts(formData.name, formData.description, formData.price, formData.image, category_id, id);
//         await navigate(`/warehouse/returants/subcategory/show-product/${id}`);
//     };

//     const [categories, setCategories] = useState([]); // Initialize categories state
//     const [units, setUnits] = useState([]); // Initialize categories state

//     const [data, setData] = useState('')
//     const [category_id, setCategoryId] = useState('')

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const recipeData = await getSubCategoryById(id);
//                 setData(recipeData.data.name);
//                 setCategoryId(recipeData.data.category.id);
//                 // console.log(recipeData.data.category.id)

//                 // console.log(recipeData.data.name)
//             } catch (error) {
//                 // console.log("Error fetching data:", error);
//             }
//         };

//         fetchData(); // Call fetchData when component mounts
//     }, []);

//     // useEffect(() => {
//     //     const fetchData = async () => {
//     //         try {
//     //             const unitData = await getUnits();
//     //             setUnits(unitData.data);
//     //         } catch (error) {
//     //             // console.log("Error fetching data:", error);
//     //         }
//     //     };

//     //     fetchData(); // Call fetchData when component mounts
//     // }, []);

//     const [clientTypes, setClientTypes] = useState([]);
//     useEffect(() => {
//       const fetchClientTypes = async () => {
//         const res = await getClientTypes({}, "", () => { });
//         setClientTypes(res?.data);
//         // console.log(res?.data);
//       };
//       fetchClientTypes();
//     }, []);

//     const fields = [
//         { type: 'text', name: 'parent', placeholder: `${data}`, required: false, disabled: true },
//         { type: 'text', name: 'name', labelName: "الاسم", placeholder: 'يجب عليك ادخال الاسم', required: true },

//         // { type: 'number', name: 'quantity', placeholder: 'يجب عليك ادخال الكميه', required: true },
//         { type: 'number', name: 'price', labelName: "السعر", placeholder: 'يجب عليك ادخال السعر', required: true },
//         { type: 'text', name: 'description', labelName: "الوصف", placeholder: 'يجب عليك ادخال الوصف', required: true },
//         {
//             type: "select",
//             name: "client_type_id",
//             labelName: "نوع العميل",
//             placeholder: "نوع العميل",
//             required: true,
//             options: clientTypes.map((type) => {
//               return { value: type.id, label: type.name };
//             }),

//           },
//         // { type: 'number', name: 'day_before_expire', placeholder: 'يجب عليك ادخال تاريح الصلاحيه', required: true },

//         // {
//         //     type: 'select',
//         //     name: 'unit_id',
//         //     placeholder: 'اختر  الكميه',
//         //     options: units.map(units => ({ value: units.id, label: units.name }))
//         // },

//         { type: 'image', name: 'image', placeholder: 'يجب عليك ادخال الصوره' },

//     ];

//     return (
//         <div className='form-container'>
//             <h1 className='form-title'>ادخال منتج جديد</h1>
//             <DynamicForm fields={fields} onSubmit={handleSubmit} />
//         </div>
//     );
// };

// export default AddProduct;

import React, { useState, useEffect } from "react";

import TotalAmount from "../../../../../../../components/shared/totalAmount/TotalAmount";

// import "./CashierWarehouseRequests.scss";
import axios from "axios";
import { getSuppliers } from "../../../../../../../apis/suppliers";
import { getAllDepartments } from "../../../../../../../apis/departments";
import { getSubCategoryById } from "../../../../../../../apis/subCategory";

import { API_ENDPOINT } from "../../../../../../../../config";
import { useNavigate, useParams } from "react-router-dom";
import CahierWearhouseDetailes from "../../../../../../../components/shared/CashierWearhouseDetailes/CashierWearhouseDetailes";
import ItemCashierWearhouse from "../../../../../../../components/shared/CashierWearhouseDetailes/ItemCashierWearhouse";
import { message } from "antd";
import { getProductsById } from "../../../../../../../apis/product";
import CashierOrderDetailes from "../../../../../../../components/shared/CashierOrderDetails/CashierOrderDetailes";
import CashierItemList from "../../../../../../../components/shared/CashierItemList/CashierItemList";
import { getDeaprtmentsById } from "../../../../../../../apis/department";
import ProductTodepartmentDetailes from "../../../../../../../components/shared/CashierOrderDetails/ProductTodepartmentDetailes";
import { getClientTypes } from "../../../../../../../apis/clients/ClientType";
import ProductDetailes from "../../../../../../../components/shared/ProductDetails/ProductDetails";
import ProductItemList from "../../../../../../../components/shared/ProductDetails/ProductItemList";
import ClintType from "../../../../cashier/pages/ClintType";

const AddProduct = () => {
  // const [suppliers, setSuppliers] = useState([]);
  const [productType, setProductType] = useState("");
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const [department, setDepartment] = useState([]);

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [Image, setImage] = useState(null);

  const [data, setData] = useState(); // Initialize data as null

  const [parentName, setParentName] = useState("");
  // const [recipeUnit, setRecipeUnit] = useState('')
  const [ProductParentId, setRecipeParentId] = useState("");
  const [ProductCategory_id, setProductCategoryId] = useState("");

  const [categories, setCategories] = useState([]); // Initialize categories state
  const [units, setUnits] = useState([]); // Initialize categories state

  // const [data, setData] = useState('')
  const [category_id, setCategoryId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeData = await getSubCategoryById(id);
        setData(recipeData.data.name);
        setCategoryId(recipeData.data.category.id);
        // console.log(recipeData.data.category.id);

        // console.log(recipeData.data.name);
      } catch (error) {
        // console.log("Error fetching data:", error);
      }
    };

    fetchData(); // Call fetchData when component mounts
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const [clientTypes, setClientTypes] = useState([]);
  useEffect(() => {
    const fetchClientTypes = async () => {
      const res = await getClientTypes({}, "", () => { });
      setClientTypes(res?.data);
      // console.log(res?.data);
    };
    fetchClientTypes();
  }, []);

  const handleAddItem = (item) => {
    setItems([...items, item]);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [price, setPrice] = useState();

  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async () => {
    const errors = {};
    if (!name) {
      errors.name = "يرجى إدخال اسم المنتج";
    }
    if (!description) {
      errors.description = "يرجى إدخال وصف المنتج";
    }
    if (!price) {
      errors.price = "يرجى إدخال السعر";
    }
    if (!Image) {
      errors.image = "يرجى اختيار صورة المنتج";
    }
    if (!category_id) {
      errors.category_id = "يرجى اختيار فئة المنتج";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Reset formErrors if there are no errors
    setFormErrors({});
    const formData = new FormData();
    // formData.append("product_id", id);
    items.forEach((item, index) => {
      formData.append(`prices[${index}][price]`, item.price);
      formData.append(`prices[${index}][client_type_id]`, item.id);

      formData.append(`prices[${index}][client_id]`, item.id);
      formData.append(`prices[${index}][profit]`, item.id);
      formData.append(`prices[${index}][service]`, item.id);
      // formData.append(`recipes[${index}][expire_date]`, item.expireDate);
      // console.log("------------------>" + item.ProductId);
    });

    formData.append("name", name);
    formData.append("description", description);
    formData.append('productType', productType);
    formData.append("image", Image);
    // formData.append('price', price);
    // Only send the first image
    formData.append("category_id", category_id);
    formData.append("price", price);

    formData.append("sub_category_id", id);

    try {
      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/store/products/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      // console.log(response.data);
      await navigate(`/warehouse/departments/show-departments/product/${id}`);
      // // console.log("Invoice created successfully!");
      message.success("تم اضافة المنتج الى القسم بنجاح");
      // Optionally, you can redirect or show a success message here
    } catch (error) {
      console.error("Error creating invoice:", error);
      // Handle error condition, show error message, etc.
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">اضافة منتج</h1>

      <div>
        <label className="form-label">القسم :</label>
        <input
          className="form-input"
          type="textarea"
          value={data}
          disabled={true}
          style={{ cursor: "not-allowed" }}
        />
      </div>

      <div>
        <label className="form-label">اسم المنتج:</label>
        <input
          className="form-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {formErrors.name && (
          <span style={{ color: "red" }}>{formErrors.name}</span>
        )}
      </div>
      <div>
        <label className="form-label">وصف المنتج:</label>
        <input
          className="form-input"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {formErrors.description && (
          <span style={{ color: "red" }}>{formErrors.description}</span>
        )}
      </div>
      <div>
        <label className="form-label">سعر التكلفة :</label>
        <input
          className="form-input"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        {formErrors.price && (
          <span style={{ color: "red" }}>{formErrors.price}</span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label className="form-label">صورة المنتج:</label>
        <input
          className="form-input"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {formErrors.image && (
          <span style={{ color: "red" }}>{formErrors.image}</span>
        )}
        <img src={Image} style={{ width: "50px", height: "50px" }} />
      </div>
      <div className="form-radio-cont justify-content-start">
        <label htmlFor="" className="fw-bold fs-5" style={{ color: "#803D3B" }} >نوع المنتج:</label>
        <label className="form-radio-btn">
          <input
            // checked
            type="radio"
            name="orderType"
            value="kitchen"
            checked={productType === "department"}
            onChange={() => setProductType("department")}
          />
          من المنفذ
        </label>
        <label className="form-radio-btn">
          <input
            type="radio"
            name="orderType"
            value="department"
            checked={productType === "kitchen"}
            onChange={() => setProductType("kitchen")}
          />
          من المطبخ
        </label>
        <label className="form-radio-btn">
          <input
            type="radio"
            name="orderType"
            value="patesierKitchen"
            checked={productType === "patesierKitchen"}
            onChange={() => setProductType("patesierKitchen")}
          />
          مطبخ الحلوانى
        </label>
      </div>
      <div
        className="shadow p-2 my-5 text-light text-center rounded"
        style={{ backgroundColor: "#AF8260" }}
      >
        <h5>اضافه اسعار للمنتج</h5>
      </div>
      <ProductDetailes items={items} onAddItem={handleAddItem} />
      <ProductItemList items={items} onDeleteItem={handleDeleteItem} />
      {/* <TotalAmount total={calculateTotalAmount()} /> */}
      <button className="form-cashier-btn" onClick={handleSubmit}>
        حفظ البيانات
      </button>
    </div>
  );
};

export default AddProduct;

// import React, { useState, useEffect } from "react";
// import { Input, Button, Form, Upload, message } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import { useParams, useNavigate } from "react-router-dom";
// import { getSubCategoryById } from "../../../../../../../apis/subCategory";
// import { getClientTypes } from "../../../../../../../apis/clients/ClientType";
// import axios from "axios";
// import { API_ENDPOINT } from "../../../../../../../../config";
// import "../../../../../../../components/shared/form/Form"

// import ProductDetailes from "../../../../../../../components/shared/ProductDetails/ProductDetails";
// import ProductItemList from "../../../../../../../components/shared/ProductDetails/ProductItemList";

// const AddProduct = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();

//     const [form] = Form.useForm();
//     const [data, setData] = useState(null);
//     const [clientTypes, setClientTypes] = useState([]);
//     const [image, setImage] = useState(null);
//     const [items, setItems] = useState([]);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const recipeData = await getSubCategoryById(id);
//                 setData(recipeData.data.name);
//             } catch (error) {
//                 // console.log("Error fetching data:", error);
//             }
//         };
//         fetchData();
//     }, [id]);

//     useEffect(() => {
//         const fetchClientTypes = async () => {
//             const res = await getClientTypes({}, "", () => {});
//             setClientTypes(res?.data);
//         };
//         fetchClientTypes();
//     }, []);

//     const handleImageChange = (info) => {
//         if (info.file.status === "done") {
//             setImage(info.file.originFileObj);
//         }
//     };

//     const handleSubmit = async () => {
//         try {
//             const values = await form.validateFields();
//             const formData = new FormData();
//             formData.append("name", values.name);
//             formData.append("description", values.description);
//             formData.append("price", values.price);
//             formData.append("image", image);
//             formData.append("category_id", values.category_id);
//             formData.append("sub_category_id", id);

//             const response = await axios.post(`${API_ENDPOINT}/api/v1/store/products/create`, formData, {
//                 headers: {
//                     "Content-Type": "multipart/form-data",
//                     Authorization: `Bearer ${Token}`,
//                 },
//             });
//             // console.log(response.data);
//             navigate(`/warehouse/departments/show-departments/product/${id}`);
//             message.success("تم اضافة المنتج الى القسم بنجاح");
//         } catch (error) {
//             console.error("Error creating product:", error);
//         }
//     };

//     const handleAddItem = (item) => {
//         setItems([...items, item]);
//     };

//     const handleDeleteItem = (index) => {
//         const updatedItems = [...items];
//         updatedItems.splice(index, 1);
//         setItems(updatedItems);
//     };

//     return (
//         <div className="form-container">
//             <h1 className="form-title">اضافة منتج جديد</h1>
//             <Form  layout="vertical" form={form} onFinish={handleSubmit}>
//                 <Form.Item label="القسم" name="parent">
//                     <Input value={data} disabled />
//                 </Form.Item>
//                 <Form.Item
//                     label="اسم المنتج"
//                     name="name"
//                     rules={[{ required: true, message: "يجب عليك ادخال الاسم" }]}
//                     labelCol={{ span: 24 }}
//                     wrapperCol={{ span: 24 }}
//                 >
//                     <Input />
//                 </Form.Item>
//                 <Form.Item
//                     label="وصف المنتج"
//                     name="description"
//                     rules={[{ required: true, message: "يجب عليك ادخال الوصف" }]}
//                 >
//                     <Input />
//                 </Form.Item>
//                 <Form.Item
//                     label="السعر"
//                     name="price"
//                     rules={[{ required: true, message: "يجب عليك ادخال السعر" }]}
//                 >
//                     <Input type="number" />
//                 </Form.Item>
//                 <Form.Item
//                     label="صورة المنتج"
//                     name="image"
//                     rules={[{ required: true, message: "يجب عليك ادخال الصورة" }]}
//                 >
//                     <Upload onChange={handleImageChange}>
//                         <Button icon={<UploadOutlined />}>انتقل للرفع</Button>
//                     </Upload>
//                 </Form.Item>
//                 <ProductDetailes onAddItem={handleAddItem} />
//                 <ProductItemList items={items} onDeleteItem={handleDeleteItem} />
//                 <Button type="primary" htmlType="submit">
//                     حفظ البيانات
//                 </Button>
//             </Form>
//         </div>
//     );
// };

// export default AddProduct;
