import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINT } from "../../config";
import { Pagination, Select } from "antd";

const ShowAllTable = () => {
  const [isPending, setIsPending] = useState(false);
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [department, setDepartment] = useState([]);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

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
  // // console.log('value', value);


  useEffect(() => {
    setIsPending(true);
    axios
      ?.get(
        `${API_ENDPOINT}/api/v1/orders/show/tables/${value}`,
        {
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
        // // console.log("error", err);
      });
  }, [currentPage, value]);


  // // console.log("data from endpoint", data);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <div>
      <div className="my-5 ">
        <h1 className="heading text-center p-3">كل التربيزات المفتوحة</h1>
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
        className="table table table-hover mt-5 5 border"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: "var(--text-color-inverted)",
        }}
      >
        <thead>
          <tr className="fw-bold fs-5 my-3">
            <th scope="col" style={{ background: '#edede9' }}>الرقم</th>
            <th scope="col" style={{ background: '#edede9' }}>رقم الترابيزه</th>
            <th scope="col" style={{ background: '#edede9' }}>الاجراءات</th>
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
              >
                {item?.table_number}
              </td>
              <td className="">
                <Link
                  to={`/warehouse/departments/show-departments/tables/show-details/${item?.id}`}
                  state={{ item }}
                >
                  <button className="btn btn-outline-info px-5">تفاصيل</button>
                </Link>
              </td>
            </tr>
          ))}
          {data?.data?.length == "0" ? (
            <h3 className="me-3 pt-3">لا يوجد تربيزات مفتوحة</h3>
          ) : null}
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
}

export default ShowAllTable