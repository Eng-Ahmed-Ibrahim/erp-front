import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getClientTypeById,
  updateClientType,
} from "../../../../../apis/clients/ClientType";
import { Form, Input, Button, Select } from "antd";
import { getPaymentMethods } from "../../../../../apis/clients/PaymentMethod";
const { Option } = Select;

const EditClientType = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const { id } = useParams();
  const [form] = Form.useForm();

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

    fetchData();
    const fetchMethods = async () => {
      try {
        const recipeData = await getPaymentMethods({}, "", () => { });
        setPaymentMethods(recipeData.data);
        // console.log(recipeData.data);
      } catch (error) {
        // console.log("Error fetching data:", error);
      }
    };

    fetchMethods();
  }, [id]);

  const onFinish = async (values) => {
    // console.log(values);
    const formData = {
      name: values.name,
      methods: selectedPaymentMethods,
      discount: values.discount,
      tax: values.tax

    };
    // console.log(formData);
    await updateClientType(id, formData);
    navigate(`/warehouse/clients/client-type`);
  };

  const handlePermissionSelect = (values, options) => {
    // console.log(values);
    const methods = values.map((value) =>
      paymentMethods.find((method) => {
        return method.name === value;
      })
    );
    // console.log(methods);
    setSelectedPaymentMethods(methods);
  };

  // const validatePermissions = (_, value) => {
  //   if (!value || value.length === 0) {
  //     return Promise.reject(new Error("يرجى اختيار صلاحية واحدة على الأقل!"));
  //   }
  //   return Promise.resolve();
  // };

  const initialValues = {
    name: data?.name || "",
    methods:data?.paymentMethods || "",
    
           // console.log()
    // minimum_limt: data?.minimum_limt || "",
    // days_before_expire:
    //   data?.days_before_expire !== undefined ? data.days_before_expire : "", // Check if day_before_expire is present
    // unit_id: data?.unit.id || "", // Check if unit_id is present
    // image: data?.image || null, // Assuming image is present in recipe data
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

        {/* <Form.Item
          label="عميل"
          name="newClient"
          style={{ marginBottom: "20px" }}
          initialValue={1}
        >
          <Select placeholder="اختر النوع" style={{ width: "100%" }}>
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

export default EditClientType;




// import React, { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { getClientTypeById, updateClientType } from "../../../../../apis/clients/ClientType";
// import { Form, Input, Button, Select } from "antd";
// import { getPaymentMethods } from "../../../../../apis/clients/PaymentMethod";

// const { Option } = Select;

// const EditClientType = () => {
//   const navigate = useNavigate();
//   const [data, setData] = useState(null);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
//   const { id } = useParams();
//   const [form] = Form.useForm();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const recipeData = await getClientTypeById(id);
//         setData(recipeData?.data);
//         // console.log("Data====================>",recipeData.data);
//       } catch (error) {
//         // console.log("Error fetching data:", error);
//       }
//     };

//     fetchData();
//     const fetchMethods = async () => {
//       try {
//         const recipeData = await getPaymentMethods({}, "", () => {});
//         setPaymentMethods(recipeData.data);
//         // console.log(recipeData.data);
//       } catch (error) {
//         // console.log("Error fetching data:", error);
//       }
//     };

//     fetchMethods();
//   }, [id]);

//   const onFinish = async (values) => {
//     // console.log(values);
//     const formData = {
//       name: values.name,
//       methods: selectedPaymentMethods,
//       discount: values.discount
//     };
//     // console.log(formData);
//     await updateClientType(id, formData);
//     navigate(`/warehouse/clients/client-type`);
//   };

//   const handlePermissionSelect = (values, options) => {
//     // console.log(values);
//     const methods = values.map((value) =>
//       paymentMethods.find((method) => {
//         return method.name === value;
//       })
//     );
//     // console.log(methods);
//     setSelectedPaymentMethods(methods);
//   };

//   const initialValues = {
//     name: data?.name || "",
//     discount: data?.discount || "", // Add discount field
//     paymentMethods: data?.paymentMethods?.map(method => method.name) || [], // Add paymentMethods field
//   };

//   return (
//     <div className="form-container">
//       <h1 className="form-title" style={{ marginBottom: "20px" }}>
//         تعديل نوع عميل
//       </h1>
//       <Form layout="vertical" form={form} onFinish={onFinish} initialValues={initialValues}>
//         <Form.Item
//           label="إسم نوع العميل"
//           name="name"
//           rules={[{ required: true, message: "من فضلك أضف إسم" }]}
//           style={{ marginBottom: "20px" }}
//         >
//           <Input placeholder="أضف إسم لنوع العميل"  />
//         </Form.Item>

//         <Form.Item
//           label="نسبة الخصم"
//           name="discount"
//           rules={[{ required: false, message: "من فضلك أضف نسبة الخصم" }]}
//           initialValue=""
//           style={{ marginBottom: "20px" }}
//         >
//           <Input placeholder="أضف نسبة الخصم" type="number"   onWheel={(event) => event.currentTarget.blur()} />
//         </Form.Item>
//         <Form.Item label="طرق الدفع" style={{ marginBottom: "20px" }}>
//           <Select
//             mode="multiple"
//             placeholder="اختر طرق الدفع"
//             onChange={handlePermissionSelect}
//             style={{ width: "100%" }}
//             defaultValue={initialValues.paymentMethods} // Set defaultValue for paymentMethods
//           >
//             {paymentMethods?.map((method, index) => (
//               <Option key={method.name}>{method.name}</Option>
//             ))}
//           </Select>
//         </Form.Item>

//         <Form.Item>
//           <Button type="primary" htmlType="submit">
//             أضف
//           </Button>
//         </Form.Item>
//       </Form>
//     </div>
//   );
// };

// export default EditClientType;







// import React, { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { getClientTypeById, updateClientType } from "../../../../../apis/clients/ClientType";
// import { Form, Input, Button, Select } from "antd";
// import { getPaymentMethods } from "../../../../../apis/clients/PaymentMethod";

// const { Option } = Select;

// const EditClientType = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const [form] = Form.useForm();
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const { data } = await getClientTypeById(id);
//         form.setFieldsValue(data); // Set form values directly
//       } catch (error) {
//         // console.log("Error fetching data:", error);
//       }
//     };

//     fetchData();

//     const fetchMethods = async () => {
//       try {
//         const { data } = await getPaymentMethods({}, "", () => {});
//         setPaymentMethods(data);
//       } catch (error) {
//         // console.log("Error fetching payment methods:", error);
//       }
//     };

//     fetchMethods();
//   }, [form, id]);

//   const onFinish = async (values) => {
//     setLoading(true);
//     try {
//       await updateClientType(id, values);
//       navigate(`/warehouse/clients/client-type`);
//     } catch (error) {
//       // console.log("Error updating client type:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="form-container">
//       <h1 className="form-title" style={{ marginBottom: "20px" }}>
//         تعديل نوع عميل
//       </h1>
//       <Form layout="vertical" form={form} onFinish={onFinish}>
//         <Form.Item
//           label="إسم نوع العميل"
//           name="name"
//           rules={[{ required: true, message: "من فضلك أضف إسم" }]}
//           style={{ marginBottom: "20px" }}
//         >
//           <Input placeholder="أضف إسم لنوع العميل" />
//         </Form.Item>

//         <Form.Item
//           label="نسبة الخصم"
//           name="discount"
//           rules={[{ required: false, message: "من فضلك أضف نسبة الخصم" }]}
//           style={{ marginBottom: "20px" }}
//         >
//           <Input placeholder="أضف نسبة الخصم" type="number" />
//         </Form.Item>

//         <Form.Item label="طرق الدفع" style={{ marginBottom: "20px" }}>
//           <Select
//             mode="multiple"
//             placeholder="اختر طرق الدفع"
//             style={{ width: "100%" }}
//             // onChange={setSelectedPaymentMethods}
//           >
//             {paymentMethods.map((method) => (
//               <Option key={method.id}>{method.name}</Option>
//             ))}
//           </Select>
//         </Form.Item>

//         <Form.Item>
//           <Button type="primary" htmlType="submit" loading={loading}>
//             أضف
//           </Button>
//         </Form.Item>
//       </Form>
//     </div>
//   );
// };

// export default EditClientType;

