// Import useState and useEffect if not already imported
import React, { useState, useEffect } from "react";
import { API_ENDPOINT } from "../../../../config";
import { getRecipesById } from "../../../apis/invoices";

const CahierWearhouseDetailes = ({ onAddItem }) => {
    const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

    const [item, setItem] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [price, setPrice] = useState(0);
    const [uint, setUnit] = useState("");
    const [epireDate, setExpireDate] = useState();

    const [errorMessage, setErrorMessage] = useState("");
    const [recipeCategoryParents, setRecipeCategoryParents] = useState([]);
    const [recipeCategories, setRecipeCategories] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [fields, setFields] = useState([]);
    const [selectedParent, setSelectedParent] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState("");
    const [selectedOneRecipe, setSelectedOneRecipe] = useState("");

    useEffect(() => {
        fetchRecipeCategoryParents();
    }, []);

    const fetchOneRecipe = async (id) => {
        try {
            const oneRecipe = await getRecipesById(id);
            // console.log("===================>price" + oneRecipe.price);

            // console.log("==================>" + oneRecipe.data);

            setPrice(oneRecipe.quantitesDetails[0].price);
        } catch (error) {
            // console.log("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchOneRecipe(selectedRecipe);
    }, [selectedRecipe]);

    const fetchRecipeCategoryParents = async () => {
        try {
            const response = await fetch(
                `${API_ENDPOINT}/api/v1/store/recipe_category_parent/all`,
                {
                    headers: {
                        Authorization: `Bearer ${Token}`,
                    },
                }
            );
            const data = await response.json();
            setRecipeCategoryParents(data.data);
            // console.log(data);
        } catch (error) {
            console.error("Error fetching recipe category parents:", error);
        }
    };

    const handleParentChange = async (parentId) => {
        setSelectedParent(parentId);
        try {
            const response = await fetch(
                `${API_ENDPOINT}/api/v1/store/recipe_category/allById/${parentId}`,
                // `${API_ENDPOINT}/api/v1/store/recipe_category?category_id=${parentId}`,
                {
                    headers: {
                        Accept: "application/json",
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
                        Accept: "application/json",
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
                onChange: (value) => setSelectedRecipe(value), // Update selectedRecipe state with selected recipe value
            },
        ]);
    }, [recipeCategoryParents, recipeCategories, recipes]);
    // console.log("=====================>" + selectedRecipe);
    const onSubmit = (formData) => {
        // Handle form submission here
        // console.log("Form data:", formData);
    };

    const handleAddItem = () => {
        if (!selectedRecipe.trim()) {
            setErrorMessage(`Please select a recipe.`);
            return;
        }
        // Logging for troubleshooting
        // console.log("recipes====================>:", recipes);
        // console.log("selectedRecipe:", selectedRecipe);

        // Find the selected recipe object from the recipes array
        const selectedRecipeObj = recipes.find(
            (recipe) => String(recipe.id) === selectedRecipe
        );

        // Logging for troubleshooting
        // console.log("selectedRecipeObj:", selectedRecipeObj);

        // If the selected recipe is found, extract its name
        const recipeName = selectedRecipeObj ? selectedRecipeObj.name : "";
        const recipeImage = selectedRecipeObj ? selectedRecipeObj.image : "";
        const recipePrice = selectedRecipeObj ? selectedRecipeObj.price : "";

        // Logging for troubleshooting
        // console.log("recipeName:", recipeName);
        // console.log("recipeName:", recipeImage);
        // console.log("recipeprice:", recipePrice);

        // Additional validation or processing logic

        const newItem = {
            name: recipeName,
            image: recipeImage,
            recipeId: selectedRecipe, // Accessing selectedRecipe directly
            quantity: parseFloat(quantity),
            price: parseFloat(price),
            expireDate: epireDate,
        };

        onAddItem(newItem);
        setItem("");
        setQuantity(1);
        setPrice(0);
        setErrorMessage("");
    };

    return (
        <div>
            {fields.map((field, index) => (
                <div key={index}>
                    <label className="form-label">{field.label}</label>
                    <select
                        className="form-select"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        required={field.required}
                    >
                        <option value="">{field.placeholder}</option>
                        {field.options.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            ))}

            <label className="form-label">الكميه:</label>
            <input
                className="form-input"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onWheel={(event) => event.currentTarget.blur()}
            />
            {/* <label className="form-label" >السعر:</label>
            <input className="form-input" type="number" value={price} onChange={(e) => setPrice(e.target.value)} onWheel={event => event.currentTarget.blur()} /> */}
            {/* <label className="form-label" >الوحده:</label>
            <input className="form-input" type="text" value={uint} />
            <label className="form-label" >تاريخ الصلاحيه:</label>
            <input className="form-input" type="date" value={epireDate} onChange={(e) => setExpireDate(e.target.value)} /> */}
            <button className="form-btn" onClick={handleAddItem}>
                اضافة عنصر
            </button>
            <p style={{ color: "red" }}>{errorMessage}</p>
        </div>
    );
};

export default CahierWearhouseDetailes;
