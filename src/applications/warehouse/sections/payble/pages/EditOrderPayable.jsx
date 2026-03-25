import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import DynamicForm from "../../../../../components/shared/form/Form";
import {
  getOrderPayableById,
  getOrderPayableOrdersOptions,
  updateOrderPayable,
} from "../../../../../apis/orderPayables";

const EditOrderPayable = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [orderOptions, setOrderOptions] = useState([]);
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, orderPayableResponse] = await Promise.all([
          getOrderPayableOrdersOptions(),
          getOrderPayableById(id),
        ]);

        const options = (ordersResponse?.data || []).map((order) => ({
          value: order.id,
          label: `${order.code || "-"} - ${order.client_name || "بدون عميل"} - ${order.total_price || 0}`,
        }));
        setOrderOptions(options);

        const item = orderPayableResponse?.data || {};
        setInitialValues({
          order_id: item.order_id || "",
          amount: item.amount || 0,
          receipt_number: item.receipt_number || "",
          note: item.note || "",
        });
      } catch (error) {
        message.error("حدث خطأ أثناء تحميل بيانات مدفوعة الأوردر");
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await updateOrderPayable(id, {
        order_id: formData.order_id,
        amount: formData.amount,
        note: formData.note,
        receipt_number: formData.receipt_number,
      });
      message.success("تم تعديل مدفوعة الأوردر بنجاح");
      navigate("/warehouse/payable/order-payables");
    } catch (error) {
      message.error(
        error?.response?.data?.message || "حدث خطأ أثناء تعديل مدفوعة الأوردر"
      );
    }
  };

  const fields = [
    {
      type: "select",
      name: "order_id",
      placeholder: "اختر الأوردر",
      labelName: "الأوردر",
      options: orderOptions,
      required: true,
    },
    {
      type: "number",
      name: "amount",
      placeholder: "أدخل قيمة المدفوعة",
      labelName: "قيمة المدفوعة",
      required: true,
    },
    {
      type: "text",
      name: "receipt_number",
      placeholder: "أدخل رقم الإيصال",
      labelName: "رقم الإيصال",
      required: false,
    },
    {
      type: "textarea",
      name: "note",
      placeholder: "أدخل الملاحظة",
      labelName: "الملاحظة",
      required: false,
    },
  ];

  if (!initialValues) {
    return <div style={{ padding: "20px" }}>جاري التحميل...</div>;
  }

  return (
    <div className="form-container">
      <h1 className="form-title">تعديل مدفوعة أوردر</h1>
      <DynamicForm
        fields={fields}
        onSubmit={handleSubmit}
        initialValues={initialValues}
      />
    </div>
  );
};

export default EditOrderPayable;

