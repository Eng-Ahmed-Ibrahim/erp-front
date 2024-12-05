import React from "react";

const InventoryShowSupplierInvoicesReport = () => {
  return (
    <div>
      <div
        className="shadow p-3 my-5 text-light text-center rounded"
        style={{ backgroundColor: "rgb(128, 61, 59)" }}
      >
        <h3>تقرير مبيعات الكاشير عن فترة</h3>
      </div>
      <div className="container text-center">
        <div className="row align-items-center">
          <div className="col-3">
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label text-end">
                اسم الكاشير
              </label>
              <input
                type="text"
                className="form-control"
                id="exampleFormControlInput1"
                placeholder="اسم الكاشير"
              />
            </div>
          </div>
          <div className="col-3">
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label text-end">
                من
              </label>
              <input
                type="date"
                className="form-control"
                id="exampleFormControlInput1"
              />
            </div>
          </div>
          <div className="col-3">
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label text-end">
                الى
              </label>
              <input
                type="date"
                className="form-control"
                id="exampleFormControlInput1"
              />
            </div>
          </div>
          <div className="col-3">
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label text-end">
                نوع العميل :
              </label>
              <select className="form-select" aria-label="Default select example">
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </select>
            </div>
          </div>
          <div className="col-3">
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label text-end">
                اسم العميل
              </label>
              <select className="form-select" aria-label="Default select example">
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </select>
            </div>
          </div>
          <div className="col-3">
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label text-end">
                طريقه الدفع
              </label>
              <select className="form-select" aria-label="Default select example">
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <table className="table table-hover mt-5">
        <thead>
          <tr>
            <th scope="col">الرقم</th>
            <th scope="col">الصنف</th>
            <th scope="col">المنفذ</th>
            <th scope="col">الكمية</th>
            <th scope="col">السعر</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>مشروبات</td>
            <td>اندلسية</td>
            <td>50</td>
            <td>70 جنية</td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>ماكولات</td>
            <td>الخديوى</td>
            <td>30</td>
            <td>50 جنية</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default InventoryShowSupplierInvoicesReport;
