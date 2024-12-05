import { useState } from "react";
import { Link } from "react-router-dom";

const UpdateReviewProduct = () => {
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <div
        className="shadow p-3 my-5 text-light text-center rounded"
        style={{ backgroundColor: "#803D3B" }}
      >
        <h1> تعديل </h1>
      </div>
      <form>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail8" className="form-label">
            السعر :
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
            الضريبة :
          </label>
          <input
            disabled
            type="email"
            className="form-control"
            id="exampleInputEmail9"
            aria-describedby="emailHelp6"
            value={30}
          />
        </div>
        <div className="d-grid gap-2 col-6 mx-auto">
          {!loading ? (
            <button className="btn btn-success" type="button">
              تعديل
            </button>
          ) : (
            <button className="btn btn-success" type="button" disabled>
              جاري التعديل ...
            </button>
          )}
          <button className="btn btn-danger" type="button">
            رجوع
          </button>
        </div>
      </form>

    </div>
  );
};

export default UpdateReviewProduct;
