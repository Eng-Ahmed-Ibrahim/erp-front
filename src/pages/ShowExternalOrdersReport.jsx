import { useEffect, useState, useRef } from "react";
import { API_ENDPOINT } from "../../config";
import { useLocation, useParams } from "react-router-dom";

import axios from "axios";
import { Pagination, message, Modal } from "antd";
import { usePDF } from "react-to-pdf";
import { useMemo } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "../context/AuthContext";

function DataModal({ show, onHide, order }) {
  console.log(order?.products);
  return (
    <Modal
      centered
      open={show}
      // onOk={}
      onCancel={onHide}
      width={1400}
      footer={null}
    >
      <div className="container text-center" >
        <h1 className="heading text-center p-3">تفاصيل الاوردر</h1>

        <section style={{ backgroundColor: "#eee" }}>
          <div className="container py-5">
            <div className="row">
              <div className="col-lg-12">
                <div className="card mb-4">
                  <div className="card-body" style={{ fontSize: "16px" }}>
                    <div className="row ">
                      <h5
                        className="text-center p-3"
                        style={{ background: "#b3946f" }}
                      >
                        المدفوعات:{" "}
                      </h5>
                      {order?.payables?.length > 0 && (
                        <table className="table">
                          <thead>
                            <tr>
                              <th scope="col">#</th>
                              <th scope="col">التاريخ</th>
                              <th scope="col">القيمة</th>
                              <th scope="col">رقم الإيصال</th>
                              <th scope="col"> ملاحظة</th>
                            </tr>
                          </thead>

                          <tbody>
                            {order?.payables?.map((payable, index) => (
                              <tr>
                                <th scope="row">{index + 1}</th>
                                <td>
                                  {
                                    new Date(payable.created_at)
                                      .toISOString()
                                      .split("T")[0]
                                  }
                                </td>
                                <td>{payable?.amount}</td>
                                <td>{payable?.receipt_number}</td>
                                <td>{payable?.note}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      <hr />

                      <h5
                        className="text-center p-3"
                        style={{ background: "#b3946f" }}
                      >
                        الملاحظات:{" "}
                      </h5>
                      {order?.comment?.split(",").length > 0 && (
                        <table className="table">
                          <thead>
                            <tr>
                              <th scope="col">#</th>
                              <th scope="col"></th>
                              <th scope="col"> الملاحظة</th>

                              <th scope="col"></th>
                            </tr>
                          </thead>

                          <tbody>
                            {order?.comment
                              ?.split(",")
                              .map((comment, index) => (
                                <tr>
                                  <th scope="row">{index + 1}</th>
                                  <td></td>
                                  <td>{comment}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}

                      <hr />
                      <div className="row">
                        <h5
                          className="text-center p-3"
                          style={{ background: "#b3946f" }}
                        >
                          {" "}
                          المنتجات
                        </h5>
                        <table className="table">
                          <thead>
                            <tr>
                              <th scope="col">#</th>
                              <th scope="col">اسم المنتج</th>
                              <th scope="col">سعر المنتج</th>
                              <th scope="col">الكمية</th>
                            </tr>
                          </thead>

                          <tbody>
                            {order?.products?.map((p, index) => (
                              <tr>
                                <th scope="row">{index + 1}</th>
                                <td>{p?.name}</td>
                                <td>{p?.price}</td>
                                <td>{p?.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}

const ExternalOrdersReport = () => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [newCosts, setNewCosts] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [error, setError] = useState(null);
  const { toPDF, targetRef } = usePDF({ filename: "page.pdf" });
  const [searchTerm, setSearchTerm] = useState("");
  const [value, setValue] = useState("");
  const [sum, setSum] = useState(0);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const tableRef = useRef();
  const { id } = useParams();

  const fetchData = async (parentId) => {
    await axios
      .get(`${API_ENDPOINT}/api/v1/orders/external-orders-report`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
        params: {
          data: {
            from: fromDate,
            to: toDate,
          },
        },
      })
      .then((res) => {
        console.log(res?.data.data);

        setData(res?.data?.data);
        setSum(
          res?.data?.data?.reduce(
            (sum, obj) =>
              Number(sum) + Number(obj.total_payables - obj.total_price || 0) ||
              0
          )
        );
      })
      .catch((err) => {
        setError("Failed to load data");
        const modal = Modal.error({
          title: "success",
          content: (
            <div style={{ fontSize: "24px", textAlign: "center" }}>
              {" "}
              حدث خطا ما
            </div>
          ),
          centered: true,
          width: 400,
        });

        setTimeout(() => {
          modal.destroy();
        }, 4000);
        console.log(err);
      });
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);
  const handleSavePDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 190;
    const pageHeight = 297;
    const rows = Array.from(tableRef.current.querySelectorAll("tr"));
    let position = 10;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowCanvas = await html2canvas(row, { scale: 2 });
      const rowImgData = rowCanvas.toDataURL("image/png");
      const rowHeight = (rowCanvas.height * pageWidth) / rowCanvas.width;
      if (position + rowHeight > pageHeight - 10) {
        pdf.addPage();
        position = 10;
      }
      pdf.addImage(rowImgData, "PNG", 10, position, pageWidth, rowHeight);
      position += rowHeight;
    }
    pdf.save("تقرير_مبيعات.pdf");
  };
  const mapOrderStaus = (status) => {
    const options = {
      returned: "تم الحذف",
      processing: "تحت التجهيز",
      completed: "تم التجهيز",
      closed: "تم الدفع",
      printed: "تم الإستلام",
    };

    return options[status] ? options[status] : status;
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };
  return (
    <div>
      <h2 className="heading text-center">
        تقرير أرباح الأوردرات الخارجية{" "}
        <span className="text-danger">{data?.name}</span>
      </h2>
      <main ref={targetRef}>
        {/* <div id="invoice-container"> */}
          <div className="row align-items-center">
            <div className="col-md-2">
              <div className="mb-3 d-flex text-center flex-column gap-small">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label ps-3 "
                >
                  من
                </label>
                <input
                  onChange={(e) => {
                    const selectedDay = e.target.value;
                    setFromDate(selectedDay);
                  }}
                  value={fromDate}
                  type="date"
                  className="form-control"
                  id="exampleFormControlInput1"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="col-md-2">
              <div className="mb-3 d-flex text-center flex-column gap-small">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label ps-3 "
                >
                  الي
                </label>
                <input
                  onChange={(e) => {
                    const selectedDay = e.target.value;
                    setToDate(selectedDay);
                  }}
                  value={toDate}
                  type="date"
                  className="form-control"
                  id="exampleFormControlInput1"
                  placeholder="name@example.com"
                />
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "start",
              gap: "50px",
            }}
          >
            <button onClick={handleSavePDF} className="pdf-button">
              {" "}
              حفظ PDF
            </button>
          </div>

          <div className="invoice-items">
            <table ref={tableRef}>
              <thead>
                <tr>
                  <th colSpan="8" className="text-center">
                    <div>
                      <span> اجمالي الأرباح :{sum.toFixed(2)}</span>
                    </div>
                  </th>
                </tr>
                <tr>
                  <th className="text-center" style={{ background: "#e6e6e6" }}>
                    #
                  </th>

                  <th className="text-center"  style={{ background: "#b3946f", fontSize:"1.2rem"}}>
                    {" "}
                    كود الأوردر
                  </th>
                  <th className="text-center" style={{ background: "#b3946f", fontSize:"1.2rem" }}>
                    {" "}
                    الحالة
                  </th>
                  <th className="text-center" style={{ background: "#b3946f", fontSize:"1.2rem" }}>
                    {" "}
                    التاربخ
                  </th>
                  <th className="text-center" style={{ background: "#b3946f" , fontSize:"1.2rem"}}>
                    {" "}
                    إجمالي المدفوعات
                  </th>
                  <th className="text-center" style={{ background: "#b3946f" , fontSize:"1.2rem"}}>
                    سعر الاوردر
                  </th>
                  <th className="text-center" style={{ background: "#b3946f" , fontSize:"1.2rem"}}>
                    {" "}
                    الأرباح{" "}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.length > 0 ? (
                  data?.map((item, index) => (
                    <tr
                      className="fw-bold fs-4"
                      key={index}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRowClick(item)}
                    >
                      <td
                        className="text-center"
                        style={{ background: "#e6e6e6" }}
                      >
                        {index + 1}
                      </td>
                      <td className="text-center" style={{ fontSize:"1.2rem"}}  > {item.code}</td>
                      <td className="text-center" style={{ fontSize:"1.2rem"}} >
                        {" "}
                        {mapOrderStaus(item.status)}
                      </td>
                      <td className="text-center" style={{ fontSize:"1.2rem"}} >{item.created_at}</td>
                      <td className="text-center"style={{ fontSize:"1.2rem"}} > {item.total_payables}</td>

                      <td className="text-center" style={{ fontSize:"1.2rem"}} > {item.total_price}</td>

                      <td className="text-center" style={{ fontSize:"1.2rem"}} >
                        {" "}
                        {item.total_payables - item.total_price}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="text-center fw-bold fs-4" colSpan="8">
                      لا توجدأوردرات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        {/* </div> */}
      </main>

      <DataModal
        show={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        order={selectedItem}
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

export default ExternalOrdersReport;
