import { useEffect, useState } from "react";
import { API_ENDPOINT } from "../../config";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import LogoDAR from "../../public/assets/images/Dar_logo.svg";
import { usePDF } from 'react-to-pdf';
import { useMemo } from 'react';

const ShowProductDepartment2 = () => {
  const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const item = useLocation()?.state?.item;

  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = () => {
    axios
      .get(`${API_ENDPOINT}/api/v1/${item?.id}/search?search=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        setData(res?.data?.data);
        message.success('تم عرض المواد الخام بنجاح');
      })
      .catch((err) => {
        setError("Failed to load data");
        message.error('حدث خطا ما');
        console.log(err);
      });
  };

  useEffect(() => {
    if (!item?.id) return;
    fetchData();
  }, [item?.id]);
  console.log(`dtatata`, data)
  const sortedDepartmentStore = useMemo(() => {
    if (!data?.department_store) return [];
    const sortedItems = Object.values(data.department_store)
      .flat()
      .sort((a, b) => {
        const parentComparison = a.recipe_category.parent.localeCompare(b.recipe_category.parent);
        if (parentComparison !== 0) return parentComparison;
        return b.quantity - a.quantity;
      });

    return sortedItems;
  }, [data]);

  useEffect(() => {
    if (data) {
      const filtered = data.department_store
        ? Object.keys(data.department_store).reduce((acc, categoryKey) => {
          const items = data.department_store[categoryKey].filter(item =>
            item.name.includes(searchTerm)
          );
          if (items.length) {
            acc[categoryKey] = items;
          }
          return acc;
        }, {})
        : {};
      setFilteredData(filtered);
    }
  }, [searchTerm, data]); // Make sure to include data here

  useEffect(() => {
    console.log("Filtered Data:", filteredData); // Log filtered data for debugging
  }, [filteredData]);

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
              <img src={LogoDAR} alt="" style={{ width: "64px", marginBottom: "5px", marginLeft: "5px" }} />
            </div>
          </div>
          <div className="invoice-info">
            <div className="invoice-info-item" style={{ width: "100%" }}>
              <h2 className="text-center fw-bold fs-2"> تقرير عن محتويات <span className="fs-1 text-danger">{data?.name}</span></h2>
            </div>
          </div>
          <div className="center" style={{ margin: "20px 0" }}>
            <input
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
              type="text"
              placeholder="إبحث باللإسم"
              value={searchTerm}
            />
          </div>
          <div className="invoice-items">
            <table>
              <thead>
                <tr>
                  <th className="text-center">#</th>

                  <th className="text-center">القسم الرئيسي</th>
                  <th className="text-center">التصنيف الرئيسي</th>
                  <th className="text-right">اسم المنتج</th>
                  <th className="text-center">صوره المنتج</th>
                  <th className="text-right">الكمية</th>
                  <th className="text-right">السعر</th>
                  <th className="text-right">حد الامان</th>

                </tr>
              </thead>
              <tbody>
                {sortedDepartmentStore.length > 0 ? (
                  sortedDepartmentStore.map((item, index) => (
                    <tr className="fw-bold fs-4" key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td className="text-center"> {item.recipe_category?.parent}</td>
                      <td className="text-center"> {item.recipe_category?.name}</td>
                      <td className="text-right"> {item.name}</td>
                      <td className="text-center">
                        <img src={item.image} alt={item.name} width={"50px"} />
                      </td>
                      <td className="text-right"> {item.quantity} {item.unit}</td>
                      <td className="text-right"> {item.price} جنيه</td>
                      <td className="text-right">5  {item.unit}</td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="text-center fw-bold fs-4" colSpan="8">لا توجد مواد مصروفة للمخزن</td>
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
    </div>
  );
};

export default ShowProductDepartment2;
