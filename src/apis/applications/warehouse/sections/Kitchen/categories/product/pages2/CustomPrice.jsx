import { message } from "antd";
import axios from "axios";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { API_ENDPOINT } from "../../../../../../../../config";

const CustomPrice = () => {
  const [isPending, setIsPending] = useState(false);
  const item = useLocation()?.state?.item;
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [profit, setprofit] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [services, setServices] = useState("");

  useEffect(() => {
    if (item?.price && profit) {
      const total = parseFloat(item.price) + parseFloat(profit);
      setTotalPrice(total.toFixed(2));
    } else {
      setTotalPrice(item?.price ? parseFloat(item.price).toFixed(2) : "");
    }
  }, [item?.price, profit]);

  const [client_type, setClient_type] = useState([]);
  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/store/client_type`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        setClient_type(res?.data);
      })
      .catch((err) => {
        // console.log("error from clint type", err);
        message.error("حدث خطا ما");
      });
  }, []);
  // console.log("fetch data from client type", client_type);
  const getInitialState = () => {
    const value = null;
    return value;
  };
  const [value, setValue] = useState(getInitialState);

  const [client_id, setClient_id] = useState([]);
  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/orders/clients/${value}`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        setClient_id(res?.data);
      })
      .catch((err) => {
        // console.log("error from clint type", err);
        message.error("حدث خطا ما");
      });
  }, [value]);
  const getInitialState2 = () => {
    const value2 = null;
    return value2;
  };
  const [value2, setValue2] = useState(getInitialState2);

  console.log(" client id", client_id);
  const hanelSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await axios
        .post(
          `${API_ENDPOINT}/api/v1/store/products/add/price/${item?.id}`,
          {
            name: item?.name,
            price: item?.price,
            client_type_id: value,
            client_id: value2,
            profit: profit,
            service: services,
          },
          {
            headers: {
              Authorization: `Bearer ${Token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((response) => {
          setprofit("");
          setServices("");
          // console.log("created success", response);
        });
      setIsPending(false);
    } catch (err) {
      setIsPending(false);
      // console.log("response" + err);
    }
  };

  return (
    <div>
      <div className="my-5">
        <h1 className="heading text-center p-3">
          اسعار خاصة للمنتج <span className="text-warning">({item?.name})</span>
        </h1>
      </div>
      <div className="container text-end">
        <div className="row align-items-start">
          <div className="col-4">
            <label htmlFor="exampleInputEmail1" className="form-label">
              نوع العميل :
            </label>
            <select
              className="form-select"
              aria-label="اختر نوع العميل"
              onChange={(e) => setValue(e?.target?.value)}
            >
              <option value="">اختر نوع العميل</option>
              {client_type?.data?.map((item, index) => (
                <option key={index} value={item?.id}>
                  {item?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-4">
            <label htmlFor="exampleInputEmail1" className="form-label">
              اسم العميل :
            </label>
            <select
              className="form-select"
              aria-label="اختر اسم العميل"
              onChange={(e) => setValue2(e.target?.value)}
            >
              <option value="">اختر اسم العميل</option>
              {client_id?.data?.map((item, index) => (
                <option key={index} value={item?.id}>
                  {item?.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <form onSubmit={hanelSubmit}>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            سعر البيع :
          </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={item?.price}
          // onChange={(e) => setprofit(e?.target?.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            الربح :
          </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={profit}
            onChange={(e) => setprofit(e?.target?.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            اجمالى السعر:
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={totalPrice}
          // onChange={(e) => setTotalPrice(e?.target?.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            الخدمة:
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={services}
            onChange={(e) => setServices(e?.target?.value)}
          />
        </div>
        <div className="d-grid gap-2">
          <button className="btn btn-primary" type="submit">
            اضافة سعر جديد
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomPrice;
