import Table from "../../../../../components/shared/table/Table";
import { useParams } from "react-router-dom";
import { getReportOfRecipe } from "../../../../../apis/reports";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../context/AuthContext";

const OneRecipeReport = () => {
    const [reportData, setReportData] = useState({ quintity: "", totalPrice: "" })
    const tableHeaders = [
        { key: "code", value: "الكود" },
        { key: "type", value: "نوع الفاتوره" },
        { key: "total_price", value: " اجمالى السعر" },
        { key: "date", value: " تاريخ الفاتورة" },
        { key: "quantity", value: " الكميه فى الفاتورة" },
        { key: "supplier", nestedKey: "name", value: "اسم المورد " },
        { key: "from", nestedKey: "name", value: "من " },
        { key: "to", nestedKey: "name", value: "الى " },
    ];
    const filters = [
        { key: "from_date", type: "date", id: "من تاريخ" },
        { key: "to_date", type: "date", id: "إلى تاريخ" },
    ];

    // const actions = [

    //     {
    //         type: "add",
    //         label: `اجمالى الكميه :${reportData.quintity} -اجمالى السعر :${reportData.totalPrice} `,
    //     },
    // ];
    const { id } = useParams();

    useEffect(() => {
        const fetchDataSuppliers = async () => {
            try {
                const data = await getReportOfRecipe({}, id, () => { }, user.department.id);
                setReportData({ quintity: data.data[0].totalQuantity, totalPrice: data.data[0].total });

            } catch (error) {
                // console.log("Error fetching data:", error);
            }
        };

        fetchDataSuppliers();
    }, []);

    const { user } = useAuth()

    return (
        <div>
            <div>
                <p>اجمالى الكميه : {reportData.quintity}</p>
                <p>
                    اجمالى السعر : {reportData.totalPrice}
                </p>

            </div>
            <Table
                headers={tableHeaders}

                title=" تقرير المكون"
                id={id}

                filters={filters}
                fetchData={(filters, id, setIsLoading) =>
                    getReportOfRecipe(filters, id, setIsLoading, user.department.id)
                }
            />
            {/* {reportData.quintity}
            {reportData.totalPrice} */}
        </div>
    );
};

export default OneRecipeReport;
