import React, { useState, useEffect } from "react";
import { API_ENDPOINT } from "../../../../config";
import { getRecipesById } from "../../../apis/invoices";
import { useAuth } from "../../../context/AuthContext";
import { Select } from "antd";
import "./AddRecipeToInvoice.scss";

const AddRecipeToInvoice = ({ onAddRecipe, onClose, invoiceType }) => {
  const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [recipeCategoryParents, setRecipeCategoryParents] = useState([]);
  const [recipeCategories, setRecipeCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchRecipeCategoryParents();
  }, []);

  // Prevent modal from closing when clicking inside
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
    } catch (error) {
      console.error("Error fetching recipe category parents:", error);
    }
  };

  const handleParentChange = async (parentId) => {
    setSelectedParent(parentId);
    setSelectedCategory("");
    setSelectedRecipe("");
    setRecipes([]);

    if (parentId) {
      try {
        const response = await fetch(
          `${API_ENDPOINT}/api/v1/store/recipe_category/${parentId}`,
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
    }
  };

  const handleCategoryChange = async (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedRecipe("");

    if (categoryId) {
      try {
        const response = await fetch(
          `${API_ENDPOINT}/api/v1/store/recipe/category/${categoryId}`,
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
    }
  };

  const fetchOneRecipe = async (id) => {
    try {
      const oneRecipe = await getRecipesById(id, user.department.id);
      if (oneRecipe) {
        setUnit(oneRecipe.unit?.name || "");
        if (invoiceType === "in_coming") {
          setPrice(oneRecipe.price || 0);
        }
      }
      return oneRecipe;
    } catch (error) {
      console.error("Error fetching recipe:", error);
      return null;
    }
  };

  const handleRecipeChange = async (recipeId) => {
    setSelectedRecipe(recipeId);
    if (recipeId) {
      await fetchOneRecipe(recipeId);
    }
  };

  const handleAddRecipe = async () => {
    // Clear previous error messages
    setErrorMessage("");

    // Validation
    if (!selectedParent) {
      setErrorMessage("الرجاء اختيار قسم من المخزن");
      return;
    }

    if (!selectedCategory) {
      setErrorMessage("الرجاء اختيار التصنيف الرئيسي");
      return;
    }

    if (!selectedRecipe) {
      setErrorMessage("الرجاء اختيار المكون");
      return;
    }

    if (!quantity || quantity <= 0) {
      setErrorMessage("الرجاء إدخال كمية صحيحة");
      return;
    }

    if (invoiceType === "in_coming" && (!price || price <= 0)) {
      setErrorMessage("الرجاء إدخال سعر صحيح");
      return;
    }

    if (!expireDate) {
      setErrorMessage("الرجاء اختيار تاريخ انتهاء الصلاحية");
      return;
    }

    const currentDate = new Date();
    const selectedDate = new Date(expireDate);
    if (selectedDate < currentDate) {
      setErrorMessage("تاريخ انتهاء الصلاحية يجب أن يكون من اليوم فصاعداً");
      return;
    }

    const selectedRecipeObj = recipes.find(recipe => recipe.id === selectedRecipe);
    if (!selectedRecipeObj) {
      setErrorMessage("لم يتم العثور على المكون المختار");
      return;
    }

    try {
      const newRecipe = {
        recipe_id: selectedRecipe,
        name: selectedRecipeObj.name,
        image: selectedRecipeObj.image,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        expire_date: expireDate,
        unit: unit
      };

      onAddRecipe(newRecipe);
      handleClose();
    } catch (error) {
      setErrorMessage("حدث خطأ أثناء إضافة المكون");
      console.error("Error adding recipe:", error);
    }
  };

  const handleClose = () => {
    // Reset form before closing
    setSelectedParent("");
    setSelectedCategory("");
    setSelectedRecipe("");
    setQuantity(1);
    setPrice(0);
    setUnit("");
    setExpireDate("");
    setErrorMessage("");
    onClose();
  };

  const fields = [
    {
      label: "أقسام المخزن",
      type: "select",
      placeholder: "اختر قسم من المخزن",
      options: recipeCategoryParents?.map((parent) => ({
        value: parent.id,
        label: parent.name,
      })),
      required: true,
      onChange: handleParentChange,
    },
    {
      label: "التصنيف الرئيسي",
      type: "select",
      placeholder: "اختر تصنيف رئيسي",
      options: recipeCategories?.map((category) => ({
        value: category.id,
        label: category.name,
      })),
      required: true,
      onChange: handleCategoryChange,
    },
    {
      label: "التصنيف الفرعي",
      type: "select",
      placeholder: "اختر تصنيف فرعي",
      options: recipes?.map((recipe) => ({
        value: recipe.id,
        label: recipe.name,
      })),
      required: true,
      onChange: handleRecipeChange,
    },
  ];

  return (
    <div className="add-recipe-modal" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={handleModalClick}>
        <div className="modal-header">
          <h3>إضافة مكون جديد</h3>
          <button className="close-btn" onClick={handleClose} type="button">
            ×
          </button>
        </div>
        
        <div className="form-fields">
          {fields.map((field, index) => (
            <div key={index} className="form-field">
              <label>{field.label}</label>
              <Select
                placeholder={field.placeholder}
                onChange={field.onChange}
                options={field.options}
                style={{ width: "100%" }}
                value={index === 0 ? selectedParent : 
                       index === 1 ? selectedCategory : 
                       index === 2 ? selectedRecipe : undefined}
                disabled={index === 1 && !selectedParent ||
                         index === 2 && !selectedCategory}
                status={index === 1 && !selectedParent ||
                        index === 2 && !selectedCategory ? "warning" : undefined}
                notFoundContent={
                  index === 1 && !selectedParent ? "يرجى اختيار قسم أولاً" :
                  index === 2 && !selectedCategory ? "يرجى اختيار التصنيف الرئيسي أولاً" :
                  "لا توجد نتائج"
                }
              />
            </div>
          ))}

          <div className="form-field">
            <label>الكمية <span style={{color: 'red'}}>*</span></label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0.01"
              step="0.01"
              placeholder="أدخل الكمية"
              required
            />
          </div>

          {invoiceType === "in_coming" && (
            <div className="form-field">
              <label>السعر <span style={{color: 'red'}}>*</span></label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0.01"
                step="0.01"
                placeholder="أدخل السعر"
                required
              />
            </div>
          )}

          <div className="form-field">
            <label>تاريخ انتهاء الصلاحية <span style={{color: 'red'}}>*</span></label>
            <input
              type="date"
              value={expireDate}
              onChange={(e) => setExpireDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {unit && (
            <div className="form-field">
              <label>الوحدة</label>
              <input
                type="text"
                value={unit}
                disabled
                className="disabled-input"
              />
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={handleClose} type="button">
            إلغاء
          </button>
          <button className="btn-add" onClick={handleAddRecipe} type="button">
            إضافة
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRecipeToInvoice;
