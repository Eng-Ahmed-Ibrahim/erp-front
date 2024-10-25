import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addSupplier } from "../../../../../apis/suppliers/index";
import DynamicForm from "../../../../../components/shared/form/Form";

const AddSupplier = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    // console.log(formData);
    await addSupplier(formData);
    navigate(`/warehouse/suppliers/show-suppliers`);
  };

  const fields = [
    {
      type: "text",
      name: "name",
      placeholder: "يجب عليك ادخال الاسم",
      labelName: "الاسم",
      required: true,
    },
    {
      type: "number",
      name: "phone",
      placeholder: "يجب عليك ادخال رقم الموبايل",
      labelName: "الموبايل",
      required: true,
    },
    {
      type: "text",
      name: "address",
      placeholder: "يجب عليك ادخال العنوان",
      labelName: "العنوان",
      required: true,
    },
    {
      type: "select",
      name: "type",
      placeholder: "يجب عليك ادخال نوع التوريد",
      labelName: "نوع التوريد",
      options: [
        { value: "contracted", label: "متعاقد" },
        { value: "local", label: "سوق محلى" },
      ],
      required: true,
    },
  ];

  return (
    <div className="form-container">
      <h1 className="form-title">إضافة مورد</h1>
      <DynamicForm fields={fields} onSubmit={handleSubmit} />
    </div>
  );
};

export default AddSupplier;
