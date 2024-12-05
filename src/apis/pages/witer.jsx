import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { API_ENDPOINT } from "../../config";
import { message } from 'antd';
const domain = API_ENDPOINT;
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
const witer = () => {
  const [data, setData] = useState([])

  useEffect(() => {
    axios.get(`${domain}/api/v1/store/waiter/all`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        }
      })
      .then(response => {
        setData(response.data)
      })
      .catch(error => {
        message.error('حدث خطأ ما')
        // console.log('error', error);
      });

  }, [])
  const handelDelete = (e) => {
    axios.delete(`${domain}/api/v1/store/waiter/delete/${e}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      }
    })
      .then(res => {
        console.log(res);
        message.success('تم حذف البيانات بنجاح')
        axios.get(`${domain}/api/v1/store/waiter/all`, {
          headers: {
            Authorization: `Bearer ${Token}`,
          }
        }).then(response => {
          setData(response.data)
        })
      })
      .catch(err => {
        message.error('حدث خطأ ما')
        console.log(err);
      })
  }

  return (
    <div className=''>
      <div className="shadow-lg p-3 mb-5 rounded text-center fs-2 fw-bold shifts text-light" >الويتر</div>
      <div className="py-4">
        <Link
          to={'/warehouse/reports/witer/create-new'}>
          <button type="button" className="mx-3 btn btn-outline-success">اضافة ويتر جديد</button>
        </Link>
      </div>
      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">اسم الكاشير</th>
            <th scope="col">رقم الهاتف</th>
            <th scope="col">الاحداث</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((item, index) => (
            <tr key={index}>
              <th scope="row">{index + 1}</th>
              <td>{item?.name}</td>
              <td>{item?.phone}</td>
              <td>
                {/* <Link
                  to={`/warehouse/reports/witer/update-witer/${item?.id}`}
                  state={{ item }}
                >
                  <button type="button" className="mx-3 btn btn-outline-info">تعديل</button>
                </Link> */}
                <button type="button" className="mx-3 btn btn-outline-danger" onClick={() => { handelDelete(item?.id) }}>حذف</button>
              </td>
            </tr>
          ))}

        </tbody>
      </table>
    </div>
  )
}

export default witer
