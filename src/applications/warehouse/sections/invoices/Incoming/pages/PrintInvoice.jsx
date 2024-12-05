import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import "./styles.css"; // Import your CSS file
import LogoDAR from "../../../../../../../public/assets/images/Dar_logo.svg";
import { useParams } from "react-router-dom";
import { Modal, message } from "antd";
import { getInvoiceById } from "../../../../../../apis/invoices";

function PrintInvoice() {
  useEffect(() => { }, []);

  const { id } = useParams();
  const [data, setData] = useState({
    code: "",
    status: "",
    invoiceType: "",
    invoice_date: "",
    supplier: "",
    to: "",
    recipeData: [],
    total_price: "",
    invoice_price: "",
    discount: "",
    tax: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false)
  const showModal = () => {
    setIsModalOpen(true)
  }

  const showModalCansel = () => {
    setIsModalOpen(false)
  }

  // const handelOkay =()=>{
  //   setIsModalOpen(false)
  // }

  const renderModal = () => (
    <Modal title="عرض فاتورة المورد" visible={isModalOpen} onCancel={showModalCansel} footer={null}>
      <img src={data.image} alt="invoice_image" style={{ width: "100%" }} />
      <a href={data.image} download onClick={(e) => {
         
        e.preventDefault();
          // Log the URL

        fetch(data.image).then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.blob();
        }).then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'invoice_image.png');
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
          .catch((error) => {
            console.error('Download failed:', error);
          });
      }}>
        <div className=" center" style={{padding:"20px 0px 0 "}}>
        <button className="btn btn-primary">تحميل</button>
        </div>
      </a>


    </Modal>
  );
  useEffect(() => {
    const fetchData = async () => {
      try {
        const InvoiceData = await getInvoiceById(id);
        setData({
          code: InvoiceData.data.code,
          status: InvoiceData.data.status,
          invoiceType: InvoiceData.data.type,
          invoice_date: InvoiceData.data.invoice_date,
          supplier: InvoiceData.data.supplier.name,
          to: InvoiceData.data.to.name,
          toPhone: InvoiceData.data.to.phone,
          toCode: InvoiceData.data.to.code,
          recipeData: InvoiceData.data.recipes,
          total_price: InvoiceData.data.total_price,
          invoice_price: InvoiceData.data.invoice_price,
          discount: InvoiceData.data.discount,
          tax: InvoiceData.data.tax,
          note: InvoiceData.data.note,
          from: InvoiceData.data.from.name,
          fromPhone: InvoiceData.data.from.phone,
          fromCode: InvoiceData.data.from.code,
          registration_date: InvoiceData.data.registration_date,
          image: InvoiceData.data.image
        });
        //  
      } catch (error) {
        //  
      }
    };

    fetchData(); 
  }, [id]); 
  const generatePDF = () => {
    const element = document.getElementById("invoice-container");
    {
      data.invoiceType === "in_coming"
        ? html2pdf()
          .from(element)
          .save(
            `${data.supplier + "-" + data.code + "-" + "فاتورة مورد"}.pdf`
          )
        : data.invoiceType === "out_going"
          ? html2pdf()
            .from(element)
            .save(`${data.to + "-" + data.code + "-" + "اذن صرف"} .pdf`)
          : html2pdf()
            .from(element)
            .save(`${data.from + "-" + data.code + "-" + "مرتجع "} .pdf`);
    }
  };

  return (
    <main>
      <div id="invoice-container">
        <div className="headers-wrapper">
          {data.status === "approved" && (
            <div className="status-green">
              <p>تم المراجعة</p>
            </div>
          )}
          {data.status === "rejected" && (
            <div className="status-red">
              <p>تم الرفض</p>
            </div>
          )}
          {data.status === "done" && (
            <div className="status-black">
              <p> تم الصرف</p>
            </div>
          )}
          {data.status === "pending" && (
            <div className="status-yellow">
              <p> تحت المراجعة</p>
            </div>
          )}
          {data.invoiceType === "in_coming" && (
            <div className="main-title">
              <p>فاتورة مورد </p>
            </div>
          )}
          {data.invoiceType === "out_going" && (
            <div className="main-title">
              <p> إذن صرف </p>
            </div>
          )}
          {data.invoiceType === "returned" && (
            <div className="main-title">
              <p> فاتورة مرتجع </p>
            </div>
          )}

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
            <h2>تـفاصيل الفاتــورة :</h2>
            <p>كـــــود الفاتــورة : {data.code}</p>
            <p>تـاريـــخ الفاتــورة : {data.invoice_date}</p>
            <p>تـاريـــخ الإصدار : {data.registration_date}</p>
          </div>
          <div className="invoice-info-item">
            <h2>مـــــــــن</h2>
            <ul>
              <li>
                الاســـــم :{" "}
                {data.invoiceType === "in_coming" ? data.supplier : data.from}
              </li>
              <li>كــود : {data.fromCode}</li>
              <li>الهاتــــــف : {data.fromPhone}</li>
            </ul>
          </div>
          <div className="invoice-info-item">
            <h2>الـــــــــي</h2>
            <ul>
              <li>الاســـــم :{data.to}</li>
              <li>كــود : {data.code}</li>
              <li>الهاتــــــف : {data.toPhone}</li>
            </ul>
          </div>
        </div>
        <div className="invoice-items">
          <h2>محــــــتويات الـفــاتورة</h2>
          <table>
            <thead>
              <tr>
                <th className="text-center">رقم العنصر</th>
                <th className="text-center">اسم العنصر</th>
                <th className="text-center">سعر العنصر الواحد</th>
                <th className="text-right">الكمية</th>
                <th className="text-right">الوحدة</th>
                <th className="text-right">تاريخ انتهاء الصلاحية</th>
                <th className="text-right">السعر الكلي</th>
              </tr>
            </thead>
            <tbody>
              {data.recipeData.map((recipe, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">{recipe.name}</td>
                  <td className="text-center">{recipe.price}</td>
                  <td className="text-right">{recipe.quantity}</td>
                  <td className="text-right">{recipe.unit.name}</td>
                  <td className="text-right">{recipe.expire_date}</td>
                  <td className="text-right">{recipe.total_price}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4"></td>

                <td></td>
                <td>السعر الكلي</td>
                <td>{data.invoice_price}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="invoice-notes">
          <div className="invoice-notes-section">
            <h2>تفــــــاصيـــل الدفــــع</h2>
            <div className="invoice-notes-item">
              <p>سعر الفاتورة: {data.invoice_price}</p>
              <p>الخصم : {data.discount}</p>
              <p>مصروفات نثرية (نقل، مشال، ...) :{data.tax} </p>
              <p>السعر النهائي : {data.total_price}</p>
            </div>
          </div>
          <div className="invoice-notes-section">
            <h2>ملاحظات</h2>
            <p>{data.note}</p>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
        <button onClick={generatePDF} className="pdf-button">
          {" "}
          حفظ PDF
        </button>

        {data.invoiceType === "in_coming" && (
          <>          <button onClick={showModal} className="pdf-button">
            {" "}
            عرض الصورة الفاتورة المورد
          </button>
            {isModalOpen && renderModal()}
          </>

        )}
        {data.invoiceType === "returned" && (
          <>          <button onClick={showModal} className="pdf-button">
            {" "}
            عرض الصورة الفاتورة المرتجع
          </button>
            {isModalOpen && renderModal()}
          </>

        )}


        {/* <img src={data.image} alt="invoice_image"/>  */}
      </div>
    </main>
  );
}

export default PrintInvoice;
