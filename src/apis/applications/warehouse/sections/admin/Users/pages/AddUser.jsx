import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Select, message } from "antd";
import { AddUsers } from "../../../../../../apis/users";
import { getRoles } from "../../../../../../apis/roles";
import { getAllDepartments } from "../../../../../../apis/departments";
const { Option } = Select;

const AddUser = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchRoles = async () => {
      const res = await getRoles();
      setRoles(res.data);
    };
    fetchRoles();
    const fetchDepartments = async () => {
      const res = await getAllDepartments();
      setDepartments(res.data);
      
    };
    fetchDepartments();
  }, []);

  const onFinish = async (values) => {
    const formData = {
      name: values.name,
      phone: values.phone,
      username: values.username,
      password: values.password,
      role: selectedRole,
      department: selectedDepartment,
      permissions: selectedRolePermissions,
    };
    // console.log(formData);
    const res = await AddUsers(formData);
    if (res instanceof Error)
      Object.keys(res.response.data.error.errors).map((key) =>
        message.error(res.response.data.error.errors[key])
      );
    else {
      message.success("تم إضافة مستخدم بنجاح");
      navigate(`/warehouse/users/show-users`);
    }
  };

  const handleRoleSelect = (value) => {
    const selectedRole = roles?.find((role) => role.id === value);
    setSelectedRole(selectedRole?.id);
    setSelectedRolePermissions(selectedRole?.permissions);
  };
  const handleDepartmentSelect = (value) => {
    const selectedDepartment = Object.keys(departments).find(
      (key) => departments[key].id === value
    );
    setSelectedDepartment(departments[selectedDepartment]?.id);
  };

  const handleAddRoleClick = () => {
    navigate("/warehouse/roles/add-role");
  };

  return (
    <div className="form-container">
      <h1 className="form-title" style={{ marginBottom: "20px" }}>
        أضف مستخدم
      </h1>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="الإسم"
          name="name"
          rules={[{ required: true, message: "من فضلك أضف إسم" }]}
          style={{ marginBottom: "20px" }}
        >
          <Input placeholder="أدخل الإسم" />
        </Form.Item>
        <Form.Item
          label="رقم الموبايل"
          name="phone"
          rules={[{ required: true, message: "من فضلك أضف رقم موبايل" }]}
          style={{ marginBottom: "20px" }}
        >
          <Input placeholder="أدخل رقم الموبايل" type="number" />
        </Form.Item>
        <Form.Item
          label="إسم المستخدم"
          name="username"
          rules={[{ required: true, message: "من فضلك أضف إسم مستخدم" }]}
          style={{ marginBottom: "20px" }}
        >
          <Input placeholder="أدخل إسم المستخدم" />
        </Form.Item>
        <Form.Item
          label="كلمة المرور"
          name="password"
          rules={[
            {
              required: true,
              message: " من فضلك أضف كلمة مرور أكثر من خمسة حروف",
              min: 6,
            },
          ]}
          style={{ marginBottom: "20px" }}
        >
          <Input.Password placeholder="أدخل كلمة المرور" />
        </Form.Item>
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
              <Option key={role.id} value={role.id}>
                {role.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {selectedRolePermissions.length > 0 && (
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
        <Form.Item
          label="القسم"
          name="department"
          rules={[{ required: true, message: "من فضلك إختر قسم" }]}
          style={{ marginBottom: "20px" }}
        >
          <Select
            placeholder="إختر قسم"
            onChange={handleDepartmentSelect}
            style={{ width: "100%" }}
          >
            {departments &&
              Object.keys(departments).map((key) => (
                <Option key={departments[key].id} value={departments[key].id}>
                  {departments[key].name}
                </Option>
              ))}
          </Select>
        </Form.Item>

        <div>
          <span>لم تعثر على دور؟</span>
          <Button style={{ marginLeft: "10px" }} onClick={handleAddRoleClick}>
            أضف هنا
          </Button>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            أضف مستخدم
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddUser;
