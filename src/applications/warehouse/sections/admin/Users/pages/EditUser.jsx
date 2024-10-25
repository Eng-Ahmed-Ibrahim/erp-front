import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, Button, Select, message } from "antd";
import { getUserById, updateUser } from "../../../../../../apis/users";
import { getRoles } from "../../../../../../apis/roles";
import axios from "axios";
const { Option } = Select;
import { API_ENDPOINT } from "../../../../../../../config";
const EditUser = () => {
  const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const navigate = useNavigate();
  const { id } = useParams();
  const [roles, setRoles] = useState([]);
  const [data, setData] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedDepatrment, setSelectedDepartment] = useState(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState([]);
  const [form] = Form.useForm();
  const [isPending, setIsPending] = useState(false)
  const [name, setName] = useState()
  const [userName, setuserName] = useState()
  const [password, setPassword] = useState(null)
  const [password_confirmation, setPassword_confirmation] = useState(null)

  useEffect(() => {
    const fetchRoles = async () => {
      const res = await getRoles();
      // console.log(res.data);

      setRoles(res.data);
    };
    fetchRoles();
    const fetchUser = async () => {
      const res = await getUserById(id);
       console.log("Data user =====>",res.data);
      setData(res.data);
      setName(res.data.name)
      setuserName(res.data.username)
      setSelectedDepartment(res.data.department.id)
    };
    fetchUser();
  }, [selectedDepatrment]);

  const onFinish = async (values) => {
    const formData = {
      name: values.name,
      role: selectedRole,
      permissions: selectedRolePermissions,
    };
     console.log(formData);
    const res = await updateUser(formData, id);
    if (res instanceof Error)
      Object.keys(res.response.data.error.errors).map((key) =>
        message.error(res.response.data.error.errors[key])
      );
    else {
      message.success("تم تعديل مستخدم بنجاح");
      navigate(`/warehouse/users/show-users`);
    }
  };

  const handleRoleSelect = (value) => {
    const selectedRole = roles?.find((role) => role.name === value);
    
    // Check if selected role exists and has permissions
    if (selectedRole && selectedRole.permissions) {
      setSelectedRole(selectedRole?.id);
      setSelectedRolePermissions(selectedRole?.permissions); // Set the permissions here
    }
  };

  const handleAddRoleClick = () => {
    navigate("/warehouse/roles/add-role");
  };
  const handelSubmit = async (e) => {
    e.preventDefault()
    setIsPending(true)
    try {
      await axios.post(`${API_ENDPOINT}/api/v1/store/user/update/${id}`, {
        name: name,
        username: userName,
        department_id: selectedDepatrment
      },
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        })
        .then((response) => {
          setIsPending(false)
          message.success("تم تعديل بيانات مستخدم بنجاح");
        })
    } catch (err) {
      setIsPending(false);
      console.log('response', err.response);
    }
  }
  const handelPassword = async (e) => {
    e.preventDefault()
    setIsPending(true)
    try {
      await axios.post(`${API_ENDPOINT}/api/v1/store/user/update/${id}`, {
        name: name,
        username: userName,
        password: password,
        password_confirmation: password_confirmation,
        department_id: selectedDepatrment
      },
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        })
        .then((response) => {
          setIsPending(false)
          message.success("تم تعديل الرقم السري للمستخدم بنجاح");
          navigate("/warehouse/users/show-users")
        })
    } catch (err) {
      setIsPending(false);
      console.log('response', err.response);
      message.error("الرقم السري غير متناسق");
    }
  }
  const [allDepartment, setAllDepartment] = useState([])
  useEffect(() => {
    setIsPending(true);
    axios.get(`${API_ENDPOINT}/api/v1/store/department`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    })
      .then((response) => {
        setIsPending(false);
        setAllDepartment(response.data);
        // console.log("contactForm", response.data);
      })
      .catch((error) => {
        setIsPending(false);
        console.log(error);
      });
  }, []);
  console.log(allDepartment, 'sjsjiiosijoi');
  const getInitialState = () => {
    const value = "user";
    return value;
  };
  const [value, setValue] = useState(getInitialState);
  const handelDepartment = async (e) => {
    e.preventDefault();
    setIsPending(true);
    // setValue(e.target.value);
    try {
      await axios
        .post(
          `${API_ENDPOINT}/api/v1/users/update/department`,
          {
            user_id: value,
          },
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        )
        .then((response) => {
          console.log('created success', response);
          message.success('تم التعديل بنجاح')
        });
      setIsPending(false);
    } catch (err) {
      setIsPending(false);
      message.error('حدث خطا ما')
      console.log('message', err);
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title" style={{ marginBottom: "20px" }}>
        عدل مستخدم
      </h1>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={data}
      >
        <Form.Item
          label="الدور"
          name="role"
          rules={[{ required: true, message: "من فضلك إختر دور" }]}
          style={{ marginBottom: "20px" }}
        >
          <Select
            placeholder="إختر دور"
            onChange={handleRoleSelect}
            style={{ width: "100%" }}
          >
            {roles?.map((role) => (
              <Option key={role.id} value={role.name}>
                {role.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {selectedRolePermissions?.length > 0 && (
          <Form.Item label="صلاحيات الدور" style={{ marginBottom: "20px" }}>
            <Select
              mode="multiple"
              placeholder="Role permissions"
              value={selectedRolePermissions.map(
                (permission) => permission.name
              )}
              disabled
              style={{ width: "100%" }}
            >
              {selectedRolePermissions.map((permission) => (
                <Option key={permission} value={permission}>
                  {permission}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <div>
          <span>لم تعثر على دور؟</span>
          <Button style={{ marginLeft: "10px" }} onClick={handleAddRoleClick}>
            أضف هنا
          </Button>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            عدل مستخدم
          </Button>
        </Form.Item>
      </Form>

      <h1 className="form-title" style={{ marginBottom: "20px" }}>
        تعديل بيانات المستخدم
      </h1>
      <form onSubmit={handelSubmit}>
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
          > اليوزرنيم (username) </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            value={userName}
            onChange={(e) => setuserName(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          class="btn btn-primary rounded p-2 fw-bold"
          style={{
            background: '#AF8260',
            border: "0px solid red"
          }}
        >تعديل بيانات المستخدم </button>
      </form>
      <h1 className="form-title mt-5" style={{ marginBottom: "20px" }}>
        تعديل الرقم السري المستخدم
      </h1>
      <form onSubmit={handelPassword}>
        <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          > الرقم السري</label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          > تاكيد الرقم السري </label>
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
          class="btn btn-primary rounded p-2 fw-bold"
          style={{
            background: '#AF8260',
            border: "0px solid red"
          }}
        >تعديل الرقم السري </button>
      </form>
      <h1 className="form-title mt-5" style={{ marginBottom: "20px" }}>
        تعديل مكان الكاشير التابع ليها
      </h1>
      <form onSubmit={handelDepartment}>
        <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          > اختر نقطة البيع</label>
          <select
            class="form-select"
            aria-label="Default select example"
            value={value}
            onChange={() => setValue(e.target.value)}
          >
            <option selected>اختر مكان</option>
            {allDepartment?.data?.map((item, index) => (
              <option key={index} value={item?.id}>{item?.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          class="btn btn-primary rounded p-2 fw-bold"
          style={{
            background: '#AF8260',
            border: "0px solid red"
          }}
        >تعديل  </button>
      </form>

    </div>
  );
};

export default EditUser;
