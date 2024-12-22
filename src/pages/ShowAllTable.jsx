import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINT } from "../../config";
import { Pagination, Select, message, Modal } from "antd";

function DetailsOrder({ show, onHide, item }) {
  const [isLoading, setLoading] = useState(false);

  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handelDelete = async (id) => {
    setLoading(true);
    await axios
      .delete(`${API_ENDPOINT}/api/v1/orders/product/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        setLoading(false);
        message.success("تم الحذف بنجاح");
        // alert("Deleted Success");
        axios.get(`${API_ENDPOINT}/api/v1/store/products`, {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        });
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };

  return (
    <Modal centered open={show} onOk={onHide} onCancel={onHide} width={1400}>
      {/* <div className="dashboard d-flex flex-row fw-bold"> */}
      <div className="container text-center">
        <h1 className="heading text-center p-3">
          تفاصيل الاوردر من ( {item?.casher} )
        </h1>

        <section style={{ backgroundColor: "#eee" }}>
          <div className="container py-5">
            <div className="row">
              <div className="col-lg-12">
                <div className="card mb-4">
                  <div className="card-body">
                    <div className="row flex-nowrap">
                      <div className="col-sm-3">
                        <h6 className="mb-0">رقم الترابيزه</h6>
                      </div>
                      <div className="col-sm-9">
                        <h6 className="text-muted mb-0">
                          {item?.table_number}
                        </h6>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <h6 className="mb-0">المنفذ</h6>
                      </div>
                      <div className="col-sm-9">
                        <h6 className="text-muted mb-0">{item?.department}</h6>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <h6 className="mb-0">مكان التنفيذ</h6>
                      </div>
                      <div className="col-sm-9">
                        <h6 className="text-muted mb-0">
                          {item?.deleviery_type}
                        </h6>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <h6 className="mb-0">رقم العضوية</h6>
                      </div>
                      <div className="col-sm-9">
                        <h6 className="text-muted mb-0">
                          {item?.client_military_number == ""
                            ? "لايوجد"
                            : item?.client_military_number}
                        </h6>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <h6 className="mb-0">طريقة الدفع </h6>
                      </div>
                      <div className="col-sm-9">
                        <h6 className="text-muted mb-0">
                          {item?.payment_method == null
                            ? "غير محددة"
                            : item?.payment_method}
                        </h6>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <h6 className="mb-0">حالة الاوردر </h6>
                      </div>
                      <div className="col-sm-9">
                        <h6 className="text-muted mb-0">
                          {item?.status == "processing"
                            ? "تحت التجهيز"
                            : "تم الدفع"}
                        </h6>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <h6 className="mb-0"> السعر بعد الخصم</h6>
                      </div>
                      <div className="col-sm-9">
                        <h6 className="text-muted mb-0">
                          {item?.total_price_after_discount}
                        </h6>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <h6 className="mb-0">السعر بعد الخصم والخدمة </h6>
                      </div>
                      <div className="col-sm-9">
                        <h6 className="text-muted mb-0">
                          {item?.total_price_after_discount_and_tax}
                        </h6>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <h6 className="mb-0">الاجمالى </h6>
                      </div>
                      <div className="col-sm-9">
                        <h6 className="text-muted mb-0">{item?.total_price}</h6>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <h6 className="mb-0">توقيت الطلب </h6>
                      </div>
                      <div className="col-sm-9">
                        <h6 className="text-muted mb-0">{item?.order_date}</h6>
                      </div>
                    </div>
                    <hr />
                    <h1 className="heading text-center p-3">تفاصيل الاوردر </h1>
                    <table className="table">
                      <thead>
                        <tr>
                          <th scope="col">الرقم</th>
                          <th scope="col">اسم المنتج</th>
                          <th scope="col">سعر المنتج</th>
                          <th scope="col">الكمية</th>
                          <th scope="col">الاجراءات</th>
                        </tr>
                      </thead>

                      <tbody>
                        {item?.products?.map((p, index) => (
                          <tr>
                            <th scope="row">{index + 1}</th>
                            <td>{p[0]?.name}</td>
                            <td>{p[0]?.price}</td>
                            <td>{p[0]?.quantity}</td>
                            <td>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() =>
                                  handelDelete(p[0]?.product_id_in_order)
                                }
                              >
                                حذف
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* </div> */}
    </Modal>
  );
}

const ShowAllTable = () => {
  const [isPending, setIsPending] = useState(false);
  const { state } = useLocation(); // Retrieve state from URL

  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [department, setDepartment] = useState([]);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisable, setIsModalVisable] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);

  // const getInitialState = () => {
  //   const initialDepartment = state?.selectedDepartment || "department";
  //   return initialDepartment;
  // };

  // const [value, setValue] = useState(getInitialState);

  useEffect(() => {
    axios
      ?.get(`${API_ENDPOINT}/api/v1/store/department`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        setIsPending(false);
        setDepartment(res?.data);
      })
      .catch((err) => {
        setIsPending(false);
        // // console.log("error", err);
      });
  }, []);

  const getInitialState = () => {
    const value = "department";
    return value;
  };

  const [value, setValue] = useState(getInitialState);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleClick = (item) => {
    setSelectedItem(item);
    setIsModalVisable(true);
  };

  useEffect(() => {
    setIsPending(true);
    axios
      ?.get(`${API_ENDPOINT}/api/v1/orders/show/tables/${value}`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        setIsPending(false);
        setData(res?.data);
        console.log(data);
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
            <th scope="col" style={{ background: "#edede9" }}>
              الرقم
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              رقم الترابيزه
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              الاجراءات
            </th>
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
                <button
                  className="btn btn-outline-info px-5"
                  onClick={() => handleClick(item)}
                >
                  تفاصيل
                </button>
              </td>
            </tr>
          ))}
          {data?.data?.length == "0" ? (
            <h3 className="me-3 pt-3">لا يوجد تربيزات مفتوحة</h3>
          ) : null}
        </tbody>
      </table>
      <DetailsOrder
        show={isModalVisable}
        onHide={() => setIsModalVisable(false)}
        item={selectedItem}
      />

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

export default ShowAllTable;
