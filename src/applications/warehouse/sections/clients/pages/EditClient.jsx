import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  updateClient,
  getClientById,
} from "../../../../../apis/clients/Client";
import DynamicForm from "../../../../../components/shared/form/Form";
import { getClientTypes } from "../../../../../apis/clients/ClientType";
import { Form, Input, Button, Select } from "antd";

const EditClient = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [clientTypes, setClientTypes] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    const fetchClientTypes = async () => {
      const res = await getClientTypes({}, "", () => {});
      setClientTypes(res?.data);
      // console.log(res?.data);
    };

    const fetchData = async () => {
      try {
        const data = await getClientById(id);
        setData(data?.data);
      } catch (error) {}
    };

    fetchData();
    fetchClientTypes();
  }, [id]);

  const handleSubmit = async (formData) => {
    await updateClient(formData, id);
    // navigate(`/warehouse/clients/client`);
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
      type: "text",
      name: "phone",
      placeholder: "  ادخل رقم الموبايل",
      labelName: "الموبايل",
    },
    {
      type: "number",
      name: "military_number",
      placeholder: "  ادخل رقم العضوية",
      labelName: "رقم العضوية",
    },
    {
      type: "number",
      name: "sallary",
      placeholder: "  ادخل المرتب",
      labelName: "المرتب",
    },
    {
      type: "number",
      name: "incentives",
      placeholder: "  ادخل الحوافز",
      labelName: "الحوافز",
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
      type: "multi-select",
      name: "client_type_id",
      labelName: "نوع العميل",
      placeholder: "نوع العميل",
      required: true,
      options: clientTypes.map((type) => {
        return { value: type.id, label: type.name };
      }),
    },
  ];

  const initialValues = data ? { ...data, client_type_id: data.client_types.map((type) => ({id: type.id, label: type.name}))|| [] } : {};

  return (
    <div className="form-container">
      <h1 className="form-title">تعديل عميل</h1>
      {data && (
          <DynamicForm
            fields={fields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
          />
      )}
    </div>
  );
};

export default EditClient;
