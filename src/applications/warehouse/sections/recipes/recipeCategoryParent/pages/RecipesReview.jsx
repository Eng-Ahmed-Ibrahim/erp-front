import React, { useEffect, useState } from "react";
import {
  getRecipes,
  changeRecipeStatus,
} from "../../../../../../apis/recipes/recipe";
import { getRecipeCategoryParent } from "../../../../../../apis/recipes/recipeCategoryParent";
import Table from "../../../../../../components/shared/table/Table";
import { useAuth } from "../../../../../../context/AuthContext";

const RecipesReview = () => {
  const [recipeParent, setRecipeParent] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecipeParent = async () => {
      const res = await getRecipeCategoryParent({}, "", () => {});
      setRecipeParent(
        [{ label: "", value: "" }].concat(
          res.data.map((item) => {
            return { label: item.name, value: item.id };
          })
        )
      );
    };

    fetchRecipeParent();
  }, []);
  const statusOptions = [
    { value: "", label: "" },
    { value: "approved", label: "تم المراجعة" },
    { value: "pending", label: "تحت المراجعة" },
    { value: "rejected", label: "مرفوضة" },
  ];
  const tableHeaders = [
    { key: "recipe_category_parent_name", value: "التصنيف الرئيسي" },
    { key: "recipe_category_name", value: "التصنيف الفرعي" },
    { key: "name", value: "الصنف" },
    { key: "created_at", value: "تاريخ الإضافة" },
    { key: "status", value: "الحالة" },
  ];
  const detailsHeaders = [
    {
      key: "recipes",
      label: "تعديل حالة الصنف",
      isArray: true,
      isInput: true,
      details: [],
    },
  ];
  const filters = [
    {
      key: "category_parent_id",
      type: "selection",
      id: "اختر التصنيف",
      placeholder: "تصنيف الصنف",
      options: recipeParent,
    },
    {
      key: "status",
      type: "selection",
      id: "اختر الحالة",
      placeholder: "اختر الحالة",
      options: statusOptions,
    },
    { key: "from_date", type: "date", id: "من تاريخ" },
    { key: "to_date", type: "date", id: "إلى تاريخ" },
  ];

  const actionsIncoming = [
    {
      type: "show",
      label: "مراجعة",
    },
  ];

  return (
    <>
      <div className="invoice-container">
        <Table
          headers={tableHeaders}
          filters={filters}
          title="مراجعة الأصناف"
          actions={actionsIncoming}
          fetchData={(filters, id, setIsLoading) =>
            getRecipes(filters, id, setIsLoading)
          }
          detailsHeaders={detailsHeaders}
          rejectTitle={{ value: "rejected", label: "رفض" }}
          acceptTitle={{ value: "approved", label: "قبول" }}
          changeStatusFn={changeRecipeStatus}
        />
      </div>
    </>
  );
};

export default RecipesReview;
