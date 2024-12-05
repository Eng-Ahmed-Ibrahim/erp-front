import Table from "../components/shared/table/Table";
import { useParams } from "react-router-dom";
import { getAllinvoicesOutGoing } from "../apis/reports";
import React, { useEffect, useState } from "react";
import { getAllDeaprtments } from "../apis/department";
import {getRecipeCategoryParent} from "../apis/recipes/recipeCategoryParent"
const ShowRecipesFromAllDepartments = () => {
    const [RecipeCategoryParent, setRecipeCategoryParent] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
       
        const fetchRecipeCategoryParent = async () => {
          const res = await getRecipeCategoryParent({}, "", setIsLoading);
          console.log(`shshhs`,res)
          setRecipeCategoryParent(res.data);
        };
        fetchRecipeCategoryParent();
      }, []);
    const tableHeaders = [

        { key: "name", value: "الإسم" },
        { key: "out_going", value: "اجمالي المصروف من المخزن " },
        { key: "total_returned_from", value: "مرتجع اليه" },
        {key:"total_returned_to",value:"مرتجع منه"},
        { key: "price", value: "متوسط السعر" },
        { key: "total_quantity", value: "اجمالي الكميه بعد المرتجع " },
    ];
    const id  = "01hy3km07mf7fafqn2j6388d1t" ;
    const filters = [
        { key: "from_date", type: "date", id: "من تاريخ" },
        { key: "to_date", type: "date", id: "إلى تاريخ" },
        { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
        {
            key: "category_id",
            type: "selection",
            id: "نوع القسم",
            placeholder: "إختار قسم لإظهار نتائج",
            options: RecipeCategoryParent.map((category) => {
              return { value: category.id, label: category.name };
            }),
          },


    ];
    return (
        <div>
            <Table
                headers={tableHeaders}
                title="تقارير المكونات"
                id="01hy3km07mf7fafqn2j6388d1t"
                filters={filters}
                fetchData={(filters, id, setIsLoading) =>
                    getAllinvoicesOutGoing(filters, id, setIsLoading)
                }
                                    
                getTotalPrice={async (filters, id, setIsLoading) => {
                    const data = await getAllinvoicesOutGoing(filters, id, setIsLoading)
                    return data.total_price;
                }
            }
            />
        </div>
    );
};
//seif
export default ShowRecipesFromAllDepartments;
