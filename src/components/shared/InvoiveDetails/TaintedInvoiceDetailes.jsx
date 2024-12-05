import React, { useState, useEffect } from "react";
import { API_ENDPOINT } from "../../../../config";
import { getRecipesById } from "../../../apis/invoices";
import { useAuth } from "../../../context/AuthContext";
import { Select } from "antd";

const TaintedInvoiceDetailes = ({ onAddItem, onDeleteItem, InvoiceType, departmentId }) => {
    const Token = localStorage.getItem('token') || sessionStorage.getItem('token')

    const [item, setItem] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [price, setPrice] = useState(0);
    const [unit, setUnit] = useState("");
    const [expireDate, setExpireDate] = useState("");
       const [invoiceId, setInvoiceId] = useState("");

    const [expirationOptions, setExpirationOptions] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [recipeCategoryParents, setRecipeCategoryParents] = useState([]);
    const [recipeCategories, setRecipeCategories] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [fields, setFields] = useState([]);
    const [selectedParent, setSelectedParent] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState("");
    const [newQuantity, setNewQuantity] = useState();
    const [newPrice, setNewPrice] = useState();
    const [department, setDepartment] = useState([]);


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
        } catch (error) {
             
        }
    };
    const handleParentChange = async (parentId) => {
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
        } catch (error) {
             
        }
    };
    const handleCategoryChange = async (categoryId) => {
        setSelectedCategory(categoryId);
        setSelectedRecipe("");
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
             
        }
    };
    const { user } = useAuth()

    const fetchOneRecipe = async (id) => {
        try {
            //  
            const oneRecipe = await getRecipesById(id, departmentId);
            setSelectedRecipe(oneRecipe.id);
            setQuantity(oneRecipe.total_quantity);
            setUnit(oneRecipe.unit.name);
            const expirationOptions = oneRecipe.quantitesDetails.map((detail) => ({
                value: `${detail.invoice_id}-${detail.expire_date}`, // Create a unique value
                label: `${"  السعر:   " + `${detail.price}` + "   --   " + "  التاريخ:    " + `${detail.expire_date}`+ "   --   " + "  الكميه:    " + `${detail.quantity}` }`,
            }));
            setExpirationOptions(expirationOptions);
            return oneRecipe; 
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        setFields([
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
                onChange: (value) => {
                    setSelectedRecipe(value); // Update the selected recipe immediately
                    fetchOneRecipe(value); // Fetch the recipe details
                },
            },
            {
                label: " اختر تاريخ الصلاحية",
                type: "select",
                placeholder: "اختر تاريخ الصلاحية",
                options: expirationOptions || [],
                required: true,
                onChange: (value) => {
                    const [invoiceId, expireyear,expiremonth,expireday] = value.split('-'); 
                      const expireDateConcat = `${expireyear}-${expiremonth}-${expireday}`;
                      setInvoiceId(invoiceId)
                      const concatValue=`${invoiceId}-${expireDateConcat}`
                    setExpireDate(expireDateConcat); 
                },            },
        ]);
    }, [recipeCategoryParents, recipeCategories, recipes, expirationOptions]);
    const handleAddItem = async () => {
        if (!selectedRecipe) {
            setErrorMessage(`الرجاء اختيار مكون.`);
            return;
        }

        const selectedRecipeObj = await fetchOneRecipe(selectedRecipe);
        if (!selectedRecipeObj) {
            setErrorMessage(`لم يتم العثور على المكون المختارة.`);
            return;
        }

        const newItem = {
            name: selectedRecipeObj.name,
            image: selectedRecipeObj.image,
            recipeId: selectedRecipe,
            quantity: parseFloat(newQuantity),
            price: parseFloat(price), // Default price
            expireDate: expireDate,
        };
        const matchedDetail = selectedRecipeObj.quantitesDetails.find(detail => detail.expire_date === expireDate&&detail.invoice_id==invoiceId);
        if (matchedDetail) {
            if (parseFloat(newQuantity) <= matchedDetail.quantity) {
                newItem.price = matchedDetail.price; 
                onAddItem(newItem);
                setItem("");
                setQuantity(1);
                setNewPrice(0);
                setPrice(0);
                setErrorMessage("");
            } else {
                setErrorMessage("الكمية المدخلة أكبر من الكمية المتاحة لتاريخ انتهاء الصلاحية المحدد.");
                setQuantity(0);
            }
        } else {
            setErrorMessage("تاريخ انتهاء الصلاحية المحدد غير موجود في التفاصيل المتاحة.");
        }
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
                            return (option?.children ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase());
                        }}
                        optionFilterProp="children"
                        disabled={field.options.length === 0}

                    >
                        {field.options.map((option, index) => (
                            <Option key={index} value={option.value} >
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
            <input className="form-input" type="text" value={unit} disabled={true} style={{ cursor: "not-allowed" }} />

            <button className="form-btn" onClick={handleAddItem}>
                اضافة عنصر
            </button>
            <p style={{ color: "red" }}>{errorMessage}</p>
        </div>
    );
};

export default TaintedInvoiceDetailes;

