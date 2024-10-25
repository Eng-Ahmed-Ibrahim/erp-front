import { useEffect, useState } from "react";
import { API_ENDPOINT } from "../../config";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import LogoDAR from "../../public/assets/images/Dar_logo.svg";
import { usePDF } from 'react-to-pdf';
const ShowProductDepartment2 = () => {
  const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const item = useLocation()?.state?.item;
  const [data, setData] = useState(null);  // Changed initial state to null
  const [error, setError] = useState(null); // Added error state
  const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });
  useEffect(() => {
    if (!item?.id) return; // If item is not available, return early

    axios
      .get(`${API_ENDPOINT}/api/v1/store/department/${item?.id}`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        setData(res?.data?.data);
        message.success('تم عرض المواد الخام بنجاح')
      })
      .catch((err) => {
        setError("Failed to load data"); // Set error message
        message.error('حدث خطا ما')
        console.log(err);
      });
  }, [item?.id]);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2 className="heading text-center">
        مخزن <span className="text-danger">{data?.name}</span> الفرعي
      </h2>
      <main ref={targetRef}>
        <div id="invoice-container">
          <div className="headers-wrapper">
            <div className="status-green">
              <span className="fs-5 fw-bold">
                {new Date().toLocaleDateString()} -- {new Date().toLocaleTimeString()}
              </span>
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
            <div className="invoice-info-item" style={{ width: "100%" }}>
              <h2 className="text-center fw-bold fs-2"> تقرير عن محتويات <span className="fs-1 text-danger">{data?.name}</span></h2>
            </div>
          </div>
          <div className="invoice-items">
            <table>
              <thead>
                <tr>
                  <th className="text-center">القسم الرئيسي</th>
                  <th className="text-center">التصنيف الرئيسي</th>
                  <th className="text-right">اسم المنتج</th>
                  <th className="text-center"> صوره المنتج</th>
                  <th className="text-right">الكمية</th>
                  <th className="text-right">السعر</th>
                  <th className="text-right">حد الامان</th>
                  <th className="text-right">السعر الكلي</th>
                </tr>
              </thead>
              <tbody>
                {data?.department_store && Object.keys(data.department_store).length > 0 ? (
                  Object.keys(data.department_store).map((categoryKey) => (
                    data.department_store[categoryKey].map((item) => (
                      <tr className="fw-bold fs-4" key={categoryKey}>
                        <td className="text-center"> {item?.recipe_category?.parent}</td>
                        <td className="text-center"> {item?.recipe_category?.name}</td>
                        <td className="text-right"> {item?.name}</td>
                        <td className="text-center">
                          <img src={item?.image} alt={item?.name} width={"50px"} />
                        </td>
                        <td className="text-right"> {item?.quantity} {item?.unit}</td>
                        <td className="text-right"> {item?.price} جنيه</td>
                        <td className="text-right">5  {item?.unit}</td>
                        <td className="text-right">5  جنيه</td>
                      </tr>
                    ))
                  ))
                ) : (
                  <tr>
                    <td className="text-center fw-bold fs-4" colSpan="9">لا توجد مواد مصروفة للمخزن</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
        <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
          <button onClick={() => toPDF()} className="pdf-button"> حفظ PDF</button>
        </div>
      </main>
      {/* <table
        className="table table-hove mt-5"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: "var(--text-color-inverted)",
        }}
      >

        <tbody style={{ borderColor: "#af8260" }}>
          {data?.department_store && Object.keys(data.department_store).length > 0 ? ( // Check if department_store exists and has content
            Object.keys(data.department_store).map((categoryKey) => (
              <div key={categoryKey}>
                {data.department_store[categoryKey].map((item) => (
                  <tr key={item?.id} className="content-area-table">
                    {categoryKey === categoryKey ? 'yes' : 'no'}
                    <h1>{categoryKey}</h1>
                    <td
                      className="clickable-cell"
                      style={{
                        padding: " 14px 12px",
                        border: "1px solid #E4C59E",
                        color: "#803D3B",
                        fontSize: "18px",
                        fontWeight: "700",
                      }}
                    >
                      {item?.name}
                    </td>
                    <td
                      className="clickable-cell"
                      style={{
                        padding: " 14px 12px",
                        border: "1px solid #E4C59E",
                        color: "#803D3B",
                        fontSize: "18px",
                        fontWeight: "700",
                      }}
                    >
                      <img src={item?.image} alt={item?.name} width={"50px"} />
                    </td>
                    <td
                      className="clickable-cell"
                      style={{
                        padding: " 14px 12px",
                        border: "1px solid #E4C59E",
                        color: "#803D3B",
                        fontSize: "18px",
                        fontWeight: "700",
                      }}
                    >
                      {item?.quantity} {item?.unit}
                    </td>
                    <td
                      className="clickable-cell"
                      style={{
                        padding: " 14px 12px",
                        border: "1px solid #E4C59E",
                        color: "#803D3B",
                        fontSize: "18px",
                        fontWeight: "700",
                      }}
                    >
                      {item?.price} جنيه
                    </td>
                    <td
                      className="clickable-cell"
                      style={{
                        padding: " 14px 12px",
                        border: "1px solid #E4C59E",
                        color: "#803D3B",
                        fontSize: "18px",
                        fontWeight: "700",
                      }}
                    >
                      {item?.recipe_category?.parent}
                    </td>
                    <td
                      className="clickable-cell"
                      style={{
                        padding: " 14px 12px",
                        border: "1px solid #E4C59E",
                        color: "#803D3B",
                        fontSize: "18px",
                        fontWeight: "700",
                      }}
                    >
                      {item?.recipe_category?.name}
                    </td>
                  </tr>
                ))}
              </div>
            ))
          ) : (
            <tr>
              <td colSpan="6">No data available</td>
            </tr>
          )}
        </tbody>
      </table> */}
    </div>
  );
};

