import React, { useEffect, useState } from "react";
import "./Departments.scss";
import Cards from "../../../../../components/ui/cards/Cards";
import { getRecipeCategoryParent } from "../../../../../apis/recipes/recipeCategoryParent";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useAuth } from "../../../../../context/AuthContext";
import { API_ENDPOINT } from "../../../../../../config";
import axios from 'axios'
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");

function Departments() {
  const { user } = useAuth();
  const [data, setData] = useState([]); // Initialize data as null
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
      handleSubmit();
  }, [debouncedTerm]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await  axios
      .get(`${API_ENDPOINT}/api/v1/store/searchItems?search=${debouncedTerm}`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      });

      const data = await response.json();
      setData(data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (department) => {
    // Handle click action here, for example, you can log the department name
    // console.log("Clicked on department:", department);
    navigate(
      `/warehouse/recipes/subCategory/show-recipe-subcategory/${department}?searchTerm=${searchTerm}`
    );
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   console.log(searchTerm)
  //   // try {

  //   const response = await fetch(`${API_ENDPOINT}/api/v1/searchItems?search=${searchTerm}`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${Token}`,
  //       },
  //     }
  //   );
  //    console.log("resposne", response);

  //       // .then((response) => {
  //       //   console.log("created success", response);
  //       //   message.success('تم التعديل بنجاح')
  //       //   setIsLoading(false);
  //       // });
  //   // } catch (err) {
  //   //   setIsLoading(false);

  //   //   console.log("response" + err);
  //   // }
  // };


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
              + بحث
            </button>
          )}
      </div>
      <div className="center">
        <input onChange={(e) => {
          setSearchTerm(e.target.value);
          console.log()
        }} className="filter-input" type="text" placeholder="إبحث باللإسم" value={searchTerm} />
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
          {
            data?.length === 0 && !isLoading && (<h1>لا يوجد منتجات بهذا الأسم</h1>)
          }
        </div>
      </div>
    </>
  );
}

export default Departments;
