import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { API_ENDPOINT } from "../../config";
const domain = API_ENDPOINT;
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
const ShoowShifts = () => {
  const [data, setData] = useState([])

  useEffect(() => {
    axios.get(`${domain}/api/v1/store/invoice/filter/get_recipes/out_going_from_to_date/`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        }
      }
    )
      .then(response => {
        setData(response.data)
      })
      .catch(error => {
        // // console.log('error', error);
      });

  }, [])

  const witerArray = [
    {
      id: 1,
      name: 'محمد فاروق وهبي حسام',
      places: 'جاردن 1 ',
      from: '08/14/2024 04:24 PM',
      to: '08/14/2024 08:24 PM',
    },
    {
      id: 2,
      name: 'محمد فاروق  حسام',
      places: 'الاندلسيه',
      from: '08/14/2024 04:24 PM',
      to: '08/14/2024 08:24 PM',
    },
    {
      id: 3,
      name: 'محمد فاروق وهبي ',
      places: 'جاردن 1 ',
      from: '08/14/2024 04:24 PM',
      to: '08/14/2024 08:24 PM',
    },
    {
      id: 4,
      name: 'محمد فاروق  ',
      places: 'جاردن 1 ',
      from: '08/14/2024 04:24 PM',
      to: '08/14/2024 08:24 PM',
    },
  ]
  return (
    <div className=''>
      <div className="shadow-lg p-3 mb-5 rounded text-center fs-2 fw-bold shifts text-light" >الشيفتات</div>
      <div className="py-4">
        <Link
          to={'/warehouse/reports/shift'}>
          <button type="button" className="mx-3 btn btn-outline-success">اضافة شيفت جديد</button>
        </Link>
      </div>
      <div className="container text-center">
        <div className="row align-items-center">
          <div className="col-3">
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label text-end">
                من
              </label>
              <input
                type="date"
                className="form-control"
                id="exampleFormControlInput1"
              />
            </div>
          </div>
          <div className="col-3">
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label text-end">
                الى
              </label>
              <input
                type="date"
                className="form-control"
                id="exampleFormControlInput1"
              />
            </div>
          </div>
        </div>
      </div>
      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">اسم الكاشير</th>
            <th scope="col">المنفذ</th>
            <th scope="col">من</th>
            <th scope="col">الى</th>
            <th scope="col">الاجرائات</th>
          </tr>
        </thead>
        <tbody>
          {witerArray?.map((item, index) => (
            <tr key={index}>
              <th scope="row">{index + 1}</th>
              <td>{item?.name}</td>
              <td>{item?.places}</td>
              <td>{item?.from}</td>
              <td>{item?.to}</td>
              <td>
                <button type="button" className="mx-3 btn btn-outline-danger">حذف</button>
              </td>
            </tr>
          ))}

        </tbody>
      </table>
    </div>
  )
}

export default ShoowShifts
