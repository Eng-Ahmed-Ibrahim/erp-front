import Table from "../../../../../../components/shared/table/Table";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  deleteRecipe,
  getRecipesById,
  getRecipes,
} from "../../../../../../apis/recipes/recipe";
import { useAuth } from "../../../../../../context/AuthContext";
import { getAllDeaprtments } from "../../../../../../apis/department";
const ShowRecipe = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  useEffect(() => {
    const fetchDepartments = async () => {
      const res = await getAllDeaprtments();
      setDepartments(res.data);
    };
    fetchDepartments();
  }, []);
  const tableHeaders = [
    { key: "name", value: "الإسم" },
    { key: "image", value: "الصوره", type: "image" },
    { key: "quantity", value: "الكميه", type: "text" },
  ];
  const filters = [
    { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
    user?.department.type === "master"
      ? {
        key: "department_id",
        type: "selection",
        id: "نوع القسم",
        placeholder: "إختار قسم لإظهار نتائج",
        options: departments.map((department) => {
          return { value: department.id, label: department.name };
        }),
      }
      : null,
  ];
  const { id } = useParams();

  const actions = [
  {
      type: `${user?.permissions.some(
        (permission) => permission.name === "edit recipe"
      )
          ? "edit"
          : ""
        }`,
      label: "تعديل",
      route: "/warehouse/recipes/recipe/:id/edit-recipes",
    },
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "edit recipe"
      )
          ? "navigate"
          : ""
        }`,
      label: "المنتجات المرتبطه",
      route: "/warehouse/recipes/recipe/:id/get-products",
    },
    
    
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "delete recipe"
      )
          ? "delete"
          : ""
        }`,
      label: "حذف",
    },
    {
      type: `${user?.permissions.some((permission) => permission.name === "add recipe")
          ? "add"
          : ""
        }`,
      label: "إضافة تصنيف فرعى",
      route: `/warehouse/recipes/recipe/add-recipes/${id}`,
    },
  ];
  const detailsHeaders = [
    { key: "type", label: "النوع", isArray: false },
    { key: "unit", label: "الوحدة", isArray: false },
    { key: "minimum_limit", label: "الحد الأدنى", isArray: false },
  ];
  return (
    <div>
      <Table
        headers={tableHeaders}
        detailsHeaders={detailsHeaders}
        filters={filters}
        actions={actions}
        deleteFn={deleteRecipe}
        showFn={(id, setIsLoading) => getRecipesById(id, setIsLoading)}
        title="التصنيف الفرعى"
        id={id}
        fetchData={(filters, id, setIsLoading) =>
          getRecipes(filters, id, setIsLoading)
        }
      />
    </div>
  );
};

export default ShowRecipe;
