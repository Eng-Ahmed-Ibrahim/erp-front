import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios'
import { API_ENDPOINT } from "../../../../../../config";
const ClintType = () => {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [abouts, setAbouts] = useState([]);
  const [about, setAbout] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [clientTypes, setClientTypes] = useState([]);
  const token = localStorage.getItem('token');
  const [clientTypes2, setClientTypes2] = useState([]);

  useEffect(() => {
    axios.get(`${API_ENDPOINT}/api/v1/store/payment_method`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setPaymentMethods(res?.data?.data);
      })
      .catch((err) => {
        // console.log(err);
      });
  }, [token]);
  console.log(paymentMethods);
  
  useEffect(()=>{
    axios.get(`${API_ENDPOINT}/api/v1/store/client_type`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setClientTypes2(res?.data?.data);
      })
      .catch((err) => {
        // console.log(err);
      });
  },[])

console.log('clientTypes2',clientTypes2);


  const handleDestinationChange = (e) => {
    const destinationId = e.target.value;
    setSelectedDestination(destinationId);
    axios
      // .get(`subjects/${destinationId}`, {
      .get(`${API_ENDPOINT}/api/v1/orders/clients/${destinationId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setClientTypes(res?.data);
        setSelectedSubject('');
        setAbouts([]);
      })
      .catch((err) => {
        // console.log(err);
      });
  };
  console.log();

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);

    axios
      .get(`about/${subjectId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAbouts(res?.data.data);
      })
      .catch((err) => {
        // console.log(err);
      });
  };
  // console.log('productType', productType);

  return (
    <div className="dashboard d-flex flex-row">
      <div className="container text-center">

        <div className="drop-down mb-5 d-flex justify-content-between align-items-center">
          <select
            className="form-select ms-3"
            aria-label="Default select example"
            onChange={handleDestinationChange}
            value={selectedDestination}
            placeholder="اختر طريقة دفع"
          >
            <option value="">طرق الدفع </option>
            {paymentMethods.map((destination) => (
              <option key={destination._id} value={destination._id}>
                {destination.name}
              </option>
            ))}
          </select>
          <select
            className="form-select ms-3"
            aria-label="Default select example"
            onChange={handleSubjectChange}
            value={selectedSubject}
            disabled={!selectedDestination}
            placeholder="اختر نوع العميل"
          >
            <option value="">نوع العميل</option>
            {clientTypes?.data?.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            aria-label="Default select example"
            onChange={(e) => setAbout(e.target.value)}
            value={about}
            disabled={!selectedSubject}
            placeholder="اختر العميل"
          >
            <option value="">العميل</option>
            {/* {abouts.map((aboutItem) => (
              <option key={aboutItem._id} value={aboutItem._id}>
                {aboutItem.name}
              </option>
            ))} */}
          </select>
          <select
            className="form-select"
            aria-label="Default select example"
            onChange={(e) => setAbout(e.target.value)}
            value={about}
            disabled={!selectedSubject}
            placeholder="رقم العضوية "
          >
            <option value="">رقم العضوية </option>
            {/* {abouts.map((aboutItem) => (
              <option key={aboutItem._id} value={aboutItem._id}>
                {aboutItem.name}
              </option>
            ))} */}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ClintType;


// {/* <div
//         className="form-radio-cont"
//       >
//       <label htmlFor="">نوع المنتج:</label>
//         <label className="form-radio-btn">
//           <input
//             defaultChecked
//             type="radio"
//             name="orderType"
//             value="kitchen"
//             checked={productType === "department"}
//             onChange={() => setProductType("department")}
//           />
//           من المنفذ
//         </label>
//         <label className="form-radio-btn">
//           <input
//             type="radio"
//             name="orderType"
//             value="department"
//             checked={productType === "kitchen"}
//             onChange={() => setProductType("kitchen")}
//           />
//           من المطبخ
//         </label>
//         <label className="form-radio-btn">
//           <input
//             type="radio"
//             name="orderType"
//             value="patesier"
//             checked={productType === "patesier"}
//             onChange={() => setProductType("patesier")}
//           />
//           الحلوانى
//         </label>
//         <label className="form-radio-btn">
//           <input
//           type="radio"
//             name="orderType"
//             value="patesierKitchen"
//             checked={productType === "patesierKitchen"}
//             onChange={() => setProductType("patesierKitchen")}
//             />
//           مطبخ الحلوانى
//         </label>

//       </div> */}
// {/* {addFormVisible && ( */ }
// {/* <div className="form-cashier-details-parent">
    
//             <div>
//               <label className="form-cashier-label"> الرقم العضوية:</label>
//               <input
//                 className="form-cashier-input"
//                 type="number"
//                 value={newUserValues["military_number"]}
//                 onChange={(e) =>
//                   handleNewUserFormChange("military_number", e.target.value)
//                 }
//                 onWheel={(event) => event.currentTarget.blur()}
//               />
//             </div>
//           </div> */}
// {/* )} */ }