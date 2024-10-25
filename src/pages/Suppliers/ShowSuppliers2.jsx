import React from 'react'
import { useState } from 'react'

const ShowSuppliers2 = () => {
  const [loading, setLoading] = useState(false)
  const suppliers = [
    {
      id: 1,
      name: 'Supplier 1',
      phone: '01011497544',
      kind: 'سوق محلى',
      address: 'Address 1'
    },
    {
      id: 2,
      name: 'Supplier 2',
      phone: '010114954874',
      kind: 'متعاقد',
      address: 'Address 2'
    },
    {
      id: 3,
      name: 'Supplier 3',
      phone: '010114954874',
      kind: 'متعاقد',
      address: 'Address asdkjhddjkh ndmsbdhgj m,hdgjhdsabb mnagbvhsdgv2'
    },
  ]
  return (
    <>
      <div className="shadow-lg p-3 mb-5 rounded text-center fs-2 fw-bold shifts text-light" >الموردين</div>

      <table className="table table table-hover">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">الاسم</th>
            <th scope="col">الهاتف</th>
            <th scope="col">المكان</th>
            <th scope="col">النوع</th>
            <th scope='col' >الاجراءت</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((item, index) => (
            <tr key={index}>
              <th scope="row">{index + 1}</th>
              <td>{item?.name}</td>
              <td>{item?.phone}</td>
              <td>{item?.address}</td>
              <td>{item?.address}</td>
              <td>
                <button type="button" className="mx-2 btn btn-outline-info">تفاصيل</button>
                <button type="button" className="mx-2 btn btn-outline-success">تعديل</button>
                <button type="button" className="mx-2 btn btn-outline-danger">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default ShowSuppliers2