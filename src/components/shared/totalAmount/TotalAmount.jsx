// components/TotalAmount.js
import React from "react";

const TotalAmount = ({ total, className }) => {
  // Check if total is a valid number
  if (typeof total !== "number" || isNaN(total)) {
    return <div className="total">Invalid total amount</div>;
  }

  return (
    <div
      className={
        "total " +
        className +
        " bg-gray-100 p-4 rounded-lg shadow-md text-center"
      }
    >
      <h3 className="text-xl font-semibold text-gray-800">
        الإجمالي :&nbsp;
        <span className="text-green-600 font-bold">{total.toFixed(2)}</span>
        {/* &nbsp; ج.م */}
      </h3>
    </div>
  );
};

export default TotalAmount;
