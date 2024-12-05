import Table from "../../../../../components/shared/table/Table";
import { useParams } from "react-router-dom";
import { getRcipeReports, getTotalForSupplierReports } from "../../../../../apis/reports";

const ShowRecipesForSupplier = () => {
    const tableHeaders = [

        { key: "name", value: "الإسم" },
        { key: "total_quantity", value: "الكميه الوارده" },
        // { key: "minimum_limt", value: "حد الامان" },

        { key: "image", value: "الصوره", type: "image" },
    ];
    const filters = [
        { key: "from_date", type: "date", id: "من تاريخ" },
        { key: "to_date", type: "date", id: "إلى تاريخ" },
    ];
    const { id } = useParams();

    // const detailsHeaders = [
    //     { key: "type", label: "النوع", isArray: false },
    //     { key: "unit", label: "الوحدة", isArray: false },
    //     { key: "minimum_limit", label: "الحد الأدنى", isArray: false },
    // ];
    return (
        <div>
            <Table
                headers={tableHeaders}

                title="تقارير المكونات"
                id={id}
                filters={filters}
                fetchData={(filters, id, setIsLoading) =>
                    getTotalForSupplierReports(filters, id, setIsLoading)
                }
            />
        </div>
    );
};

export default ShowRecipesForSupplier;
