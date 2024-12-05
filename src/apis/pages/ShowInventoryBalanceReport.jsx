
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINT } from "../../config";
import { Pagination, Select } from "antd";
const ShowInventoryBalanceReport = () => {
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
        <h1 className="heading text-center p-3"> الميزان المخزنى</h1>
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
            <th scope="col" style={{ background: '#edede9' }}>الصنف</th>
            <th scope="col" style={{ background: '#edede9' }}>رصيد اول المده</th>
            <th scope="col" style={{ background: '#edede9' }}>اضافه</th>
            <th scope="col" style={{ background: '#edede9' }}>الاجمالى</th>
            <th scope="col" style={{ background: '#edede9' }}>صرف</th>
            <th scope="col" style={{ background: '#edede9' }}>مرتجع</th>
            <th scope="col" style={{ background: '#edede9' }}>رصيد اول المده</th>
            <th scope="col" style={{ background: '#edede9' }}>الجرد الفعلى</th>
            <th scope="col" style={{ background: '#edede9' }}>الفرق</th>
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
            >بسله جزر
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
            >62.00
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
            >120
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
            >182.00
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
            >60
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
            >0
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
            >122
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
            >0
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
            >122.00
            </td>

          </tr>
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
            >بسله جزر
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
            >62.00
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
            >120
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
            >182.00
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
            >60
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
            >0
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
            >122
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
            >0
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
            >122.00
            </td>

          </tr>
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
            >بسله جزر
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
            >62.00
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
            >120
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
            >182.00
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
            >60
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
            >0
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
            >122
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
            >0
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
            >122.00
            </td>

          </tr>
          {/* {data?.data?.map((item, index) => (
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
                <button
                  type="button"
                  onClick={() => handelDelete(item.id)}
                  className="mx-3 btn btn-danger px-4"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))} */}
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
