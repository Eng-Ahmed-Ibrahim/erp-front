import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPaymentMethodById,
  updatePaymentMethod,
} from "../../../../../apis/clients/PaymentMethod/index";
import DynamicForm from "../../../../../components/shared/form/Form";

const EditPaymentMethod = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recipeData = await getPaymentMethodById(id);
        setData(recipeData?.data);
        // console.log(recipeData.data);
      } catch (error) {
        // console.log("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (formData) => {
    await updatePaymentMethod(id, formData);
    navigate(`/warehouse/clients/payment-method`);
  };

  const fields = [
    {
      type: "text",
      name: "name",
      labelName: "إسم طريقة الدفع",
      placeholder: "يجب عليك ادخال الاسم",
      required: true,
    },
    // {
    //   type: "text",
    //   name: "label",
    //   labelName: "وصف طريقة الدفع",
    //   placeholder: "إدخل عنوان",
    // },
    // {
    //   type: "image",
    //   name: "image",
    //   labelName: "الصورة",
    //   placeholder: "إدخل صورة",
    // },
    // {
    //   type: "select",
    //   name: "status",
    //   labelName: "الحالة",
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
    //   labelName: "النوع",
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
      <h1 className="form-title">تعديل طريقة دفع</h1>
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

export default EditPaymentMethod;
