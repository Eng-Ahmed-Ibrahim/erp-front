import React, { useState, useEffect, useRef } from 'react';
import { Select, Pagination, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { API_ENDPOINT } from '../../../../../../config';
import {
  getInventoryArchiveReport,
  getAvailableCaptureDates,
  getAllRicipes,
} from '../../../../../apis/reports';
import { getAllDeaprtments } from '../../../../../apis/apis/department';
import { getRecipeCategoryParent } from '../../../../../apis/recipes/recipeCategoryParent';
import { set } from 'date-fns';

const InventoryArchiveTable = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterValues, setFilterValues] = useState({});

  // Filter data states
  const [departments, setDepartments] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [recipeCategories, setRecipeCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const tableRef = useRef();

  // Fetch filter data on component mount
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch departments
        const departmentsData = await getAllDeaprtments();
        setDepartments(departmentsData.data || []);

        // Fetch parent categories
        const parentCategoriesData = await getRecipeCategoryParent({}, '');
        setParentCategories(parentCategoriesData.data || []);

        // // Fetch recipes
        // const recipesData = await getAllRicipes({}, '', () => {});
        // setRecipes(recipesData.data || []);

        // Fetch available capture dates
        const datesData = await getAvailableCaptureDates();
        setAvailableDates(datesData.data || []);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchFilterData();
  }, []);

  // Fetch recipe categories when parent category changes
  useEffect(() => {
    const fetchRecipeCategories = async (parentId) => {
      if (!parentId) {
        setRecipeCategories([]);
        return;
      }
      try {
        const response = await fetch(
          `${API_ENDPOINT}/api/v1/store/recipe_category/allById/${parentId}`,
          {
            headers: {
              Authorization: `Bearer ${
                localStorage.getItem('token') || sessionStorage.getItem('token')
              }`,
            },
          }
        );
        const data = await response.json();
        setRecipeCategories(data.data || []);
      } catch (error) {
        console.error('Error fetching recipe categories:', error);
        setRecipeCategories([]);
      }
    };

    fetchRecipeCategories(selectedParentCategory);
  }, [selectedParentCategory]);

  // Fetch recipeW when  category changes
  useEffect(() => {
    const fetchRecipes = async (categoryId) => {
      if (!categoryId) {
        setRecipes([]);
        return;
      }
      try {
        const response = await fetch(
          `${API_ENDPOINT}/api/v1/store/recipe/filter_by_category/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${
                localStorage.getItem('token') || sessionStorage.getItem('token')
              }`,
            },
          }
        );
        const recipesData = await response.json();
        setRecipes(recipesData.data || []);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setRecipes([]);
      }
    };

    fetchRecipes(selectedCategory);
  }, [selectedCategory]);

  // Fetch data when filters or page changes
  useEffect(() => {
    fetchData();
  }, [filterValues, currentPage]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await getInventoryArchiveReport(
        { ...filterValues, page: currentPage },
        '',
        setIsLoading
      );

      if (result && result.data) {
        setData(result.data?.data);
        setTotalItems(result.pagination?.total || 0);
      } else {
        setData([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setTotalItems(0);
    }
  };

  const handleFilterChange = (key, value) => {
    // Handle parent category change
    if (key === 'parent_category_id') {
      setSelectedParentCategory(value);
      setRecipeCategories([]);
      setRecipes([]);
      // Clear recipe category filter
      setFilterValues((prev) => ({
        ...prev,
        [key]: value,
        recipe_category_id: '',
      }));
    } else if (key === 'recipe_category_id') {
      setSelectedCategory(value);
      setRecipes([]);

      setFilterValues((prev) => ({
        ...prev,
        [key]: value,
        recipe_id: '',
      }));
    } else {
      setFilterValues((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h2
        className="heading text-center mb-4"
        style={{
          color: '#FFFFF',
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '30px',
          textShadow: '0 2px 4px rgba(128, 61, 59, 0.1)',
        }}
      >
        تقرير أرشيف المخزون
      </h2>

      {/* Filters Section */}
      <div
        className="mb-4"
        style={{
          padding: '0',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            alignItems: 'end',
            width: '100%',
          }}
        >
          {/* Department Filter */}
          <div>
            <label
              className="form-label fw-bold"
              style={{
                color: 'var(--brown-color)',
                fontSize: '16px',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              القسم
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر القسم"
              value={filterValues.department_id}
              onChange={(value) => handleFilterChange('department_id', value)}
              options={departments.map((dept) => ({
                value: dept.id,
                label: dept.name,
              }))}
              allowClear
            />
          </div>

          {/* Parent Category Filter */}
          <div>
            <label
              className="form-label fw-bold"
              style={{
                color: 'var(--brown-color)',
                fontSize: '16px',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              التصنيف الرئيسي
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر التصنيف الرئيسي"
              value={filterValues.parent_category_id}
              onChange={(value) =>
                handleFilterChange('parent_category_id', value)
              }
              options={parentCategories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
              allowClear
            />
          </div>

          {/* Sub Category Filter */}
          <div>
            <label
              className="form-label fw-bold"
              style={{
                color: 'var(--brown-color)',
                fontSize: '16px',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              التصنيف الفرعى
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر التصنيف الفرعى"
              value={filterValues.recipe_category_id}
              onChange={(value) =>
                handleFilterChange('recipe_category_id', value)
              }
              options={recipeCategories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
              disabled={!selectedParentCategory}
              allowClear
            />
          </div>

          {/* Recipe Filter */}
          <div>
            <label
              className="form-label fw-bold"
              style={{
                color: 'var(--brown-color)',
                fontSize: '16px',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              المكون
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر المكون"
              value={filterValues.recipe_id}
              onChange={(value) => handleFilterChange('recipe_id', value)}
              options={recipes.map((recipe) => ({
                value: recipe.id,
                label: recipe.name,
              }))}
              allowClear
              disabled={!selectedCategory}
            />
          </div>

          {/* Capture Date Filter */}
          <div>
            <label
              className="form-label fw-bold"
              style={{
                color: 'var(--brown-color)',
                fontSize: '16px',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              التاريخ 
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر التاريخ "
              value={filterValues.capture_date}
              onChange={(value) => handleFilterChange('capture_date', value)}
              options={availableDates.map((date) => ({
                value: date,
                label: date,
              }))}
              allowClear
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div
        style={{
          backgroundColor: 'var(--light-color)',
          borderRadius: '5',
          // boxShadow: '0 8px 32px rgba(128, 61, 59, 0.15)',
          overflow: 'hidden',
          // border: '2px solid var(--beige-color)',
          marginTop: '50px',
        }}
      >
        <div
          style={{
            // height: '70vh',
            overflow: 'auto',
            backgroundColor: 'var(--light-color)',
          }}
        >
          <table
            ref={tableRef}
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
            }}
          >
            <thead
              style={{
                position: 'sticky',
                top: 0,
                background: '#AF8260',
              }}
            >
              <tr>
                <th
                  style={{
                    padding: '12px 8px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    color: 'var(--light-color)',
                    fontSize: '16px',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    padding: '12px 8px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    color: 'var(--light-color)',
                    fontSize: '16px',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  القسم
                </th>
                <th
                  style={{
                    padding: '12px 8px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    color: 'var(--light-color)',
                    fontSize: '16px',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  التصنيف الرئيسي
                </th>
                <th
                  style={{
                    padding: '12px 8px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    color: 'var(--light-color)',
                    fontSize: '16px',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  التصنيف الفرعى
                </th>
                <th
                  style={{
                    padding: '12px 8px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    color: 'var(--light-color)',
                    fontSize: '16px',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  اسم المكون
                </th>
                <th
                  style={{
                    padding: '12px 8px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    color: 'var(--light-color)',
                    fontSize: '16px',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  الكميه الموجوده
                </th>
                <th
                  style={{
                    padding: '12px 8px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    color: 'var(--light-color)',
                    fontSize: '16px',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  السعر
                </th>
                <th
                  style={{
                    padding: '12px 8px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    color: 'var(--light-color)',
                    fontSize: '16px',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  الوحده
                </th>
                <th
                  style={{
                    padding: '12px 8px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    color: 'var(--light-color)',
                    fontSize: '16px',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  التاريخ 
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 && !isLoading ? (
                data.map((item, index) => (
                  <tr
                    key={item.id}
                    className="fw-bold fs-4"
                    style={{
                      backgroundColor:
                        index % 2 === 0
                          ? 'var(--light-color)'
                          : 'rgba(175, 130, 96, 0.05)',
                      transition: 'var(--default-transition)',
                      borderBottom: '1px solid rgba(175, 130, 96, 0.2)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) =>
                      (e.target.closest('tr').style.backgroundColor =
                        'rgba(175, 130, 96, 0.1)')
                    }
                    onMouseLeave={(e) =>
                      (e.target.closest('tr').style.backgroundColor =
                        index % 2 === 0
                          ? 'var(--light-color)'
                          : 'rgba(175, 130, 96, 0.05)')
                    }
                  >
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        border: '1px solid rgba(175, 130, 96, 0.2)',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      {index + 1 + (currentPage - 1) * 10}
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        border: '1px solid rgba(175, 130, 96, 0.2)',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      {item.department?.name || 'لا يوجد'}
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        border: '1px solid rgba(175, 130, 96, 0.2)',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      {item.parent_category?.name || 'لا يوجد'}
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        border: '1px solid rgba(175, 130, 96, 0.2)',
                        fontSize: '16px',
                        fontWeight: '600',
                      }}
                    >
                      {item.category?.name || 'لا يوجد'}
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        border: '1px solid rgba(175, 130, 96, 0.2)',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      {item.recipe?.name || 'لا يوجد'}
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        border: '1px solid rgba(175, 130, 96, 0.2)',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      {item.quantity || '0'}
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        border: '1px solid rgba(175, 130, 96, 0.2)',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      {item.price ? `${item.price} جنيه` : '0 جنيه'}
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        border: '1px solid rgba(175, 130, 96, 0.2)',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      {item.unit?.name || 'لا يوجد'}
                    </td>
                    <td
                      style={{
                        padding: '12px 8px',
                        textAlign: 'center',
                        border: '1px solid rgba(175, 130, 96, 0.2)',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      {item.captured_at || 'لا يوجد'}
                    </td>
                  </tr>
                ))
              ) : data.length === 0 && !isLoading ? (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      textAlign: 'center',
                      padding: '40px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    لا توجد بيانات للعرض
                  </td>
                </tr>
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      textAlign: 'center',
                      padding: '40px',
                    }}
                  >
                    <Spin
                      indicator={
                        <LoadingOutlined
                          style={{ fontSize: 24, color: 'var(--brown-color)' }}
                          spin
                        />
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalItems > 0 && !isLoading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '40px',
            padding: '25px',
            backgroundColor: 'rgba(175, 130, 96, 0.05)',
            borderRadius: '20px',
            border: '2px solid var(--beige-color)',
            boxShadow: '0 8px 32px rgba(128, 61, 59, 0.1)',
          }}
        >
          <Pagination
            current={currentPage}
            onChange={handlePageChange}
            total={totalItems}
            pageSize={10}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} من ${total} عنصر`
            }
            style={{
              '--ant-pagination-item-bg': 'var(--light-color)',
              '--ant-pagination-item-border-color': 'var(--beige-color)',
              '--ant-pagination-item-color': 'var(--brown-color)',
              '--ant-pagination-item-active-bg': 'var(--brown-color)',
              '--ant-pagination-item-active-border-color': 'var(--brown-color)',
              '--ant-pagination-item-hover-bg': 'var(--light-beige-color)',
              '--ant-pagination-item-hover-border-color': 'var(--beige-color)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default InventoryArchiveTable;
