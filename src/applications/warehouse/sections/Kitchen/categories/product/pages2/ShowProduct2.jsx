import axios from "axios";
import { useEffect, useState } from "react";
import { API_ENDPOINT } from "../../../../../../../../config";
import { Link } from "react-router-dom";
const ShowProduct2 = () => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [data, setData] = useState([]);
  useEffect(() => {
    axios
      ?.get(`${API_ENDPOINT}/api/v1/store/categories`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => setData(res))
      .catch((err) => console.log("error", err));
  }, []);
  // console.log("data", data);
  return (
    // <div>
    //   <div className="my-4">
    //     <h1 className="heading text-center p-3">المنتجات</h1>
    //   </div>
    //   <div className="container text-center"  style={{ display: "flex",flexWrap:"wrap", justifyContent:"space-between",  flexDirection: "row", gap: "50px", flexDirection:"row", justifyItems:"center" }}>
    //     <div  style={{ display: "flex", flexDirection: "row", gap: "50px", flexDirection:"row", justifyItems:"center" }} >
    //       {data?.data?.data?.map((item, index) => (
    //         <Link
    //           key={index}                                                          
    //           // className="col-4 rounded text-decoration-none"
    //           to={`/warehouse/returants/show-resturants2/${item?.id}`}
    //           state={{ item }}
    //           style={{ flex:"1 1 calc(30% - 16px)"}}
    //         >
    //           <div className="card custom-card-rest"  >
    //             <img
    //               src={item?.image}
    //               className="card-img-top image-rest"
    //               alt={item?.name}
    //             />
    //             <div className="card-body" style={{marginTop:"15px"}}>
    //               <span style={{fontWeight:"800", fontSize:"28px", paddingTop:"20px"}} className="menu-link-text">{item?.name}</span>
    //             </div>
    //           </div>
    //         </Link>
    //       ))}
    //     </div>
    //   </div>
    // </div>

      <div>
        <div className="my-1">
          <h1 className="heading text-center p-3">المنتجات</h1>
        </div>


        <div className="text-center" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "50px" , width:"80%", margin:"auto", marginTop:"80px"}}>
          {data?.data?.data?.map((item, index) => (
            <Link
              key={index}
              to={`/warehouse/returants/show-resturants2/${item?.id}`}
              state={{ item }}
              style={{ flex: "1 1 calc(33% - 16px)", maxWidth: "30%", textDecoration: "none" }}
            >
              <div className="card custom-card-rest"  style={{ width:"100%"}}>
                <img
                  src={item?.image}
                  className="card-img-top image-rest"
                  alt={item?.name}
                />
                <div className="card-body" style={{ marginTop: "15px" }}>
                  <span style={{ fontWeight: "800", fontSize: "28px", paddingTop: "20px" }} className="menu-link-text">
                    {item?.name}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
  );
};

export default ShowProduct2;
