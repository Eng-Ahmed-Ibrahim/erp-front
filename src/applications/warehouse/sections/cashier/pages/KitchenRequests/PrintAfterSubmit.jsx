import React, { useEffect, useRef, useState } from "react";
import LogoDAR from "../../../../../../../public/assets/images/Dar_logo.svg";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import { getOrderById } from "../../../../../../apis/orders";
import {
  Br,
  Cut,
  Line,
  Printer,
  Text,
  Row,
  render,
} from "react-thermal-printer";
import { useReactToPrint } from "react-to-print";

function PrintAfterSubmit({
  id,
  table_no,
  tableNO,
  isQuickPrint,
  onPrintComplete,
}) {
  //
  const componentRef = useRef();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);

  // Use tableNO if provided, otherwise fall back to table_no
  const tableNumber = tableNO || table_no;

  const [data, setData] = useState({
    code: "",
    status: "",
    client: "",
    invoice_date: "",
    client_type: "",
    recipeData: [],
    total_price: 0,
    total_price_after_discount_and_tax: 0,
    departmentName: "",
    cashier: "",
    payment: "",
    comment: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🖨️ PrintAfterSubmit: Fetching order data for ID:", id);
        const InvoiceData = await getOrderById(id);
        console.log("🖨️ PrintAfterSubmit: Order data received:", InvoiceData);

        if (!InvoiceData || !InvoiceData.data) {
          throw new Error("No order data received");
        }

        setData({
          code: InvoiceData.data.code,
          cashier: InvoiceData.data.casher,
          products: InvoiceData.data.products,
          payment_method: InvoiceData.data.payment_method,
          order_date: InvoiceData.data.order_date,
          client: InvoiceData.data.client,
          payment: InvoiceData.data.payment_method,
          status: InvoiceData.data.status,
          invoice_date: InvoiceData.data.order_date,
          table_number: InvoiceData.data.table_number,
          client_type: InvoiceData.data.client_type,
          recipeData: InvoiceData.data.products,
          price: InvoiceData.data.price,
          total_price: InvoiceData.data.total_price,
          waiter_name: InvoiceData.data.waiter?.name || "N/A",
          comment: InvoiceData.data.comment,
          total_price_after_discount_and_tax:
            InvoiceData.data.total_price_after_discount_and_tax,
          departmentName: InvoiceData.data.department,
        });
      } catch (error) {
        console.error("🖨️ PrintAfterSubmit: Error fetching order data:", error);
        if (onPrintComplete) {
          console.log(
            "🖨️ PrintAfterSubmit: Calling onPrintComplete due to error"
          );
          onPrintComplete();
        }
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, onPrintComplete]);
  const generatePDF = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${data.code + "-" + "أوردر كود"}`,
    onAfterPrint: () => {
      console.log("🖨️ PrintAfterSubmit: Print completed, handling callback");

      // If onPrintComplete is provided (from POSPage), call it instead of navigating
      if (onPrintComplete) {
        onPrintComplete();
      } else if (!isQuickPrint) {
        navigate("/warehouse/cashier/create-order");
      } else {
        navigate("/warehouse/cashier/pos");
      }
    },
  });
  useEffect(() => {
    console.log("🖨️ PrintAfterSubmit: Data updated:", {
      total_price: data.total_price,
      price: data.price,
      code: data.code,
      products: data.products?.length || 0,
    });

    if (data.total_price !== 0 && data.price !== 0) {
      console.log("🖨️ PrintAfterSubmit: Triggering print generation");
      generatePDF();
    } else if (data.code && data.products?.length > 0) {
      // Even if price is 0, try to print if we have order data
      console.log("🖨️ PrintAfterSubmit: Triggering print for zero-price order");
      generatePDF();
    }
  }, [data]);

  return (
    <div
      id="invoice-container"
      ref={componentRef}
      dir="rtl"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <Printer ref={componentRef} className="main">
        <div className="headers-wrapper">
          <div className="main-title">
            <p> أوردر من {data.departmentName}</p>
          </div>
          <div className="header-img">
            <img
              src={LogoDAR}
              alt=""
              style={{ width: "64px", marginBottom: "5px", marginLeft: "5px" }}
            />
          </div>
        </div>
        <div className="invoice-info">
          <div className="invoice-info-item">
            <p>كـــــود الأوردر : {data.code}</p>
            <p>تـاريـــخ الأوردر : {data.order_date}</p>
            <p>رقم الترابيزة : {tableNumber}</p>
            <p>الملاحظه : {data.comment}</p>
          </div>
          <div className="invoice-info-item">
            <p>اسم الكاشير : {data.cashier}</p>
            <p>اسم الويتر : {data.waiter_name}</p>
            <p>اسم العميل : {data?.client == "" ? "Guest" : data?.client}</p>
            <p>الفئة : {data?.client_type}</p>
            <p> طريقة الدفع : {data?.payment_method}</p>
          </div>
        </div>
        <div className="invoice-items">
          <h2>محــــــتويات الأوردر</h2>
          <table>
            <thead>
              <tr>
                <th className="text-center">رقم العنصر</th>
                <th className="text-center">اسم العنصر</th>
                <th className="text-center">سعر العنصر الواحد</th>
                <th className="text-right">الكمية</th>
                <th className="text-right">الاجمالي</th>
              </tr>
            </thead>
            <tbody>
              {data?.products?.map((recipe, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">{recipe?.name}</td>
                  <td className="text-center">{recipe?.price}</td>
                  <td className="text-right">{recipe?.quantity}</td>
                  <td className="text-right">
                    {recipe?.quantity * recipe?.price}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="text-price" colSpan={3}>
                  {" "}
                  السعر الكلي{" "}
                </td>
                <td className="text-price" colSpan={3}>
                  {data.price} ج.م
                </td>
              </tr>
              <tr>
                <td className="text-price" colSpan={3}>
                  السعر الكلي بعد الخصم
                </td>
                <td className="text-price" colSpan={3}>
                  {data.total_price} ج.م
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <Cut />
      </Printer>
    </div>
  );
}

export default PrintAfterSubmit;
