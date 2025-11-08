import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { API_ENDPOINT } from "../../config";
import { Select } from 'antd';
import useShifts from '../lib/services/hooks/useShifts';
import { Loading } from '../components/shared/Loading';
import useGeneralLoading from '../store/loadingStore';
import { transformSingleToDateTime } from '../lib/helpers/transformToDatetime';

const domain = API_ENDPOINT;
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
const ShoowShifts = () => {
  const [shiftsData, setShifftsData] = useState({ from: ``, to: `` })

  const { shifts,
    deleteShift,
    isDeleting,
    deleteError,
    deleteSuccess,
  } = useShifts({
    "date[from]": shiftsData.from,
    "date[to]": shiftsData.to
  });

  const { isGeneralLoading, setIsGeneralLoading } = useGeneralLoading()


  const handleDeleteTask = async (id) => {
    deleteShift(id);
  }
  return (
    <div className=''>
      <div className="shadow-lg p-3 mb-5 rounded text-center fs-2 fw-bold shifts text-light" >الشيفتات</div>
      <div className="py-4">
        <Link
          to={'/warehouse/reports/shift'}>
          <button type="button" className="mx-3 btn btn-outline-success pdf-button">اضافة شيفت جديد</button>
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
                onChange={(e) => setShifftsData({ ...shiftsData, from: transformSingleToDateTime({ day: e.target.value, hour: `08:00` }) })}
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
                onChange={(e) => setShifftsData({ ...shiftsData, to: transformSingleToDateTime({ day: e.target.value, hour: `08:00` }) })}

              />
            </div>
          </div>
        </div>
      </div>
      {(isGeneralLoading) && <Loading />}

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
          {Array.isArray(shifts) && shifts?.map((shift, index) => (
            <tr key={shift.id}>
              <th scope="row">{index + 1}</th>
              <td>{shift?.user?.name}</td>
              <td>{shift?.department?.name}</td>
              <td>{shift?.start}</td>
              <td>{shift?.end}</td>
              <td>
                <button
                  onClick={() => { handleDeleteTask(shift?.shift_id) }}
                  type="button" className="mx-3 btn btn-outline-danger">حذف</button>
              </td>
            </tr>
          ))}

        </tbody>
      </table>

    </div>
  )
}

export default ShoowShifts
