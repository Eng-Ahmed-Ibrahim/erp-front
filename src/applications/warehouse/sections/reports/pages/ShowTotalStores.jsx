import Table from "../../../../../components/shared/table/Table";
import { getTotalStores } from "../../../../../apis/reports";

const ShowTotalStores = () => {
    const tableHeaders = [

        { key: "category", value: "التصنيف الرئيسي" },
        { key: "sub_category", value: "التصنيف الفرعى" },
        { key: "name", value: "الإسم" },
        { key: "quantity", value: "الكميه الموجوده" },
        { key: "price", value: "السعر" },
        { key: "unit", value: "الوحده", nestedKey: "name" },
    ];

    return (
        <div>
            <Table
                headers={tableHeaders}
                title="جرد  المكونات فى الدار "
                fetchData={(filters, id, setIsLoading) =>
                 getTotalStores(filters, id, setIsLoading)
                }
            />
        </div>
    );
};

export default ShowTotalStores;
