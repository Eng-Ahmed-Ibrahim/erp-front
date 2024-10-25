import React, { useState } from "react";
import "./Form.scss";
import { Form, Input, Upload, Button, Select, Checkbox, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Option } = Select;

const DynamicForm = ({ fields, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false); // State to track loading status

  const handleFormSubmit = async () => {
    try {
      setLoading(true); // Start loading
      const formData = await form.validateFields();
      onSubmit(formData);
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleSelectChange = (value, field) => {
    // console.log(value);
    if (field.onChange) {
      field.onChange(value);
    }
  };
  const handleMultiSelectChange = (value, field) => {
    // console.log(value);
    if (field.onChange) {
      field.onChange(value);
    }
  };

  const handleCheckboxChange = (e, fieldName) => {
    const value = e.target.checked ? 1 : 0;
    form.setFieldValue(fieldName, value);
    // console.log(form.getFieldsValue(), fieldName, value);
  };

  return (
    <Form form={form} onFinish={handleFormSubmit} initialValues={initialValues}>
      {fields.map((field, index) => (
        <Form.Item
          key={index}
          name={field.name}
          label={
            <span
              style={{
                display: "block",
                color: "#803D3B",
                fontSize: "16px",
                fontWeight: "700",
                fontFamily: "Cairo",
              }}
            >
              {field.labelName}
            </span>
          }
          rules={[{ required: field.required, message: field.placeholder }]}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          {field.type === "number" && (
            <Input
              type="number"
              placeholder={field.placeholder}
              className="disable-scroll"
              onWheel={(event) => event.currentTarget.blur()}
            />
          )}
          {field.type === "textarea" && (
            <Input.TextArea
              placeholder={field.placeholder}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          )}
          {field.type === "image" && (
            <div>
              {initialValues && initialValues[field.name] && (
                <img
                  src={`${initialValues[field.name]}`}
                  alt={`alt-${initialValues.name}`}
                  style={{ width: "50px", height: "50px" }}
                />
              )}
              <Form.Item
                name={field.name}
                valuePropName="file"
                getValueFromEvent={(e) => e.fileList}
                rules={[
                  { required: field.required, message: "يرجى تحميل الملف" },
                ]}
              >
                <Upload
                  name={field.name}
                  listType="text"
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>اضغط لرفع الملف</Button>
                </Upload>
              </Form.Item>
            </div>
          )}
          {field.type === "select" && (
            <Select
              placeholder={field.placeholder}
              showSearch // Enable search functionality
              optionFilterProp="children" // Search by children (option label)
              onChange={(value) => handleSelectChange(value, field)}
            >
              {field.options?.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          )}
          {field.type === "multi-select" && (
            <Select
              mode="multiple"
              placeholder={field.placeholder}
              onChange={(value) => handleMultiSelectChange(value, field)}
            >
              {field.options?.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          )}
          {field.type === "text" && (
            <Input
              placeholder={field.placeholder}
              disabled={field.disabled}
              value={field.disabled ? field.value : undefined}
            />
          )}
          {field.type === "checkbox" && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Checkbox
                id={field.name}
                placeholder={field.placeholder}
                disabled={field.disabled}
                onChange={(e) => handleCheckboxChange(e, field.name)}
              />
              <label htmlFor={field.name}>{field.placeholder}</label>
            </div>
          )}
        </Form.Item>
      ))}
      <Form.Item>
        {loading ? ( // Render Spin component if loading
          <Spin size="large" />
        ) : (
          <Button type="primary" htmlType="submit">
            تعديل بيانات المنتج
          </Button>
        )}
      </Form.Item>
      {/* <div
        className="shadow p-3 mb-5 rounded text-light text-center"
        style={{ backgroundColor: "#AF8260" }}
      >
        <h6>اسعار المنتج</h6>
      </div>
      <form>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            نوع العميل
          </label>
          <select className="form-select" aria-label="Default select example">
            <option selected>Open this select menu</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            اسم العميل
          </label>
          <select className="form-select" aria-label="Default select example">
            <option selected>Open this select menu</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            الربح
          </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={"15"}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            الخدمه
          </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={"15"}
          />
        </div>

        <button
          type="submit"
          className="btn text-light fs-bold px-3"
          style={{ backgroundColor: "#AF8260" }}
        >
          اضافه السعر للمنتج
        </button>
      </form>

      <table className="table table-hover mt-5">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">نوع العميل</th>
            <th scope="col">اسم العميل</th>
            <th scope="col">الربح </th>
            <th scope="col">الخدمه </th>
            <th scope="col">السعر الكلى </th>
            <th scope="col">الاجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>ظابط مشاه</td>
            <td>ظابط مشاه</td>
            <td>10 جنيه مصري</td>
            <td> 2% </td>
            <td>40 جنيه مصري</td>
            <td>
              <Link>
                <button className="mx-3 px-5 btn btn-outline-success">
                  تعديل
                </button>
              </Link>
              <button className="mx-3 px-5 btn btn-outline-danger">حذف</button>
            </td>
          </tr>
          <tr>
            <th scope="row">1</th>
            <td> وفود</td>
            <td> وفد كيني </td>
            <td>15 جنيه مصري</td>
            <td> 3% </td>
            <td>35 جنيه مصري</td>
            <td>
              <Link>
                <button className="mx-3 px-5 btn btn-outline-success">
                  تعديل
                </button>
              </Link>
              <button className="mx-3 px-5 btn btn-outline-danger">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        className="shadow p-3 my-5 rounded text-light text-center"
        style={{ backgroundColor: "#AF8260" }}
      >
        <h6>مكونات المنتج </h6>
      </div>
      <Link to={''}>
        <button
          type="button"
          className="btn text-light fs-bold px-3"
          style={{ backgroundColor: "#AF8260" }}
        >
          اضافه مكون
        </button>
      </Link>
      <table className="table table-hover mt-5">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">اسم المنتج</th>
            <th scope="col">الصوره </th>
            <th scope="col">الكميه </th>
            <th scope="col">السعر </th>
            <th scope="col">الاجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>رز بالبن</td>
            <td>
              <img
                src="/dojoids.jpg"
                width={"50px"}
                height={"50px"}
                alt=""
                srcset=""
              />
            </td>
            <td> 5 </td>
            <td>15 جنيه مصري</td>
            <td>
              <button className="mx-3 px-5 btn btn-outline-danger">حذف</button>
            </td>
          </tr>
        </tbody>
      </table> */}

    </Form>
  );
};

export default DynamicForm;
