
import { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINT } from "../../config";
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
const CreateNewWiter = () => {
  const navigate = useNavigate()
  const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const [isPending, setIsPending] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')


  const handelSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true)
    try {
      await axios
        .post(
          `${API_ENDPOINT}/api/v1/store/waiter/create`,
          {
            name: name,
            phone: phone,
          },
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            }
          }
        )
        .then((response) => {
          setIsPending(false);
          message.success('تم اضافة ويتر جديد بنجاح')
          navigate('/warehouse/reports/witer')
        });
    } catch (err) {
      setIsPending(false);
      message.error('حدث خطأ ما')

    }
  }
  return (
    <div>
      <div className="shadow-lg p-3 mb-5 rounded text-center fs-2 fw-bold shifts text-light" >اضافة ويتر جديد</div>
      <form onSubmit={handelSubmit}>
        <div className="mb-3">
          <label htmlFor="exampleInputName" className="form-label">اسم الويتر</label>
          <input
            type="text"
            className="form-control"
            id="exampleInputName"
            aria-describedby="textHelp"
            placeholder='ادخل اسم الويتر'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPlace" className="form-label">رقم الهاتف</label>
          <input
            type="text"
            className="form-control"
            id="exampleInputPlace"
            aria-describedby="placeHelp"
            placeholder='ادخل رقم الهاتف '
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        {!isPending &&
          <button type="submit" className="btn btn-primary">اضافة</button>
        }
        {isPending &&
          <button type="submit" className="btn btn-primary" disabled>جارى الاضافة</button>
        }
      </form>
    </div>
  )
}

export default CreateNewWiter
