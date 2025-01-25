import React from "react";
import { useNavigate } from "react-router-dom";
import tableImg from "../../../../public/assets/images/departments images/table-dining-sets.jpg";
import "./TableCard.scss";
const TableCard = ({ id, number, comment }) => {
  console.log(`comment`, comment);
  const navigate = useNavigate();
  const handleCardClick = () => {
    navigate(`/warehouse/cashier/order/${id}`);
  };
  return (
    <button className="custom-table-card" onClick={handleCardClick}>
      <div className="image">
        <img className="table-card-img" src={tableImg} alt={`alt-table-img`} />
      </div>
      <div className="table-number">
        <p className="table-number-title">{number}</p>
      </div>

      {comment &&
        comment?.split(",")?.map((c) => {
          return (
            <>
              <li
                style={{ fontWeight: "500", fontSize: "16px", margin: "5px" }}
              >
                {c}
              </li>
            </>
          );
        })}
    </button>
  );
};

export default TableCard;
