import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../config";
import { Pagination, Select,Modal,message } from "antd";
function DataModal({ show, onHide,itemId}) {
    const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
    const [name, setName] = useState("");
    const [nationalID, setNationalID] = useState("");
    const [job, setJob] = useState("");
    const [department, setDepartment] = useState("");
    const [jobs, setJobs] = useState([]);
    const [data, setData] = useState([]);
    const [departments, setDepartments] = useState([]);
    useEffect(() => {
        axios.get(`${API_ENDPOINT}/api/v1/employees/`, {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        })
          .then((response) => {
            setData(response.data.data);
            const employee = data.map((user)=>user.id===itemId)
          })
          .catch((error) => {
          });
      }, []);

      
      const handleAddEmployee=async()=>{
        const res= await axios.post(`${API_ENDPOINT}/api/v1/employees/`, 
        
          {  national_id:nationalID,
            name:name,
            job_id:job,
            department_id:department,
            points:null
        },
      {  headers: {
          Authorization: `Bearer ${Token}`,
        },}
      )
      if(res.data){
        message.success('تم اضافه الموظف بنجاح');
        onHide
      }  
}
const handleEditEmployee= async ()=>{
    const res= await axios.put(`${API_ENDPOINT}/api/v1/employees/${itemId}`, 
        
          {  national_id:nationalID,
            name:name,
            job_id:job,
            department_id:department,
            points:null
        },
      {  headers: {
          Authorization: `Bearer ${Token}`,
        },}
      )
      if(res.data){
        message.success('تم تعديل الموظف بنجاح');
        onHide
      }  
}
    useEffect(() => {
        axios.get(`${API_ENDPOINT}/api/v1/store/department`, {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        })
          .then((response) => {
            setDepartments(response.data);
          })
          .catch((error) => {
          });
      }, []);
      useEffect(() => {
        axios.get(`${API_ENDPOINT}/api/v1/jobs/`, {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        })
          .then((response) => {
            setJobs(response.data);
          })
          .catch((error) => {
          });
      }, []);
    return (
      <Modal
      title={itemId? "   تعديل موظف   " :"اضافة موظف جديد"}
      centered
      open={show}
      onOk={itemId ? handleEditEmployee: handleAddEmployee}
      onCancel={onHide}
      width={1000}
    >
     <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          > الاسم </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          > الرقم القومي </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            value={nationalID}
            onChange={(e) => setNationalID(e.target.value)}
            required
          />
        </div>
        <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          >  اختر القسم التابع له</label>
          <select
            class="form-select"
            aria-label="Default select example"
            value={department}
            onChange={(e) => {
                setDepartment(e.target.value)
            }}
          >
            <option selected>اختر مكان</option>
            {departments?.data?.map((item, index) => (
              <option key={index} value={item?.id}>{item?.name}</option>
            ))}
          </select>
        </div>
        <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          >  اختر الوظيفه التابع له</label>
          <select
            class="form-select"
            aria-label="Default select example"
            value={job}
            onChange={(e) => {
                setJob(e.target.value)
            }}
          >
            <option selected>اختر مكان</option>
            {jobs?.data?.map((item, index) => (
              <option key={index} value={item?.id}>{item?.name}</option>
            ))}
          </select>
        </div>
       </Modal>
    );
  }
const ShowAllStaff = () => {
  const item = useLocation()?.state?.item;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const [nationalID, setNationalID] = useState("");
  const [job, setJob] = useState("");
  const [department, setDepartment] = useState("");
  const [point, setPoint] = useState("");
  const [itemId, setItemId] = useState(null);


  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handelEdit = async (id) => {
    setItemId(id); // Store the id of the employee to be edited
    setIsModalVisible(true);

};

  const handelDelete = async (id) => {
    const res = await  axios
      .delete(`${API_ENDPOINT}/api/v1/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
        
      })
      if(res.data){
        message.success('تم الحذف بنجاح');
        
      }  
  }; useEffect(() => {
    axios.get(`${API_ENDPOINT}/api/v1/employees/`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    })
      .then((response) => {
        setData(response.data);
        setName()
      })
      .catch((error) => {
      });
  }, []);
  return (
    <div>
      <div className="my-5 ">
        <h1 className="heading text-center p-3"> العاملين بالدار  </h1>
      </div>
     <div>
     <button
          type="button"
          className="btn text-light fs-bold px-3"
          style={{ backgroundColor: "#AF8260" }}
          onClick={()=>setIsModalVisible(true)}
        >
          اضافه موظف
        </button>
     </div>
      <table
        className="table table table-hover mt-5"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: "var(--text-color-inverted)",
        }}
      >
        <thead>
          <tr className="fw-bold fs-5 my-3">
          <th scope="col" style={{ background: '#edede9' }}>الاسم</th>
            <th scope="col" style={{ background: '#edede9' }}>القسم</th>
            <th scope="col" style={{ background: '#edede9' }}>الوظيفه</th>
            <th scope="col" style={{ background: '#edede9' }}>البونط</th>
            <th scope="col" style={{ background: '#edede9' }}>الرقم القومي</th>
            <th scope="col" style={{ background: '#edede9' }}>ألاجرائات</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((item, index) => (
            <tr key={index} className="content-area-table">
                         <td
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >{item.name}
            </td>
            <td
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >{item.department.name}
            </td>
            <td
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >{item.job.name}
            </td>
            <td
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >{item.points?item.points:"لا يوجد"}
            </td>
            <td
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >{item.national_id}
            </td>
            <td
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}>
                <div style={{display:"flex",flexDirection:"row",gap:"7px"}}>
                <button
          type="button"
          className="btn text-light fs-bold px-3"
          style={{ backgroundColor: "#AF8260" }}
          onClick={()=>handelEdit(item.id)}
        >
تعديل        </button>
        <button
          type="button"
          className="btn text-light fs-bold px-3"
          style={{ backgroundColor: "red" }}
          onClick={()=>handelDelete(item.id)}
        >
خذف        </button>
        </div>
            </td>
            </tr>
          ))}
        </tbody>
      </table>
      <DataModal
        show={isModalVisible}
        onHide={() => setIsModalVisible(false)}  
        itemId={itemId}
        

/>
      {data?.data?.length > 0 && (
        <Pagination
          className="pagination"
          current={currentPage}
          onChange={handlePageChange}
          total={data?.pagination?.total || 1}
          showSizeChanger={false}
        />
      )}
    </div>
  );
};

export default ShowAllStaff;
