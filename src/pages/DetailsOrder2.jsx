import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'
import { API_ENDPOINT } from "../../config";
import axios from "axios";
import { message } from 'antd';
const DetailsOrder2 = () => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const item = useLocation()?.state?.item
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    axios
      ?.get(
        `${API_ENDPOINT}/api/v1/orders/${item?.id}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      )
      .then((res) => {
        setLoading(false);
        setData(res?.data);
      })
      .catch((err) => {
        setLoading(false);
        // // console.log("error", err);
      });
  }, [])
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
        axios
          .get(
            `${API_ENDPOINT}/api/v1/store/products`,
            {
              headers: {
                Authorization: `Bearer ${Token}`,
              },
            }
          )
      })
      .catch((error) => {
        setLoading(false);
         console.log(error);
      });
  };
  // // console.log('data', data);

  return (
    <div className="dashboard d-flex flex-row fw-bold">
      <div className="container text-center">
        <h1 className="heading text-center p-3">تفاصيل الاوردر من ( {data?.data?.casher} )</h1>

        <section style={{ backgroundColor: "#eee" }}>
          <div className="container py-5">
            <div className="row">
              <div className="col-lg-12">
                <div className="card mb-4">
                  <div className="card-body">
                    <div className="row flex-nowrap">
                      <div className="col-sm-3">
                        <p className="mb-0">رقم الترابيزه</p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0">{data?.data?.table_number}</p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0">المنفذ</p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0">{data?.data?.department}</p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0">مكان التنفيذ</p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0">{data?.data?.deleviery_type}</p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0">رقم العضوية</p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0">{data?.data?.client_military_number == '' ? 'لايوجد' : (data?.data?.client_military_number)}</p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0">طريقة الدفع </p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0">{data?.data?.payment_method == null ? 'غير محددة' : (data?.data?.payment_method)}</p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0">حالة الاوردر </p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0">{data?.data?.status == "processing" ? ('تحت التجهيز') : 'تم الدفع'}</p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0"> السعر بعد الخصم</p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0">{data?.data?.total_price_after_discount}</p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0">السعر بعد الخصم والخدمة </p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0">{data?.data?.total_price_after_discount_and_tax}</p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0">الاجمالى </p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0">{data?.data?.total_price}</p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-sm-3">
                        <p className="mb-0">توقيت الطلب </p>
                      </div>
                      <div className="col-sm-9">
                        <p className="text-muted mb-0">{data?.data?.order_date}</p>
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
                        {data?.data?.products?.map((item, index) => (
                          <tr>
                            <th scope="row">{index + 1}</th>
                            <td>{item?.name}</td>
                            <td>{item?.price}</td>
                            <td>{item?.quantity}</td>
                            <td>
                              <button className='btn btn-outline-danger' onClick={() => handelDelete(item?.product_id_in_order)}>حذف</button>
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
    </div>
  )
}

export default DetailsOrder2