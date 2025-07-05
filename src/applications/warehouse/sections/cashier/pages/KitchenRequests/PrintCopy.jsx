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

function PrintCopy({ id }) {
  const componentRef = useRef();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);

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
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const InvoiceData = await getOrderById(id);
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
          waiter_name: InvoiceData.data.waiter.name,
          payables: InvoiceData?.data?.payables,
          comment: InvoiceData?.data?.comment,
          total_price_after_discount_and_tax:
            InvoiceData.data.total_price_after_discount_and_tax,
          departmentName: InvoiceData.data.department,
        });
      } catch (error) {}
    };

    fetchData();
  }, [id]);
  const generatePDF = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${data.code + "-" + "أوردر كود"}`,
    onAfterPrint: () => {
      navigate("/warehouse/cashier/create-order"); // Navigate after printing
    },
  });
  useEffect(() => {
    if (data.total_price !== 0 && data.price !== 0) {
      generatePDF();
    }
    console.log("rrrrrrrrrrrrrrrrrrrrrrrrrrr", data);
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

        <div>
          <h4>
            {" "}
            نسخة تشغيل لا يتم التحصيل بها و في حالة التحصيل يرجي التوجة لأمن
            الدار{" "}
          </h4>
        </div>

        {/* {data?.payables?.length > 0 && (
          <>
            <h5 className="text-center p-3" style={{ background: "#ced4da" }}>
              المدفوعات:{" "}
            </h5>

            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">التاريخ</th>
                  <th scope="col">القيمة</th>
                  <th scope="col">رقم الإيصال</th>
                  <th scope="col"> ملاحظة</th>
                </tr>
              </thead>

              <tbody>
                {data?.payables?.map((payable, index) => (
                  <tr>
                    <th scope="row">{index + 1}</th>
                    <td>
                      {new Date(payable.created_at).toISOString().split("T")[0]}
                    </td>
                    <td>{payable?.amount}</td>
                    <td>{payable?.receipt_number}</td>
                    <td>{payable?.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )} */}

        {/* <hr /> */}

        {data?.comment?.split(",").length > 0 && (
          <>
            <h5 className="text-center p-3" style={{ background: "#ced4da" }}>
              الملاحظات:{" "}
            </h5>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col"></th>
                  <th scope="col"> الملاحظة</th>

                  <th scope="col"></th>
                </tr>
              </thead>

              <tbody>
                {data?.comment?.split(",").map((comment, index) => (
                  <tr>
                    <th scope="row">{index + 1}</th>
                    <td></td>
                    <td>{comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* {data?.payables?.length > 0 && (
          <div className="cards-container">
            <h2>المدفوعات</h2>

            {data?.payables?.map((payable, index) => (
              <div className="order-header-card">
                <div className="created-at">
                  {new Date(payable.created_at).toISOString().split("T")[0]}
                </div>

                <div className="payable-content">
                  <div className="amount">
                    <label className="card-title">رقم الإيصال : </label>
                    {"  "}
                    {payable?.receipt_number}
                  </div>
                  <div className="amount">
                    <label className="card-title">قيمة المدفوعة: </label>
                    {"  "}
                    {payable.amount}
                  </div>
                  <div className="note">
                    <label className="card-title">ملاحظات :</label>
                    {"  "}
                    {payable.note}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )} */}

        <div className="invoice-items">
          <h2>محــــــتويات الأوردر</h2>
          <table>
            <thead>
              <tr>
                <th className="text-center">رقم العنصر</th>
                <th className="text-center">اسم العنصر</th>
                <th className="text-right">الكمية</th>
              </tr>
            </thead>
            <tbody>
              {data?.products?.map((recipe, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">{recipe?.name}</td>
                  <td className="text-right">{recipe?.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Cut />
      </Printer>
    </div>
  );
}

export default PrintCopy;
