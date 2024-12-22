import Table from "../../../../../components/shared/table/Table";
import "../../../../../components/shared/table/Table.scss";
import { deleteDeaprtment, getDeaprtments } from "../../../../../apis/department";
import { useLocation } from "react-router-dom";


const ShowDepartmentsProducts = () => {
   
    const tableHeaders = [
        { key: "code", value: "الكود" },
        {
        key: "name", value: " الاسم ", clickable: true,
        route: "order-products/:id",
        },
        // { key: "total_invoices_price", value: "إجمالي سعر الفواتير" },
    ];


    const filters = [
        { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
        { key: "from_date", type: "date", id: "من تاريخ" },
        { key: "to_date", type: "date", id: "إلى تاريخ" },

    ];

    return (
        <div>
            <Table
                headers={tableHeaders}
                title=" الاقسام"
                filters={filters}

                fetchData={(filters, currentPage, setIsLoading) =>
                    getDeaprtments(filters, currentPage, setIsLoading)
                }
            />
        </div>
    );
};

export default ShowDepartmentsProducts;
