import Table from "../../../../../../components/shared/table/Table";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  deleteRecipeSubCategory,
  getRecipeSubCategory,
} from "../../../../../../apis/recipes/recipeSubCategory";
import { useAuth } from "../../../../../../context/AuthContext";
const ShowRecipesSubCategory = () => {
  const { user } = useAuth();
  const tableHeaders = [
    {
      key: "name",
      value: "الإسم",
      clickable: true,
      route: "/warehouse/recipes/recipe/show-recipe/:id",
    },
    { key: "image", value: "الصوره", type: "image" },
  ];
  const filters = [
    { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
  ];
  const { id } = useParams();
  const actions = [
    {
      type: `${user?.permissions.some((permission) => permission.name === "edit recipe_category_parent")
        ? "edit"
        : ""
        }`,
      label: "تعديل",
      route: "/warehouse/recipes/subCategory/:id/edit-recipes",
    },
    {
      type: `${user?.permissions.some((permission) => permission.name === "delete recipe_category_parent")
        ? "delete"
        : ""
        }`,
      label: "حذف",
    },
    {
      type: `${user?.permissions.some((permission) => permission.name === "create recipe_category_parent")
        ? "add"
        : ""
        }`,
      label: "إضافة تصنيف رئيسى",
      route: `/warehouse/recipes/subCategory/add-recipes/${id}`,
    },
  ];
  return (
    <div>
      <Table
        headers={tableHeaders}
        filters={filters}
        title="التصنيف الرئيسى"
        actions={actions}
        id={id}
        fetchData={(filters, id, setIsLoading) =>
          getRecipeSubCategory(filters, id, setIsLoading)
        }
        deleteFn={deleteRecipeSubCategory}
      />
    </div>
  );
};

export default ShowRecipesSubCategory;
