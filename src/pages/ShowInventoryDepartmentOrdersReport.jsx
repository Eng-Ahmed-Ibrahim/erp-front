import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINT } from "../../config";
import { Pagination, Select } from "antd";
const ShowInventoryDepartmentOrdersReport = () => {
  const item = useLocation()?.state?.item;
  const [isPending, setIsPending] = useState(false);
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [data, setData] = useState([]);
  const [department, setDepartment] = useState([]);

  useEffect(() => {
    axios
      ?.get(
        `${API_ENDPOINT}/api/v1/store/department`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      )
      .then((res) => {
        setIsPending(false);
        setDepartment(res?.data);
      })
      .catch((err) => {
        setIsPending(false);
        // // console.log("error", err);
      });
  }, [])
  const getInitialState = () => {
    const value = "department";
    return value;
  };
  const [value, setValue] = useState(getInitialState);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    setIsPending(true);
    axios
      ?.get(
        `${API_ENDPOINT}/api/v1/store/department/orders/01j45gcqmcnpdy1470ycdh556a?from=2024-08-22&to=2024-09-10&user_id`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      )
      .then((res) => {
        setIsPending(false);
        setData(res?.data.data);
      })
      .catch((err) => {
        setIsPending(false);
        console.log("error", err);
      });
  }, [value]);
  return (
    <div>
      <div className="my-5 ">
        <h1 className="heading text-center p-3">جرد المدفوعات للمنفذ</h1>
      </div>
      <div className="mb-3">
        <label htmlFor="exampleInputEmail1" className="form-label">
          المنفذ :
        </label>
        <select
          className="form-select"
          aria-label="المنفذ"
          value={value}
          onChange={handleChange}
        >
          <option> من فضلك اختر المنفذ</option>
          {department?.data?.map((item, index) => (
            <option value={item?.id}>{item?.name} </option>
          ))}
        </select>
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
            <th scope="col" style={{ background: '#edede9' }}>#</th>
            <th scope="col" style={{ background: '#edede9' }}>الويتر</th>
            <th scope="col" style={{ background: '#edede9' }}>الدفع كاش</th>
            <th scope="col" style={{ background: '#edede9' }}>الدفع اجل</th>
            <th scope="col" style={{ background: '#edede9' }}>الدفع فيزا(visa)</th>
            <th scope="col" style={{ background: '#edede9' }}>الاجمالى</th>
          </tr>
        </thead>
        <tbody>
          <tr className="content-area-table">
            <td
              className="clickable-cell"
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >1
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
            >1
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
            >{data?.totals?.total_cash}
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
            >{data?.totals?.total_post_paid}
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
            >{data?.totals?.total_visa}
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
            >{data?.totals?.total}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ShowInventoryDepartmentOrdersReport;
