import React, { useEffect, useState } from "react";
import "./Departments.scss";
import Cards from "../../../../../components/ui/cards/Cards";
import { getRecipeCategoryParent } from "../../../../../apis/recipes/recipeCategoryParent";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useAuth } from "../../../../../context/AuthContext";
function Departments() {
  const { user } = useAuth();
  const [data, setData] = useState([]); // Initialize data as null
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const fetchData = async () => {
    try {
      const recipeData = await getRecipeCategoryParent({}, "", setIsLoading);
      setData(recipeData.data);
    } catch (error) {
      // console.log("Error fetching data:", error);
    }
  };

  const handleAddDepartment = () => {
    navigate("/warehouse/recipes/add-recipes-parent");
  };
  const handleSearchDepartment = () => {
    navigate("/warehouse/recipes/show-recipes");
  };
  useEffect(() => {
    fetchData(); // Call fetchData when component mounts
  }, []);
  const handleCardClick = (department) => {
    // Handle click action here, for example, you can log the department name
    // console.log("Clicked on department:", department);
    navigate(
      `/warehouse/recipes/subCategory/show-recipe-subcategory/${department}`
    );
  };

  return (
    <>
      <h1 className="heading text-center p-3">اقسام المخزن </h1>
      <div className="btn-container">
        {user?.permissions.some(
          (permission) => permission.name === "create recipe_category_parent"
        ) && (
            <button className="dept-btn" onClick={handleAddDepartment}>
              +اضافة قسم
            </button>
          )}
        {user?.permissions.some(
          (permission) => permission.name === "view recipe_categories"
        ) && (
            <button className="dept-btn" onClick={handleSearchDepartment}>
              +بحث عن قسم
            </button>
          )}
      </div>
      <div className="cards-container">
        <div className="row">
          {data.map((department, index) => (
            <Cards
              key={index}
              img={department.image}
              department={department.name}
              onClick={() => handleCardClick(department.id)}
            />
          ))}
          {isLoading && (
            <>
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 56 }} spin />}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Departments;
