import Table from "../../../../../components/shared/table/Table";
import "../../../../../components/shared/table/Table.scss";
import { deleteDeaprtment, getDeaprtments } from "../../../../../apis/department";
import { useLocation } from "react-router-dom";
const ShowDepartmentsForBalance = () => {
   
    const tableHeaders = [
        { key: "code", value: "الكود" },
        {
        key: "name", value: " الاسم ", clickable: true,
        route: "/warehouse/reports/show-reports/inventory-balance/:id",
        },

    ];
    const filters = [
        { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },

    ];

    return (
        <div>
            <Table
                headers={tableHeaders}
                title=" الاقسام"
                filters={filters}

                fetchData={(filterValues, currentPage, setIsLoading) =>
                    getDeaprtments(filterValues, currentPage, setIsLoading)
                }
            />
        </div>
    );
};

export default ShowDepartmentsForBalance;
