import React from "react";
import CashierOrderDetailes from "../../../../../../../components/shared/CashierOrderDetails/CashierOrderDetailes";
import CashierItemList from "../../../../../../../components/shared/CashierItemList/CashierItemList";
import TotalAmount from "../../../../../../../components/shared/totalAmount/TotalAmount";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../../../config";
const AddProductToOrder = () => {
  const { id } = useParams();
  const [items, setItems] = useState([]);

  const calculateTotalAmount = () => {
    return items?.reduce((total, item) => total + item?.quantity * item?.price, 0);

  };

  const handleDeleteItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };
  const handleAddItem = (item) => {
    setItems([...items, item]);
  };
  const handleSubmit = async () => {
    const formData = new FormData();
    items.forEach((item, index) => {
      formData.append(`products[${index}][product_id]`, item.ProductId);
      formData.append(`products[${index}][product_type]`, item.productType);
      formData.append(`products[${index}][quantity]`, item.quantity);
    });
    try {
      // console.log(formData);

      const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/orders/product/add/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-cashier-data",
            Authorization: `Bearer ${Token}`,
          },
        }
      ).then(res => {
        console.log('data from .then', res);
        setItems([])
      })
      console.log(response);
      message.success("لقد تم اضافة المنتجات بنجاح");
    } catch (error) {
      console.error("Error creating invoice:", error);
      message.error("حدث خطأ");
    }
  };

  return (
    <div>
      <h1>إضافة منتج إالى الأوردر</h1>
      <CashierOrderDetailes onAddItem={handleAddItem} />
      <CashierItemList items={items} onDeleteItem={handleDeleteItem} />
      <TotalAmount total={calculateTotalAmount()} />
      <button className="form-cashier-btn" onClick={handleSubmit}>
        حفظ البيانات
      </button>
    </div>
  );
};

export default AddProductToOrder;
