import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { API_ENDPOINT } from "../../config";
const Shifts = () => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [activeItemId, setActiveItemId] = useState(null);
  const [data, setData] = useState([])

  useEffect(() => {
    axios.get(`${API_ENDPOINT}/api/v1/store/department`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    }
    )
      .then(res => {
        setData(res?.data?.data)
      })
  }, [])
  console.log('data from department', activeItemId);
  return (
    <div className=''>
      <div className="shadow-lg p-3 mb-5 rounded text-center fs-2 fw-bold shifts text-light" >الشيفتات</div>

      <div className=''>
        <div className="container text-center ">
          <div className="row align-items-center">
            <div className="col-md-3">
              <div className="row g-2">
                <div className="col-md">
                  <div className="form-floating">
                    <select className="form-select" id="floatingSelectGrid">
                      <option selected>احمد محمد</option>
                      <option value="1">One</option>
                      <option value="2">Two</option>
                      <option value="3">Three</option>
                    </select>
                    <label htmlFor="floatingSelectGrid">الكاشير</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3 d-flex text-center">
                <label htmlFor="exampleFormControlInput1" className="form-label ps-3 ">من</label>
                <input type="datetime-local" className="form-control" id="exampleFormControlInput1" placeholder="name@example.com" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3 d-flex text-center">
                <label htmlFor="exampleFormControlInput1" className="form-label ps-3 ">الى</label>
                <input type="datetime-local" className="form-control" id="exampleFormControlInput1" placeholder="name@example.com" />
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-around flex-wrap">
          {data?.map((item, index) => (
            <button
              onClick={() => setActiveItemId(item.id)}
              // value={active}
              // onChange={() => setActive(!active)}
              class={`form-check  pe-3 py-3 m-3 shadow rounded shift-hover ${activeItemId === item.id ? "shifts" : ""} 
              `}
              key={index}
              style={{ border: "2px solid #803d3b" }}
            >
              {/*  <div className="form-check  pe-3 py-3 m-3 shadow rounded" style={{ backgroundColor: "#803d3b69" }} key={index}> */}
              {/* <input className="form-check-input" type="checkbox" value={index} id="defaultCheck1" /> */}
              <label className="form-check-label border-success border-3 " htmlFor="defaultCheck1">
                {item?.name}
              </label>
            </button>
          ))}
        </div>
      </div>
      <div className="d-grid gap-2">
        <button className="btn btn-primary bg-brown text-light m-auto mt-5" style={{ width: "50%", backgroundColor: '#803D3B', border: 0 }} type="button">حفظ</button>
      </div>
    </div >

  )
}

export default Shifts