import React from "react";
import { login } from "../apis/auth";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import "./Login.scss";
import loginImg from "../../public/assets/images/dar_white.svg";
import soldierImg from "../../public/assets/images/solidierImg.png";

const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const res = await login(values);
    if (!(res instanceof Error)) {
      values.remember
        ? localStorage.setItem("token", res.data.data.token)
        : sessionStorage.setItem("token", res.data.data.token);
    } else {
      message.error(res.response.data.error.message);
      return;
    }
    window.location.href = "/warehouse/home";
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-form-wrapper">
          <Form
            className="login-form"
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 24 }}
            style={{ maxWidth: 400 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <div style={{ marginBottom: 20, width: "100%" }}>
              <label
                style={{
                  display: "block",
                  color: "#803D3B",
                  fontSize: "16px",
                  fontWeight: "700",
                  fontFamily: "Cairo",
                }}
              >
                إسم المستخدم
              </label>
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "من فضلك أدخل إسم المستخدم" },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="login-input-field"
                  style={{
                    borderRadius: 8,
                    border: "1px solid #d9d9d9",
                    padding: 10,
                    width: "100%",
                    fontFamily: "Cairo",
                  }}
                />
              </Form.Item>
            </div>

            <div style={{ marginBottom: 20, width: "100%" }}>
              <label
                style={{
                  display: "block",
                  color: "#803D3B",
                  fontSize: "16px",
                  fontWeight: "700",
                  fontFamily: "Cairo",
                }}
              >
                كلمة المرور
              </label>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "من فضلك أدخل كلمة المرور" },
                ]}
                style={{ width: "100%" }}
              >
                <Input.Password
                  className="login-input-field"
                  style={{
                    borderRadius: 8,
                    border: "1px solid #d9d9d9",
                    padding: 10,
                    width: "100%",
                    fontFamily: "Cairo",
                  }}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="remember"
              valuePropName="checked"
              wrapperCol={{ offset: 8, span: 16 }}
              style={{ marginBottom: 20 }}
            >
              <Checkbox
                className="login-checkbox"
                style={{
                  float: "right",
                  fontWeight: "700",
                  fontFamily: "Cairo",
                }}
              >
                تذكرنى
              </Checkbox>
            </Form.Item>

            <Form.Item
              wrapperCol={{ span: 24 }}
              style={{ textAlign: "center" }}
            >
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                style={{
                  width: "100%",
                  padding: 20,
                  maxWidth: 400,
                  fontFamily: "Cairo",
                }}
              >
                تسجيل الدخول
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div className="login-image">
          <img src={loginImg} alt="Dar-elmoshaa-logo" />
        </div>
      </div>
    </div>
  );
};

export default Login;
