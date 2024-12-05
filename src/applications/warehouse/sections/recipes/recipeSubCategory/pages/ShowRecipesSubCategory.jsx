import SubCategoryTable from "../../../../../../components/shared/table/SubCategoryTable";
import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  deleteRecipeSubCategory,
  getRecipeSubCategory,
} from "../../../../../../apis/recipes/recipeSubCategory";
import { useAuth } from "../../../../../../context/AuthContext";
const ShowRecipesSubCategory = () => {
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get('searchTerm');
  const [searchOfSubCategory, setSearchOfSubCategory] = useState(searchTerm)
  const tableHeaders = [
    {
      key: "name",
      value: "الإسم",
      clickable: true,
      route: `/warehouse/recipes/recipe/show-recipe/:id?searchTerm=${searchOfSubCategory}`,
    },
    { key: "image", value: "الصوره", type: "image" },
  ];

  const filters = [
    { 
      key: "name",
      type: "text",
      placeholder: "إبحث باللإسم", 
      id: "الإسم",
      handleInputChange: (term) => {
        console.log("Term: ", term)
        setSearchOfSubCategory(term);
        searchParams.set("searchTerm", term)
      }
     },
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
  const [filterValues, setFilterValues] = useState({ name: searchOfSubCategory || "" });
  useEffect(() => {
    setFilterValues((prev) => ({ ...prev, name: searchOfSubCategory || "" }));
  }, [searchTerm]);


  return (
    <div>
      <SubCategoryTable
        headers={tableHeaders}
        filters={filters}
        title="التصنيف الرئيسى"
        actions={actions}
        id={id}
        fetchData={(filters, id, setIsLoading) =>
          getRecipeSubCategory({ ...filters, searchOfSubCategory }, id, setIsLoading)
        }
        filterValues={filterValues} 
        setFilterValues={setFilterValues}
        deleteFn={deleteRecipeSubCategory}
      />
    </div>
  );
};

export default ShowRecipesSubCategory;
