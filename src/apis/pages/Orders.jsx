import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Orders = () => {
  const [loading, setLoading] = useState(false)

  const order = [
    {
      id: 1,
      name: 'جاردن 1',
      img: "http://10.0.6.8:3000/storage/departments_images/fKdsb8NU32rVSjvfIvLAluY1mzaIt6XwgY5W2MLr.jpg",
    },
    {
      id: 2,
      name: 'جاردن 1',
      img: "http://10.0.6.8:3000/storage/departments_images/fKdsb8NU32rVSjvfIvLAluY1mzaIt6XwgY5W2MLr.jpg",
    },
    {
      id: 3,
      name: 'جاردن 1',
      img: "http://10.0.6.8:3000/storage/departments_images/fKdsb8NU32rVSjvfIvLAluY1mzaIt6XwgY5W2MLr.jpg",
    },
    {
      id: 4,
      name: 'جاردن 1',
      img: "http://10.0.6.8:3000/storage/departments_images/fKdsb8NU32rVSjvfIvLAluY1mzaIt6XwgY5W2MLr.jpg",
    },
    {
      id: 5,
      name: 'جاردن 1',
      img: "http://10.0.6.8:3000/storage/departments_images/fKdsb8NU32rVSjvfIvLAluY1mzaIt6XwgY5W2MLr.jpg",
    },
    {
      id: 6,
      name: 'جاردن 1',
      img: "http://10.0.6.8:3000/storage/departments_images/fKdsb8NU32rVSjvfIvLAluY1mzaIt6XwgY5W2MLr.jpg",
    },
  ]
  return (
    <>
      <div className="shadow-lg p-3 mb-5 rounded text-center fs-2 fw-bold shifts text-light" >التربيزات المفتوحة</div>
      <div className="container text-center">
        <div className="row  ">
          {order?.map((item, index) => (
            <div className="col-sm-4 d-flex flex-wrap justify-content-around">
              <Link
                key={index}
                // to={`/warehouse/cashier/order/${item?.id}`}
                to={`/warehouse/cashier/create-order`}
                state={{ item }}
                className="card mb-3"
                style={{
                  width: "18rem",
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center'

                }}
              >
                <img src={item?.img} className="card-img-top" alt="..." />
                <div className="card-body">
                  <h5 className="card-title">{item?.name}</h5>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div >
    </>


  )
}

export default Orders