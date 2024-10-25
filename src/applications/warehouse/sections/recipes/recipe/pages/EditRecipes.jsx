import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  eidtRecipes,
  getRecipes,
  getRecipesById,
  getUnits,
} from "../../../../../../apis/recipes/recipe";
import DynamicForm from "../../../../../../components/shared/form/Form";
import { useAuth } from "../../../../../../context/AuthContext";

const EditRecipes = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(); // Initialize data as null

  const { id } = useParams();

  const { user } = useAuth()

  // const [departmentId, setDepartmentId] = useState(user.department.id); // Initialize data as null
  // // console.log("id", departmentId)
  const handleSubmit = async (formData) => {
    // console.log("=================>" + formData.name);

    await eidtRecipes(
      formData.name,
      formData.image,
      recipeParentId,
      formData.unit_id,
      formData.minimum_limt,
      formData.days_before_expire,
      id
    );
    await navigate(`/warehouse/recipes/recipe/show-recipe/${recipeParentId}`);
  };
  const [units, setUnits] = useState([]); // Initialize categories state
  const [parentName, setParentName] = useState("");
  const [recipeUnit, setRecipeUnit] = useState("");
  const [recipeParentId, setRecipeParentId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeData = await getRecipesById(id, user.department.id);
        // console.log("================>" + recipeData.data.name);
        setData(recipeData.data);
        setParentName(recipeData.data.recipe_category.name);
        setRecipeUnit(recipeData.data.unit);
        setRecipeParentId(recipeData.data.recipe_category.id);

        // console.log("================>" + recipeData.data);
      } catch (error) {
        // console.log("Error fetching data:", error);
      }
    };
    fetchData();
  }, [id]); // useEffect dependency on id

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
      placeholder: `${parentName}`,
      required: false,
      disabled: true,
    },
    {
      type: "text",
      name: "name",
      placeholder: "يجب عليك ادخال الاسم",
      labelName: "الاسم",
      required: false,
      disabled: false,
    },
    {
      type: "number",
      name: "minimum_limt",
      placeholder: "يجب عليك ادخال كمية حد الامان",
      labelName: "كمية حد الامان",
      required: false,
      disabled: false,
    },
    {
      type: "number",
      name: "days_before_expire",
      placeholder: "يجب عليك ادخال أيام التنبيه قبل انتهاء الصلاحية",
      labelName: "أيام التنبيه قبل انتهاء الصلاحية",
      required: false,
      disabled: false,
    },
    {
      type: "select",
      name: "unit_id",
      labelName: "الوحدة",
      options: units?.map((units) => {
        // console.log(units);
        return { value: units.id, label: units.name };
      }),
    },
    { type: "image", name: "image", placeholder: "يجب عليك ادخال الصوره" },
  ];

  // Map the recipe data to match form field names
  const initialValues = {
    name: data?.name || "",
    minimum_limt: data?.minimum_limt || "",
    days_before_expire:
      data?.days_before_expire !== undefined ? data.days_before_expire : "", // Check if day_before_expire is present
    unit_id: data?.unit.id || "", // Check if unit_id is present
    image: data?.image || null, // Assuming image is present in recipe data
  };

  // console.log(initialValues);
  // console.log("Name from data:", data?.name);
  // console.log("Minimum limit from data:", data?.minimum_limt);

  return (
    <div className="form-container">
      <h1 className="form-title">تعديل تصنيف الفرعى</h1>
      {data && (
        <DynamicForm
          fields={fields}
          initialValues={initialValues}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default EditRecipes;
