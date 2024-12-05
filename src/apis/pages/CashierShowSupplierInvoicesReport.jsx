import React from "react";

const CashierShowSupplierInvoicesReport = () => {
  return (
    <div>
      <div
        className="shadow p-3 my-5 text-light text-center rounded"
        style={{ backgroundColor: "rgb(128, 61, 59)" }}
      >
        <h3>تقرير محتويات المخازن الفرعية عن مدة</h3>
      </div>
      <div className="container text-center">
        <div className="row align-items-center">
          <div className="col">
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                المنفذ
              </label>
              <input
                type="text"
                className="form-control"
                id="exampleFormControlInput1"
                placeholder="اسم المنفذ"
              />
            </div>
          </div>
          <div className="col">
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                من
              </label>
              <input
                type="date"
                className="form-control"
                id="exampleFormControlInput1"
              />
            </div>
          </div>
          <div className="col">
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                الى
              </label>
              <input
                type="date"
                className="form-control"
                id="exampleFormControlInput1"
              />
            </div>
          </div>
        </div>
      </div>
      <table className="table table-hover mt-5">
        <thead>
          <tr>
            <th scope="col">الرقم</th>
            <th scope="col">الصنف</th>
            <th scope="col">مكان التواجد</th>
            <th scope="col">المصروف</th>
            <th scope="col">الهالك</th>
            <th scope="col">المرتجع</th>
            <th scope="col">المتبقي</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
            <td>@mdo</td>
            <td>@mdo</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
            <td>@mdo</td>
            <td>@mdo</td>
            <td>@mdo</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CashierShowSupplierInvoicesReport;
