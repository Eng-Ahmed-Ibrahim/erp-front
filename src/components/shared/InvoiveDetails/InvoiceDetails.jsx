// Import useState and useEffect if not already imported
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { API_ENDPOINT } from "../../../../config";
import { getRecipesById } from "../../../apis/invoices";
import { useAuth } from "../../../context/AuthContext";
import { Select } from "antd";
import { current } from "@reduxjs/toolkit";

const InvoiceDetails = ({
  onAddItem,
  onDeleteItem,
  InvoiceType,
  addedItems = [],
}) => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [pastQuantity, setPastQuantity] = useState(0);
  const [pastPrice, setPastPrice] = useState(0);
  const [uint, setUnit] = useState("");
  const [epireDate, setExpireDate] = useState();
  const [expirationOptions, setExpirationOptions] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [recipeCategoryParents, setRecipeCategoryParents] = useState([]);
  const [recipeCategories, setRecipeCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [invoiceId, setInvoiceId] = useState("");

  // const [fields, setFields] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [selectedOneRecipe, setSelectedOneRecipe] = useState("");
  const [newQuantity, setNewQuantity] = useState();
  const [newPrice, setNewPrice] = useState();
  const [recipeInvoiceQuantities, setRecipeInvoiceQuantities] = useState({});
  const [recipeTotalQuantities, setRecipeTotalQuantities] = useState({});
  const [lastFetchedRecipe, setLastFetchedRecipe] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchRecipeCategoryParents();
  }, []);
  useEffect(() => {
    if (selectedRecipe) {
      const selectedRecipeObj = recipes.find(
        (recipe) => recipe.id === selectedRecipe
      );

      if (selectedRecipeObj) {
        const { price, quantity } = selectedRecipeObj.last_recipe_invoice;

        setPastPrice(price);
        setPastQuantity(quantity);
      }
    }
  }, [selectedRecipe, recipes]);
  const fetchOneRecipe = async (id, departmentId) => {
    try {
      departmentId = departmentId ? departmentId : user.department.id;
      const oneRecipe = await getRecipesById(id, departmentId);
      setSelectedOneRecipe(oneRecipe);

      if (InvoiceType === "out_going") {
        setQuantity(oneRecipe.total_quantity);
        setPrice(oneRecipe.price);
        setUnit(oneRecipe.unit.name);
        setNewPrice(oneRecipe.price / oneRecipe.total_quantity);
        const expirationOptions = oneRecipe.quantitesDetails.map((detail) => ({
          value: `${detail.invoice_id}-${detail.expire_date}`, // Create a unique value
          label: `${
            " كود الفاتورة:   " +
            `${detail.invoice_code}` +
            "   --   " +
            "  السعر:   " +
            `${detail.price}` +
            "   --   " +
            "    تاريخ الصلاحية:    " +
            `${detail.expire_date}` +
            "   --   " +
            "  الكميه:    " +
            `${detail.quantity}`
          }`,
        }));

        setExpirationOptions(expirationOptions);
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

      return oneRecipe;
      //
    } catch (error) {
      //
    }
  };

  useEffect(() => {
    if (
      selectedRecipe &&
      user?.department?.id &&
      selectedRecipe !== lastFetchedRecipe
    ) {
      fetchOneRecipe(selectedRecipe, user.department.id);
      setLastFetchedRecipe(selectedRecipe);
    }
  }, [selectedRecipe, user?.department?.id, lastFetchedRecipe]);

  // Create a stable key for addedItems to prevent unnecessary re-renders
  const addedItemsKey = useMemo(() => {
    if (!addedItems || addedItems.length === 0) return "empty";
    return addedItems
      .map((item) => `${item.recipeId}-${item.invoiceId}-${item.quantity}`)
      .join("|");
  }, [addedItems]);

  // Sync quantities from added items for outgoing invoices
  useEffect(() => {
    if (InvoiceType !== "out_going") {
      return;
    }

    if (!addedItems || addedItems.length === 0) {
      console.log("🔥 Resetting quantities - no added items");
      setRecipeInvoiceQuantities({});
      setRecipeTotalQuantities({});
      return;
    }

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
    setRecipeInvoiceQuantities(invoiceQuantities);
    setRecipeTotalQuantities(totalQuantities);
  }, [addedItemsKey, InvoiceType]);

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

  const handleParentChange = useCallback(
    async (parentId) => {
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
    },
    [Token]
  );

  const handleCategoryChange = useCallback(
    async (categoryId) => {
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
    },
    [Token]
  );

  // Memoize the fields array to prevent unnecessary re-renders
  const fileds = useMemo(() => {
    const baseFields = [
      {
        label: "اقسام المخزن",
        type: "select",
        placeholder: "اختر منتج من المخزن",
        options:
          recipeCategoryParents?.map((parent) => ({
            value: parent.id,
            label: parent.name,
          })) || [],
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
          })) || [],
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
          })) || [],
        required: true,
        onChange: (value) => setSelectedRecipe(value),
      },
    ];

    if (InvoiceType === "out_going") {
      baseFields.push({
        label: " اختر تاريخ الصلاحية",
        type: "select",
        placeholder: "اختر تاريخ الصلاحية",
        options: expirationOptions || [],
        required: true,
        onChange: (value) => {
          const [invoiceId, expireyear, expiremonth, expireday] =
            value.split("-");
          const expireDateConcat = `${expireyear}-${expiremonth}-${expireday}`;
          setInvoiceId(invoiceId);
          const concatValue = `${invoiceId}-${expireDateConcat}`;
          setExpireDate(expireDateConcat);
        },
      });
    }

    return baseFields;
  }, [
    recipeCategoryParents,
    recipeCategories,
    recipes,
    expirationOptions,
    InvoiceType,
    handleParentChange,
    handleCategoryChange,
  ]);
  // const expirationOptionsLabel =

  const onSubmit = (formData) => {
    // Handle form submission here
    //
  };

  const handleAddItem = async () => {

    if (!selectedRecipe.trim()) {
      setErrorMessage(`Please select a recipe.`);
      return;
    }

    if ( (InvoiceType === "out_going" || InvoiceType === "returned" ) && !invoiceId) {
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

    console.log("🔥 Selected Recipe Object:", selectedRecipeObj);

    // If the selected recipe is found, extract its name
    const recipeName = selectedRecipeObj ? selectedRecipeObj.name : "";
    const recipeImage = selectedRecipeObj ? selectedRecipeObj.image : "";

    // For outgoing invoices, check quantity against available stock for the specific invoice
    if (InvoiceType === "out_going") {
      const combinationKey = `${selectedRecipe}-${invoiceId}`;
      const alreadySelectedQuantity =
        recipeInvoiceQuantities[combinationKey] || 0;
      const totalRecipeQuantity = recipeTotalQuantities[selectedRecipe] || 0;
      const newQuantityValue = parseFloat(newQuantity);

      console.log("Validation Debug:", {
        combinationKey,
        alreadySelectedQuantity,
        totalRecipeQuantity,
        newQuantityValue,
        recipeInvoiceQuantities,
        recipeTotalQuantities,
        selectedRecipeObj: selectedRecipeObj?.quantitesDetails,
      });

      // Find the available quantity for this specific invoice
      const matchedDetail = selectedRecipeObj.quantitesDetails.find(
        (detail) =>
          detail.expire_date === epireDate && detail.invoice_id == invoiceId
      );

      console.log("Matched Detail:", matchedDetail);

      if (matchedDetail) {
        const availableQuantityForInvoice = matchedDetail.quantity;
        const totalRecipeAvailableQuantity = selectedRecipeObj.total_quantity;

        // Check 1: Per invoice quantity validation
        const totalSelectedForInvoice =
          alreadySelectedQuantity + newQuantityValue;

        // Check 2: Global recipe quantity validation
        const totalSelectedForRecipe = totalRecipeQuantity + newQuantityValue;

        console.log("🔥 QUANTITY VALIDATION CHECKS:", {
          availableQuantityForInvoice,
          totalSelectedForInvoice,
          totalRecipeAvailableQuantity,
          totalSelectedForRecipe,
          invoiceExceeded:
            totalSelectedForInvoice > availableQuantityForInvoice,
          recipeExceeded: totalSelectedForRecipe > totalRecipeAvailableQuantity,
        });

        // Check if quantity exceeds available stock for this specific invoice
        if (totalSelectedForInvoice > availableQuantityForInvoice) {
          console.log("🔥 VALIDATION FAILED: Invoice quantity exceeded");
          setErrorMessage(
            `الكميه المطلوبة (${totalSelectedForInvoice}) تتجاوز الكميه المتاحه (${availableQuantityForInvoice}) من الفاتورة ${matchedDetail.invoice_code}`
          );
          return;
        }

        // Check if total quantity exceeds available stock for this recipe globally
        if (totalSelectedForRecipe > totalRecipeAvailableQuantity) {
          console.log("🔥 VALIDATION FAILED: Total recipe quantity exceeded");
          setErrorMessage(
            `الكميه المطلوبة (${totalSelectedForRecipe}) تتجاوز الكميه المتاحه (${totalRecipeAvailableQuantity}) للمنتج ${selectedRecipeObj.name}`
          );
          return;
        }

        console.log("🔥 VALIDATION PASSED: Both checks successful");
      } else {
        console.log("No matched detail found for:", { epireDate, invoiceId });
        setErrorMessage(`  لم يتم العثور على تفاصيل المنتج المحدد`);
        return;
      }
    } else {
      // For other invoice types, check if the same recipe already exists
      const isItemsExist = recipes.some(
        (item) =>
          item.recipeId === selectedRecipe &&
          item.quantity === parseInt(newQuantity)
      );

      if (isItemsExist) {
        setErrorMessage(`  لا يمكن اضافة العنصر مرتين`);
        return;
      }
    }

    if (InvoiceType != "out_going") {
      const cuurentDate = new Date();
      const selectedDate = new Date(epireDate);
      if (selectedDate < cuurentDate) {
        setErrorMessage(`  التاريخ يجب ان يكون بداية من النهاردة`);
        return;
      }
    }

    // Additional validation or processing logic
    // const newItem = {
    //   name: recipeName,
    //   image: recipeImage,
    //   recipeId: selectedRecipe, // Accessing selectedRecipe directly
    //   quantity: parseFloat(newQuantity),
    //   price: InvoiceType === "in_coming" ? parseFloat(price) : parseFloat(newPrice),
    //   expireDate: epireDate,
    //   invoiceId: invoiceId
    // };

    // if (InvoiceType === "in_coming") {
    //   // if( selectedRecipe !=newItem.recipeId ){

    //   // }

    //   onAddItem(newItem);
    //   setItem("");
    //   setNewQuantity(1);
    //   setNewPrice(0)
    //   setPrice(0);

    //   setErrorMessage("");
    // }

    // If we reach here, validation passed for outgoing invoices
    if (InvoiceType === "out_going") {
      console.log(
        "🔥 ADDING ITEM: Validation passed, proceeding with addition"
      );

      const matchedDetail = selectedRecipeObj.quantitesDetails.find(
        (detail) =>
          detail.expire_date === epireDate && detail.invoice_id == invoiceId
      );

      const newItem = {
        name: recipeName,
        image: recipeImage,
        recipeId: selectedRecipe,
        quantity: parseFloat(newQuantity),
        price: matchedDetail.price,
        expireDate: epireDate,
        invoiceId: invoiceId,
      };

      onAddItem(newItem);

      // Update quantity tracking for outgoing invoices
      const combinationKey = `${selectedRecipe}-${invoiceId}`;
      const quantityToAdd = parseFloat(newQuantity);

      console.log("🔥 UPDATING QUANTITIES:", {
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

      setItem("");
      setNewQuantity(1);
      setNewPrice(matchedDetail.price);
      setPrice(0);
      setErrorMessage("");
    } else {
      const newItem = {
        name: recipeName,
        image: recipeImage,
        recipeId: selectedRecipe, // Accessing selectedRecipe directly
        quantity: parseFloat(newQuantity),
        price: parseFloat(price),
        expireDate: epireDate,
        invoiceId: invoiceId,
      };
      setExpireDate("");
      onAddItem(newItem);
      setItem("");
      setNewQuantity(1);
      setNewPrice(0);
      setPrice(0);
      setErrorMessage("");
    }
  };

  return (
    <div>
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
              <Option key={index} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      ))}
      {InvoiceType === "in_coming" && selectedRecipe ? (
        <>
          <label className="form-label">تفاصيل المنتج في اخر فاتوره:</label>
          <option className="form-select-pp">
            الكميه الوارده {pastQuantity} -- سعر الكميه في الفاتوره {pastPrice}
          </option>
        </>
      ) : null}
      {InvoiceType === "in_coming" ||
      InvoiceType === "returned" ||
      InvoiceType === "tainted" ? null : (
        <label className="form-label">{` اجمالي الكميه المتاحه فى المخزن هى ${quantity}  ${uint}`}</label>
      )}
      <label className="form-label">الكمية:</label>
      <input
        className="form-input"
        type="number"
        value={newQuantity}
        onChange={(e) => setNewQuantity(e.target.value)}
        onWheel={(event) => event.currentTarget.blur()}
      />
      {InvoiceType === "in_coming" ? (
        <>
          <label className="form-label">السعر:</label>
          <input
            className="form-input"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onWheel={(event) => event.currentTarget.blur()}
          />
        </>
      ) : null}

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
      <input
        className="form-input"
        type="text"
        value={uint}
        disabled={true}
        style={{ cursor: "not-allowed" }}
      />
      {InvoiceType === "in_coming" ||
      InvoiceType === "returned" ||
      InvoiceType === "tainted" ? (
        <>
          {" "}
          <label className="form-label"> تاريخ انتهاء الصلاحيه:</label>
          <input
            className="form-input"
            type="date"
            value={epireDate || ""} // <- fallback to empty string
            onChange={(e) => setExpireDate(e.target.value)}
          />
        </>
      ) : null}

      <button className="form-btn" onClick={handleAddItem}>
        اضافة عنصر
      </button>
      <p style={{ color: "red" }}>{errorMessage}</p>
    </div>
  );
};

export default InvoiceDetails;
