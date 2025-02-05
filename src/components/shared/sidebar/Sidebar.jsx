import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../../../context/ThemeContext";
import LogoDAR from "../../../../public/assets/images/Dar_logo.svg";
import { Pagination, Select, Modal, message } from "antd";
import axios from "axios";

import {
  MdAssignmentLate,
  MdLocalFireDepartment,
  MdReport,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CgDanger } from "react-icons/cg";

import {
  FaCodePullRequest,
  FaKitchenSet,
  FaWarehouse,
  FaCashRegister,
  FaTruckArrowRight,
  FaCalendarXmark,
} from "react-icons/fa6";
import { FaUserCircle, FaUser, FaUsers } from "react-icons/fa";
import { BsCashCoin, BsCreditCard2FrontFill } from "react-icons/bs";

import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { GiTomato } from "react-icons/gi";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { MdDelete, MdLogout } from "react-icons/md";
import { PiUserSwitchThin } from "react-icons/pi";
import { CiDiscount1 } from "react-icons/ci";
import {
  TbReport,
  TbBrandUnity,
  TbReportSearch,
  TbUserSquare,
} from "react-icons/tb";
import {
  MdOutlineClose,
  MdOutlineLogout,
  MdPerson,
  MdProductionQuantityLimits,
  MdTableBar,
} from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.scss";
import { SidebarContext } from "../../../context/SidebarContext";
import { useTranslation } from "react-i18next";
import { RightOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINT } from "../../../../config";

function SaveIncentivesModal({ show, onHide, user }) {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const navigate = useNavigate();

  const handdleLogoutClick = async () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
    onHide();
  };

  const handleshowTablesClick = () => {
    navigate("/warehouse/cashier/opened-tables");
    onHide();
  };

  return (
    <Modal
      centered
      open={show}
      onCancel={onHide}
      onOk={onHide}
      width={900}
      footer={null}
    >
      <div className="mb-3">
        <h3
          htmlFor="exampleInputPassword"
          className="form-label"
          style={{ justifySelf: "center", margin: "20px" }}
        >
          رجاء التأكد من عدم وجود ترابيزات مفتوحة قبل تقفيل الشيفت
        </h3>
        <h3></h3>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            margin: "40px 20px 20px 20px",
          }}
        >
          {" "}
          <button
            type="button"
            className="pdf-button white-space-nowrap"
            style={{
              // backgroundColor: "#AF8260",
              fontSize: "18px",
              height: "43px",
              margin: "15px 0 20px",
              // background: "firebrick",
            }}
            onClick={handdleLogoutClick}
          >
            تسجيل الخروج
          </button>
          <button
            type="button"
            className="pdf-button white-space-nowrap"
            style={{
              backgroundColor: "#AF8260",
              fontSize: "18px",
              height: "43px",
              margin: "15px 0 20px",
              background: "#803D3B",
            }}
            onClick={handleshowTablesClick}
          >
            عرض الترابيزات المفتوحة
          </button>
        </div>
      </div>
    </Modal>
  );
}

