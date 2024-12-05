import React, { useState, useEffect } from "react";
import { API_ENDPOINT } from "../../../../config";
import { getRecipesById } from "../../../apis/invoices";
import {getCategories ,getSubCategories} from "../../../apis/categories"
import {getSubCategoryById,getSubCategoryFilterById} from "../../../apis/subCategory"
const CahierWearhouseDetailes = ({ onAddItem }) => {
    const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
    const [items, setItems] = useState([]);
    const [item, setItem] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [price, setPrice] = useState(0);
    const [unit, setUnit] = useState("");
    const [epireDate, setExpireDate] = useState();
    const [isAddProduct, setIsAddProduct] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [recipeCategoryParents, setRecipeCategoryParents] = useState([]);
    const [recipeCategories, setRecipeCategories] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [fields, setFields] = useState([]);
    const [selectedParent, setSelectedParent] = useState("");
    const [recipeCategoryParentsproduct, setRecipeCategoryParentsproduct] = useState([]); 
    const [recipeCategoriesproduct, setRecipeCategoriesproduct] = useState([]);
    const [recipesproduct, setRecipesproduct] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState("");
    const [selectedRecipeproduct, setSelectedRecipeproduct] = useState("");
    const [selectedOneRecipe, setSelectedOneRecipe] = useState("");
    const [recipesinproduct, setRecipesinproduct] = useState([]);

    useEffect(() => {
        fetchRecipeCategoryParents();
        fetchMaincatProduct();
    }, []);

    const fetchOneRecipe = async (id) => {
        try {
            const oneRecipe = await getRecipesById(id);
            console.log(`dataaa`,oneRecipe)

           // setPrice(oneRecipe.quantitesDetails[0].price);
        } catch (error) {
            console.error("Error fetching one recipe:", error);
        }
    };

    useEffect(() => {
        fetchOneRecipe(selectedRecipe);
    }, [selectedRecipe]);

const fetchMaincatProduct = async () => {
    try {
        const data = await getCategories();
        setRecipeCategoryParentsproduct(data.data);
    } catch (error) {
        console.error("Error fetching recipe category parents:", error);
    }
};
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
        } catch (error) {
            console.error("Error fetching recipe category parents:", error);
        }
    };
    const handleProductParentChange = async (parentId) => {
        console.log(`parent`,parentId)
        setSelectedParent(parentId);
        try {
            const res = await fetch(
                `${API_ENDPOINT}/api/v1/store/sub_categories/filter_by_category/${parentId}`, {
               
                headers: {
                    Authorization: `Bearer ${Token}`,
                },
            }
            );
            const data = await res.json();
            setRecipeCategoriesproduct(data.data);
        } catch (error) {
            console.error("Error fetching recipe categories:", error);
        }
    };

    const handleParentChange = async (parentId) => {
        setSelectedParent(parentId);
        try {
            const response = await fetch(
                `${API_ENDPOINT}/api/v1/store/recipe_category/allById/${parentId}`,
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
    const handleproductCategoryChange = async (categoryId) => {
        setSelectedCategory(categoryId);
        try {
            const res = await fetch(
                `${API_ENDPOINT}/api/v1/store/products/subcategory/${categoryId}`,
                {
                 
                  headers: {
                    Authorization: `Bearer ${Token}`,
                  },
                }
              );
            const data = await res.json();
            setRecipesproduct(data.data);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        }
    };
    const handleCategoryChange = async (categoryId) => {
        setSelectedCategory(categoryId);
        try {
            const response = await fetch(
                `${API_ENDPOINT}/api/v1/store/recipe/allById/${categoryId}`,
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
    const handleChangeRecipe = async (recipeId) => {
        setSelectedRecipe(recipeId);
        console.log(`rec`,recipes)
       const RecUnit = recipes.filter(recipe=>recipe.id===recipeId)
       console.log(`unittt`,RecUnit[0].unit.name)
       setUnit(RecUnit[0].unit.name)
    };
    useEffect(() => {
        setFields([
            {
                label: "اضافه منتج او مكون",
                type: "select",    
                placeholder: "هل تريد اضافه منتج كامل ام مكون واحد",
                options: [
                    { value: "product", label: "منتج كامل" },
                    { value: "recipe", label: "مكون" }
                ],
                required: true,
                onChange: (value) => {
                    setIsAddProduct(value === "product");
                },
            },

            !isAddProduct && {
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

            !isAddProduct && {
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
//
            !isAddProduct && {
                label: "التصنيف الفرعى",
                type: "select",
                placeholder: "اختر تصنيف فرعى",
                options:
                    recipes?.map((recipe) => ({
                        value: recipe.id,
                        label: recipe.name,
                    })) || [],
                required: true,
                onChange: handleChangeRecipe ,
            },
            isAddProduct && {
                label: "القسم الرئيسي للمنتج ",
                type: "select",
                placeholder: "اختر القسم الرئيسي للمنتج",
                options:
                    recipeCategoryParentsproduct?.map((parent) => ({
                        value: parent.id,
                        label: parent.name,
                    })) || [],
                required: true,
                onChange: handleProductParentChange,
            },
            isAddProduct && {
                label: "التصنيف الرئيسى",
                type: "select",
                placeholder: "اختر تصنيف رئيسى ",
                options:
                    recipeCategoriesproduct?.map((category) => ({
                        value: category.id,
                        label: category.name,
                    })) || [],
                required: true,
                onChange: handleproductCategoryChange,
            },
            isAddProduct && {
                label: "التصنيف الفرعى",
                type: "select",
                placeholder: "اختر تصنيف فرعى",
                options:
                recipesproduct?.map((recipe) => ({
                        value: recipe.id,
                        label: recipe.name,
                    })) || [],
                required: true,
                onChange: (value) => setSelectedRecipeproduct(value),
            },

        ].filter(Boolean));  // Filter out any falsy values (e.g., `false` or `undefined` from the conditional fields)
    }, [isAddProduct, recipeCategoryParents, recipeCategories, recipes,recipeCategoryParentsproduct, recipeCategoriesproduct, recipesproduct]);

    const onSubmit = (formData) => {
        // Handle form submission
    };

const handleAddOneItem = async (item)=>{
    setItems([...items,item])
}

const handleAddItem = async () => {
    let newItems = []; 
  
    if (selectedRecipeproduct) {
        console.log(`p`)

      try {
        const res = await fetch(`${API_ENDPOINT}/api/v1/store/products/${selectedRecipeproduct}`, {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        });
        const data = await res.json();
        setRecipesinproduct(data.data.recipes);
  
        recipesinproduct.forEach((recipenow) => {
            console.log(`s`,recipenow.id,recipenow.quantity * quantity,recipenow.quantity , quantity)
          const newItem = {
            name: recipenow.name,
            image: recipenow.image,
            recipeId: recipenow.id,
            quantity: recipenow.quantity * quantity, 
            price: price,
            expireDate: epireDate,
          };
          newItems.push(newItem);
          console.log(`p`,newItems)
        });
      } catch (error) {
        message.error(error.response.data.error.message);
      }
    } else if (selectedRecipe) {
      const selectedRecipeObj = recipes.find(recipe => String(recipe.id) === selectedRecipe);
      const newItem = {
        name: selectedRecipeObj?.name || "",
        image: selectedRecipeObj?.image || "",
        recipeId: selectedRecipe,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        expireDate: epireDate,
      };
  
      newItems.push(newItem);
    } else {
      setErrorMessage("Please select a recipe.");
      return;
    }  
    onAddItem(newItems);
    setItem("");
    setQuantity(1);
    setPrice(0);
    setErrorMessage("");
  };
    return (
        <div>
            {fields.map((field, index) => (
                field && (
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
                )
            ))}

            <label className="form-label">الكميه:</label>
            <input
                className="form-input"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onWheel={(event) => event.currentTarget.blur()}
            />
            <label className="form-label">الوحده:</label>
            <input
                className="form-input"
                type="text"
                value={unit}
                disabled
            />
            <button className="form-btn" onClick={handleAddItem}>
                اضافة عنصر
            </button>
            <p style={{ color: "red" }}>{errorMessage}</p>
        </div>
    );
};

export default CahierWearhouseDetailes;
