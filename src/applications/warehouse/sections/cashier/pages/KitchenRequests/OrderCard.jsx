import React from "react";
// import { useHistory } from 'react-router-dom';
import { changeOrderStatus, getOrders } from "../../../../../../apis/orders";
import axios from "axios";
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
import { API_ENDPOINT } from "../../../../../../../config";
import { useEffect, useState } from "react";
import { BsBorderAll } from "react-icons/bs";
import { Pagination, Select, message, Modal } from "antd";
import { use } from "i18next";

const OrderCard = ({ order, actions, changeStatusFn, user, refreshOrders }) => {
  // const [cardStyle, setCardStyle] = useState("");

  const formattedDate = new Date(order.date).toLocaleString();

  const cardStyle = (order) => {
    return order.status == "completed"
      ? { background: "#949494", BsBorderAll: "#0066CC" }
      : order.is_printed == 1
      ? {
          background: "#a89f9f",
          BsBorderAll: "#0066CC",
        }
      : {};
  };

  const productsStyle = (order) => {
    return order.is_printed == 1
      ? {
          //  background: '#a89f9f',
          //  BsBorderAll:'#0066CC',
        }
      : {};
  };

  const handleChangeStatus = (status) => {
    changeOrderStatus(order.id, status);
    refreshOrders();
  };

  const handleRecievedOrder = async (id) => {
    try {
      const res = await axios.get(
        `${API_ENDPOINT}/api/v1/orders/print-order/${id}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );

      if (res.data.status) {
        message.success("تم الاستلام بنجاح");
      }
    } catch (error) {
      console.error(error);
    }
    refreshOrders();
  };

  const mapOrderStaus = (status) => {
    const options = {
      returned: "تم الحذف",
      processing: "تحت التجهيز",
      completed: "تم التجهيز",
      closed: "تم الدفع",
      printed: "تم الإستلام",
    };

    return options[status] ? options[status] : status;
  };
  const productRowStyle = (isNew) => {
    if (isNew) {
      return {
        backgroundColor: "#b9e7bc", // Light yellow background
        color: "#D9534F", // Red text color to make it stand out
        fontWeight: "bold", // Make the text bold for emphasis
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow to make the row pop
        transition: "all 0.3s ease", // Smooth transition effect for when it appears
        animation: "fadeIn 0.5s ease-out", // Apply the fade-in animation
      };
    }
    return {};
  };
  return (
    <div className="order-card" style={cardStyle(order)}>
      <h3> {order.code}</h3>
      {order.client_type && (
        <h5>
          <strong> نوع العميل : </strong> {order.client_type}
        </h5>
      )}
      {order.client && (
        <h5>
          <strong>العميل:</strong> {order.client}
        </h5>
      )}
      {order.table_number && (
        <h5>
          <strong>رقم الترابيزة:</strong> {order.table_number}
        </h5>
      )}
      <h5>
        <strong>الحالة:</strong> {mapOrderStaus(order.status)}
      </h5>
      <h5>
        <strong>تاريخ الأوردر:</strong> {formattedDate}
      </h5>

      <div className="order-products" style={productsStyle(order)}>
        <h5 style={{ color: "#08489b" }}>تفاصيل الأوردر:</h5>

        <table className="table table-hover mt-5">
          <thead>
            <tr>
              {/* <th scope="col"></th> */}
              <th scope="col">المنتج</th>
              <th scope="col">الكمية</th>
            </tr>
          </thead>
          <tbody>
            {order?.products &&
              order?.products.map((product, index) => {
                const rowStyle = productRowStyle(product.is_new); // Get the row color style
                return (
                  <React.Fragment key={index}>
                    <tr key={index}>
                      {/* <th scope="row" >{index + 1}</th> */}
                      <td style={rowStyle}>{product.name}</td>
                      <td style={rowStyle}>{product.quantity}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
        <ul></ul>
      </div>
      {user?.roles[0] == "9c1102e-985-4b10-bdf8-25c8469f2" && (
        <div className="order-products" style={productsStyle(order)}>
          <h5 style={{ color: "#08489b" }}>الملاحظات :</h5>
          <table className="table table-hover mt-3">
            <tbody>
              {order?.comment &&
                order?.comment?.split(",")?.map((comment, index) => {
                  return (
                    <React.Fragment key={index}>
                      <tr key={index}>
                        <td scope="row">{index + 1}</td>
                        <td>{comment}</td>
                      </tr>
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
          <ul></ul>
        </div>
      )}
      <div className="actions">
        {actions.map((action) => {
          if (action.type === "show") {
            return (
              <div className="butons_container" key={action.type}>
                {order.is_printed == 0 && (
                  <button
                    style={{
                      background: "#ff8001",
                    }}
                    onClick={() => handleRecievedOrder(order.id)}
                  >
                    تم الإستلام
                  </button>
                )}
                <button onClick={() => handleChangeStatus("completed")}>
                  جهز
                </button>
              </div>
            );
          }
          // if (action.type === 'navigate') {
          //   return (
          //     <button key="print" onClick={handlePrint}>
          //       Print
          //     </button>
          //   );
          // }
          return null;
        })}
      </div>
    </div>
  );
};

export default OrderCard;
