import Table from "../../../../../components/shared/table/Table";
import "../../../../../components/shared/table/Table.scss";
import { getDeaprtments } from "../../../../../apis/department";

const ShowDepartmentsForCategoryReport = () => {
   
    const tableHeaders = [
        { key: "code", value: "الكود" },
        {
            key: "name", 
            value: " الاسم ", 
            clickable: true,
            route: "/warehouse/reports/show-reports/category-inventory/:id",
        },
    ];
    
    const filters = [
        { key: "name", type: "text", placeholder: "إبحث بالإسم", id: "الإسم" },
    ];

    return (
        <div>
            <Table
                headers={tableHeaders}
                title="الأقسام - تقرير المخزون حسب التصنيفات"
                filters={filters}
                fetchData={(filterValues, currentPage, setIsLoading) =>
                    getDeaprtments(filterValues, currentPage, setIsLoading, false)
                }
            />
        </div>
    );
};

export default ShowDepartmentsForCategoryReport;

