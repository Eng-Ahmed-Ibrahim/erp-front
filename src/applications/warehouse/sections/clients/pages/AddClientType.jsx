import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addClientType } from "../../../../../apis/clients/ClientType";
import { getPaymentMethods } from "../../../../../apis/clients/PaymentMethod";
import { Form, Input, Button, Select } from "antd";
const { Option } = Select;

const AddClientType = () => {
  const navigate = useNavigate();
  const [newClient, setNewClient] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchPermissions = async () => {
      const res = await getPaymentMethods({}, "", () => { });
      // console.log(res.data);
      setPaymentMethods(
        res.data.map((method) => {
          return { name: method.name, id: method.id };
        })
      );
    };
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
    // console.log(formData);
    await addClientType(formData);
    navigate(`/warehouse/clients/client-type`);
  };

  const handlePermissionSelect = (values, options) => {
    // console.log(values);
    const selectedPaymentMethods = values.map((value) =>
      paymentMethods.find((method) => {
        return method.name === value;
      })
    );
    // console.log(selectedPaymentMethods);
    setSelectedPaymentMethods(selectedPaymentMethods);
  };

  const validatePermissions = (_, value) => {
    if (!value || value.length === 0) {
      return Promise.reject(new Error("يرجى اختيار صلاحية واحدة على الأقل!"));
    }
    return Promise.resolve();
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
        {/* <Form.Item
          label="عميل"
          name="newClient"
          style={{ marginBottom: "20px" }}
        >
          <Select
            placeholder="اختر النوع"
            style={{ width: "100%" }}
            initialvalue={1}
          >
            <Option key={1} value={0}>
              عميل قديم
            </Option>
            <Option key={2} value={1}>
              عميل جديد
            </Option>
          </Select>
        </Form.Item> */}
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
