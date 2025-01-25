import React from "react";
import { API_ENDPOINT } from "../../../../config";
import "./Cards.scss";

function Cards(props) {
  // console.log(props)
  return (
    <button className="custom-card-rest" onClick={props.onClick}  style={{
      Flex:"1 1 30%",
      // flexBasis: '33.33%', // Makes each item take up one-third of the container width
      boxSizing: 'border-box', 
      minWidth:"350px"

    }}>
      <div className="image-rest" >
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
