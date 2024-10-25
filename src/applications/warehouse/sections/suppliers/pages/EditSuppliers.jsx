import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  editSupplier,
  getSupplierById,
} from "../../../../../apis/suppliers/index";
import DynamicForm from "../../../../../components/shared/form/Form";

const EditSuppliers = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeData = await getSupplierById(id);
        setData(recipeData?.data);
        // console.log(recipeData.data);
      } catch (error) {
        // console.log("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (formData) => {
    // console.log(formData);
    await editSupplier(formData.name, formData.phone, formData.address, formData.type, id);
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
      type: "text",
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

  const initialValues = {
    name: data?.name || "",
    phone: data?.phone || "",
    address: data?.address || "",
    type: data?.type || "",
  };

  // console.log("values:", initialValues)

  return (
    <div className="form-container">
      <h1 className="form-title">تعديل مورد</h1>
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

export default EditSuppliers;
