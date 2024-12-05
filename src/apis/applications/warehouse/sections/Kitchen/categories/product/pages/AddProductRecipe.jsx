import React, { useState, useEffect } from "react";

import TotalAmount from "../../../../../../../components/shared/totalAmount/TotalAmount";

// import "./CashierWarehouseRequests.scss";
import axios from "axios";
import { getSuppliers } from "../../../../../../../apis/suppliers";
import { getAllDepartments } from "../../../../../../../apis/departments";

import { API_ENDPOINT } from "../../../../../../../../config";
import { useNavigate, useParams } from "react-router-dom";
import CahierWearhouseDetailes from "../../../../../../../components/shared/CashierWearhouseDetailes/CashierWearhouseDetailes";
import ItemCashierWearhouse from "../../../../../../../components/shared/CashierWearhouseDetailes/ItemCashierWearhouse";
import { message } from "antd";
import { getProductsById } from "../../../../../../../apis/product";
import { usePDF } from 'react-to-pdf';
const AddProductRecipe = () => {
  // const [suppliers, setSuppliers] = useState([]);
  // const [department, setDepartment] = useState([]);
  const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [data, setData] = useState(); // Initialize data as null

  const [parentName, setParentName] = useState("");
  // const [recipeUnit, setRecipeUnit] = useState('')
  const [ProductParentId, setRecipeParentId] = useState("");
  const [ProductCategory_id, setProductCategoryId] = useState("");

  const handleAddItem = (item) => {
    setItems([...items, item]);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const calculateTotalAmount = () => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeData = await getProductsById(id);
        setData(recipeData.data);
        setParentName(recipeData.data.name);
        // setRecipeUnit(recipeData.data.unit)
        setRecipeParentId(recipeData.data.sub_category_id);
        setProductCategoryId(recipeData.data.category_id);

        // console.log("================>" + recipeData.data);
      } catch (error) {
        // console.log("Error fetching data:", error);
      }
    };
    fetchData();
  }, [id]);
  const [recipePrice, setRecipePrice] = useState([])
  useEffect(() => {
    axios.get(`${API_ENDPOINT}/api/v1/store/products/${id}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    })
      .then(res => {
        setRecipePrice(res.data)
        // console.log('ajsdhnk', res.data?.data?.recipes);
      })
      .catch(err => {
        message.error(err?.response?.data?.error?.message)
        // console.log(err);
      })
  }, [])
  const handleDownloadPDF = async () => {
    const formData = new FormData();
    formData.append("product_id", id);
    items.forEach((item, index) => {
      formData.append(`recipes[${index}][recipe_id]`, item.recipeId);
      formData.append(`recipes[${index}][quantity]`, item.quantity);
      // formData.append(`recipes[${index}][expire_date]`, item.expireDate);
    });

    try {
      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/store/products/recipts/add`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Token}`,
          },
        }
      ).then(res => {
        navigate(
          `/warehouse/returants/show-resturants2/${data.sub_category_id}/details-product`
        )
        message.success("تم اضافة المكون بنجاح");
        axios.get(`${API_ENDPOINT}/api/v1/store/products/${id}`, {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        })
      })
      // console.log(response.data);
      // // console.log("Invoice created successfully!");
      // Optionally, you can redirect or show a success message here
    } catch (error) {
      console.error("Error creating invoice:", error);
      // Handle error condition, show error message, etc.
    }
  };
  const handelDelete = async (id) => {
    // setIsPending(true);
    await axios
      .delete(`${API_ENDPOINT}/api/v1/store/products/${recipePrice?.data?.id}/recipe/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        // setIsPending(false);
        message.success("تم حذف المكون بنجاح");
        axios
          .get(
            `${API_ENDPOINT}/api/v1/store/sub_categories/filter_by_category/${item?.id}`,
            {
              headers: {
                Authorization: `Bearer ${Token}`,
              },
            }
          )
          .then((response) => {
            // setIsPending(false);
            setData(response.data);
          });
      })
      .catch((error) => {
        // setIsPending(false);
        console.log(error);
        message.error("حدث خطأ ما");
      });
  };

  return (
    <div className="form-container" ref={targetRef}>
      <h1 className="form-title">اضافة مكون الى المنتج</h1>
      <div>
        <label className="form-label">المنتج :</label>
        <input
          className="form-input"
          type="textarea"
          value={parentName}
          disabled={true}
          style={{ cursor: "not-allowed" }}
        />
      </div>

      <CahierWearhouseDetailes
        onAddItem={handleAddItem}
        selectedSupplier={selectedSupplier}
      // InvoiceType={lastItem}
      />
      <ItemCashierWearhouse items={items} onDeleteItem={handleDeleteItem} />
      <TotalAmount total={calculateTotalAmount()} />
      <button className="form-btn" onClick={handleDownloadPDF}>
        حفظ البيانات
      </button>
      <table className="table table-hover mt-5" style={{ width: "100%", borderCollapse: "collapse", color: '#edede9' }} >
        <thead>
          <tr className="fw-bold fs-5 my-3">
            <th scope="col" style={{ background: "rgb(237, 237, 233)" }}>الرقم</th>
            <th scope="col" style={{ background: "rgb(237, 237, 233)" }}>اسم المكون</th>
            <th scope="col" style={{ background: "rgb(237, 237, 233)" }}>الكميه</th>
            <th scope="col" style={{ background: "rgb(237, 237, 233)" }}>التصنيف الفرعى</th>
            <th scope="col" style={{ background: "rgb(237, 237, 233)" }}>الاجراءات</th>
          </tr>
        </thead>
        <tbody style={{ borderColor: "rgb(175, 130, 96)" }}>
          {recipePrice?.data?.recipes?.map((item, index) => (
            <tr key={index} className='content-area-table'>
              <th className="clickable-cell"
                style={{ padding: "14px 12px", border: "1px solid rgb(228, 197, 158)", color: "rgb(128, 61, 59)", fontSize: "18px", fontWeight: "700" }}
                scope="row">{index + 1}</th>
              <td className="clickable-cell"
                style={{ padding: "14px 12px", border: "1px solid rgb(228, 197, 158)", color: "rgb(128, 61, 59)", fontSize: "18px", fontWeight: "700" }}
              >{item?.name}</td>
              <td className="clickable-cell"
                style={{ padding: "14px 12px", border: "1px solid rgb(228, 197, 158)", color: "rgb(128, 61, 59)", fontSize: "18px", fontWeight: "700" }}
              >{item?.quantity} {item?.unit}</td>
              <td className="clickable-cell"
                style={{ padding: "14px 12px", border: "1px solid rgb(228, 197, 158)", color: "rgb(128, 61, 59)", fontSize: "18px", fontWeight: "700" }}
              >{item?.type}</td>
              <td className="clickable-cell"
                style={{ padding: "14px 12px", border: "1px solid rgb(228, 197, 158)", color: "rgb(128, 61, 59)", fontSize: "18px", fontWeight: "700" }}
              >
                <button
                  type="button"
                  onClick={() => handelDelete(item.id)}
                  className="mx-3 btn btn-danger px-4"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => toPDF()} className="pdf-button"> حفظ PDF</button>
    </div>
  );
};

export default AddProductRecipe;
