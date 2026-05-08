import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getClientTypeById,
  updateClientType,
} from "../../../../../apis/clients/ClientType";
import { Form, Input, Button, Select, message } from "antd";
import { getPaymentMethods } from "../../../../../apis/clients/PaymentMethod";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../config";

const { Option } = Select;

const EditClientType = () => {
  const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const [activeItemId, setActiveItemId] = useState(null);
  const [selectedDepartments, setSelectedDepartments] = useState([]); 

  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const { id } = useParams();
  const [form] = Form.useForm();
  const [allDepartment, setAllDepartment] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeData = await getClientTypeById(id);
        setData(recipeData?.data);
        form.setFieldsValue(recipeData.data); // Set form values directly

        // console.log("Data====================>",recipeData.data);
      } catch (error) {
        // console.log("Error fetching data:", error);
      }
    };

    const fetchMethods = async () => {
      try {
        const recipeData = await getPaymentMethods({}, "", () => { });
        setPaymentMethods(recipeData.data);
      } catch (error) {
      }
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
    fetchDepartmentsWithDiscount();
    fetchData();
    fetchMethods();
    fetchDepartments();
  }, [id,Token]);
  const handleSetDiscount = async () => {
    try {
      const response = await axios.post(`${API_ENDPOINT}/api/v1/store/departments_with_discount/update`, {
        client_type_id :id,
        departments : selectedDepartments
      
    },
        {headers: {
          Authorization: `Bearer ${Token}`,
        },
        }
      );
     console.log(response)
     message.success(response.data.data.message)
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };
  const onFinish = async (values) => {
    const formData = {
      name: values.name,
      methods: selectedPaymentMethods,
      discount: values.discount,
      tax: values.tax,
      monthly_discount_limit: values.monthly_discount_limit,
    };
    await updateClientType(id, formData);
  //  navigate(`/warehouse/clients/client-type`);
  };

  const handlePermissionSelect = (values, options) => {
    const methods = values.map((value) =>
      paymentMethods.find((method) => {
        return method.name === value;
      })
    );
    // console.log(methods);
    setSelectedPaymentMethods(methods);
  };

  const toggleDepartmentSelection = (departmentId) => {
    setSelectedDepartments((prevSelected) =>
      prevSelected.includes(departmentId)
        ? prevSelected.filter((id) => id !== departmentId)
        : [...prevSelected, departmentId]
    );
    console.log(`setselected`,selectedDepartments)

  };

  const initialValues = {
    name: data?.name || "",
    methods:data?.paymentMethods || "",
    
   
  };

  return (
    <div className="form-container">
      <h1 className="form-title" style={{ marginBottom: "20px" }}>
        تعديل نوع عميل
      </h1>
      <Form layout="vertical" form={form} onFinish={onFinish} initialValues={initialValues}>
        <Form.Item
          label="إسم نوع العميل"
          name="name"
          rules={[{ required: true, message: "من فضلك أضف إسم" }]}
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
          label="حد الخصم الشهري (مجموع الخصم لكل عميل)"
          name="monthly_discount_limit"
          tooltip="الحد الأقصى لمجموع مبالغ الخصم في الطلبات خلال الشهر لكل عميل من هذا النوع. اتركه فارغًا لعدم تطبيق حد."
          rules={[{ required: false }]}
          style={{ marginBottom: "20px" }}
        >
          <Input
            placeholder="اتركه فارغًا بدون حد"
            type="number"
            min={0}
            step="0.01"
            onWheel={(event) => event.currentTarget.blur()}
          />
        </Form.Item>

        <Form.Item label="طرق الدفع" style={{ marginBottom: "20px" }}>
          <Select
            mode="multiple"
            placeholder="اختر طرق الدفع"
            onChange={handlePermissionSelect}
            style={{ width: "100%" }}
            initialValue={initialValues.paymentMethods}
          >
            {paymentMethods?.map((method, index) => (
              <Option key={method.name}>{method.name}</Option>
            ))}
          </Select>
        </Form.Item>

       
        <Form.Item>
          <Button type="primary" htmlType="submit">
            أضف
          </Button>
        </Form.Item>
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
        <button onClick={handleSetDiscount}
         className={`form-check pe-3 py-3 m-3 shadow rounded shift-hover`}
        style={{ border: "2px solid " ,color:"white" ,background : "#AF8260"}}
          >
            عدل
          </button>
    {/* <div className="d-grid gap-2">
      <button
        onClick={handeladdShift}
        className="btn btn-primary bg-brown text-light m-auto mt-5"
        style={{ width: "50%", backgroundColor: '#803D3B', border: 0 }}
        type="button"
      >
        حفظ
      </button>
    </div> */}
      </Form>
    </div>
  );
};

export default EditClientType;

