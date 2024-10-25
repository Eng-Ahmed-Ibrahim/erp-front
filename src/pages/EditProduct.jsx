import React from "react";
import { Link } from "react-router-dom";

const EditProduct = () => {
  return (
    <div>
      <div
        className="shadow p-3 mt-5 rounded text-light text-center"
        style={{ backgroundColor: "#803D3B" }}
      >
        <h3>تعديل المنتج </h3>
      </div>
      <form className="mb-5">
        <div className="mb-3 mt-5">
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={"السندوتشات"}
            disabled
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            الاسم
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={"محمود"}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            السعر
          </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={"30"}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            الوصف
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={"وصف المنتج"}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            صوره النتج
          </label>
          <img
            src="/kdjkjds.jpg"
            width={"50px"}
            height={"50px"}
            alt=""
            srcset=""
          />
        </div>

        <button
          type="submit"
          className="btn text-light fs-bold px-3"
          style={{ backgroundColor: "#AF8260" }}
        >
          تعديل بيانات المنتج
        </button>
      </form>
      <div
        className="shadow p-3 mb-5 rounded text-light text-center"
        style={{ backgroundColor: "#AF8260" }}
      >
        <h6>اسعار المنتج </h6>
      </div>
      <form>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            نوع العميل
          </label>
          <select className="form-select" aria-label="Default select example">
            <option selected>Open this select menu</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            اسم العميل
          </label>
          <select className="form-select" aria-label="Default select example">
            <option selected>Open this select menu</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            الربح
          </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={"15"}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            الخدمه
          </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={"15"}
          />
        </div>

        <button
          type="submit"
          className="btn text-light fs-bold px-3"
          style={{ backgroundColor: "#AF8260" }}
        >
          اضافه السعر للمنتج
        </button>
      </form>
      <table className="table table-hover mt-5">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">نوع العميل</th>
            <th scope="col">اسم العميل</th>
            <th scope="col">الربح </th>
            <th scope="col">الخدمه </th>
            <th scope="col">السعر الكلى </th>
            <th scope="col">الاجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>ظابط مشاه</td>
            <td>ظابط مشاه</td>
            <td>10 جنيه مصري</td>
            <td> 2% </td>
            <td>40 جنيه مصري</td>
            <td>
              <Link>
                <button className="mx-3 px-5 btn btn-outline-success">
                  تعديل
                </button>
              </Link>
              <button className="mx-3 px-5 btn btn-outline-danger">حذف</button>
            </td>
          </tr>
          <tr>
            <th scope="row">1</th>
            <td> وفود</td>
            <td> وفد كيني </td>
            <td>15 جنيه مصري</td>
            <td> 3% </td>
            <td>35 جنيه مصري</td>
            <td>
              <Link>
                <button className="mx-3 px-5 btn btn-outline-success">
                  تعديل
                </button>
              </Link>
              <button className="mx-3 px-5 btn btn-outline-danger">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        className="shadow p-3 my-5 rounded text-light text-center"
        style={{ backgroundColor: "#AF8260" }}
      >
        <h6>مكونات المنتج </h6>
      </div>
      <Link to={''}>
        <button
          type="button"
          className="btn text-light fs-bold px-3"
          style={{ backgroundColor: "#AF8260" }}
        >
          اضافه مكون
        </button>
      </Link>
      <table className="table table-hover mt-5">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">اسم المنتج</th>
            <th scope="col">الصوره </th>
            <th scope="col">الكميه </th>
            <th scope="col">السعر </th>
            <th scope="col">الاجراءات</th>
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
            <td>
              <button className="mx-3 px-5 btn btn-outline-danger">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EditProduct;
