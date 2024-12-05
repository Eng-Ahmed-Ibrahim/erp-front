import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  eidtRecipes,
  getRecipesById,
  getUnits,
} from "../../../../../../apis/recipes/recipe";
import DynamicForm from "../../../../../../components/shared/form/Form";
import { useAuth } from "../../../../../../context/AuthContext";
import { getRecipeCategoryParent } from "../../../../../../apis/recipes/recipeCategoryParent";
import { getRecipeSubCategory } from "../../../../../../apis/recipes/recipeSubCategory";

const EditRecipes = () => {
  const navigate = useNavigate();
  const [data, setData] = useState();
  const { id } = useParams();
  const { user } = useAuth();

  const handleSubmit = async (formData) => {
    await eidtRecipes(
      formData.name,
      formData.image,
      recipeParentId,
      formData.unit_id,
      formData.minimum_limt,
      formData.days_before_expire,
      id,
      formData.categories,
      formData.sub_categories
    );
    await navigate(`/warehouse/recipes/recipe/show-recipe/${recipeParentId}`);
  };

  const [units, setUnits] = useState([]);
  const [parentName, setParentName] = useState("");
  const [recipeUnit, setRecipeUnit] = useState("");
  const [recipeParentId, setRecipeParentId] = useState("");
  const [categoriesParent, setCategoriesParent] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategoryParentId, setSelectedCategoryParentId] = useState(null);
  const [subCategoryCache, setSubCategoryCache] = useState({}); // Cache for subcategories

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeData = await getRecipesById(id, user.department.id);
        setData(recipeData.data);
        setParentName(recipeData.data.recipe_category.name);
        setRecipeUnit(recipeData.data.unit);
        setRecipeParentId(recipeData.data.recipe_category.id);
      } catch (error) {
        // Handle error
      }
    };
    fetchData();
  }, [id]);

  const fields = [
    {
      type: "text",
      name: "parent",
      placeholder: parentName,
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
      options: units?.map((unit) => ({
        value: unit.id,
        label: unit.name,
      })),
    },
    { type: "image", name: "image", placeholder: "يجب عليك ادخال الصوره" },
    {
      type: "select",
      name: "categories",
      labelName: "القسم الرئيسي",
      options: categoriesParent?.map((categoryParent) => ({
        value: categoryParent.id,
        label: categoryParent.name,
        subCategories: subCategoryCache[categoryParent.id] || [] // Add this line
      })),
      handleSelectedItemId: (catParentId) => setSelectedCategoryParentId(catParentId),

    },
    {
      type: "select",
      name: "sub_categories",
      labelName: "القسم الفرعي",
      options: subCategories?.map((subCategory) => ({
        value: subCategory.id,
        label: subCategory.name,
      })),
      disabled: subCategories.length === 0
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const unitData = await getUnits();
        const categoriesParentData = await getRecipeCategoryParent({}, "");
        setUnits(unitData.data);
        setCategoriesParent(categoriesParentData.data);
      } catch (error) {
        // Handle error
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setSubCategories([]);
    const fetchSubCategories = async () => {
      if (selectedCategoryParentId) {
        // Check if we have cached data for this category
        if (subCategoryCache[selectedCategoryParentId]) {
          setSubCategories(subCategoryCache[selectedCategoryParentId]);
        } else {
          const subCategoriesData = await getRecipeSubCategory({}, selectedCategoryParentId);
          setSubCategories(subCategoriesData.data);
          // Cache the fetched subcategories
          setSubCategoryCache((prevCache) => ({
            ...prevCache,
            [selectedCategoryParentId]: subCategoriesData.data,
          }));
        }
      }
    };
    fetchSubCategories();
  }, [selectedCategoryParentId]);


  useEffect(() => {
    setSelectedCategoryParentId(data?.recipe_category?.parent_id);
  }, [data]);

  const initialValues = {
    name: data?.name || "",
    minimum_limt: data?.minimum_limt || "",
    days_before_expire: data?.days_before_expire !== undefined ? data.days_before_expire : "",
    unit_id: data?.unit.id || "",
    image: data?.image || null,
    categories: data?.recipe_category?.parent_id,
    sub_categories: data?.recipe_category?.id || "",
  };

  useEffect(
    () => {
      setSelectedCategoryParentId(data?.recipe_category?.parent_id);
    }, [data]
  )

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
