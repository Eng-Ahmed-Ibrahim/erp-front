import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { API_ENDPOINT } from '../../../../config';
import { getRecipesById } from '../../../apis/invoices';
import { useAuth } from '../../../context/AuthContext';
import { Select } from 'antd';
const { Option } = Select;

const TaintedInvoiceDetailes = ({
  onAddItem,
  onDeleteItem,
  InvoiceType,
  departmentId,
  addedItems = [],
}) => {
  const Token =
    localStorage.getItem('token') || sessionStorage.getItem('token');

  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [unit, setUnit] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [invoiceId, setInvoiceId] = useState('');

  const [expirationOptions, setExpirationOptions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [recipeCategoryParents, setRecipeCategoryParents] = useState([]);
  const [recipeCategories, setRecipeCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [newQuantity, setNewQuantity] = useState();
  const [newPrice, setNewPrice] = useState();
  const [department, setDepartment] = useState([]);
  const [recipeInvoiceQuantities, setRecipeInvoiceQuantities] = useState({});
  const [recipeTotalQuantities, setRecipeTotalQuantities] = useState({});
  const [lastFetchedRecipe, setLastFetchedRecipe] = useState('');

  useEffect(() => {
    fetchRecipeCategoryParents();
  }, []);

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
    } catch (error) {}
  };
  const handleParentChange = useCallback(
    async (parentId) => {
      setSelectedParent(parentId);
      try {
        const response = await fetch(
          `${API_ENDPOINT}/api/v1/store/recipe_category/allById/${parentId}`,
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        );
        const data = await response.json();
        setRecipeCategories(data.data);
      } catch (error) {}
    },
    [Token]
  );

  const handleCategoryChange = useCallback(
    async (categoryId) => {
      setSelectedCategory(categoryId);
      setSelectedRecipe('');
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
      } catch (error) {}
    },
    [Token]
  );
  const { user } = useAuth();

  const fetchOneRecipe = async (id) => {
    try {
      const oneRecipe = await getRecipesById(id, departmentId);
      setSelectedRecipe(oneRecipe.id);
      setQuantity(oneRecipe.total_quantity);
      setUnit(oneRecipe.unit.name);
      const expirationOptions = oneRecipe.quantitesDetails.map((detail) => ({
        value: `${detail.invoice_id}-${detail.expire_date}`, // Create a unique value
        label: `${
          '  السعر:   ' +
          `${detail.price}` +
          '   --   ' +
          '  التاريخ:    ' +
          `${detail.expire_date}` +
          '   --   ' +
          '  الكميه:    ' +
          `${detail.quantity}`
        }`,
      }));
      setExpirationOptions(expirationOptions);
      return oneRecipe;
    } catch (error) {
      return null;
    }
  };

  // Create a stable key for addedItems to prevent unnecessary re-renders
  const addedItemsKey = useMemo(() => {
    if (!addedItems || addedItems.length === 0) return 'empty';
    return addedItems
      .map((item) => `${item.recipeId}-${item.invoiceId}-${item.quantity}`)
      .join('|');
  }, [addedItems]);

  // Sync quantities from added items for returned invoices
  useEffect(() => {
    if (InvoiceType !== 'returned' && InvoiceType !== 'tainted') {
      return;
    }

    console.log('🔥 Syncing quantities with key:', addedItemsKey);

    if (!addedItems || addedItems.length === 0) {
      console.log('🔥 Resetting quantities - no added items');
      setRecipeInvoiceQuantities({});
      setRecipeTotalQuantities({});
      return;
    }

    console.log('🔥 Calculating quantities from added items:', addedItems);

    const invoiceQuantities = {};
    const totalQuantities = {};

    addedItems.forEach((item) => {
      // Track per invoice quantities
      const invoiceKey = `${item.recipeId}-${item.invoiceId}`;
      invoiceQuantities[invoiceKey] =
        (invoiceQuantities[invoiceKey] || 0) + item.quantity;

      // Track total quantities per recipe
      totalQuantities[item.recipeId] =
        (totalQuantities[item.recipeId] || 0) + item.quantity;
    });

    console.log('🔥 Setting new quantities:', {
      invoiceQuantities,
      totalQuantities,
    });
    setRecipeInvoiceQuantities(invoiceQuantities);
    setRecipeTotalQuantities(totalQuantities);
  }, [addedItemsKey, InvoiceType]);

  // Memoize the fields array to prevent unnecessary re-renders
  const fields = useMemo(() => {
    const baseFields = [
      {
        label: 'اقسام المخزن',
        type: 'select',
        placeholder: 'اختر منتج من المخزن',
        options:
          recipeCategoryParents?.map((parent) => ({
            value: parent.id,
            label: parent.name,
          })) || [],
        required: true,
        onChange: handleParentChange,
      },
      {
        label: 'التصنيف الرئيسى',
        type: 'select',
        placeholder: 'اختر تصنيف رئيسى ',
        options:
          recipeCategories?.map((category) => ({
            value: category.id,
            label: category.name,
          })) || [],
        required: true,
        onChange: handleCategoryChange,
      },
      {
        label: 'التصنيف الفرعى',
        type: 'select',
        placeholder: 'اختر تصنيف فرعى',
        options:
          recipes?.map((recipe) => ({
            value: recipe.id,
            label: recipe.name,
          })) || [],
        required: true,
        onChange: (value) => {
          if (value !== lastFetchedRecipe) {
            setSelectedRecipe(value);
            fetchOneRecipe(value);
            setLastFetchedRecipe(value);
          }
        },
      },
      {
        label: ' اختر تاريخ الصلاحية',
        type: 'select',
        placeholder: 'اختر تاريخ الصلاحية',
        options: expirationOptions || [],
        required: true,
        onChange: (value) => {
          const [invoiceId, expireyear, expiremonth, expireday] =
            value.split('-');
          const expireDateConcat = `${expireyear}-${expiremonth}-${expireday}`;
          setInvoiceId(invoiceId);
          const concatValue = `${invoiceId}-${expireDateConcat}`;
          setExpireDate(expireDateConcat);
        },
      },
    ];

    return baseFields;
  }, [
    recipeCategoryParents,
    recipeCategories,
    recipes,
    expirationOptions,
    handleParentChange,
    handleCategoryChange,
    lastFetchedRecipe,
  ]);
  const handleAddItem = async () => {
    console.log('🔥 DEBUG: handleAddItem called for returned invoice');
    console.log('🔥 Selected Recipe:', selectedRecipe);
    console.log('🔥 Invoice ID:', invoiceId);
    console.log('🔥 New Quantity:', newQuantity);
    console.log('🔥 Expire Date:', expireDate);
    console.log('🔥 Current recipeInvoiceQuantities:', recipeInvoiceQuantities);
    console.log('🔥 Current recipeTotalQuantities:', recipeTotalQuantities);

    if (!selectedRecipe) {
      setErrorMessage(`الرجاء اختيار مكون.`);
      return;
    }

    if (!invoiceId) {
      setErrorMessage(`يرجى اختيار تاريخ الصلاحية`);
      return;
    }

    if (!newQuantity || newQuantity <= 0) {
      setErrorMessage(`يرجى إدخال كمية صحيحة`);
      return;
    }

    const selectedRecipeObj = await fetchOneRecipe(selectedRecipe);
    if (!selectedRecipeObj) {
      setErrorMessage(`لم يتم العثور على المكون المختارة.`);
      return;
    }

    console.log('🔥 Selected Recipe Object:', selectedRecipeObj);

    // For returned/tainted invoices, check quantity against available stock for the specific invoice
    const combinationKey = `${selectedRecipe}-${invoiceId}`;
    const alreadySelectedQuantity =
      recipeInvoiceQuantities[combinationKey] || 0;
    const totalRecipeQuantity = recipeTotalQuantities[selectedRecipe] || 0;
    const newQuantityValue = parseFloat(newQuantity) || 0;

    console.log('🔥 Validation Variables:', {
      combinationKey,
      alreadySelectedQuantity,
      totalRecipeQuantity,
      newQuantityValue,
      recipeInvoiceQuantities,
      recipeTotalQuantities,
    });

    // Find the available quantity for this specific invoice
    const matchedDetail = selectedRecipeObj.quantitesDetails?.find(
      (detail) =>
        detail.expire_date === expireDate && detail.invoice_id == invoiceId
    );

    console.log('🔥 Matched Detail:', matchedDetail);
    console.log('🔥 All quantitesDetails:', selectedRecipeObj.quantitesDetails);

    if (!matchedDetail) {
      console.log('🔥 ERROR: No matched detail found');
      setErrorMessage(`لم يتم العثور على تفاصيل المنتج المحدد`);
      return;
    }

    const availableQuantityForInvoice = parseFloat(matchedDetail.quantity) || 0;
    const totalRecipeAvailableQuantity =
      parseFloat(selectedRecipeObj.total_quantity) || 0;

    // Check 1: Per invoice quantity validation
    const totalSelectedForInvoice = alreadySelectedQuantity + newQuantityValue;

    // Check 2: Global recipe quantity validation
    const totalSelectedForRecipe = totalRecipeQuantity + newQuantityValue;

    console.log('🔥 CRITICAL VALIDATION CHECKS:', {
      availableQuantityForInvoice,
      totalSelectedForInvoice,
      totalRecipeAvailableQuantity,
      totalSelectedForRecipe,
      invoiceExceeded: totalSelectedForInvoice > availableQuantityForInvoice,
      recipeExceeded: totalSelectedForRecipe > totalRecipeAvailableQuantity,
    });

    // Check if quantity exceeds available stock for this specific invoice
    if (totalSelectedForInvoice > availableQuantityForInvoice) {
      console.log('🔥 VALIDATION FAILED: Invoice quantity exceeded');
      setErrorMessage(
        `الكميه المطلوبة (${totalSelectedForInvoice}) تتجاوز الكميه المتاحه (${availableQuantityForInvoice}) من الفاتورة ${matchedDetail.invoice_code}`
      );
      return;
    }

    // Check if total quantity exceeds available stock for this recipe globally
    if (totalSelectedForRecipe > totalRecipeAvailableQuantity) {
      console.log('🔥 VALIDATION FAILED: Total recipe quantity exceeded');
      setErrorMessage(
        `الكميه المطلوبة (${totalSelectedForRecipe}) تتجاوز الكميه المتاحه (${totalRecipeAvailableQuantity}) للمنتج ${selectedRecipeObj.name}`
      );
      return;
    }

    console.log('🔥 VALIDATION PASSED: Both checks successful');

    // If we reach here, validation passed
    console.log('🔥 ADDING ITEM: Validation passed, proceeding with addition');

    const newItem = {
      name: selectedRecipeObj.name,
      image: selectedRecipeObj.image,
      recipeId: selectedRecipe,
      quantity: parseFloat(newQuantity),
      price: matchedDetail.price,
      expireDate: expireDate,
      invoiceId: invoiceId,
    };

    onAddItem(newItem);

    // Update quantity tracking for returned invoices
    const quantityToAdd = parseFloat(newQuantity);

    console.log('🔥 UPDATING QUANTITIES:', {
      combinationKey,
      quantityToAdd,
      beforeInvoice: recipeInvoiceQuantities[combinationKey] || 0,
      beforeTotal: recipeTotalQuantities[selectedRecipe] || 0,
    });

    // Update per-invoice quantities
    setRecipeInvoiceQuantities((prev) => ({
      ...prev,
      [combinationKey]: (prev[combinationKey] || 0) + quantityToAdd,
    }));

    // Update global recipe quantities
    setRecipeTotalQuantities((prev) => ({
      ...prev,
      [selectedRecipe]: (prev[selectedRecipe] || 0) + quantityToAdd,
    }));

    setItem('');
    setQuantity(1);
    setNewPrice(0);
    setPrice(0);
    setErrorMessage('');
  };

  return (
    <div>
      {fields.map((field, index) => (
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
              return (option?.children ?? '')
                .toLowerCase()
                .includes(input.toLowerCase());
            }}
            optionFilterProp="children"
            disabled={field.options.length === 0}
          >
            {field.options.map((option, index) => (
              <Option key={index} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      ))}

      <label className="form-label">الكميه:</label>
      <input
        className="form-input"
        type="number"
        value={newQuantity}
        onChange={(e) => setNewQuantity(e.target.value)}
        onWheel={(event) => event.currentTarget.blur()}
      />

      <label className="form-label">الوحده:</label>
      <input
        className="form-input"
        type="text"
        value={unit}
        disabled={true}
        style={{ cursor: 'not-allowed' }}
      />

      <button className="form-btn" onClick={handleAddItem}>
        اضافة عنصر
      </button>
      <p style={{ color: 'red' }}>{errorMessage}</p>
    </div>
  );
};

export default TaintedInvoiceDetailes;
