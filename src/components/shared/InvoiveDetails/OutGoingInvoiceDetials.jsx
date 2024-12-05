// Import useState and useEffect if not already imported
import React, { useState, useEffect } from "react";
import { API_ENDPOINT } from "../../../../config";
import { getRecipesById } from "../../../apis/invoices";
import { useAuth } from "../../../context/AuthContext";
import { Select } from "antd";
import { current } from "@reduxjs/toolkit";

const OutGoingDetails = ({ onAddItem, onDeleteItem, InvoiceType }) => {
  const Token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [uint, setUnit] = useState("");
  const [epireDate, setExpireDate] = useState();

  const [errorMessage, setErrorMessage] = useState("");
  const [recipeCategoryParents, setRecipeCategoryParents] = useState([]);
  const [recipeCategories, setRecipeCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  // const [fields, setFields] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [selectedOneRecipe, setSelectedOneRecipe] = useState("");
  const [newQuantity, setNewQuantity] = useState()
  const [newPrice, setNewPrice] = useState()
  const { user } = useAuth()

  useEffect(() => {
    fetchRecipeCategoryParents();
  }, []);

  const fetchOneRecipe = async (id, departmentId) => {
    try {
      const oneRecipe = await getRecipesById(id, departmentId);
      setSelectedOneRecipe(oneRecipe);
      if (InvoiceType === "out_going") {
        setQuantity(oneRecipe.total_quantity);
        setPrice(oneRecipe.price);
        setUnit(oneRecipe.unit.name);
        setNewPrice(oneRecipe.quantitesDetails[0].price)
      }
      if (InvoiceType === "in_coming") {
        setUnit(oneRecipe.unit.name);
      }
      if (InvoiceType === "returned") {
        setQuantity(oneRecipe.total_quantity);
        setPrice(0);
        setUnit(oneRecipe.unit.name);
      }
      if (InvoiceType === "tainted") {
        setQuantity(oneRecipe.total_quantity);
        setPrice(0);
        setUnit(oneRecipe.unit.name);
      }

      //  
    } catch (error) {
      //  
    }
  };
  

  useEffect(() => {
    fetchOneRecipe(selectedRecipe, user.department.id);
  }, [selectedRecipe, quantity]);

  const fetchRecipeCategoryParents = async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/store/recipe_category_parent`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const data = await response.json();
      setRecipeCategoryParents(data.data);
      //  
    } catch (error) {
      console.error("Error fetching recipe category parents:", error);
    }
  };

  const handleParentChange = async (parentId) => {
    setSelectedParent(parentId);
    try {
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/store/recipe_category?category_id=${parentId}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const data = await response.json();
      setRecipeCategories(data.data);
    } catch (error) {
      console.error("Error fetching recipe categories:", error);
    }
  };

  const handleCategoryChange = async (categoryId) => {
    setSelectedCategory(categoryId);
    try {
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/store/recipe/allById/${categoryId}`,
        // `${API_ENDPOINT}/api/v1/store/recipe?recipe_category_id=${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const data = await response.json();
      setRecipes(data.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const fileds = [
    {
      label: "اقسام المخزن",
      type: "select",
      placeholder: "اختر منتج من المخزن",
      options:
        recipeCategoryParents?.map((parent) => ({
          value: parent.id,
          label: parent.name,
        })),
      required: true,
      onChange: handleParentChange,
    },
    {
      label: "التصنيف الرئيسى",
      type: "select",
      placeholder: "اختر تصنيف رئيسى ",
      options:
        recipeCategories?.map((category) => ({
          value: category.id,
          label: category.name,
        })),
      required: true,
      onChange: handleCategoryChange,
    },
    {
      label: "التصنيف الفرعى",
      type: "select",
      placeholder: "اختر تصنيف فرعى",
      options:
        recipes?.map((recipe) => ({
          value: recipe.id,
          label: recipe.name,
        })),
      required: true,
      onChange: (value) => setSelectedRecipe(value), // Update selectedRecipe state with selected recipe value
    },
  ]


  const onSubmit = (formData) => {
    // Handle form submission here
    //  
  };

  const handleAddItem = () => {
    if (!selectedRecipe.trim()) {
      setErrorMessage(`Please select a recipe.`);
      return;
    }


    // Logging for troubleshooting
    //  
    //  



    // Find the selected recipe object from the recipes array
    const selectedRecipeObj = recipes.find(
      (recipe) => String(recipe.id) === selectedRecipe

    );

    // Logging for troubleshooting
    //  

    // If the selected recipe is found, extract its name
    const recipeName = selectedRecipeObj ? selectedRecipeObj.name : "";
    const recipeImage = selectedRecipeObj ? selectedRecipeObj.image : "";

    // Logging for troubleshooting
    //  
    //  
    //  

    // const isItemsExist = recipes.some(
    //   (item)=> item.recipeId ===selectedRecipe && item.quantity === parseInt(newQuantity )
    // )

    // if(isItemsExist ){
    //   setErrorMessage(`  لا يمكن اضافة العنصر مرتين`);
    //   return
    // }

    const cuurentDate = new Date()
    const selectedDate = new Date(epireDate)

    if (selectedDate < cuurentDate) {
      setErrorMessage(`  التاريخ يجب ان يكون بداية من النهاردة`);
      return
    }

    // Additional validation or processing logic
    const newItem = {
      name: recipeName,
      image: recipeImage,
      recipeId: selectedRecipe, // Accessing selectedRecipe directly
      quantity: parseFloat(newQuantity),
      price: InvoiceType === "in_coming" ? parseFloat(price) : parseFloat(newPrice),
      expireDate: epireDate,
    };
    if (InvoiceType === "in_coming") {
      // if( selectedRecipe !=newItem.recipeId ){

      // }

      onAddItem(newItem);
      setItem("");
      setNewQuantity(1);
      setNewPrice(0)
      setPrice(0);

      setErrorMessage("");

    }

    if (InvoiceType === "out_going") {
      if (parseFloat(newQuantity) <= quantity) {
        onAddItem(newItem);
        setItem("");
        setNewQuantity(1);
        setNewPrice(0)
        setPrice(0);

        setErrorMessage("");

      }
      else {
        setErrorMessage(`  الكميه غير متاحه من :${selectedRecipeObj.name}`);
      }


    }



  };
  const [selectedType,setSelectedType]=useState()

  return (
    <div>
     
        <label className="form-label">هل تريد ارسال فاتورة كامله ام مكونات منفصله:</label>
        <select className="form-input" onChange={(e)=>setSelectedType(e.target.value)}>
          <option value="">اختر النوع المناسب</option>
          <option value="MoveInoice">نقل مكونات فاتورة كامله</option>
          <option value="InvoiceRecipe">نقل كل مكون على حده</option>
        </select>
       
      {selectedType ==="InvoiceRecipe" ? <>
        {fileds.map((field, index) => (
        <div key={index}>
          <label className="form-label">{field.label}</label>
          <Select
            className="form-select"
            showSearch
            value={field.value}
            onChange={(value) => field.onChange(value)}
            required={field.required}
            filterOption={(input, option) => {
              //  
              return (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase());
            }}
            optionFilterProp="children"
            disabled={field.options.length === 0}

          >
            {/* <Option value=""  >{field.placeholder}</Option> */}
            {field.options.map((option, index) => (
              <Option key={index} value={option.value} >
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      ))}

      {InvoiceType === "in_coming" || InvoiceType === "returned" || InvoiceType === "tainted" ? null : <label className="form-label">{` الكميه المتاحه فى المخزن هى ${quantity}  ${uint}`}</label>}
      <label className="form-label">الكميه:</label>
      <input
        className="form-input"
        type="number"
        value={newQuantity}
        onChange={(e) => setNewQuantity(e.target.value)}
        onWheel={(event) => event.currentTarget.blur()}
      />
      {InvoiceType === "in_coming" ? <>
        <label className="form-label">السعر:</label>
        <input
          className="form-input"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onWheel={(event) => event.currentTarget.blur()}
        />
      </> : null}

      {/* {InvoiceType === "returned" ? <>
        <label className="form-label">السعر:</label>
        <input
          className="form-input"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onWheel={(event) => event.currentTarget.blur()}
        />
      </> : null} */}


      <label className="form-label">الوحده:</label>
      <input className="form-input" type="text" value={uint} disabled={true} style={{ cursor: "not-allowed" }} />
      {InvoiceType === "in_coming" || InvoiceType === "returned" || InvoiceType === "tainted" ? <> <label className="form-label"> تاريخ  انتهاء الصلاحيه:</label>
        <input
          className="form-input"
          type="date"
          value={epireDate}
          onChange={(e) => setExpireDate(e.target.value)}
        /></> : null}

      <button className="form-btn" onClick={handleAddItem}>
        اضافة عنصر
      </button>
      <p style={{ color: "red" }}>{errorMessage}</p>
      </> : <></>}

    
    </div>
  );
};

export default OutGoingDetails;
