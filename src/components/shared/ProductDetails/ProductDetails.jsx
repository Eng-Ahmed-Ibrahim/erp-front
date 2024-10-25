// Import useState and useEffect if not already imported
import React, { useState, useEffect } from "react";
import { API_ENDPOINT } from "../../../../config";
import { getProductById } from "../../../apis/cashier";
import { getClientTypeById } from "../../../apis/clients/ClientType";

const ProductDetailes = ({ onAddItem, onDeleteItem }) => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [uint, setUnit] = useState("");
  const [epireDate, setExpireDate] = useState();
  const [selectedSubject, setSelectedSubject] = useState('');
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
  const [service, setService] = useState(0);
  const [profit, setProfit] = useState(0);
  // const [totalPrice,setTotalPrice]=useState(profit+price)
  const [abouts, setAbouts] = useState([]);
  useEffect(() => {
    fetchProductCategoryParents();
    handleParentChange();
  }, []);

  const fetchOneProduct = async (id) => {
    try {
      const oneProduct = await getClientTypeById(id);
      // console.log(oneProduct);
      setSelectedOneProduct(oneProduct);

      // console.log("=====================>" + oneProduct);
    } catch (error) {
      // console.log("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchOneProduct(selectedProduct);
    handleParentChange();
  }, [selectedProduct]);

  const fetchProductCategoryParents = async () => {
    try {
      const response = await fetch(`${API_ENDPOINT}/api/v1/store/client_type`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      });
      const data = await response.json();
      setProductCategoryParents(data.data);
      // console.log("data from =============>", data);
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
        `${API_ENDPOINT}/api/v1/store/products/subcategory/${parentId}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const data = await response.json();
      setProductCategories(data.data);
      // console.log("data", data);
    } catch (error) {
      console.error("Error fetching Product categories:", error);
    }
  };
  /////////////////////////////////////////////////
  const handleDestinationChange = (e) => {
    const destinationId = e.target.value;
    setSelectedDestination(destinationId);

    axios
      // .get(`subjects/${destinationId}`, {
      .get(`${API_ENDPOINT}/api/v1/orders/clients/${destinationId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        setClientTypes(res?.data);
        setSelectedSubject('');
        setAbouts([]);
      })
      .catch((err) => {
        // console.log(err);
      });
  };
  ////////////////////////////////////////////////////
  useEffect(() => {
    setFields([
      {
        label: "انوع العملاء ",
        type: "select",
        placeholder: "اختر انوع العملاء ",
        options:
          ProductCategoryParents?.map((parent) => ({
            value: parent.id,
            label: parent.name,
          })) || [],
        required: true,
        onChange: (value) => setSelectedProduct(value),
      },
      {
        label: "اسماء العملاء",
        type: "select",
        placeholder: "اختر اسم العميل   ",
        options:
          ProductCategories?.map((category) => ({
            value: category.id,
            label: category.name,
          })) || [],
        required: true,
        onChange: (value) => setSelectedProduct(value),
      },
      // {
      //   label: "المنتجات",
      //   type: "select",
      //   placeholder: "اختر  منتج ",
      //   options:
      //     ProductCategories?.map((category) => ({
      //       value: category.id,
      //       label: category.name,
      //     })) || [],
      //   required: true,
      //   onChange: (value) => setSelectedProduct(value),
      // },
    ]);
  }, [ProductCategoryParents, ProductCategories]);
  const onSubmit = (formData) => {
    // Handle form submission here
    // console.log("Form data:", formData);
  };

  const handleAddItem = () => {
    // console.log(productType);
    if (!selectedProduct.trim()) {
      setErrorMessage(`الرجاء اختيار `);
      return;
    }
    // Logging for troubleshooting
    // // console.log('Products:', Products);
    // console.log("selectedProduct:", selectedProduct);

    // Find the selected Product object from the Products array
    const selectedProductObj = ProductCategoryParents.find(
      (Product) => String(Product.id) === selectedProduct
    );

    // Logging for troubleshooting
    // console.log("selectedProductObj:", selectedProductObj);

    // If the selected Product is found, extract its name
    const ProductName = selectedProductObj ? selectedProductObj.name : "";
    const ClientTypeId = selectedProductObj ? selectedProductObj.id : "";
    // const ProductImage = selectedProductObj ? selectedProductObj.image : "";
    const ProductPrice = selectedProductObj ? selectedProductObj.price : "";

    // Logging for troubleshooting
    // console.log("ProductName:", ProductName);

    // Additional validation or processing logic

    const newItem = {
      name: ProductName,
      id: ClientTypeId,
      price: parseFloat(totalPrice),
    };

    onAddItem(newItem);
    setItem("");
    setQuantity(1);
    setPrice(0);
    setErrorMessage("");
  };

  const totalPrice = parseFloat(price) + parseFloat(profit);

  return (
    <div className="form-cashier-product-category-parent">
      <div className="form-cashier-product-category">
        {fields.map((field, index) => (
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
              {field.options.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* <div>
          <label className="form-label">سعر التكلفة:</label>
          <input
          style={{width:'50px'}}
            className="form-input"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onWheel={(event) => event.currentTarget.blur()}
          />
        </div> */}

        <div>
          <label className="form-label">الربح :</label>
          <input
            style={{ width: "70px" }}
            className="form-input"
            type="number"
            value={profit}
            onChange={(e) => setProfit(e.target.value)}
            onWheel={(event) => event.currentTarget.blur()}
          />
        </div>
        <div>
          <label className="form-label"> اجمالى السعر:</label>
          {/* <div>{parseInt(price)+parseInt(profit)}</div> */}
          <input
            style={{ width: "70px" }}
            className="form-input"
            type="number"
            value={totalPrice}
            disabled
          />
        </div>
        <div>
          <label className="form-label">الخدمة:</label>
          <input
            style={{ width: "50px" }}
            className="form-input"
            type="number"
            value={service}
            onChange={(e) => setService(e.target.value)}
          // onWheel={(event) => event.currentTarget.blur()}
          />
        </div>
      </div>

      <button className="form-cashier-btn" onClick={handleAddItem}>
        اضافة سعر حسب نسبة الخصم
      </button>
      <p style={{ color: "red" }}>{errorMessage}</p>
    </div>
  );
};

export default ProductDetailes;






