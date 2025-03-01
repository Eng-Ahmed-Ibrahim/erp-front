import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, Button, Select, message } from "antd";
import { API_ENDPOINT } from "../../../../../config";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";

const AccountSetting = () => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const navigate = useNavigate();
  const { id } = useParams();
  const [userDepartment, setUserDepartment] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [name, setName] = useState();
  const [userName, setuserName] = useState();
  const [password, setPassword] = useState(null);
  const [password_confirmation, setPassword_confirmation] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    setName(user?.name);
    setUserDepartment(user?.department?.id);
    setuserName(user?.username);
  }, []);

  const handelSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post(
          `${API_ENDPOINT}/api/v1/store/user/update/${user?.id}`,
          {
            name: name,
            username: userName,
            department_id: userDepartment,
          },
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        )
        .then(() => {
          message.success("تم تعديل الاسم بنجاح");
        });
    } catch (err) {
      message.error("حدث خطأ ما", err);
    }
  };

  const handelPassword = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post(
          `${API_ENDPOINT}/api/v1/store/user/update/${user?.id}`,
          {
            name: name,
            username: userName,
            password: password,
            password_confirmation: password_confirmation,
            department_id: userDepartment,
          },
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        )
        .then((response) => {
          message.success("تم تعديل الرقم السري للمستخدم بنجاح");
          navigate("/login");
        });
    } catch (err) {
      message.error("الرقم السري غير متناسق");
    }
  };
  return (
    <div className="content-area-table" style={{ padding: "40px" }}>
      <h3 className="form-title" style={{ marginBottom: "20px" }}>
        تعديل إسم المستخدم
      </h3>
      <form onSubmit={handelSubmit}>
        <div className="mb-3">
          <label for="exampleInputPassword" className="form-label">
            {" "}
            الإسم :
          </label>
          <input
            type="text"
            className="form-input"
            id="exampleInputEmail1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label for="exampleInputPassword" className="form-label">
            اليوزرنيم (username) :
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            value={userName}
            onChange={(e) => setuserName(e.target.value)}
            required
            disabled={true}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary rounded p-2 fw-bold"
          style={{
            background: "#AF8260",
            border: "0px solid red",
          }}
        >
          تعديل الإسم{" "}
        </button>
      </form>

      <h3 className="form-title mt-5" style={{ marginBottom: "20px" }}>
        تغيير كلمة المرور
      </h3>
      <form onSubmit={handelPassword}>
        <div className="mb-3">
          <label for="exampleInputPassword" className="form-label">
            {" "}
            كلمة السر
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label for="exampleInputPassword" className="form-label">
            تأكيد كلمة السر
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            value={password_confirmation}
            onChange={(e) => setPassword_confirmation(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary rounded p-2 fw-bold"
          style={{
            background: "#AF8260",
            border: "0px solid red",
          }}
        >
          تعديل الرقم السري{" "}
        </button>
      </form>
    </div>
  );
};

export default AccountSetting;