const Sidebar = () => {
  const { theme } = useContext(ThemeContext);
  const { closeSidebar } = useContext(SidebarContext);
  const navbarRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [activeLink, setActiveLink] = useState(pathname);
  const { user } = useAuth();
  const [display, setDisplay] = useState("d-block");
  const [sidebarWidth, setSidebarWidth] = useState("w-defualt");
  const [arrowDirection, setArrowDirection] = useState("");
  const [justifyContent, setJustifyContent] = useState("d-flex-start");
  const { wrapperMargin, toggleWrapperMargin } = useContext(SidebarContext);
  const [key, setKey] = useState(0);
  const [isMechOrChem, setIsMechOrChem] = useState(false);
  const [isTalaat, setIsTalaat] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  const [isIncentives, setIsIncentives] = useState(false);
  const [incentivesCollapsedGroup, setIncentivesCollapsedGroup] =
    useState(false);
  const [linkedDepartment, setLinkedDepartment] = useState("");
  const [linkedDepartmentName, setLinkedDepartmentName] = useState("");
  const [warehouseCollapsedGroup, setWarehouseCollapsedGroup] = useState(false);
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const repairId = "9d727355-cad2-48b4-9671-aebbcfdc6771";
  const chemicalId = "9d72735b-c904-4b4b-a613-f5f16ba8ad98";
  const talaatId = "9d7b0996-857f-4a59-997b-64d605af07c0";
  const CASHIER_ROLE = "9c10dd38-9229-4b5f-b48b-37aab38e9af7";

  const checkMenuItemPermission = (requiredPermission) => {
    if (!user?.permissions) return;
    return user
      ? user?.permissions.some(
          (permission) => permission.name === requiredPermission.name
        )
      : false;
  };

  useEffect(() => {
    if (user.id === "01hy3km0ce0hv4w80hadt8sbt1") {
      setIsAdmin(true);
    }

    if (
      user.permissions.map(
        (permission) => permission.id === "9c17t5au-74tn-48gb-4845-c9nrr3456b0d"
      ) ||
      user.permissions.map(
        (permission) => permission.id === "f5b1a3c2-91e3-4e34-a44d-5f56b6f9b22e"
      )
    ) {
      setIsIncentives(true);
    }

    if (user.roles[0] == talaatId) {
      setIsTalaat(true);
    }

    if (user.roles[0] == CASHIER_ROLE) {
      setUserRole("cashier");
    }
    
    if (user?.department?.linked_department) {
      setLinkedDepartment(user?.department?.linked_department);
      setLinkedDepartmentName(user?.department?.linked_department_name);
    }
    if (!(user.roles[0] == repairId || user.roles[0] == chemicalId)) {
      setIsMechOrChem(false);
    } else {
      setIsMechOrChem(true);
    }

    setKey((prevKey) => prevKey + 1);
  }, [location]);

  const handleLogout = () => {
    if (userRole == "cashier") {
      setLogoutModalVisible(true);
      return;
    }

    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const changeCahierDepartment = async () => {
    try {
      await axios
        .post(
          `${API_ENDPOINT}/api/v1/store/user/update-department/${user.id}`,
          {
            department_id: linkedDepartment,
          },
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        )
        .then((response) => {
          message.success("تم تعديل بيانات مستخدم بنجاح");
        });

      navigate("/warehouse/cashier/create-order", { replace: true });
      window.location.reload();
    } catch (err) {
      message.error(err);
    }
  };

  const handleMenuLinkClick = (link) => {
    setActiveLink(link);
  };

  const handleClickOutside = (event) => {
    if (
      navbarRef.current &&
      !navbarRef.current.contains(event.target) &&
      event.target.className !== "sidebar-oepn-btn"
    ) {
      // closeSidebar();
    }
  };

  const handleIncentivesGroupClick = () => {
    setIncentivesCollapsedGroup(!incentivesCollapsedGroup);
  };

  const handleWarehouseGroupClick = () => {
    setWarehouseCollapsedGroup(!warehouseCollapsedGroup);
  };
  const handleCloseSidebar = () => {
    {
      display === "d-block" ? setDisplay("d-none") : setDisplay("d-block");
    }
    {
      sidebarWidth === "w-auto"
        ? setSidebarWidth("w-defualt")
        : setSidebarWidth("w-auto");
    }
    {
      arrowDirection === "rotate-y-180"
        ? setArrowDirection("")
        : setArrowDirection("rotate-y-180");
    }
    {
      justifyContent === "d-flex-start"
        ? setJustifyContent("d-justify-center")
        : setJustifyContent("d-flex-start");
    }
    toggleWrapperMargin(); // Call toggleWrapperMargin from context
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <nav className={`sidebar ${sidebarWidth}`} ref={navbarRef}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <img src={LogoDAR} alt="" />
          <span className={`sidebar-brand-text ${display}`}>دار المشاه</span>
        </div>
        <div className={`arrows ${arrowDirection}`}>
          <RightOutlined
            className={`arrow-right `}
            onClick={() => {
              handleCloseSidebar();
            }}
          />
        </div>
        <button className="sidebar-close-btn">
          <MdOutlineClose size={24} />
        </button>
      </div>
      <div className="sidebar-body">
        <div className="sidebar-menu">
          <div className="current-user">
            <FaUser size={30} className="user-icon" />
            <span className="user-rule">{user?.name}</span>
          </div>
          <ul className="menu-list">
           
           
           
          <li
              className="menu-item"
              title="الموردين"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 88,
                    name: "view suppliers",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/suppliers/show-suppliers"
                className={`menu-link ${
                  activeLink === "/warehouse/suppliers/show-suppliers"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() => {
                  // console.log("show-suppliers");
                  handleMenuLinkClick("/warehouse/suppliers/show-suppliers");
                }}
              >
                <span className="menu-link-icon">
                  <FaTruckArrowRight size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  الموردين
                </span>
              </Link>
            </li>

            {/* <li
              className="menu-item"
              title=" الموردين"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 88,
                    name: "view suppliers",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/suppliers/show-suppliers"
                className={`menu-link ${
                  activeLink === "/warehouse/suppliers/show-suppliers"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() => {               
                  handleMenuLinkClick("/warehouse/suppliers/show-suppliers");
                }}
              >
                <span className="menu-link-icon">
                  <FaTruckArrowRight size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  الموردين
                </span>
              </Link>
            </li> */}



            <li
              className="menu-item"
              title="اقسام المخزن"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 135,
                    name: "view recipe_category_parents",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/recipes/show-departments"
                className={`menu-link ${
                  activeLink === "/warehouse/recipes/show-departments"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() => {
                  handleMenuLinkClick("/warehouse/recipes/show-departments");
                }}
              >
                <span className="menu-link-icon">
                  <GiTomato size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  اقسام المخزن
                </span>
              </Link>
            </li>

            <li
              className="menu-item"
              title="الفواتير"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 140,
                    name: "view invoices",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/invoices/show"
                className={`menu-link ${
                  activeLink === "/warehouse/invoices/show" ? "active" : ""
                } ${justifyContent}`}
                onClick={() => handleMenuLinkClick("/warehouse/invoices/show")}
              >
                <span className="menu-link-icon">
                  <TbReport size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  الفواتير
                </span>
              </Link>
            </li>

            <li
              className="menu-item"
              title="الهالك"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 140,
                    name: "view tainted",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/invoices/show-tained"
                className={`menu-link ${
                  activeLink === "/warehouse/invoices/show-tained"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() =>
                  handleMenuLinkClick("/warehouse/invoices/show-tained")
                }
              >
                <span className="menu-link-icon">
                  <MdDelete size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  الهالك
                </span>
              </Link>
            </li>

            <li
              className="menu-item"
              title="المدفوعات"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 140,
                    name: "view payable",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/payable/show-payable"
                className={`menu-link ${
                  activeLink === "/warehouse/payable/show-payable"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() =>
                  handleMenuLinkClick("/warehouse/payable/show-payable")
                }
              >
                <span className="menu-link-icon">
                  <BsCashCoin size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  المدفوعات
                </span>
              </Link>
            </li>
            <li
              className="menu-item"
              title="الطلبات"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 140,
                    name: "view requests",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/requests/show-requests"
                className={`menu-link ${
                  activeLink === "/warehouse/requests/show-requests"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() =>
                  handleMenuLinkClick("/warehouse/requests/show-requests")
                }
              >
                <span className="menu-link-icon">
                  <FaCodePullRequest size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  الطلبات
                </span>
              </Link>
            </li>
            {user?.username != "رئيس قسم الحسابات" || "يحيي" ? (
              <li
                className="menu-item"
                title="الكاشير"
                style={{
                  display: `${
                    checkMenuItemPermission({
                      id: 124,
                      name: "add order",
                    }) &&
                    !checkMenuItemPermission({
                      id: 124,
                      name: "view sales points only",
                    })
                      ? ""
                      : "none"
                  }`,
                }}
              >
                <Link
                  to="/warehouse/cashier/create-order"
                  className={`menu-link ${
                    activeLink === "/warehouse/cashier/create-order"
                      ? "active"
                      : ""
                  } ${justifyContent}`}
                  onClick={() => {
                    handleMenuLinkClick("/warehouse/cashier/create-order");
                  }}
                >
                  <span className="menu-link-icon">
                    <FaCashRegister size={30} />
                  </span>
                  <span
                    className={`menu-link-text ${display}`}
                    style={{ fontSize: "20px" }}
                  >
                    الكاشير
                  </span>
                </Link>
              </li>
            ) : null}
            {user?.username != "رئيس قسم الحسابات" ? (
              <li
                className="menu-item"
                title="ترابيزات مفتوحة"
                style={{
                  display: `${
                    checkMenuItemPermission({
                      id: 124,
                      name: "add order",
                    }) &&
                    !checkMenuItemPermission({
                      id: 124,
                      name: "view sales points only",
                    })
                      ? ""
                      : "none"
                  }`,
                }}
              >
                <Link
                  to="/warehouse/cashier/opened-tables"
                  className={`menu-link ${
                    activeLink === "/warehouse/cashier/opened-tables"
                      ? "active"
                      : ""
                  } ${justifyContent}`}
                  onClick={() =>
                    handleMenuLinkClick("/warehouse/cashier/opened-tables")
                  }
                >
                  <span className="menu-link-icon">
                    <MdTableBar size={30} />
                  </span>
                  <span
                    className={`menu-link-text ${display}`}
                    style={{ fontSize: "20px" }}
                  >
                    ترابيزات مفتوحة
                  </span>
                </Link>
              </li>
            ) : null}

            <li
              className="menu-item"
              title="  نقاط البيع"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 124,
                    name: "add order",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/cashier/selles-points"
                className={`menu-link ${
                  activeLink === "/warehouse/cashier/selles-points"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() =>
                  handleMenuLinkClick("/warehouse/cashier/selles-points")
                }
              >
                <span className="menu-link-icon">
                  <MdLocalFireDepartment size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  نقاط البيع
                </span>
              </Link>
            </li>

            <li
              className="menu-item"
              title="طلبات المطبخ"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 124,
                    name: "view Kitchen_orders",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/cashier/kitchen-orders"
                className={`menu-link ${
                  activeLink === "/warehouse/cashier/kitchen-orders"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() =>
                  handleMenuLinkClick("/warehouse/cashier/kitchen-orders")
                }
              >
                <span className="menu-link-icon">
                  <FaKitchenSet size={30} />
                </span>
                <span
                  className={`menu-link-text special-txt ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  أوردرات المطبخ
                </span>
              </Link>
            </li>

            {!isTalaat && (
              <li
                className="menu-item"
                title="طلبات المطبخ"
                style={{
                  display: `${
                    checkMenuItemPermission({
                      id: 124,
                      name: "view orders",
                    })
                      ? ""
                      : "none"
                  }`,
                }}
              >
                <Link
                  to="/warehouse/cashier/kitchen-requests"
                  className={`menu-link ${
                    activeLink === "/warehouse/cashier/kitchen-requests"
                      ? "active"
                      : ""
                  } ${justifyContent}`}
                  onClick={() =>
                    handleMenuLinkClick("/warehouse/cashier/kitchen-requests")
                  }
                >
                  <span className="menu-link-icon">
                    <FaKitchenSet size={30} />
                  </span>
                  <span
                    className={`menu-link-text special-txt ${display}`}
                    style={{ fontSize: "20px" }}
                  >
                    الأوردرات
                  </span>
                </Link>
              </li>
            )}

            <li
              className="menu-item"
              title="الأوردرات المحذوفة"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 146,
                    name: "view deleted_orders",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/cashier/deleted-orders"
                className={`menu-link ${
                  activeLink === "/warehouse/cashier/deleted-orders"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() =>
                  handleMenuLinkClick("/warehouse/cashier/deleted-orders")
                }
              >
                <span className="menu-link-icon">
                  <FaKitchenSet size={30} />
                </span>
                <span
                  className={`menu-link-text special-txt ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  الأوردرات المحذوفة
                </span>
              </Link>
            </li>

            <li
              className="menu-item"
              title="تقارير المبيعات"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 124,
                    name: "view orders",
                  }) &&
                  !checkMenuItemPermission({
                    id: 124,
                    name: "view orders only",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/cashier/order-reports"
                className={`menu-link ${
                  activeLink === "/warehouse/cashier/order-reports"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() =>
                  handleMenuLinkClick("/warehouse/cashier/order-reports")
                }
              >
                <span className="menu-link-icon">
                  <MdReport size={30} />
                </span>
                <span
                  className={`menu-link-text special-txt ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  تقارير المبيعات
                </span>
              </Link>
            </li>
            {!isMechOrChem && (
              <>
                {" "}
                <li
                  className="menu-item"
                  title=" حد الامان"
                  style={{
                    display: `${
                      checkMenuItemPermission({
                        id: 85,
                        name: "safe limit",
                      })
                        ? ""
                        : "none"
                    }`,
                  }}
                >
                  <Link
                    to="/warehouse/underLimit/show-under-limit"
                    className={`menu-link ${
                      activeLink === "/warehouse/underLimit/show-under-limit"
                        ? "active"
                        : ""
                    } ${justifyContent}`}
                    onClick={() =>
                      handleMenuLinkClick(
                        "/warehouse/underLimit/show-under-limit"
                      )
                    }
                  >
                    <span className="menu-link-icon">
                      <AiOutlineSafetyCertificate size={30} />
                    </span>
                    <span
                      className={`menu-link-text ${display}`}
                      style={{ fontSize: "20px" }}
                    >
                      حد الامان
                    </span>
                    <CgDanger size={30} style={{ color: "red" }} />
                  </Link>
                </li>
                <li
                  className="menu-item"
                  title=" حد الامان"
                  style={{
                    display: `${
                      checkMenuItemPermission({
                        id: 86,
                        name: "expire_date limit",
                      })
                        ? ""
                        : "none"
                    }`,
                  }}
                >
                  <Link
                    to="/warehouse/underLimit/show-under-limit/show-expire-limit"
                    className={`menu-link ${
                      activeLink ===
                      "/warehouse/underLimit/show-under-limit/show-expire-limit"
                        ? "active"
                        : ""
                    } ${justifyContent}`}
                    onClick={() =>
                      handleMenuLinkClick(
                        "/warehouse/underLimit/show-under-limit/show-expire-limit"
                      )
                    }
                  >
                    <span className="menu-link-icon">
                      <FaCalendarXmark size={30} />
                    </span>
                    <span
                      className={`menu-link-text ${display}`}
                      style={{ fontSize: "20px" }}
                    >
                      حد الصلاحية
                    </span>
                    <CgDanger size={30} style={{ color: "red" }} />
                  </Link>
                </li>
              </>
            )}
            {/* <li
              className="menu-item"
              title="المنتجات"
              style={{
                display: `${checkMenuItemPermission({
                  id: 93,
                  name: "view categories",
                })
                  ? ""
                  : "none"
                  }`,
              }}
            >
              <Link
                to="/warehouse/returants/show-resturants"
                className={`menu-link ${activeLink === "/warehouse/returants/show-resturants"
                  ? "active"
                  : ""
                  } ${justifyContent}`}
                onClick={() => {
                  handleMenuLinkClick("/warehouse/returants/show-resturants");
                }}
              >
                <span className="menu-link-icon">
                  <MdProductionQuantityLimits size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  المنتجات
                </span>
              </Link>
            </li> */}

            <li
              className="menu-item"
              title="المنتجات2"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 93,
                    name: "view categories",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/returants/show-resturants2"
                className={`menu-link ${
                  activeLink === "/warehouse/returants/show-resturants2"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() => {
                  handleMenuLinkClick("/warehouse/returants/show-resturants2");
                }}
              >
                <span className="menu-link-icon">
                  <MdProductionQuantityLimits size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  المنتجات
                </span>
              </Link>
            </li>

            <li
              className="menu-item"
              title="الأدوار"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 113,
                    name: "view users",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/users/show-users"
                className={`menu-link ${
                  activeLink === "/warehouse/users/show-users" ? "active" : ""
                } ${justifyContent}`}
                onClick={() => {
                  handleMenuLinkClick("/warehouse/users/show-users");
                }}
              >
                <span className="menu-link-icon">
                  <TbUserSquare size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  المستخدمين
                </span>
              </Link>
            </li>
            <li
              className="menu-item"
              title="الأدوار"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 110,
                    name: "add role",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/roles/show-roles"
                className={`menu-link ${
                  activeLink === "/warehouse/roles/show-roles" ? "active" : ""
                } ${justifyContent}`}
                onClick={() => {
                  handleMenuLinkClick("/warehouse/roles/show-roles");
                }}
              >
                <span className="menu-link-icon">
                  <MdAssignmentLate size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  الأدوار
                </span>
              </Link>
            </li>
            <li
              className="menu-item"
              title="طرق الدفع"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 123,
                    name: "view payment methods",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/clients/payment-method"
                className={`menu-link ${
                  activeLink === "/warehouse/clients/payment-method"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() => {
                  handleMenuLinkClick("/warehouse/clients/payment-method");
                }}
              >
                <span className="menu-link-icon">
                  <BsCreditCard2FrontFill size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  طرق الدفع
                </span>
              </Link>
            </li>
            <li
              className="menu-item"
              title="أنواع العملاء"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 123,
                    name: "view client types",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/clients/client-type"
                className={`menu-link ${
                  activeLink === "/warehouse/clients/client-type"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() => {
                  handleMenuLinkClick("/warehouse/clients/client-type");
                }}
              >
                <span className="menu-link-icon">
                  <PiUserSwitchThin size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  أنواع العملاء
                </span>
              </Link>
            </li>
            <li
              className="menu-item"
              title="أنواع العملاء"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 123,
                    name: "view clients",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/clients/client"
                className={`menu-link ${
                  activeLink === "/warehouse/clients/client" ? "active" : ""
                } ${justifyContent}`}
                onClick={() => {
                  handleMenuLinkClick("/warehouse/clients/client");
                }}
              >
                <span className="menu-link-icon">
                  <FaUsers size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  العملاء
                </span>
              </Link>
            </li>

            <li
              className="menu-item"
              title="طرق الدفع"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 123,
                    name: "view discount reasons",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              {/* <Link
                to="/warehouse/clients/discount-reason"
                className={`menu-link ${activeLink === "/warehouse/clients/discount-reason"
                    ? "active"
                    : ""
                  } ${justifyContent}`}
                onClick={() => {
                  handleMenuLinkClick("/warehouse/clients/discount-reason");
                }}
              >
                <span className="menu-link-icon">
                  <CiDiscount1 size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  أسباب الخصم
                </span>
              </Link> */}
            </li>

            <li
              className="menu-item"
              title="التقارير"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 140,
                    name: "view reports",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/reports/show-reports"
                className={`menu-link ${
                  activeLink === "/warehouse/reports/show-reports"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() =>
                  handleMenuLinkClick("/warehouse/reports/show-reports")
                }
              >
                <span className="menu-link-icon">
                  <TbReportSearch size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  التقارير
                </span>
              </Link>
            </li>

            <li
              className="menu-item"
              title="المنافذ"
              style={{
                display: `${
                  checkMenuItemPermission({
                    id: 135,
                    name: "view recipe_category_parents",
                  })
                    ? ""
                    : "none"
                }`,
              }}
            >
              <Link
                to="/warehouse/departments/show-departments"
                className={`menu-link ${
                  activeLink === "/warehouse/departments/show-departments"
                    ? "active"
                    : ""
                } ${justifyContent}`}
                onClick={() =>
                  handleMenuLinkClick("/warehouse/departments/show-departments")
                }
              >
                <span className="menu-link-icon">
                  <HiOutlineOfficeBuilding size={30} />
                </span>
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  المخازن الفرعية
                </span>
              </Link>
            </li>

            {isIncentives && (
              <>
                {incentivesCollapsedGroup ? (
                  <>
                    <li
                      className="menu-item"
                      title="الحوافز"
                      style={{
                        display: `${
                          checkMenuItemPermission({
                            id: 148,
                            name: "view incentives",
                          })
                            ? ""
                            : "none"
                        }`,
                      }}
                    >
                      <Link
                        to="/warehouse/Incentives/show-Incentives"
                        className={`menu-link ${
                          activeLink === "/warehouse/Incentives/show-Incentives"
                            ? "active"
                            : ""
                        } ${justifyContent}`}
                        onClick={() =>
                          handleMenuLinkClick(
                            "/warehouse/Incentives/show-Incentives"
                          )
                        }
                      >
                        <span className="menu-link-icon">
                          <BsCashCoin size={30} />
                        </span>
                        <span
                          className={`menu-link-text ${display}`}
                          style={{ fontSize: "20px" }}
                        >
                          الحوافز
                        </span>
                      </Link>
                    </li>

                    <li
                      className="menu-item"
                      title="الوظائف"
                      style={{
                        display: `${
                          checkMenuItemPermission({
                            id: 148,
                            name: "view employees_and_jobs",
                          })
                            ? ""
                            : "none"
                        }`,
                      }}
                    >
                      <Link
                        to="/warehouse/jobs/show-jobs"
                        className={`menu-link ${
                          activeLink === "/warehouse/jobs/show-jobs"
                            ? "active"
                            : ""
                        } ${justifyContent}`}
                        onClick={() =>
                          handleMenuLinkClick("/warehouse/jobs/show-jobs")
                        }
                      >
                        <span className="menu-link-icon">
                          <BsCashCoin size={30} />
                        </span>
                        <span
                          className={`menu-link-text ${display}`}
                          style={{ fontSize: "20px" }}
                        >
                          الوظائف
                        </span>
                      </Link>
                    </li>

                    <li
                      className="menu-item"
                      title="العاملين بالدار"
                      style={{
                        display: `${
                          checkMenuItemPermission({
                            id: 148,
                            name: "view employees_and_jobs",
                          })
                            ? ""
                            : "none"
                        }`,
                      }}
                    >
                      <Link
                        to="/warehouse/staff/show-staff"
                        className={`menu-link ${
                          activeLink === "/warehouse/staff/show-staff"
                            ? "active"
                            : ""
                        } ${justifyContent}`}
                        onClick={() =>
                          handleMenuLinkClick("/warehouse/staff/show-staff")
                        }
                      >
                        <span className="menu-link-icon">
                          <FaUsers size={30} />
                        </span>
                        <span
                          className={`menu-link-text ${display}`}
                          style={{ fontSize: "20px" }}
                        >
                          العاملين بالدار
                        </span>
                      </Link>
                    </li>
                    <li
                      className="menu-item"
                      title="أقسام الموظفين"
                      style={{
                        display: `${
                          checkMenuItemPermission({
                            id: 148,
                            name: "view employees_and_jobs",
                          })
                            ? ""
                            : "none"
                        }`,
                      }}
                    >
                      <Link
                        to="/warehouse/show-employees-departments"
                        className={`menu-link ${
                          activeLink === "/warehouse/show-employees-departments"
                            ? "active"
                            : ""
                        } ${justifyContent}`}
                        onClick={() =>
                          handleMenuLinkClick(
                            "/warehouse/show-employees-departments"
                          )
                        }
                      >
                        <span className="menu-link-icon">
                          <FaUsers size={30} />
                        </span>
                        <span
                          className={`menu-link-text ${display}`}
                          style={{ fontSize: "20px" }}
                        >
                          الأقسام
                        </span>
                      </Link>
                    </li>

                    <li
                      className="menu-item"
                      style={{
                        height: "25px",
                        alignItems: "center",
                      }}
                    >
                      <Link
                        className="menu-link"
                        onClick={() => handleIncentivesGroupClick()}
                        style={{
                          justifyContent: "center",
                          height: "20px",
                        }}
                      >
                        <span
                          className={`menu-link-text ${display}`}
                          style={{ fontSize: "20px" }}
                        >
                          ^
                        </span>
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="menu-item" title="الحوافز">
                      <Link
                        className="menu-link"
                        style={{
                          display: `${
                            checkMenuItemPermission({
                              id: 148,
                              name: "view employees_and_jobs",
                            })
                              ? ""
                              : "none"
                          }`,
                        }}
                        onClick={() => handleIncentivesGroupClick()}
                      >
                        <span className="menu-link-icon">
                          <BsCashCoin size={30} />
                        </span>
                        <span
                          className={`menu-link-text ${display}`}
                          style={{ fontSize: "20px" }}
                        >
                          الحوافز
                          <img
                            src="../../../../assets/icons/down-arrow.png"
                            style={{ width: "20px", marginRight: "10px" }}
                          />
                        </span>
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}

            {!isMechOrChem && (
              <>
                <li
                  className="menu-item"
                  title="المنافذ"
                  style={{
                    display: `${
                      checkMenuItemPermission({
                        id: 140,
                        name: "ترابيزات مفتوحة",
                      })
                        ? ""
                        : "none"
                    }`,
                  }}
                >
                  <Link
                    to="/warehouse/departments/show-departments/tables"
                    className={`menu-link ${
                      activeLink ===
                      "/warehouse/departments/show-departments/tables"
                        ? "active"
                        : ""
                    } ${justifyContent}`}
                    onClick={() =>
                      handleMenuLinkClick(
                        "/warehouse/departments/show-departments/tables"
                      )
                    }
                  >
                    <span className="menu-link-icon">
                      <HiOutlineOfficeBuilding size={30} />
                    </span>
                    <span
                      className={`menu-link-text ${display}`}
                      style={{ fontSize: "20px" }}
                    >
                      كل التربيزات المفتوحة
                    </span>
                  </Link>
                </li>

                <li
                  className="menu-item"
                  title="الوحدات"
                  style={{
                    display: `${
                      checkMenuItemPermission({
                        id: 140,
                        name: "view units",
                      })
                        ? ""
                        : "none"
                    }`,
                  }}
                >
                  <Link
                    to="/warehouse/units/show-units"
                    className={`menu-link ${
                      activeLink === "/warehouse/units/show-units"
                        ? "active"
                        : ""
                    } ${justifyContent}`}
                    onClick={() =>
                      handleMenuLinkClick("/warehouse/units/show-units")
                    }
                  >
                    <span className="menu-link-icon">
                      <TbBrandUnity size={30} />
                    </span>
                    <span
                      className={`menu-link-text ${display}`}
                      style={{ fontSize: "20px" }}
                    >
                      الوحدات
                    </span>
                  </Link>
                </li>
              </>
            )}

            {user?.department.type != "source" ? (
              <>
                {!isMechOrChem && (
                  <>
                    <li
                      className="menu-item"
                      title="الشيفتات"
                      style={{
                        display: `${
                          checkMenuItemPermission({
                            id: 140,
                            name: "view units",
                          })
                            ? ""
                            : "none"
                        }`,
                      }}
                    >
                      <Link
                        to="/warehouse/reports/show-shifts"
                        className={`menu-link ${
                          activeLink === "/warehouse/reports/show-shifts"
                            ? "active"
                            : ""
                        } ${justifyContent}`}
                        onClick={() =>
                          handleMenuLinkClick("/warehouse/reports/show-shifts")
                        }
                      >
                        <span className="menu-link-icon">
                          <TbBrandUnity size={30} />
                        </span>
                        <span
                          className={`menu-link-text ${display}`}
                          style={{ fontSize: "20px" }}
                        >
                          الشيفتات
                        </span>
                      </Link>
                    </li>
                    <li
                      className="menu-item"
                      title="الويتر"
                      style={{
                        display: `${
                          checkMenuItemPermission({
                            id: 140,
                            name: "view units",
                          })
                            ? ""
                            : "none"
                        }`,
                      }}
                    >
                      <Link
                        to="/warehouse/reports/witer"
                        className={`menu-link ${
                          activeLink === "/warehouse/reports/witer"
                            ? "active"
                            : ""
                        } ${justifyContent}`}
                        onClick={() =>
                          handleMenuLinkClick("/warehouse/reports/witer")
                        }
                      >
                        <span className="menu-link-icon">
                          <TbBrandUnity size={30} />
                        </span>
                        <span
                          className={`menu-link-text ${display}`}
                          style={{ fontSize: "20px" }}
                        >
                          الويتر
                        </span>
                      </Link>
                    </li>

                    <li
                      className="menu-item"
                      title="الويتر"
                      style={{
                        display: `${
                          checkMenuItemPermission({
                            id: 146,
                            name: "view products_review",
                          })
                            ? ""
                            : "none"
                        }`,
                      }}
                    >
                      <Link
                        to="/warehouse/reports/review"
                        className={`menu-link ${
                          activeLink === "/warehouse/reports/review"
                            ? "active"
                            : ""
                        } ${justifyContent}`}
                        onClick={() =>
                          handleMenuLinkClick("/warehouse/reports/review")
                        }
                      >
                        <span className="menu-link-icon">
                          <TbBrandUnity size={30} />
                        </span>
                        <span
                          className={`menu-link-text ${display}`}
                          style={{ fontSize: "20px" }}
                        >
                          مراجعه المنتجات
                        </span>
                      </Link>
                    </li>
                  </>
                )}
              </>
            ) : null}

            {linkedDepartment && (
              <li className="menu-item" title="كاشير الأنشطة">
                <Link
                  to="/warehouse/cashier/create-order"
                  className={`menu-link ${justifyContent}`}
                  onClick={() =>
                    // handleMenuLinkClick("/warehouse/cashier/create-order")
                    changeCahierDepartment()
                  }
                >
                  <span className="menu-link-icon">
                    <TbBrandUnity size={30} />
                  </span>
                  <span
                    className={`menu-link-text ${display}`}
                    style={{ fontSize: "20px" }}
                  >
                    كاشير {linkedDepartmentName}
                  </span>
                </Link>
              </li>
            )}

            <li className="menu-item" title="تسجيل خروج">
              <button
                className={`menu-link logout ${
                  activeLink === "/warehouse/*" ? "active" : ""
                } ${justifyContent}`}
                onClick={handleLogout}
              >
                <span className="menu-link-icon">
                  <MdLogout size={30} />
                </span>
                {/* <button onClick={handleLogout} style={{ fontSize: "20px", }}> */}
                <span
                  className={`menu-link-text ${display}`}
                  style={{ fontSize: "20px" }}
                >
                  تسجيل خروج
                </span>
                {/* </button> */}
              </button>
            </li>
          </ul>
        </div>
      </div>
      <SaveIncentivesModal
        show={isLogoutModalVisible}
        onHide={() => setLogoutModalVisible(false)}
        user={user}
      />
    </nav>
  );
};

export default Sidebar;
