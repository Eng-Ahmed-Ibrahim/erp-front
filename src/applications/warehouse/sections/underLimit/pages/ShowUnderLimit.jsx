import Table from "../../../../../components/shared/table/Table";
import "../../../../../components/shared/table/Table.scss";
import { getUderLimit } from "../../../../../apis/underLimit";
import { useAuth } from "../../../../../context/AuthContext";
const ShowUnderLimit = () => {
    const { user } = useAuth()
    const tableHeaders = [

        { key: "name", value: "التصنيف الفرعى " },
        // { key: "recipe_category", nestedKey: "name", value: " التصنيف الرئيسى " },
        { key: "unit", nestedKey: "name", value: "الوحدة " },

        { key: "quantity", value: "الكمية المتبقية  " },
    ];
    const filters = [
        { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },

    ];



    return (
        <div>
            <Table
                headers={tableHeaders}
                title="حد الامان"
                filters={filters}
                fetchData={(filterValues, id) =>
                    getUderLimit(filterValues, user.department.id)
                }
            />
        </div>
    );
};

export default ShowUnderLimit;
