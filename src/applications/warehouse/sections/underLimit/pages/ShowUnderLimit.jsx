import Table from "../../../../../components/shared/table/Table";
import "../../../../../components/shared/table/Table.scss";
import { getUderLimit } from "../../../../../apis/underLimit";
import { useAuth } from "../../../../../context/AuthContext";
import { getRecipeCategoryParent } from "../../../../../apis/recipes/recipeCategoryParent";
import React, { useState, useEffect } from "react";

const ShowUnderLimit = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeData = await getRecipeCategoryParent({},"");
        setCategories(recipeData.data);
      } catch (error) {}
    };

    fetchData();
  }, []);

  const tableHeaders = [
    { key: "recipe_parent_name", value: "التصنيف الفرعى " },
    { key: "recipe_category_name", value: "التصنيف الفرعى " },
    { key: "name", value: "التصنيف الفرعى " },
    // { key: "recipe_category", nestedKey: "name", value: " التصنيف الرئيسى " },
    { key: "unit_name", value: "الوحدة " },
    { key: "minimum_limt", value: "كمية حد الأمان " },

    { key: "department_store_quantity", value: "كمية المخزن " },
  ];
  const filters = [
    { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
    {
      key: "category_id",
      type: "selection",
      id: "نوع الصنف",
      placeholder: "إختار نوع الصنف ",
      options: categories.map((category) => {
        return { value: category?.id, label: category?.name };
      }),
    },
  ];

  return (
    <div>
      <Table
        headers={tableHeaders}
        title="حد الامان"
        filters={filters}
        fetchData={async (filterValues, id) =>
          getUderLimit(filterValues, user.department.id)
        }
      />
    </div>
  );
};

export default ShowUnderLimit;
