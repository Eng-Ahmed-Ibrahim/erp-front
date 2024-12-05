import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addClientType } from "../../../../../apis/clients/ClientType";
import { getPaymentMethods } from "../../../../../apis/clients/PaymentMethod";
import { Form, Input, Button, Select } from "antd";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../config";
const { Option } = Select;

const AddClientType = () => {
  const Token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const navigate = useNavigate();
  const [newClient, setNewClient] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [form] = Form.useForm();
  const [selectedDepartments, setSelectedDepartments] = useState([]); 
  const [allDepartment, setAllDepartment] = useState([])

  useEffect(() => {
    const fetchPermissions = async () => {
      const res = await getPaymentMethods({}, "", () => { });
      //  
      setPaymentMethods(
        res.data.map((method) => {
          return { name: method.name, id: method.id };
        })
      );
    };
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINT}/api/v1/store/department`, {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        });
        console.log(`response`,response)
        setAllDepartment(Array.isArray(response.data.data) ? response.data.data : []);
        
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    const fetchDepartmentsWithDiscount = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINT}/api/v1/store/departments_with_discount`, {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
          params: {
            data :{
            client_type_id :id
                  },
                  }
         
        });
        const departmentIds = Array.isArray(response.data.data)
        ? response.data.data.map(department => department)
        : [];
        console.log(response.data.data)
  
      setSelectedDepartments(departmentIds);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
    fetchDepartmentsWithDiscount();
    fetchPermissions();
  }, []);

  const onFinish = async (values) => {
    const formData = {
      name: values.name,
      methods: selectedPaymentMethods,
      // newClient: values.newClient || 1,
      discount: values.discount,
      // discount: 0,
      tax: values.tax
      // tax: 0
    };
    //  
    await addClientType(formData);
    navigate(`/warehouse/clients/client-type`);
  };

  const handlePermissionSelect = (values, options) => {
    //  
    const selectedPaymentMethods = values.map((value) =>
      paymentMethods.find((method) => {
        return method.name === value;
      })
    );
    //  
    setSelectedPaymentMethods(selectedPaymentMethods);
  };

  const validatePermissions = (_, value) => {
    if (!value || value.length === 0) {
      return Promise.reject(new Error("يرجى اختيار صلاحية واحدة على الأقل!"));
    }
    return Promise.resolve();
  };
  const toggleDepartmentSelection = (departmentId) => {
    setSelectedDepartments((prevSelected) =>
      prevSelected.includes(departmentId)
        ? prevSelected.filter((id) => id !== departmentId)
        : [...prevSelected, departmentId]
    );
    console.log(`setselected`,selectedDepartments)

  };
  return (
    <div className="form-container">
      <h1 className="form-title" style={{ marginBottom: "20px" }}>
        أضف نوع عميل
      </h1>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="إسم نوع العميل"
          name="name"
          rules={[{ required: true, message: "من فضلك أضف إسم" }]}
          initialValue=""
          style={{ marginBottom: "20px" }}
        >
          <Input placeholder="أضف إسم لنوع العميل" />
        </Form.Item>

        <Form.Item
          label="نسبة الخصم"
          name="discount"
          rules={[{ required: false, message: "من فضلك أضف نسبة الخصم" }]}
          initialValue=""
          style={{ marginBottom: "20px" }}
        >
          <Input placeholder="أضف نسبة الخصم" type="number" onWheel={(event) => event.currentTarget.blur()} />
        </Form.Item>

        <Form.Item
          label=" الضريبه المضافه"
          name="tax"
          rules={[{ required: false, message: "من فضلك أضف الضريبه المضافه " }]}
          initialValue=""
          style={{ marginBottom: "20px" }}
        >
          <Input placeholder="أضف الضريبه المضافه" type="number" onWheel={(event) => event.currentTarget.blur()} />
        </Form.Item>
        <Form.Item
          label="طرق الدفع"
          name="methods"
          rules={[{ validator: validatePermissions }]}
          initialValue={[]}
          style={{ marginBottom: "20px" }}
        >
          <Select
            mode="multiple"
            placeholder="اختر طرق الدفع"
            onChange={handlePermissionSelect}
            style={{ width: "100%" }}
            value={selectedPaymentMethods}
          >
            {paymentMethods?.map((method) => (
              <Option key={method.name}>{method.name}</Option>
            ))}
          </Select>
        </Form.Item>
<Form.Item>
<h1 className="form-title mt-5" style={{ marginBottom: "20px" }}>
المنافذ المتعاقد معها    </h1>
  
<div className="d-flex justify-content-around flex-wrap">
          {allDepartment.map((item) => (
            <button
              onClick={() => toggleDepartmentSelection(item.id)}
              className={`form-check pe-3 py-3 m-3 shadow rounded shift-hover ${
                selectedDepartments.includes(item.id) ? "shifts" : ""
              }`}
              key={item.id}
              style={{ border: "2px solid #803d3b" }}
            >
              <label className="form-check-label" htmlFor="defaultCheck1">
                {item?.name}
              </label>
            </button>
            
          ))}
         
        </div>

</Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            أضف
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddClientType;
