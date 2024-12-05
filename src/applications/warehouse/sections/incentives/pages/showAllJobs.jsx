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
    const [points, setPoints] = useState("");
    const handleEditJob= async()=>{
        const res= await  axios.put(`${API_ENDPOINT}/api/v1/jobs/${itemId}`, 
            
              { name:name,
                points:points
            },
          {  headers: {
              Authorization: `Bearer ${Token}`,
            },}
          )
          if(res.data){
            message.success('تم تعديل الوظيفه بنجاح');
            onHide
          }  
    }
    const handleAddJob= async()=>{
       const res= await axios.post(`${API_ENDPOINT}/api/v1/jobs/`, 
            
              {  
                name:name,
                points:points
            },
            { headers: {
              Authorization: `Bearer ${Token}`,
            },}
          )
          if(res.data){
            message.success('تم اضافة الوظيفه بنجاح');
            onHide
          }  
    }
  
    return (
      <Modal
      title={itemId? "   تعديل وظيفه   " :"اضافة وظيفه جديده"}
      centered
      open={show}
      onOk={itemId? handleEditJob:handleAddJob}
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
const ShowAllJobs = () => {
  const item = useLocation()?.state?.item;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const [itemId, setItemId] = useState(null);

  const handelDelete = async (id) => {
    const res = await axios
      .delete(`${API_ENDPOINT}/api/v1/jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      if(res.data){
        message.success('تم الحذف بنجاح'); 
      }  
  };
  const handelEdit = async (id) => {
    setItemId(id); // Store the id of the employee to be edited
    setIsModalVisible(true);
 
};
 useEffect(() => {
    axios.get(`${API_ENDPOINT}/api/v1/jobs/`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
      });
  }, []);
  return (
    <div>
      <div className="my-5 ">
        <h1 className="heading text-center p-3">  الوظائف  </h1>
      </div>
     <div>
     <button
          type="button"
          className="btn text-light fs-bold px-3"
          style={{ backgroundColor: "#AF8260" }}
          onClick={()=>setIsModalVisible(true)}
        >
          اضافه وظيفه جديده
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
            <th scope="col" style={{ background: '#edede9' }}>عدد البونط</th>
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
            >{item.points}
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

export default ShowAllJobs;
