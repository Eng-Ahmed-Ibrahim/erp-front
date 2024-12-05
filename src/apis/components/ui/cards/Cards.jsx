import React from "react";
import { API_ENDPOINT } from "../../../../config";
import "./Cards.scss";

function Cards(props) {
  // console.log(props)
  return (
    <button className="custom-card-rest" onClick={props.onClick}>
      <div className="image-rest">
        <img
          className="card-img-rest"
          src={`${props.img}`}
          alt={`alt-${props.department}`}
        />
      </div>
      <div className="details-rest">
        <h1>{props.department} </h1>
      </div>
    </button>
  );
}

export default Cards;
