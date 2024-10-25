import Table from "../../../../../components/shared/table/Table";
import "../../../../../components/shared/table/Table.scss";
import {
  deleteDeaprtment,
  deleteProductDeaprtment,
  getDeaprtmentsFilterById,
} from "../../../../../apis/department";
import {
  editProductsToDepartment,
  getSubCategoriesForDepartment,
} from "../../../../../apis/product";
import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../context/AuthContext";
import { API_ENDPOINT } from "../../../../../../config";
import axios from 'axios'
const ShowProductDepartment = () => {
  const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const item = useLocation()?.state?.item
  const { user } = useAuth();
  const [subCategories, setSubCategories] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchSubCategories = async () => {
      const res = await getSubCategoriesForDepartment(id);
      // console.log(res.data);
      setSubCategories(res.data);
    };
    fetchSubCategories();
  }, [id]);
  const tableHeaders = [
    // { key: "code", value: "الكود" },
    {
      key: "name",
      value: " الاسم ",
    },
    { key: "image", value: "الصوره", type: "image" },
    { key: "quantity", value: "الكمية" },
  ];
  const filters = [
    { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
    {
      key: "sub_category_id",
      type: "selection",
      placeholder: "إبحث بالقسم الرئيسى",
      id: "القسم الرئيسى",
      options: [{ value: "", label: "" }].concat(
        subCategories.map((category) => {
          return { value: category.id, label: category.name };
        })
      ),
    },
  ];
  const actions = [
    {
      type: "delete",
      label: "حذف",
    },
    {
      type: "show",
      label: "تعديل",
    },

    {
      type: "add",
      label: "إضافة منتج الى المنفذ ",
      route: `/warehouse/departments/add-product-to-department/${id}`,
    },
  ];
  const detailsHeaders = [
    {
      key: "id",
      label: "الكود",
      isInput: false,
    },
    {
      key: "quantity",
      label: "الكمية",
      isInput: true,
    },
  ];

  const [data, setData] = useState([])

  useEffect(() => {
    axios.get(`${API_ENDPOINT}/api/v1/store/invoice/filter/get_recipes/out_going_from_to_date/${item?.id}`, {

      headers: {
        Authorization: `Bearer ${Token}`,
      },
    }
    )
      .then(res => {
        setData(res?.data?.data)
      })


  }, [])
  console.log('data from invoice', data);
  return (
    <div>
      {/* <h1>المخزن الفرعى</h1>
      <table>
        <thead>
          <tr>
            <th>الرقم</th>
            <th>الاسم</th>
            <th>الكمية</th>
            <th>الصوره</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index}>
              <th>{index + 1}</th>
              <th>{item?.name}</th>
              <th>{item?.total_quantity}</th>
              <th><img src={item?.image} alt={item?.name} /></th>

            </tr>
          ))}
        </tbody>
      </table> */}

      <Table
        headers={tableHeaders}
        title={`المنيو  `}
        filters={filters}
        id={id}
        fetchData={(filters, id, setIsLoading) =>
          getDeaprtmentsFilterById(filters, id, setIsLoading)
        }
        actions={actions}
        deleteFn={deleteProductDeaprtment}
        detailsHeaders={detailsHeaders}
        updateFn={editProductsToDepartment}
      />
    </div>
  );
};

export default ShowProductDepartment;
