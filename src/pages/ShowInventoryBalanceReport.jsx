
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINT } from "../../config";
import { Pagination, Select } from "antd";
const ShowInventoryBalanceReport = () => {
  const item = useLocation()?.state?.item;
  const [isPending, setIsPending] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const startDate = new Date(2024-11-12)
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
const {id}=useParams()
console.log(id)
  useEffect(() => {
    setIsPending(true);
    axios
      ?.get(
        `${API_ENDPOINT}/api/v1/store/inventory_balance/`,
        {
       params:  { data:{
            from:"2024-11-12",
            to : toDate,
            department_id :id
          }},
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      )
      .then((res) => {
        setIsPending(false);
        setData(res?.data);
      
      })
      .catch((err) => {
        setIsPending(false);
      });
  }, [currentPage]);

  const handleFilterData = () => {
    setIsPending(true);
    axios
      ?.get(
        `${API_ENDPOINT}/api/v1/store/inventory_balance/`,
        {
          params:  { data:{
            from:fromDate,
            to : toDate,
            department_id :id
          }},
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      )
        .then((res) => {
            setIsPending(false);
            setData(res?.data);
        })
        .catch((err) => {
            setIsPending(false);
            console.error("Error fetching data:", err);
        });
};
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <div>
      <div className="my-5 ">
        <h1 className="heading text-center p-3"> الميزان المخزنى</h1>
      </div>
      <div className="row-display">
                <div className="mb-3">
                    <label htmlFor="exampleFormControlInput1" className="form-label">من</label>
                    <input type="date" className="form-control" value={fromDate} onChange={(e) => { setFromDate(e.target.value) }}   min="2024-11-12" />
                </div>
                <div className="mb-3">
                    <label htmlFor="exampleFormControlInput1" className="form-label">الى</label>
                    <input type="date" className="form-control" value={toDate} onChange={(e) => { setToDate(e.target.value.toString().split("T")[0]) }}   min="2024-11-12" />
                </div>
            </div>
            <div className="center" style={{ margin: "20px 0" }}>
                <button onClick={handleFilterData} className="pdf-button white-space-nowrap"> فلتره</button>

            </div>
      <table
        className="table table table-hover mt-5"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: "var(--text-color-inverted)",
        }}
      >
        <thead>
          <tr className="fw-bold fs-5 my-3">
          <th scope="col" style={{ background: '#edede9' }}>الرقم</th>

            <th scope="col" style={{ background: '#edede9' }}>الصنف</th>
            <th scope="col" style={{ background: '#edede9' }}>رصيد اول المده</th>
            <th scope="col" style={{ background: '#edede9' }}>مورد</th>
            <th scope="col" style={{ background: '#edede9' }}>صرف</th>
            <th scope="col" style={{ background: '#edede9' }}>مرتجع منه</th>
            <th scope="col" style={{ background: '#edede9' }}>مرتجع اليه</th>
            <th scope="col" style={{ background: '#edede9' }}>الهالك</th>
            <th scope="col" style={{ background: '#edede9' }}>الجرد الفعلى</th>
            <th scope="col" style={{ background: '#edede9' }}>الاجمالى</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((item, index) => (
            <tr key={index} className="content-area-table">
              <th scope="row">{index + 1}</th>
                         <td
              className="clickable-cell"
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >{item.recipe_name}
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
            >{item.initial_stock}
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
            >{item.total_incoming}
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
            >{item.total_outgoing}
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
            >{item.total_returned_to}
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
            >{item.total_returned_from}
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
            >{item.total_tainted}
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
            >{item.total}
            </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data?.data?.length > 0 && (
        <Pagination
          className="pagination"
          current={currentPage}
          onChange={handlePageChange}
          total={data?.pagination?.total || 1}
          showSizeChanger={false}
        />
      )}
    </div>
  );
};

export default ShowInventoryBalanceReport;
