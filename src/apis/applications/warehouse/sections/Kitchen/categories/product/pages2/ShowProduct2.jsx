import axios from "axios";
import { useEffect, useState } from "react";
import { API_ENDPOINT } from "../../../../../../../../config";
import { Link } from "react-router-dom";
const ShowProduct2 = () => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [data, setData] = useState([]);
  useEffect(() => {
    axios
      ?.get(`${API_ENDPOINT}/api/v1/store/categories`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => setData(res))
      .catch((err) => console.log("error", err));
  }, []);
  // console.log("data", data);
  return (
    <div>
      <div className="my-4">
        <h1 className="heading text-center p-3">المنتجات</h1>
      </div>
      <div className="container text-center">
        <div className="row align-items-center">
          {data?.data?.data?.map((item, index) => (
            <Link
              key={index}
              className="col-4 rounded text-decoration-none"
              to={`/warehouse/returants/show-resturants2/${item?.id}`}
              state={{ item }}
            >
              <div className="card custom-card-rest" style={{ width: "18rem" }}>
                <img
                  src={item?.image}
                  className="card-img-top image-rest"
                  alt={item?.name}
                />
                <div className="card-body">
                  <h3 className="card-title details-rest">{item?.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShowProduct2;
