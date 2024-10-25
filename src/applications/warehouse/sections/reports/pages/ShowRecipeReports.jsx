import Table from "../../../../../components/shared/table/Table";
import { useParams } from "react-router-dom";
import { getRcipeReports } from "../../../../../apis/reports";

const ShowRecipeReports = () => {
    const tableHeaders = [

        { key: "name", value: "الإسم" },
        { key: "total_quantity", value: "الكميه الموجوده" },
        { key: "minimum_limt", value: "حد الامان" },
        { key: "returned", value: "المرتجع" },
        { key: "out_going", value: "المصروف للقسم" },

        { key: "image", value: "الصوره", type: "image" },
    ];
    // const filters = [
    //     { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
    // ];
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
                fetchData={(filters, id, setIsLoading) =>
                    getRcipeReports(filters, id, setIsLoading)
                }
            />
        </div>
    );
};

export default ShowRecipeReports;
