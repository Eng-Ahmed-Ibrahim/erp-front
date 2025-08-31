import React, { useState, useEffect } from "react";
import { API_ENDPOINT } from "../../../../config";
import { getRecipesById } from "../../../apis/invoices";
import { useAuth } from '../../../context/AuthContext';
import './AddRecipeToInvoice.scss';

const AddRecipeToInvoice = ({ onAddRecipe, onClose, invoiceType }) => {
  const Token =
    localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log('Token retrieved:', Token ? 'Yes' : 'No');

  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [recipeCategoryParents, setRecipeCategoryParents] = useState([]);
  const [recipeCategories, setRecipeCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [expirationOptions, setExpirationOptions] = useState([]);
  const { user } = useAuth();


  useEffect(() => {
    fetchRecipeCategoryParents();
  }, []);

  // Prevent modal from closing when clicking inside
  const handleModalClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent any clicks inside the modal from bubbling up
  const handleContentClick = (e) => {
    e.stopPropagation();
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
      console.error('Error fetching recipe category parents:', error);
    }
  };

  const handleParentChange = async (parentId) => {
    setSelectedParent(parentId);
    setSelectedCategory('');
    setSelectedRecipe('');
    setRecipes([]);
    setRecipeCategories([]);

    if (parentId) {
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
        console.error('Error fetching recipe categories:', error);
      }
    }
  };

  const handleCategoryChange = async (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedRecipe('');
    setRecipes([]);

    if (categoryId) {
      try {
        const response = await fetch(
          `${API_ENDPOINT}/api/v1/store/recipe/allById/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        );
        const data = await response.json();
        setRecipes(data.data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    }
  };

  const fetchOneRecipe = async (id) => {
    try {
      const oneRecipe = await getRecipesById(id, user.department.id);
      if (oneRecipe) {
        setUnit(oneRecipe.unit?.name || '');
        if (invoiceType === 'in_coming') {
          setPrice(oneRecipe.price || 0);
        }
      }
      return oneRecipe;
    } catch (error) {
      console.error('Error fetching recipe:', error);
      return null;
    }
  };

  const handleRecipeChange = async (recipeId) => {
    console.log('Recipe changed to:', recipeId);
    setSelectedRecipe(recipeId);
    if (recipeId) {
      try {
        const oneRecipe = await getRecipesById(recipeId, user.department.id);
        if (oneRecipe) {
          setUnit(oneRecipe.unit?.name || '');
          if (invoiceType === 'in_coming') {
            setPrice(oneRecipe.price || 0);
          }

          // Set expiration options if available
          if (
            oneRecipe.quantitesDetails &&
            oneRecipe.quantitesDetails.length > 0
          ) {
            const expirationOptions = oneRecipe.quantitesDetails.map(
              (detail) => ({
                value: detail.expire_date,
                label: `السعر: ${detail.price} -- التاريخ: ${detail.expire_date}`,
              })
            );
            setExpirationOptions(expirationOptions);
          } else {
            // If no expiration details, create a simple date input option
            setExpirationOptions([]);
          }
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
      }
    }
  };

  const handleAddRecipe = async () => {
    // Clear previous error messages
    setErrorMessage('');

    // Validation
    if (!selectedParent) {
      setErrorMessage('الرجاء اختيار قسم من المخزن');
      return;
    }

    if (!selectedCategory) {
      setErrorMessage('الرجاء اختيار التصنيف الرئيسي');
      return;
    }

    if (!selectedRecipe) {
      setErrorMessage('الرجاء اختيار المكون');
      return;
    }

    if (!quantity || quantity <= 0) {
      setErrorMessage('الرجاء إدخال كمية صحيحة');
      return;
    }

    if (invoiceType === 'in_coming' && (!price || price <= 0)) {
      setErrorMessage('الرجاء إدخال سعر صحيح');
      return;
    }

    if (!expireDate) {
      setErrorMessage('الرجاء اختيار تاريخ انتهاء الصلاحية');
      return;
    }

    // For in_coming invoices, validate that the selected date is not in the past
    if (invoiceType === 'in_coming') {
      const currentDate = new Date();
      const selectedDate = new Date(expireDate);
      if (selectedDate < currentDate) {
        setErrorMessage('تاريخ انتهاء الصلاحية يجب أن يكون من اليوم فصاعداً');
        return;
      }
    }

    const selectedRecipeObj = recipes.find(
      (recipe) => recipe.id === selectedRecipe
    );
    if (!selectedRecipeObj) {
      setErrorMessage('لم يتم العثور على المكون المختار');
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
        unit: unit,
      };

      await onAddRecipe(newRecipe);
      handleClose();
    } catch (error) {
      setErrorMessage('حدث خطأ أثناء إضافة المكون');
      console.error('Error adding recipe:', error);
    }
  };

  const handleClose = () => {
    // Reset form before closing
    setSelectedParent('');
    setSelectedCategory('');
    setSelectedRecipe('');
    setQuantity(1);
    setPrice(0);
    setUnit('');
    setExpireDate('');
    setErrorMessage('');
    setExpirationOptions([]);
    onClose();
  };

  // Additional debugging for component lifecycle
  useEffect(() => {
    console.log('Component mounted with props:', {
      onAddRecipe,
      onClose,
      invoiceType,
    });
  }, [onAddRecipe, onClose, invoiceType]);

  return (
    <div className="add-recipe-modal" onClick={handleBackdropClick}>
      <div
        className="modal-content"
        onClick={handleContentClick}
        style={{ width: '600px', maxWidth: '90vw' }}
      >
        <div className="modal-header">
          <h3>إضافة مكون جديد</h3>
          <button className="close-btn" onClick={handleClose} type="button">
            ×
          </button>
        </div>

        <div className="form-fields">
          <div className="form-field">
            <label>أقسام المخزن</label>
            <select
              className="form-input"
              value={selectedParent}
              onChange={(e) => handleParentChange(e.target.value)}
              style={{ height: '45px' }}
            >
              <option value="">اختر قسم من المخزن</option>
              {recipeCategoryParents &&
              Array.isArray(recipeCategoryParents) &&
              recipeCategoryParents.length > 0 ? (
                recipeCategoryParents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name || 'Unnamed'}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  لا توجد أقسام متاحة
                </option>
              )}
            </select>
          </div>

          <div className="form-field">
            <label>التصنيف الرئيسي</label>
            <select
              className="form-input"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={{ height: '45px' }}
              disabled={!selectedParent}
            >
              <option value="">اختر تصنيف رئيسي</option>
              {recipeCategories &&
              Array.isArray(recipeCategories) &&
              recipeCategories.length > 0 ? (
                recipeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name || 'Unnamed'}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {!selectedParent
                    ? 'يرجى اختيار قسم أولاً'
                    : 'لا توجد تصنيفات متاحة'}
                </option>
              )}
            </select>
          </div>

          <div className="form-field">
            <label>التصنيف الفرعي</label>
            <select
              className="form-input"
              value={selectedRecipe}
              onChange={(e) => handleRecipeChange(e.target.value)}
              style={{ height: '45px' }}
              disabled={!selectedCategory}
            >
              <option value="">اختر تصنيف فرعي</option>
              {recipes && Array.isArray(recipes) && recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name || 'Unnamed'}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {!selectedCategory
                    ? 'يرجى اختيار التصنيف الرئيسي أولاً'
                    : 'لا توجد مكونات متاحة'}
                </option>
              )}
            </select>
          </div>

          <div className="form-field">
            <label>تاريخ انتهاء الصلاحية</label>
            {expirationOptions && expirationOptions.length > 0 ? (
              <select
                className="form-input"
                value={expireDate}
                onChange={(e) => setExpireDate(e.target.value)}
                style={{ height: '45px' }}
                disabled={!selectedRecipe}
              >
                <option value="">اختر تاريخ انتهاء الصلاحية</option>
                {expirationOptions.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="date"
                className="form-input"
                value={expireDate}
                onChange={(e) => setExpireDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                placeholder="اختر التاريخ"
                required
                disabled={!selectedRecipe}
              />
            )}
          </div>

          <div className="form-field">
            <label>
              الكمية <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              className="form-input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0.01"
              step="0.01"
              placeholder="أدخل الكمية"
              required
            />
          </div>

          {invoiceType === 'in_coming' && (
            <div className="form-field">
              <label>
                السعر <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0.01"
                step="0.01"
                placeholder="أدخل السعر"
                required
              />
            </div>
          )}

          {unit && (
            <div className="form-field">
              <label>الوحدة</label>
              <input
                type="text"
                className="form-input disabled-input"
                value={unit}
                disabled
              />
            </div>
          )}
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

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
