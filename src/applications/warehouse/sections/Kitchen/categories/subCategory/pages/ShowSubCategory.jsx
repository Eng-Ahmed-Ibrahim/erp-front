import Table from "../../../../../../../components/shared/table/Table";
import { useParams } from "react-router-dom";
import {
  deleteSubCategory,
  getSubCategoryFilterById,
} from "../../../../../../../apis/subCategory";
import { useAuth } from "../../../../../../../context/AuthContext";
const ShowSubCategory = () => {
  const { user } = useAuth();
  const tableHeaders = [

    {
      key: "name",
      value: "الإسم",
      clickable: true,
      route: "/warehouse/returants/subcategory/show-product/:id",
    },
    { key: "image", value: "الصوره", type: "image" },
  ];
  const filters = [
    { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
  ];
  const { id } = useParams();
  const actions = [
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "edit sub_category"
      )
          ? "edit"
          : ""
        }`,
      label: "تعديل",
      route: "/warehouse/returants/subCategory/:id/edit-subCategory",
    },
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "delete sub_category"
      )
          ? "delete"
          : ""
        }`,
      label: "حذف",
    },
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "add sub_category"
      )
          ? "add"
          : ""
        }`,
      label: "إضافة قسم فرعى",
      route: `/warehouse/returants/add-subcategory/${id}`,
    },
  ];
  return (
    <div>
      <Table
        headers={tableHeaders}
        filters={filters}
        title="اقسام المنتجات"
        actions={actions}
        id={id}
        fetchData={(filters, currentPage) =>
          getSubCategoryFilterById(filters, currentPage, id)
        }
        deleteFn={deleteSubCategory}
      />
    </div>
  );
};

export default ShowSubCategory;
