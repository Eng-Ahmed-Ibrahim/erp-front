import Table from "../../../../../../../components/shared/table/Table";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  deleteProduct,
  getProductsFilterById,
  getProductsById,
} from "../../../../../../../apis/product";
import { useAuth } from "../../../../../../../context/AuthContext";
const ShowProduct = () => {
  const { user } = useAuth();
  const tableHeaders = [

    { key: "name", value: "الإسم" },
    { key: "price", value: "السعر" },
    
    { key: "image", value: "الصوره", type: "image" },
    { key: "status", value: "الحالة" },
  ];
  const filters = [
    { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
  ];
  const { id } = useParams();

  const actions = [
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "edit product"
      )
        ? "edit"
        : ""
        }`,
      label: "تعديل",
      route: "/warehouse/returants/subcategory/:id/edit-product",
    },

    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "delete product"
      )
        ? "delete"
        : ""
        }`,
      label: "حذف",
    },
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "add product"
      )
        ? "add"
        : ""
        }`,
      label: "إضافة منتج",
      route: `/warehouse/returants/subcategory/add-product/${id}`,
    },

    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "edit product"
      )
        ? "show"
        : ""
        }`,
      label: "تفاصيل",
    },
    {
      type: `${user?.permissions.some(
        (permission) => permission.name === "add recipes to product"
      )
        ? "navigate"
        : ""
        }`,
      label: "اضافة مكون",
      route: "/warehouse/returants/subcategory/:id/add-rescipes",
    }
  ];
  const detailsHeaders = [


    { key: "name", label: "الإسم" },
    { key: "price", label: "السعر" },
    // { key: "image", value: "الصوره", type: "image" },
  ];
  return (
    <div>
      <Table
        headers={tableHeaders}
        detailsHeaders={detailsHeaders}
        filters={filters}
        actions={actions}
        deleteFn={deleteProduct}
        showFn={getProductsById}
        title="المنتجات"
        id={id}
        fetchData={(filters, currentPage) =>
          getProductsFilterById(filters, currentPage, id)
        }
      />
    </div>
  );
};

export default ShowProduct;
