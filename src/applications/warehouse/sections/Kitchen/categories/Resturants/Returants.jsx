import React, { useEffect, useState } from "react";
import "./Resturants.scss";
import Cards from "../../../../../../components/ui/cards/Cards";

import { useNavigate } from "react-router-dom";
import { getCategories } from "../../../../../../apis/categories";

function Resturants() {


    const [data, setData] = useState([]); // Initialize data as null
    const navigate = useNavigate()
    const fetchData = async () => {
        try {
            const recipeData = await getCategories();
            setData(recipeData.data);
        } catch (error) {
            // console.log("Error fetching data:", error);
        }
    };


    useEffect(() => {

        fetchData(); // Call fetchData when component mounts
    }, []);
    const handleCardClick = (department) => {
        // Handle click action here, for example, you can log the department name
        // console.log("Clicked on department:", department);
        navigate(`/warehouse/returants/show-subCategory/${department}`)
    };

    return (
        <>
            <h1 className="heading text-center p-3">المنافذ </h1>
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

                </div>
            </div>
        </>
    );
}

export default Resturants;