export default ShowProductDepartment2;

// import { useEffect, useState } from "react";
// import { API_ENDPOINT } from "../../config";
// import { useLocation } from "react-router-dom";
// import axios from "axios";
// import { message } from "antd";
// import LogoDAR from "../../public/assets/images/Dar_logo.svg";
// import { usePDF } from 'react-to-pdf';

// const ShowProductDepartment2 = () => {
//   const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
//   const item = useLocation()?.state?.item;
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);
//   const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });

//   useEffect(() => {
//     if (!item?.id) return;

//     axios
//       .get(`${API_ENDPOINT}/api/v1/store/department/${item?.id}`, {
//         headers: {
//           Authorization: `Bearer ${Token}`,
//         },
//       })
//       .then((res) => {
//         setData(res?.data?.data);
//         message.success('تم عرض المواد الخام بنجاح');
//       })
//       .catch((err) => {
//         setError("Failed to load data");
//         message.error('حدث خطا ما');
//         console.log(err);
//       });
//   }, [item?.id]);

//   if (error) return <p>{error}</p>;

//   const renderRows = () => {
//     const rows = [];

//     if (data?.department_store) {
//       let lastSection = null;
//       let lastClassification = null;

//       Object.keys(data.department_store).forEach((categoryKey) => {
//         data.department_store[categoryKey].forEach((item, index) => {
//           const currentSection = item?.recipe_category?.parent;
//           const currentClassification = item?.recipe_category?.name;

//           rows.push(
//             <tr className="fw-bold fs-4" key={`${categoryKey}-${index}`}>
//               <td className="text-center">
//                 {currentSection !== lastSection ? currentSection : ""}
//               </td>
//               <td className="text-center">
//                 {currentClassification !== lastClassification ? currentClassification : ""}
//               </td>
//               <td className="text-right">{item?.name}</td>
//               <td className="text-center">
//                 <img src={item?.image} alt={item?.name} width={"50px"} />
//               </td>
//               <td className="text-right">{item?.quantity} {item?.unit}</td>
//               <td className="text-right">{item?.price} جنيه</td>
//               <td className="text-right">2024-08-01</td>
//               <td className="text-right">5 {item?.unit}</td>
//               <td className="text-right">5 جنيه</td>
//             </tr>
//           );

//           // Update the last section to current section
//           lastSection = currentSection;
//           lastClassification = currentClassification;
//         });
//       });
//     }

//     return rows;
//   };
//   return (
//     <div>
//       <h2 className="heading text-center">
//         مخزن <span className="text-danger">{data?.name}</span> الفرعي
//       </h2>
//       <main ref={targetRef}>
//         <div id="invoice-container">
//           <div className="headers-wrapper">
//             <div className="status-green">
//               <span className="fs-5 fw-bold">
//                 {new Date().toLocaleDateString()} -- {new Date().toLocaleTimeString()}
//               </span>
//             </div>
//             <div className="header-img">
//               <img
//                 src={LogoDAR}
//                 alt=""
//                 style={{ width: "84px", marginBottom: "5px", marginLeft: "5px" }}
//               />
//             </div>
//           </div>
//           <div className="invoice-info">
//             <div className="invoice-info-item" style={{ width: "100%" }}>
//               <h2 className="text-center fw-bold fs-2">
//                 تقرير عن محتويات <span className="fs-1 text-danger">{data?.name}</span>
//               </h2>
//             </div>
//           </div>
//           <div className="invoice-items">
//             <table>
//               <thead>
//                 <tr>
//                   <th className="text-center">القسم الرئيسي</th>
//                   <th className="text-center">التصنيف الرئيسي</th>
//                   <th className="text-right">اسم المنتج</th>
//                   <th className="text-center">صوره المنتج</th>
//                   <th className="text-right">الكمية</th>
//                   <th className="text-right">السعر</th>
//                   <th className="text-right">تاريخ انتهاء الصلاحية</th>
//                   <th className="text-right">حد الامان</th>
//                   <th className="text-right">السعر الكلي</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {data?.department_store && Object.keys(data.department_store).length > 0 ? (
//                   renderRows()
//                 ) : (
//                   <tr>
//                     <td className="text-center fw-bold fs-4" colSpan="9">
//                       لا توجد مواد مصروفة للمخزن
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//         <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
//           <button onClick={() => toPDF()} className="pdf-button">
//             حفظ PDF
//           </button>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default ShowProductDepartment2;
