import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDiscountReason } from "../../../../../apis/clients/DiscountReason";
import DynamicForm from "../../../../../components/shared/form/Form";

const AddDiscountReason = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    // console.log(formData);
    await addDiscountReason(formData);
    navigate(`/warehouse/clients/discount-reason`);
  };

  const fields = [
    {
      type: "text",
      name: "discount_reason",
      labelName: " سبب الخصم",
      placeholder: "يجب عليك ادخال سبب الخصم",
      required: true,
    },
    {
      type: "number",
      name: "discount",
      labelName: " قيمة الخصم",
      placeholder: "يجب عليك ادخال قيمة الخصم",
      required: true,
    },
  ];
  return (
    <div className="form-container">
      <h1 className="form-title">إضافة سبب الخصم</h1>
      <DynamicForm fields={fields} onSubmit={handleSubmit} />
    </div>
  );
};

export default AddDiscountReason;
