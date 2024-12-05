import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  editRequest,
  getRequestById,
} from "../../../../../apis/requests/index";
import DynamicForm from "../../../../../components/shared/form/Form";

const EditRequest = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeData = await getRequestById(id);
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
    await editRequest(formData.name, formData.phone, formData.address, id);
    navigate(`/warehouse/suppliers/show-requests`);
  };

  const fields = [
    {
      type: "text",
      name: "name",
      labelName: "الاسم",
      placeholder: "يجب عليك ادخال الاسم",
      required: true,
    },
    {
      type: "text",
      name: "phone",
      labelName: "الرقم التيليفون",
      placeholder: "يجب عليك ادخال رقم الموبايل",
      required: true,
    },
    {
      type: "text",
      name: "address",
      labelName: "العنوان",
      placeholder: "يجب عليك ادخال العنوان",
      required: true,
    },
  ];

  return (
    <div className="form-container">
      <h1 className="form-title">تعديل مورد</h1>
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

export default EditRequest;
