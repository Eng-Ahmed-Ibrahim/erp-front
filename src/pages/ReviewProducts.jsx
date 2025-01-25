import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Table from "../components/shared/table/Table";
import { message } from "antd";
import { API_ENDPOINT } from "../../config";
const ReviewProducts = () => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [categories, setCategories] = useState([]);

  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      ?.get(`${API_ENDPOINT}/api/v1/store/categories`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        console.log("res", res?.data?.data);

        setCategories(res?.data?.data);
      })
      .catch((err) => console.log("error", err));

    getProducts([], 5);
  }, []);

  // useEffect(() => {
  // }, []);

  const filters = [
    { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
    {
      key: "category_id",
      type: "selection",
      placeholder: "إبحث بالقسم الرئيسى",
      id: "القسم الرئيسى",
      options: [{ value: "", label: "" }].concat(
        categories?.map((category) => {
          return { value: category.id, label: category.name };
        })
      ),
    },
  ];
  const tableHeaders = [
    { key: "category_name", value: "التصنيف الرئيسي" },
    { key: "subcategory_name", value: "التصنيف الفرعي" },
    { key: "name", value: "إسم المنتج " },
    { key: "cost_price", value: "سعر التكلفة" },
    { key: "estimated_price", value: "سعر المنتج الإسترشادي" },
    { key: "price", value: "سعر البيع" },
  ];

  const getProducts = async (filteredValues, id) => {
    try {
      const { name, page, category_id } = filteredValues;

      const res = await axios.get(`${API_ENDPOINT}/api/v1/store/cost-report`, {
        params: {
          name,
          page,
          category_id,
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      });

      return res.data;
    } catch (error) {
      console.log(error);
      message.error("حدث خطأ الرجاء إعادة المحاولة ");
    }
  };

  const actions = [
    {
      type: "edit",
      label: "مراجعة",
      route: "/warehouse/returants/show-resturants2",
    },
  ];
  return (
    <div>
      <Table
        headers={tableHeaders}
        title="مراجعة المنتجات"
        filters={filters}
        fetchData={(filterValues, currentPage) =>
          getProducts(filterValues, currentPage)
        }
        actions={actions}
      />
    </div>
  );
};

export default ReviewProducts;
