import React from "react";
import { API_ENDPOINT } from "../../../../config";
import "./Cards.scss";

function SellsPointsCard(props) {
  // console.log(props)
  return (
    <button className={`custom-card-rest`} onClick={props.onClick}>
      <div className="image-rest">
        <img
          className="card-img-rest"
          src={`${props.img}`}
          alt={`alt-${props.department}`}
        />
      </div>
      <div className={`${props.isActive === "true" ? " details-rest isActive" : " details-rest"}`} style={{ display: "flex", flexDirection: "column", direction: 'ltr' }} >
        <h1>{props.department} </h1>

        <p> {props.from}: {props.to} </p>

        <p>{props.date} </p>
      </div>
    </button>
  );
}

export default SellsPointsCard;
