// Import useState and useEffect if not already imported
import React, { useState, useEffect } from "react";
import { API_ENDPOINT } from "../../../../config";
import { getProductById } from "../../../apis/cashier";
import axios from "axios";

const CashierOrderDetailes = ({ onAddItem, onDeleteItem, clientTypePrice }) => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [uint, setUnit] = useState("");
  const [epireDate, setExpireDate] = useState();

  const [errorMessage, setErrorMessage] = useState("");
  const [ProductCategoryParents, setProductCategoryParents] = useState([]);
  const [ProductCategories, setProductCategories] = useState([]);
  const [Products, setProducts] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedOneProduct, setSelectedOneProduct] = useState("");
  const [productType, setProductType] = useState("");
  const [data2, setData2] = useState([]);

  useEffect(() => {
    fetchProductCategoryParents();
  }, []);

  const fetchOneProduct = async (id) => {
    try {
      const oneProduct = await getProductById(id);
      setSelectedOneProduct(oneProduct);
    } catch (error) {}
  };

  useEffect(() => {
    fetchOneProduct(selectedProduct);
  }, [selectedProduct]);

  const fetchProductCategoryParents = async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/product/subcategories/department`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const data = await response.json();
      setProductCategoryParents(data.data);
    } catch (error) {
      console.error("Error fetching Product category parents:", error);
    }
  };

  const handleParentChange = async (parentId) => {
    setSelectedParent(parentId);
    try {
      const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/product/subcategory/${parentId}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const data = await response.json();
      setProductCategories(data.data);
    } catch (error) {
      console.error("Error fetching Product categories:", error);
    }
  };
  useEffect(() => {
    setFields([
      {
        label: "اقسام ",
        type: "select",
        placeholder: "اختر منتج من الاقسام",
        options:
          ProductCategoryParents?.map((parent) => ({
            value: parent.id,
            label: parent.name,
          })) || [],
        required: true,
        onChange: handleParentChange,
      },
      {
        label: "المنتجات",
        type: "select",
        placeholder: "اختر  منتج ",
        options:
          ProductCategories?.map((category) => ({
            value: category.id,
            label: category.name,
          })) || [],
        required: true,
        onChange: (value) => {
          setSelectedProduct(value);
          setProductType(value.type);
        },
      },
    ]);
  }, [ProductCategoryParents, ProductCategories]);
  const onSubmit = (formData) => {
    // Handle form submission here
  };

  const handleAddItem = () => {
    if (!selectedProduct.trim()) {
      setErrorMessage(`الرجاء اختيار منتج`);
      return;
    }
    // Logging for troubleshooting

    // Find the selected Product object from the Products array
    const selectedProductObj = ProductCategories.find(
      (Product) => String(Product.id) === selectedProduct
    );
    // Logging for troubleshooting

    // If the selected Product is found, extract its name
    const ProductName = selectedProductObj ? selectedProductObj.name : "";
    const ProductImage = selectedProductObj ? selectedProductObj.image : "";
    const ProductPrice = selectedProductObj ? selectedProductObj.price : "";
    // const matchedDetail = selectedProductObj?.prices.find(detail => detail.client_type_id === clientTypePrice)
    // const matchedDetail = selectedProductObj.prices.find(detail => detail.client_type_id === clientTypePrice)

    const newItem = {
      name: ProductName,
      image: ProductImage,
      ProductId: selectedProduct,
      quantity: parseFloat(quantity),
      price: parseFloat(ProductPrice),
      expireDate: epireDate,
      productType: productType,
    };

    onAddItem(newItem);
    setItem("");
    setQuantity(1);
    setPrice(0);
    setErrorMessage("");
  };
  // useEffect(() => {
  //   axios.get(`${API_ENDPOINT}/api/v1/product/subcategory`, {
  //     headers: {
  //       Authorization: `Bearer ${Token}`,
  //     },
  //   }).then(res => {
  //     setData2(res.data)
  //   })
  // }, [])
  return (
    <div className="form-cashier-product-category-parent">
      <div className="form-cashier-product-category">
        {fields?.map((field, index) =>
          index == 0 ? (
            <div key={index} className="form-cashier-select-wrraper">
              <label className="form-cashier-label">{field.label}</label>
              <select
                className="form-cashier-select"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                required={field.required}
              >
                <option value="" disabled selected>
                  {field.placeholder}
                </option>
                {field?.options?.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null
        )}
      </div>
      <div
        className="d-flex flex-wrap shadow-lg p-3 my-5 bg-light rounded"
        style={{
          overflowY: "auto",
          border: "3px solid #af8260",
        }}
      >
        {ProductCategories?.length == 0 ? (
          <h1 className="m-auto text-danger">لا يوجد منتجات </h1>
        ) : (
          <>
            {ProductCategories?.map((item, index) => (
              <button
                onClick={() => {
                  setSelectedProduct(item.id), setProductType(item.type);
                }}
                // value={active}
                // onChange={() => setActive(!active)}
                class={`form-check  pe-3 py-3 m-3 shadow rounded shift-hover ${
                  selectedProduct === item.id ? "shifts" : ""
                } 
          `}
                key={index}
                style={{ border: "2px solid #803d3b" }}
              >
                <label
                  className="form-check-label border-success border-3 "
                  htmlFor="defaultCheck1"
                >
                  {item?.name}
                </label>
              </button>
            ))}
          </>
        )}
      </div>
      <div>
        <label className="form-label">الكمية:</label>
        <input
          className="form-input"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          onWheel={(event) => event.currentTarget.blur()}
          required
        />
      </div>
      <div className="form-radio-cont">
        {/* <label htmlFor="">نوع المنتج:</label>
        <label className="form-radio-btn">
          <input
            required
            defaultChecked
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
            required
            type="radio"
            name="orderType"
            value="department"
            checked={productType === "kitchen"}
            onChange={() => setProductType("kitchen")}
          />
          من المطبخ
        </label> */}
        {/* <label className="form-radio-btn">
          <input
            type="radio"
            name="orderType"
            value="patesierKitchen"
            checked={productType === "patesierKitchen"}
            onChange={() => setProductType("patesierKitchen")}
          />
          مطبخ الحلوانى
        </label> */}
      </div>
      <button className="form-cashier-btn" onClick={handleAddItem}>
        اضافة عنصر
      </button>

      <p style={{ color: "red" }}>{errorMessage}</p>
    </div>
  );
};

export default CashierOrderDetailes;
