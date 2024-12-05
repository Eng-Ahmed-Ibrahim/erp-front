import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClientTypes } from "../../../../../apis/clients/ClientType";
import { addClient } from "../../../../../apis/clients/Client";
import DynamicForm from "../../../../../components/shared/form/Form";

const AddClient = () => {
  const navigate = useNavigate();
  const [clientTypes, setClientTypes] = useState([]);
  useEffect(() => {
    const fetchClientTypes = async () => {
      const res = await getClientTypes({}, "", () => { });
      setClientTypes(res?.data);
      //  
    };
    fetchClientTypes();
  }, []);
  const handleSubmit = async (formData) => {
    //  
    await addClient(formData);
    navigate(`/warehouse/clients/client`);
  };

  const fields = [
    {
      type: "text",
      name: "name",
      labelName: "الاسم العميل",
      placeholder: "يجب عليك ادخال إسم العميل",
      required: true,
    },
    {
      type: "number",
      name: "phone",
      labelName: "رقم التليفون",
      placeholder: "يجب عليك ادخال رقم العميل",
      required: false,
    },
    {
      type: "number",
      name: "military_number",
      labelName: "رقم العضوية",
      placeholder: "ادخل الرقم العضوية",
      required: false,

    },

    {
      type: "number",
      name: "salary",
      labelName: "المرتب",
      placeholder: "ادخل المرتب",
    },
    {
      type: "number",
      name: "incentives",
      labelName: "الحوافز",
      placeholder: "ادخل الحوافز",
    },
    {
      type: "number",
      name: "discount",
      labelName: "نسبة الخصم",
      placeholder: "نسبة الخصم",
    },
    {
      type: "number",
      name: "tax",
      labelName: "ضريبة الخدمه",
      placeholder: "ضريبة الخدمه",
    },
    {
      type: "select",
      name: "client_type_id",
      labelName: "نوع العميل",
      placeholder: "نوع العميل",
      required: true,
      options: clientTypes.map((type) => {
        return { value: type.id, label: type.name };
      }),

    },
  ];
  return (
    <div className="form-container">
      <h1 className="form-title">إضافة عميل جديد</h1>
      <DynamicForm fields={fields} onSubmit={handleSubmit} />
    </div>
  );
};

export default AddClient;
