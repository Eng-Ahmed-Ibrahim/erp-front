import React from "react";
import CashierOrderDetailes from "../../../../../../../components/shared/CashierOrderDetails/CashierOrderDetailes";
import CashierItemList from "../../../../../../../components/shared/CashierItemList/CashierItemList";
import TotalAmount from "../../../../../../../components/shared/totalAmount/TotalAmount";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Modal, message } from "antd";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../../../config";
const AddProductToOrder = () => {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);

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
    setIsDisabled(true)
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
      const modal = Modal.success({
        title: 'success',
        content: <div style={{ fontSize: '24px', textAlign: 'center' }}>لقد تم اضافة المنتجات بنجاح </div>,
        centered: true, 
        width: 400, 
      });
      
      setTimeout(() => {
        modal.destroy();
      }, 2500);
    } catch (error) {
      console.error("Error creating invoice:", error);
      const modal = Modal.error({
        title: 'Error',
        content: <div style={{ fontSize: '24px', textAlign: 'center' }}>{error.response.data.error.message} </div>,
        centered: true, 
        width: 400, 
      });
      
      setTimeout(() => {
        modal.destroy();
      }, 5000);
    }
  };

  return (
    <div>
      <h1>إضافة منتج إالى الأوردر</h1>
      <CashierOrderDetailes onAddItem={handleAddItem} />
      <CashierItemList items={items} onDeleteItem={handleDeleteItem} />
      <TotalAmount total={calculateTotalAmount()} />
      <button className="form-cashier-btn" onClick={handleSubmit}  disabled={isDisabled} style={{
    backgroundColor: isDisabled ? "#d3d3d3" : "#AF8260", 
    cursor: isDisabled ? "not-allowed" : "pointer",
    color: isDisabled ? "#a9a9a9" : "white", 
  }}>
        حفظ البيانات
      </button>
    </div>
  );
};

export default AddProductToOrder;
