import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../../../config";
import { Pagination, Select } from "antd";
import { DownloadTableExcel } from 'react-export-table-to-excel';
import { useAuth } from "../../../../../../../context/AuthContext";
const ShowSubCategory2 = () => {
  const { user } = useAuth()
  const tableRef = useRef(null);
  const item = useLocation()?.state?.item;
  const [isPending, setIsPending] = useState(false);
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {
    setIsPending(true);
    axios
      ?.get(
        `${API_ENDPOINT}/api/v1/store/sub_categories/filter_by_category/${item?.id}?page=${currentPage}`,
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
        // console.log("error", err);
      });
  }, [currentPage]);

  // console.log(currentPage);

  // console.log("data from endpoint", data);
  const handelDelete = async (id) => {
    setIsPending(true);
    await axios
      .delete(`${API_ENDPOINT}/api/v1/store/sub_categories/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        setIsPending(false);
        alert("Deleted Success");
        axios
          .get(
            `${API_ENDPOINT}/api/v1/store/sub_categories/filter_by_category/${item?.id}`,
            {
              headers: {
                Authorization: `Bearer ${Token}`,
              },
            }
          )
          .then((response) => {
            setIsPending(false);
            setData(response.data);
          });
      })
      .catch((error) => {
        setIsPending(false);
        // console.log(error);
      });
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <div>
      <div className="my-5 ">
        <h1 className="heading text-center p-3">اقسام المنتجات <span className="text-warning">({item?.name})</span></h1>
      </div>
      <div className="content-area-table">
        <Link
          className="data-table-info"
          to={`/warehouse/returants/show-resturants2/${item?.id}/create-new`}
          state={{ item }}
        >
          <button type="button" className="btn  add-btn">
            ادخال تصنيف فرعى
          </button>
        </Link>
      </div>
      <DownloadTableExcel
        filename="users table"
        sheet="users"
        currentTableRef={tableRef.current}
      >

        <button> Export excel </button>

      </DownloadTableExcel>
      <table ref={tableRef}
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
            <th scope="col" style={{ background: '#edede9' }}>الإسم</th>
            <th scope="col" style={{ background: '#edede9' }}>الصوره</th>
            <th scope="col" style={{ background: '#edede9' }}>الإجراءات</th>
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
                <Link
                  to={`/warehouse/returants/show-resturants2/${item?.id}/details-product`}
                  state={{ item }}
                  className="text-decoration-none text-dark"
                >
                  {item?.name}
                </Link>
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
                <img src={item?.image} alt={item?.name} width={'80'} height={"60px"} />
              </td>
              <td>
                <Link
                  to={`/warehouse/returants/show-resturants2/${item?.id}/updated-product`}
                  state={{ item }}
                >
                  <button type="button" className="mx-3 btn btn-primary px-4" style={{ background: '#1677ff' }}>
                    تعديل
                  </button>
                </Link>
                {user?.id != '01j4qqe8nvyqm1sqawg1rfhnw3' ? (
                  <button
                    type="button"
                    onClick={() => handelDelete(item.id)}
                    className="mx-3 btn btn-danger px-4"
                  >
                    حذف
                  </button>
                ) : null}
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

export default ShowSubCategory2;
