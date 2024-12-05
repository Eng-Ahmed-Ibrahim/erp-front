import React, { useState, useEffect } from "react";
import InvoiceDetails from "../../../../../../components/shared/InvoiveDetails/InvoiceDetails";
import ItemList from "../../../../../../components/shared/itemList/ItemList";
import TotalAmount from "../../../../../../components/shared/totalAmount/TotalAmount";

import "./AddInvoice.scss";
import axios from "axios";
import { getSuppliers } from "../../../../../../apis/suppliers";
import { getAllDepartments } from "../../../../../../apis/departments";

import { API_ENDPOINT } from "../../../../../../../config";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import TaintedInvoiceDetailes from "../../../../../../components/shared/InvoiveDetails/TaintedInvoiceDetailes";

const AddTaintedInvoices = () => {
    const Token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [department, setDepartment] = useState([]);

    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const [invoiceDate, setInvoiceDate] = useState("");
    const [invoiceCode, setInvoiceCode] = useState("");
    const [invoiceNote, setInvoiceNote] = useState("");
    const [invoiceImage, setInvoiceImage] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [tax, setTx] = useState(0);

    useEffect(() => {
        const fetchDataSuppliers = async () => {
            try {
                const supplierData = await getSuppliers({}, "", () => { });
                setSuppliers(supplierData.data);
                // console.log(suppliers);
            } catch (error) {
                // console.log("Error fetching data:", error);
            }
        };

        fetchDataSuppliers();
    }, []);

    useEffect(() => {
        const fetchDepartment = async () => {
            try {
                const departmentData = await getAllDepartments();
                setDepartment(departmentData.data);
                // console.log(departmentData);
            } catch (error) {
                // console.log("Error fetching data:", error);
            }
        };

        fetchDepartment();
    }, []);

    const handleAddItem = (item) => {
        setItems([...items, item]);
    };

    const handleDeleteItem = (index) => {
        const updatedItems = [...items];
        updatedItems.splice(index, 1);
        setItems(updatedItems);
    };

    const calculateTotalAmount = () => {
        return (
            items.reduce((total, item) => total + item.quantity * item.price, 0) -
            parseInt(discount) +
            parseInt(tax)
        );
    };
    const navigate = useNavigate();
    const handleDownloadPDF = async () => {
        const formData = new FormData();

        items.forEach((item, index) => {
            formData.append(`recipes[${index}][recipe_id]`, item.recipeId);
            //   { { lastItem === "out_going" || lastItem === "returned" ? null : formData.append(`recipes[${index}][price]`, item.price) } }
            formData.append(`recipes[${index}][price]`, item.price);
            // Add other fields as needed, for example quantity, expire_date, etc.
            formData.append(`recipes[${index}][quantity]`, item.quantity);
            formData.append(`recipes[${index}][expire_date]`, item.expireDate);
            //   { lastItem === "in_coming" || lastItem === "returned" ? formData.append(`recipes[${index}][expire_date]`, item.expireDate) : null }
            // formData.append(`recipes[${index}][expire_date]`, item.expireDate);
        });

        // if (lastItem === "out_going") {
        //   formData.append("to", selectedDepartment);
        // }
        // if (lastItem === "returned") {
        //   formData.append("from", selectedDepartment);
        // }

        // if (lastItem === "in_coming") {
        //   formData.append("supplier_id", selectedSupplier);
        // }

        // if (lastItem === "returned") {
        //   formData.append("supplier_id", selectedSupplier || "");
        // }

        formData.append("from", selectedDepartment);

        formData.append("invoice_date", invoiceDate);

        formData.append("note", invoiceNote);
        // Add other fields as needed

        try {
            const response = await axios.post(
                `${API_ENDPOINT}/api/v1/store/tainted-invoices/create`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${Token}`,
                    },
                }
            );
            // console.log(response.data);
            await navigate("/warehouse/invoices/show-tained");
            // console.log("Invoice created successfully!");
            message.success("تم اضافة  الفاتوره بنجاح ");
            // Optionally, you can redirect or show a success message here
        } catch (error) {
            console.error("Error creating invoice:", error);
            message.error(error.response.data.error.message, 10);
            // Handle error condition, show error message, etc.
        }
    };
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setInvoiceImage(file);
    };

    return (
        <div className="form-container">
            <h1 className="form-title">اضافة فاتورة هالك</h1>

            <div>
                <label className="form-label" htmlFor="supplierSelect">
                    اختر قسم:
                </label>
                <select
                    className="form-select"
                    id="supplierSelect"
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                    <option value="">اختر قسم</option>
                    {department.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="form-label">اختر تاريخ الفاتورة:</label>
                <input
                    className="form-input"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                />
            </div>

            <div>
                <label className="form-label">صورة الفاتورة:</label>
                <input
                    className="form-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                />
            </div>

            <div>
                <label className="form-label"> اضافة تعليق:</label>
                <input
                    className="form-input"
                    type="textarea"
                    value={invoiceNote}
                    onChange={(e) => setInvoiceNote(e.target.value)}
                />
            </div>
            <TaintedInvoiceDetailes
                onAddItem={handleAddItem}
                selectedSupplier={selectedSupplier}
                InvoiceType={"tainted"}
                departmentId={selectedDepartment}
            />
            <ItemList
                items={items}
                onDeleteItem={handleDeleteItem}
                InvoiceType={"tainted"}
            />
            {/* <TotalAmount total={calculateTotalAmount()} /> */}

            <button className="form-btn" onClick={handleDownloadPDF}>
                حفظ البيانات
            </button>
        </div>
    );
};

export default AddTaintedInvoices;
