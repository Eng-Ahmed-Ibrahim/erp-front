import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPaymentMethod } from "../../../../../apis/clients/PaymentMethod";
import DynamicForm from "../../../../../components/shared/form/Form";

const AddPaymentMethod = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    // console.log(formData);
    await addPaymentMethod(formData);
    navigate(`/warehouse/clients/payment-method`);
  };

  const fields = [
    {
      type: "text",
      name: "name",


      labelName: " الاسم",
      placeholder: "يجب عليك ادخال الاسم",
      required: true,
    },
    // {
    //   type: "text",
    //   name: "label",
    //   labelName: "إدخل عنوان",
    //   placeholder: "إدخل عنوان",
    // },
    // {
    //   type: "image",
    //   name: "image",
    //   labelName: "إدخل صورة",
    //   placeholder: "إدخل صورة",
    //   required: true,
    // },
    // {
    //   type: "select",
    //   name: "status",
    //   labelName: "إدخال حالة",
    //   placeholder: "يجب عليك إدخال حالة",
    //   required: true,
    //   options: [
    //     { value: "active", label: "نشط" },
    //     { value: "inactive", label: "غير نشط" },
    //   ],
    // },
    // {
    //   type: "select",
    //   name: "type",
    //   labelName: "إدخال نوع",
    //   placeholder: "يجب عليك إدخال نوع",
    //   required: true,
    //   options: [
    //     { value: "cash", label: "كاش" },
    //     { value: "postpaid", label: "دفع اجل" },
    //     { value: "hospitality", label: "ضيافة" },
    //     { value: "visa", label: "فيزا" },
    //   ],
    // },
  ];
  return (
    <div className="form-container">
      <h1 className="form-title">إضافة طريقة دفع</h1>
      <DynamicForm fields={fields} onSubmit={handleSubmit} />
    </div>
  );
};

export default AddPaymentMethod;
