import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import DynamicForm from "../../../../../components/shared/form/Form";
import {
  addOrderPayable,
  getOrderPayableOrdersOptions,
} from "../../../../../apis/orderPayables";

const AddOrderPayable = () => {
  const navigate = useNavigate();
  const [orderOptions, setOrderOptions] = useState([]);

  useEffect(() => {
    const fetchOrderOptions = async () => {
      try {
        const response = await getOrderPayableOrdersOptions();
        const options = (response?.data || []).map((order) => ({
          value: order.id,
          label: `${order.code || "-"} - ${order.client_name || "بدون عميل"} - ${order.total_price || 0}`,
        }));
        setOrderOptions(options);
      } catch (error) {
        message.error("حدث خطأ أثناء تحميل الأوردرات");
      }
    };

    fetchOrderOptions();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      await addOrderPayable({
        order_id: formData.order_id,
        amount: formData.amount,
        note: formData.note,
        receipt_number: formData.receipt_number,
      });
      message.success("تم إضافة مدفوعة الأوردر بنجاح");
      navigate("/warehouse/payable/order-payables");
    } catch (error) {
      message.error(
        error?.response?.data?.message || "حدث خطأ أثناء إضافة مدفوعة الأوردر"
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

  return (
    <div className="form-container">
      <h1 className="form-title">إضافة مدفوعة أوردر</h1>
      <DynamicForm fields={fields} onSubmit={handleSubmit} />
    </div>
  );
};

export default AddOrderPayable;

