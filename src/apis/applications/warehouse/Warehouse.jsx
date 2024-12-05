import { Outlet, Link, useLocation } from "react-router-dom";
import Sidebar from "../../components/shared/sidebar/Sidebar";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useContext, useEffect } from "react";
import { SidebarContext } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import WebSocketComponent from "./sections/WebSocket";
const Warehouse = () => {
  const { checkAuthUser, isLoading } = useAuth();
  const location = useLocation();
  const { wrapperMargin } = useContext(SidebarContext); // Access wrapperMargin from context

  const handleGoBack = () => {
    window.history.back();
  };
  useEffect(() => {
    const getProfile = async () => {
      await checkAuthUser();
    };
    getProfile();
  }, []);
  return (
    <>
      {/* <WebSocketComponent /> */}
      {!isLoading && (
        <>
          <Sidebar />
          <div className={`content-wrapper ${wrapperMargin}`}>
            <button className="back-arrow" onClick={handleGoBack}>
              <ArrowLeftOutlined />
            </button>
            {/* <h1 className="main-hero-title">دار المـشـاة</h1>
            <div className="hero">
              <img src="../../../public/assets/images/hero/Data-report.svg" alt="" />
            </div> */}
            <Outlet />
          </div>
        </>
      )}
      {isLoading && (
        <Spin
          indicator={
            <LoadingOutlined
              style={{ fontSize: 56, marginTop: "50vh", marginRight: "50vw" }}
              spin
            />
          }
        />
      )}
    </>
  );
};

export default Warehouse;
