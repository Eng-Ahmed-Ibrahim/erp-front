import { useParams } from "react-router-dom";
import Table from "../../../../../../components/shared/table/Table";
import ShowDataModal from "../../../../../../components/ui/ShowDataModal/ShowDataModal";
import { getRecipesById } from "../../../../../../apis/recipes/recipe";
const ShowRecipeDetails = () => {
    const { id } = useParams();
    const tableHeaders = [
        { key: "id", value: "الكود" },
        { key: "name", value: "الإسم", },
        { key: "image", value: "الصوره", type: "image" },

    ];
    const filters = [
        { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },

    ];
    return (
        <div>
            <ShowDataModal>
                <Table
                    headers={tableHeaders}
                    title="تفاصيل التصنيف الفرعى"
                    id={id}
                    filters={filters}
                    fetchData={(filters, currentPage) => getRecipesById(filters, currentPage, id)}
                    addition={{ navigate: false }}
                />
            </ShowDataModal>
        </div>
    );
};

export default ShowRecipeDetails;
