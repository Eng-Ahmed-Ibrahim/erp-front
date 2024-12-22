import React, { useState } from "react";
import "./Form.scss";
import { Form, Input, Upload, Button, Select, Checkbox, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Option } = Select;

const DynamicForm = ({ fields, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false); 
console.log(`initialValues`,initialValues)



  const handleFormSubmit = async () => {
    try {
      setLoading(true); 
      const formData = await form.validateFields();
      onSubmit(formData);
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false); 
    }
  };

  const handleSelectChange = (value, field) => {
    if (field.onChange) {
      field.onChange(value);
    }

    if (field.name === "categories") {
      const selectedSubCategories = field.options.find(option => option.value === value);

      if (selectedSubCategories) {
        const firstSubCategoryValue = selectedSubCategories.subCategories.length > 0
          ? selectedSubCategories.subCategories[0].value
          : "";
        form.setFieldsValue({ sub_categories: firstSubCategoryValue });
      } else {
        form.setFieldsValue({ sub_categories: "" });
      }
    }
  };
  const handleMultiSelectChange = (value, field) => {
    if (field.onChange) {
      field.onChange(value);
    }
  };

  const handleCheckboxChange = (e, fieldName) => {
    const value = e.target.checked ? 1 : 0;
    form.setFieldValue(fieldName, value);
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
              showSearch 
              optionFilterProp="children" 
              onChange={(value) => {
                handleSelectChange(value, field)

                if (field?.handleSelectedItemId) {
                  field?.handleSelectedItemId(value)
                }
              }}
              disabled={field?.disabled}
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
              value={field.disabled ? field.value : field.value}
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
        {loading ? ( 
          <Spin size="large" />
        ) : (
          <Button type="primary" htmlType="submit">
        حفظ
          </Button>
        )}
      </Form.Item>
    </Form>
  );
};

export default DynamicForm;
