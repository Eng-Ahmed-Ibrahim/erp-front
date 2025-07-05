import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../../../config";
import { message, Pagination } from "antd";
import { useAuth } from "../../../../../../../context/AuthContext";
const DetailsProduct2 = () => {
  const { user } = useAuth();
  const item = useLocation()?.state?.item;
  const [isPending, setIsPending] = useState(false);
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { depID } = useParams();

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage, searchTerm]);
  const checkMenuItemPermission = (requiredPermission) => {
    if (!user?.permissions) return;
    return user
      ? user?.permissions.some(
          (permission) => permission.name === requiredPermission.name
        )
      : false;
  };
  const fetchData = (page, searchTerm) => {
    setIsPending(true);
    axios
      .get(
        `${API_ENDPOINT}/api/v1/store/products/subcategory/${item?.id}?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      )
      .then((res) => {
        setIsPending(false);
        let products = res?.data?.data || [];
        if (searchTerm) {
          // Filter the products if there's a search term
          products = products.filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        products.sort((a,b) => a?.cost_price - b?.cost_price )

        setData({
          data: products,
          pagination: res?.data?.pagination || {},
        });
      })
      .catch((err) => {
        setIsPending(false);
      });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handelDelete = async (id) => {
    setIsPending(true);
    await axios
      .delete(`${API_ENDPOINT}/api/v1/store/products/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        setIsPending(false);
        message.success("تم الحذف بنجاح");
        axios
          .get(
            `${API_ENDPOINT}/api/v1/store/products/subcategory/${item?.id}?page=${currentPage}`,
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
      });
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <div>
      <div className="my-5">
        <h1 className="heading text-center p-3">
          اقسام المنتجات <span className="text-warning">({item?.name})</span>
        </h1>
      </div>

      <div className="content-area-table">
        <Link
          className="data-table-info"
          to={`/warehouse/returants/show-resturants2/${item?.id}/create-new/product`}
          state={{ item }}
        >
          {checkMenuItemPermission({
            id: 104,
            name: "add product",
          }) && (
            <button type="button" className="btn  add-btn">
              + إضافة منتج
            </button>
          )}
        </Link>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "start",
          marginTop: "4px",
        }}
      >
        <input
          className="filter-input"
          type="text"
          placeholder={"ابحث بالاسم"}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      <table
        className="table table table-hover mt-5 "
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: "var(--text-color-inverted)",
        }}
      >
        <thead>
          <tr className="fw-bold fs-5 my-3">
            <th scope="col" style={{ background: "#edede9" }}>
              الرقم
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              الإسم
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              السعر
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              الحاله
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              الصوره
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              الإجراءات
            </th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((item, index) => (
            <tr
              key={index}
              className=" fs-5 fw-bold content-area-table"
              style={{ border: "1px solid #af8260" }}
            >
              <th scope="row">{index + 1}</th>
              <td className="clickable-cell">{item?.name}</td>
              {/* <td>{item?.id}</td> */}
              <td>{item?.price}</td>
              <td>{item?.status == 0 ? "تحت المراجعه" : "تم المراجعه"}</td>
              <td>
                <img
                  src={item?.image}
                  alt={item?.name}
                  width={"80px"}
                  height={"60px"}
                />
              </td>
              <td>
                {/* <Link
                  to={`/warehouse/returants/show-resturants2/custom-price/product/${item?.id}`}
                  state={{ item }}
                >
                  <button type="button" className="px-3 mt-2 mx-3 btn btn-info">
                    اسعار خاصة
                  </button>
                </Link> */}



                {/* {checkMenuItemPermission({
                  id: 103,
                  name: "edit product",
                }) && ( */}
                  <Link
                    to={`/warehouse/returants/show-resturants2/updated-product/product/${item?.id}`}
                    state={{ item }}
                  >
                    <button
                      type="button"
                      className="px-3 mt-2 mx-3 btn btn-success"
                    >
                      تعديل
                    </button>
                  </Link>
               {/* )}*/}


                <Link
                  to={`/warehouse/returants/subcategory/${item?.id}/add-rescipes`}
                  state={{ item }}
                >
                  <button
                    type="button"
                    className="px-3 mt-2 mx-3 btn btn-warning"
                  >
                    اضافة مكون
                  </button>
                </Link>
                {checkMenuItemPermission({
                  id: 104,
                  name: "delete product",
                }) &&
                  (user?.id != "01j4qqe8nvyqm1sqawg1rfhnw3" ? (
                    <button
                      type="button"
                      onClick={() => handelDelete(item.id)}
                      className="px-3 mt-2 mx-3 btn btn-danger"
                    >
                      حذف
                    </button>
                  ) : null)}
              </td>
            </tr>
          ))}
          {data?.pagination?.count == "0" ? (
            <h3 className="me-3 pt-3">لا يوجد منتجات</h3>
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
};

export default DetailsProduct2;
