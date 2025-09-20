import Table from '../../../../../components/shared/table/Table';
import { useState, useEffect } from 'react';
import { getAllRicipes } from '../../../../../apis/reports';
import { getAllDepartments } from '../../../../../apis/departments';
import { getRecipeCategoryParent } from '../../../../../apis/recipes/recipeCategoryParent';

const ShowOneRecipeReport = () => {
  const [recipeCategoryParents, setRecipeCategoryParents] = useState([]);
  const tableHeaders = [
    {
      key: 'recipe_category_parent_name',
      value: 'التصنيف الرئيسي',
      clickable: true,
      route: '/warehouse/reports/show-reports/get-recipe-report/recipe/:id',
    },
    {
      key: 'recipe_category_name',
      value: 'التصنيف الفرعي',
      clickable: true,
      route: '/warehouse/reports/show-reports/get-recipe-report/recipe/:id',
    },
    {
      key: 'name',
      value: 'الإسم',
      clickable: true,
      route: '/warehouse/reports/show-reports/get-recipe-report/recipe/:id',
    },
    { key: 'image', value: 'الصوره', type: 'image' },
  ];

  // Fetch data for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch recipe category parents
        const categoryParentsResponse = await getRecipeCategoryParent(
          {},
          null,
          () => {}
        );
        if (categoryParentsResponse?.data) {
          setRecipeCategoryParents(
            categoryParentsResponse.data.map((parent) => ({
              value: parent.id,
              label: parent.name,
            }))
          );
        }

        // Recipe categories will be fetched when a parent category is selected
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchFilterData();
  }, []);

  const filters = [
    {
      key: 'category_parent_id',
      type: 'selection',
      placeholder: 'اختر التصنيف الرئيسي',
      id: 'التصنيف الرئيسي',
      options: recipeCategoryParents,
    },
    { key: 'name', type: 'text', placeholder: 'إبحث بإسم الصنف', id: 'الإسم' },
  ];

  return (
    <div>
      <Table
        headers={tableHeaders}
        filters={filters}
        title=" كل الاصناف الفرعية"
        fetchData={(filters, id, setIsLoading) =>
          getAllRicipes(filters, id, setIsLoading)
        }
      />
    </div>
  );
};

export default ShowOneRecipeReport;
