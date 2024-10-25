import { useState } from "react";
import { Link } from "react-router-dom";

const ReviewProduct = () => {
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <div
        className="shadow p-3 my-5 text-light text-center rounded"
        style={{ backgroundColor: "#803D3B" }}
      >
        <h1> مراجعه المنتجات</h1>
      </div>
      <form>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            القسم :
          </label>
          <input
            disabled
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp1"
            value={"قسم الماكولات"}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail2" className="form-label">
            اسم المنتج:
          </label>
          <input
            disabled
            type="email"
            className="form-control"
            id="exampleInputEmail2"
            aria-describedby="emailHelp2"
            value={"رز بالبن"}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail3" className="form-label">
            وصف المنتج:
          </label>
          <input
            disabled
            type="email"
            className="form-control"
            id="exampleInputEmail3"
            aria-describedby="emailHelp3"
            value={"زر فرن مضاف اليه لبن"}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail4" className="form-label">
            صورة المنتج:
          </label>
          <img
            src="../../sjkjsdo/dhjka.jpg"
            width={"50px"}
            height={"50px"}
            alt=""
            srcset=""
            className="mt-3"
          />
        </div>
        {/* <div className="mb-3">
          <label htmlFor="exampleInputEmail5" className="form-label">
            انوع العملاء:
          </label>
          <select className="form-select" aria-label="انوع العملاء">
            <option selected>Open this select menu</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail6" className="form-label">
            اسماء العملاء:
          </label>
          <select className="form-select" aria-label="اسماء العملاء">
            <option selected>Open this select menu</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>
        </div> */}
        <div className="mb-3">
          <label htmlFor="exampleInputEmail7" className="form-label">
            سعر التكلفة:
          </label>
          <input
            disabled
            type="email"
            className="form-control"
            id="exampleInputEmail7"
            aria-describedby="emailHelp4"
            value={15}
          />
        </div>
        {/* 
        <div className="mb-3">
          <label htmlFor="exampleInputEmail8" className="form-label">
            الربح:
          </label>
          <input
            disabled
            type="email"
            className="form-control"
            id="exampleInputEmail8"
            aria-describedby="emailHelp5"
            value={15}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail9" className="form-label">
            اجمالى السعر:
          </label>
          <input
            disabled
            type="email"
            className="form-control"
            id="exampleInputEmail9"
            aria-describedby="emailHelp6"
            value={30}
          />
        </div> */}
        {/* <div className="mb-3">
          <label htmlFor="exampleInputEmail10" className="form-label">
            الخدمة:
          </label>
          <input
            disabled
            type="email"
            className="form-control"
            id="exampleInputEmail10"
            aria-describedby="emailHelp7"
            value={15}
          />
        </div> */}
        <div
          className="shadow p-2 my-5 text-light text-center rounded"
          style={{ backgroundColor: "#803D3B" }}
        >
          <h5> اسعار المنتج</h5>
        </div>
        <table className="table table-hover mt-5">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">نوع العميل</th>
              <th scope="col">السعر</th>
              <th scope="col">الربح</th>
              <th scope="col">اجمالى التكلفه</th>
              <th scope="col">الضريبة</th>
              {/* <th scope="col">الاجراءات</th> */}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">1</th>
              <td>وفود</td>
              <td>15 جنية</td>
              <td>1 جنية</td>
              <td>16 جنية</td>
              <td>1 جنية</td>
              {/* <td>
                <Link to={"/warehouse/reports/review-product/update/:id"}>
                  <button className="mx-3 px-5 btn btn-outline-info">
                    تعديل
                  </button>
                </Link>
                <button className="mx-3 px-5 btn btn-outline-danger">
                  حذف
                </button>
              </td> */}
            </tr>
            <tr>
              <th scope="row">2</th>
              <td>ضابط مشاه</td>
              <td>25 جنية</td>
              <td>2 جنية</td>
              <td>2 جنية</td>
              <td>2 جنية</td>
              {/* <td>
                <Link to={"/warehouse/reports/review-product/update/:id"}>
                  <button className="mx-3 px-5 btn btn-outline-info">
                    تعديل
                  </button>
                </Link>
                <button className="mx-3 px-5 btn btn-outline-danger">
                  حذف
                </button>
              </td> */}
            </tr>
          </tbody>
        </table>
        <div
          className="shadow p-2 my-5 text-light text-center rounded"
          style={{ backgroundColor: "#803D3B" }}
        >
          <h5> مكونات المنتج</h5>
        </div>
        <table className="table table-hover mt-5">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">اسم المنتج</th>
              <th scope="col">الصوره </th>
              <th scope="col">الكميه </th>
              <th scope="col">السعر </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">1</th>
              <td>رز بالبن</td>
              <td>
                <img
                  src="/dojoids.jpg"
                  width={"50px"}
                  height={"50px"}
                  alt=""
                  srcset=""
                />
              </td>
              <td> 5 </td>
              <td>15 جنيه مصري</td>

            </tr>
          </tbody>
        </table>
        <div className="d-grid gap-2 col-6 mx-auto ">
          {!loading ? (
            <button className="btn btn-success" type="button">
              قبول
            </button>
          ) : (
            <button className="btn btn-success" type="button" disabled>
              جاري القبول ...
            </button>
          )}
          <button className="btn btn-danger" type="button">
            رفض
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewProduct;
