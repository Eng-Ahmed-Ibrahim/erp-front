import Table from "../../../../../../components/shared/table/Table";
import {
  deleteRecipeSubCategoryParent,
  getRecipeCategoryParent,
} from "../../../../../../apis/recipes/recipeCategoryParent";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../../../context/AuthContext";
const ShowRecipesCategoryParent = () => {
  const { user } = useAuth();
  const tableHeaders = [

    { key: "name", value: "الإسم" },
    { key: "image", value: "الصوره", type: "image" },
  ];

  const actions = [
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "edit recipe_category_parent"
      )
          ? "edit"
          : ""
        }`,
      label: "تعديل",
      route: "/warehouse/recipes/edit-recipes-parent/:id",
    },
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "delete recipe_category_parent"
      )
          ? "delete"
          : ""
        }`,
      label: "حذف",
    },
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "create recipe_category_parent"
      )
          ? "add"
          : ""
        }`,
      label: "إضافة قسم المخزن",
      route: `/warehouse/recipes/add-recipes-parent`,
    },
  ];
  const filters = [{ key: "name", type: "text", placeholder: "إبحث باللإسم" }];
  return (
    <div>
      <Table
        headers={tableHeaders}
        filters={filters}
        title="القسم"
        actions={actions}
        fetchData={(filters, id, setIsLoading) =>
          getRecipeCategoryParent(filters, id, setIsLoading)
        }
        deleteFn={deleteRecipeSubCategoryParent}
      />
    </div>
  );
};

export default ShowRecipesCategoryParent;
