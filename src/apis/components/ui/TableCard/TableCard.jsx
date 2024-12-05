import React from "react";
import { useNavigate } from "react-router-dom";
import tableImg from '../../../../public/assets/images/departments images/table-dining-sets.jpg'
import "./TableCard.scss";
const TableCard = ({ id, number }) => {
  const navigate = useNavigate();
  const handleCardClick = () => {
    navigate(`/warehouse/cashier/order/${id}`);
  };
  return (
    <button className="custom-table-card" onClick={handleCardClick}>
      <div className="image">

        <img
          className="table-card-img"
          src={tableImg}
          alt={`alt-table-img`}
        />
      </div>
      <div className="table-number">
        <p className="table-number-title">{number}</p>
      </div>
    
    </button>
  );
};

export default TableCard;
