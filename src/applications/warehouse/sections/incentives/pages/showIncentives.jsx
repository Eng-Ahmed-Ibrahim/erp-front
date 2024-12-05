
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../config";
import { Pagination, Select ,Modal} from "antd";
function DataModal({ show, onHide,itemId,message}) {
    const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
    const [discount, setDiscount] = useState(0);
    const [reward, setReward] = useState(0);
    const [points, setPoints] = useState(0);
    const handleEditPoints=async()=>{
        const res= await axios.put(`${API_ENDPOINT}/api/v1/incentives/${itemId}`, 
            { 
                discount:discount,
                reward:reward,
                points:points
            },
            {   
            headers: {
              Authorization: `Bearer ${Token}`,
            },
            }
          )
          if(res.data){
            message.success('تم تعديل الحافز بنجاح');
            onHide
          }  
    }

    return (
      <Modal
      title="   تعديل الحوافز   "
      centered
      open={show}
      onOk={handleEditPoints}
      onCancel={onHide}
      width={1000}
    >
     <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          > الاثابه </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            required
          />
        </div>
        <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          > الخصم </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            required
          />
        </div>
        <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          > عدد البونط  </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            required
          />
        </div>
       
       </Modal>
    );
  }
const ShowInventives = () => {
  const [departments, setDepartments] = useState([]);
  const [itemId, setItemId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pointValue, setPointValue] = useState();
  const [editedPointValue, setEditedPointValue] = useState(pointValue);
const month = new Date().toISOString().split("-")[1]
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  useEffect(() => {
    axios.get(`${API_ENDPOINT}/api/v1/incentives/`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    })
      .then((response) => {
        setData(response.data);
        console.log(`data`,data)
        setPointValue(response.data[0].point_value)
        console.log(pointValue,`data`)
        setEditedPointValue(response.data[0].point_value)
      })
      .catch((error) => {
      });
  }, []);
  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/store/department`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        setDepartments(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, []);
  
  const handelEditPoints=async()=>{
    const res= await axios.put(`${API_ENDPOINT}/api/v1/incentives/`, 
        { 
            point_value:editedPointValue
        },
        {   
        headers: {
          Authorization: `Bearer ${Token}`,
        },
        }
      )
      if(res){
        message.success('تم تعديل الحافز بنجاح');
        onHide
      }  
}
  const handelEdit = async (id) => {
    setItemId(id); 
    setIsModalVisible(true);
};  const getDepartmentName = (departmentId) => {
    const department = departments?.find(
      (dept) => dept.id === departmentId
    );
    return department ? department.name : "غير معروف";
  };
  return (
    <div>
      <div className="my-5 ">
        <h1 className="heading text-center p-3"> الحوافز  </h1>
      </div>
     <div>
<div>
    <div class="mb-3" style={{display:"flex",flexDirection:"row"}}>
    <p style={{fontSize:"35px", overflow:"auto" ,whiteSpace:"none", width:"100%",display:"flex", gap:"7px"}}>  قيمه البونط لشهر {month} :  
         <input
          style={{width:"90px",fontSize:"29px"}}
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            value={editedPointValue}
            onChange={(e) => setEditedPointValue(e.target.value)}
            required
          /> 
          جنيه </p>
        </div>
        <button
          type="button"
          className="btn text-light fs-bold px-3"
          style={{ backgroundColor: "#AF8260" }}
          onClick={handelEditPoints}
        >
           تعديل
        </button>
</div>
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
            <th scope="col" style={{ background: '#edede9' }}> عدد البونط</th>
            <th scope="col" style={{ background: '#edede9' }}>الخصم</th>
            <th scope="col" style={{ background: '#edede9' }}>الاثابه</th>
            <th scope="col" style={{ background: '#edede9' }}> اجمالي الحافز</th>
            <th scope="col" style={{ background: '#edede9' }}>الوظيفه</th>
            <th scope="col" style={{ background: '#edede9' }}>الرقم القومي</th>
            <th scope="col" style={{ background: '#edede9' }}>ألاجرائات</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index} className="content-area-table">
                         <td
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >{item.employee.name}
            </td>
            <td
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}
            > {getDepartmentName(item.employee.department_id)} {/* Render department name */}

            </td>
            <td
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >{item.points?item.points : item.job.points?item.job.points:"لا يوجد"}
            </td>
            <td
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >{item.discount}
            </td>
            <td
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >{item.reward}
            </td>
            <td
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >{item.total_incentives}
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
            > {item.employee.national_id}
            </td>
            <td
              style={{
                padding: " 14px 12px",
                border: "1px solid #E4C59E",
                color: "#803D3B",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >     <button
          type="button"
          className="btn text-light fs-bold px-3"
          style={{ backgroundColor: "#AF8260" }}
          onClick={()=>handelEdit(item.id)}
        >
           تعديل
        </button>
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

export default ShowInventives;
