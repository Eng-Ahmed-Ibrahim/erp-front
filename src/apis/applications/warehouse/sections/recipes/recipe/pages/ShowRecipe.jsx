import SubCategoryTable from "../../../../../../components/shared/table/SubCategoryTable";
import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  deleteRecipe,
  getRecipesById,
  getRecipes,
} from "../../../../../../apis/recipes/recipe";
import { useAuth } from "../../../../../../context/AuthContext";
import { getAllDeaprtments } from "../../../../../../apis/department";
const ShowRecipe = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get('searchTerm');

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
          options: departments.map(department => ({
            value: department.id,
            label: department.name
          })),
        }
      : null,
  ].filter(Boolean); // Filter out nulls


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
  
  const initialFilterValues = filters.reduce((acc, filter) => {
    acc[filter.key] = ""; // Initialize with empty string or appropriate default
    return acc;
  }, { name: searchTerm || "" });

  const [filterValues, setFilterValues] = useState({ name: searchTerm || "" });

  useEffect(() => {
    // Update filter values when searchTerm changes
    setFilterValues(prev => ({ ...prev, name: searchTerm || "" }));
  }, [searchTerm]);

  const handleFilterChange = (key, value) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <SubCategoryTable
        headers={tableHeaders}
        detailsHeaders={detailsHeaders}
        filters={filters.map(filter => ({
          ...filter,
          onChange: handleFilterChange // Attach onChange handler
        }))}
        actions={actions}
        deleteFn={deleteRecipe}
        showFn={(id, setIsLoading) => getRecipesById(id, setIsLoading)}
        title="التصنيف الفرعى"
        id={id}
        fetchData={(filters, id, setIsLoading) =>
          getRecipes(filters, id, setIsLoading)
        }
        filterValues={filterValues}
        setFilterValues={setFilterValues}
      />
    </div>
  );
};

export default ShowRecipe;
