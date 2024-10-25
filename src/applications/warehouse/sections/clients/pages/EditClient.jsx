import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  updateClient,
  getClientById,
} from "../../../../../apis/clients/Client";
import DynamicForm from "../../../../../components/shared/form/Form";
import { getClientTypes } from "../../../../../apis/clients/ClientType";

const EditClient = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [clientTypes, setClientTypes] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    const fetchClientTypes = async () => {
      const res = await getClientTypes({}, "", () => { });
      setClientTypes(res?.data);
      // console.log(res?.data);
    };


    const fetchData = async () => {
      try {
        const recipeData = await getClientById(id);
        setData(recipeData?.data);
        // console.log(recipeData.data);
      } catch (error) {
        // console.log("Error fetching data:", error);
      }
    };

    fetchData();
    fetchClientTypes();
  }, [id]);

  const handleSubmit = async (formData) => {
    // console.log(formData);
    await updateClient(formData, id);
    navigate(`/warehouse/clients/client`);
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
    // {
    //   type: "select",
    //   name: "is_worker",
    //   placeholder: "يجب عليك ادخال النوع",
    //   labelName: "النوع",
    //   options: [
    //     { value: 0, label: "غير عامل بالدار" },
    //     { value: 1, label: "عامل بالدار" },
    //   ],
    //   required: true,
    // },
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
      <h1 className="form-title">تعديل عميل</h1>
      {data && (
        <DynamicForm
          fields={fields}
          initialValues={data}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default EditClient;
