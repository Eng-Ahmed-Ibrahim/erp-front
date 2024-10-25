import Table from "../../../../../components/shared/table/Table";

import { getAllRicipes } from "../../../../../apis/reports";

const ShowOneRecipeReport = () => {
    const tableHeaders = [
        {
            key: "name", value: "الإسم", clickable: true,
            route: "/warehouse/reports/show-reports/get-recipe-report/recipe/:id",
        },
        { key: "image", value: "الصوره", type: "image" },
    ];
    const filters = [
        { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
    ];




    return (
        <div>
            <Table
                headers={tableHeaders}

                filters={filters}


                title=" كل الاصناف الفرعية"

                fetchData={(filters, id, setIsLoading) =>
                    getAllRicipes(filters, id, setIsLoading)
                }
            />
        </div>
    );
};

export default ShowOneRecipeReport;
