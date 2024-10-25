import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRecipesById } from "../../../../../../apis/invoices";
import {
  addRecipes,
  getRecipes,
  getUnits,
} from "../../../../../../apis/recipes/recipe";
import { getRecipeSubCategoryById } from "../../../../../../apis/recipes/recipeSubCategory";
import DynamicForm from "../../../../../../components/shared/form/Form";

const AddRecipes = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const handleSubmit = async (formData) => {
    // console.log(formData);
    await addRecipes(
      formData.name,
      formData.image,
      id,
      formData.unit_id,
      formData.minimum_limt,
      formData.day_before_expire
    );
    await navigate(`/warehouse/recipes/recipe/show-recipe/${id}`);
  };

  const [categories, setCategories] = useState([]); // Initialize categories state
  const [units, setUnits] = useState([]); // Initialize categories state

  const [data, setData] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeData = await getRecipeSubCategoryById(id);
        setData(recipeData.data.name);
        // console.log(recipeData.data.name);
      } catch (error) {
        // console.log("Error fetching data:", error);
      }
    };

    fetchData(); // Call fetchData when component mounts
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const unitData = await getUnits();
        setUnits(unitData.data);
      } catch (error) {
        // console.log("Error fetching data:", error);
      }
    };

    fetchData(); // Call fetchData when component mounts
  }, []);

  const fields = [
    {
      type: "text",
      name: "parent",
      placeholder: `${data}`,
      required: false,
      disabled: true,
    },
    {
      type: "text",
      name: "name",
      placeholder: "يجب عليك ادخال الاسم",
      labelName: "الاسم",

      required: true,
    },
    // { type: 'number', name: 'quantity', placeholder: 'يجب عليك ادخال الكميه', required: true },
    // { type: 'number', name: 'price', placeholder: 'يجب عليك ادخال السعر', required: true },
    {
      type: "number",
      name: "minimum_limt",
      placeholder: "يجب عليك ادخال كمية حد الامان",
      labelName: " كمية حد الامان",
      required: true,
    },
    {
      type: "number",
      name: "day_before_expire",
      placeholder: "يجب عليك ادخال أيام التنبيه قبل انتهاء الصلاحية",
      labelName: "  أيام التنبيه قبل انتهاء الصلاحية",
      required: true,
    },

    {
      type: "select",
      name: "unit_id",
      placeholder: "اختر  الوحدة",
      labelName: "الوحدة",
      options: units.map((units) => ({ value: units.id, label: units.name })),
    },

    { type: "image", name: "image", placeholder: "يجب عليك ادخال الصوره" },
  ];

  return (
    <div className="form-container">
      <h1 className="form-title">ادخال تصنيف الفرعى</h1>
      <DynamicForm fields={fields} onSubmit={handleSubmit} />
    </div>
  );
};

export default AddRecipes;
