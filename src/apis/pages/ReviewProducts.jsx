import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


const ReviewProducts = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    axios
      ?.get(`fddfdfdf`)
      .then((res) => {
        setData(res?.data);
      })
    // .catch((err) => // console.log("error", err));
  }, []);
  return (
    <div>
      <div
        className="shadow p-3 my-5 text-light text-center rounded"
        style={{ backgroundColor: "#803D3B" }}
      >
        <h1> مراجعه المنتجات </h1>
      </div>
      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">اسم المنتج</th>
            <th scope="col">سعر التكلفه</th>
            <th scope="col">الاجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>رز بالبن</td>
            <td>15 جنيه مصري</td>
            <td>
              <Link to={"/warehouse/reports/review-product"}>
                <button className="mx-3 px-5 btn btn-outline-success">
                  مراجعه
                </button>
              </Link>

            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ReviewProducts;
