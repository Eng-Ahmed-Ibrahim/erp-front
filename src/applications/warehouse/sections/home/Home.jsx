import { Outlet } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { Pagination, Select ,Modal} from "antd";

const Home = () => {
    console.log("الحريه 1/12/2025")
    console.log("جمعونا احباب وفرقونا اغراب")
    console.log("المشاه مصنع الرجال")
    console.log("الجيش للرجاله والرجاله بتقولك متجيش")
    const { user } = useAuth();
    console.log(user)
    if(user.department.type == "reciver")
    {
    const modal = Modal.warning({
        title: 'warning',
        content: <div style={{ fontSize: '29px', textAlign: 'center' }}>  خلي بالك  انت الان في قسم : <span style={{color:"red",fontWeight:"700"}}> {user.department.name} </span>  هل انت متاكد انك في القسم الصحيح ؟ اذا واجهت مشكله او انك في قسم مخالف برجاء التواصل مع مسؤول الشيفتات <span style={{color:"red",fontWeight:"700"}}> قسم النظم </span>  </div>,
        centered: true, 
        width: 800, 
      });
   
      setTimeout(() => {
        modal.destroy();
      }, 10000); }
    return (

        <div>
            <h1 className="main-hero-title">دار المـشـاة</h1>
            <div className="hero">
                <img src="../../../../../assets/images/hero/Data-report.svg" alt="" />
            </div>
        </div>

    );
};

export default Home;
