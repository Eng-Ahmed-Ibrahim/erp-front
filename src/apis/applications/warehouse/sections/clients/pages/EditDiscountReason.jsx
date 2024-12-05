import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDiscountReasonById,
  updateDiscountReason,
} from "../../../../../apis/clients/DiscountReason";
import DynamicForm from "../../../../../components/shared/form/Form";

const EditDiscountReason = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeData = await getDiscountReasonById(id);
        setData(recipeData?.data);
        // console.log(recipeData.data);
      } catch (error) {
        // console.log("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (formData) => {
    await updateDiscountReason(id, formData);
    navigate(`/warehouse/clients/discount-reason`);
  };

  const fields = [
    {
      type: "text",
      name: "discount_reason",
      labelName: "سبب الخصم",
      placeholder: "يجب عليك ادخال سبب الخصم",
      required: true,
    },
    {
      type: "number",
      name: "discount",
      labelName: "قيمة الخصم",
      placeholder: "يجب عليك ادخال قيمة الخصم",
    },
  ];

  return (
    <div className="form-container">
      <h1 className="form-title">تعديل سبب الخصم</h1>
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

export default EditDiscountReason;
