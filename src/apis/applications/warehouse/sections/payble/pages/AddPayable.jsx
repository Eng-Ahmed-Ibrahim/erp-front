import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPayable, getAllSuppliersInvoices } from "../../../../../apis/payable";
import { addSupplier } from "../../../../../apis/suppliers/index";
import DynamicForm from "../../../../../components/shared/form/Form";
import { Form } from "antd"; // Import Form from Ant Design

const AddPayable = () => {
    const navigate = useNavigate();
    const [selectedPayableType, setSelectedPayableType] = useState("");
    const [InvoiceSupplier, setInvoicesSupplier] = useState([]);

    // Define form object using Ant Design's useForm() hook
    const [totalPrice, setTotalPrice] = useState("");


    useEffect(() => {
        const fetchSuppliersInvices = async () => {
            try {
                const supplierData = await getAllSuppliersInvoices();
                setInvoicesSupplier(supplierData.data);
            } catch (error) {
                // console.log("Error fetching data:", error);
            }
        };

        fetchSuppliersInvices();
    }, []);

    const handleSubmit = async (formData) => {
        await addPayable(
            formData.amount,
            formData.note,
            formData.type,
            formData.invoice_id,
            formData.image,
            selectedPayableType
        );
        await navigate(`/warehouse/payable/show-payable`);
    };

    const payableType = [
        { value: "invoices", label: "فواتير" },
        { value: "expenses", label: "نثريات" },
        { value: "incentives", label: "الحوافز" },
        { value: "salaries", label: "المرتبات" },
    ];

    const fields = [
        {
            type: "number",
            name: "amount",
            placeholder: "يجب عليك ادخال  القمية",
            labelName: "القمية",
            required: true,
        },

        {
            type: "textarea",
            name: "note",
            placeholder: "يجب عليك ادخال الملاحظة",
            labelName: "الملاحظة",
            required: true,
        },
        {
            type: "select",
            name: "type",
            placeholder: "يجب عليك ادخال نوع الدفع",
            labelName: "نوع الدفع",
            options: payableType,
            required: true,
            onChange: (value) => {
                setSelectedPayableType(value);
            },
        },
    ];

    if (selectedPayableType === "invoices") {
        const invoiceOptions = InvoiceSupplier.map((invoice) => ({
            value: invoice.id,
            label: `${invoice.code} - ${invoice.supplier.name}-${invoice.invoice_date}`,
        }));

        fields.push({
            type: "select",
            name: "invoice_id",
            placeholder: "يجب عليك ادخال  الفاتوره",
            labelName: "الفاتوره",
            options: invoiceOptions,
            showSearch: true,
            filterOption: (input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
            required: true,
            onChange: (value, option) => {
                const selectedInvoice = InvoiceSupplier.find(
                    (invoice) => invoice.id === value
                );
                if (selectedInvoice) {
                    const totalPrice = selectedInvoice.total_price;
                    setTotalPrice(totalPrice);
                }
            },
        });
        fields.push({

            type: "text",
            name: "value",
            placeholder: `سعرالفاتوره :${totalPrice}`, // Empty initially
            labelName: "سعرالفاتوره ",
            required: false,
            disabled: true,
        })
    }

    if (selectedPayableType === "expenses") {
        fields.push({
            type: "image",
            name: "image",
            placeholder: "يجب عليك ادخال الصوره",
        });
    }

    return (
        <div className="form-container">
            <h1 className="form-title">إضافة مدفوعات</h1>
            {/* Pass the form object to the DynamicForm component */}
            <DynamicForm fields={fields} onSubmit={handleSubmit} />
        </div>
    );
};

export default AddPayable;

