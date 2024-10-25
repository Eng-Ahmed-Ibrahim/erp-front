import React, { useState, useEffect } from "react";
import InvoiceDetails from "../../../../../../components/shared/InvoiveDetails/InvoiceDetails";
import ItemList from "../../../../../../components/shared/itemList/ItemList";
import TotalAmount from "../../../../../../components/shared/totalAmount/TotalAmount";

import "./CashierWarehouseRequests.scss";
import axios from "axios";
import { getSuppliers } from "../../../../../../apis/suppliers";
import { getAllDepartments } from "../../../../../../apis/departments";

import { API_ENDPOINT } from "../../../../../../../config";
import { useNavigate } from "react-router-dom";
import CahierWearhouseDetailes from "../../../../../../components/shared/CashierWearhouseDetailes/CashierWearhouseDetailes";
import ItemCashierWearhouse from "../../../../../../components/shared/CashierWearhouseDetailes/ItemCashierWearhouse";
import { message } from "antd";

const CashierWarehouseRequests = () => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const [suppliers, setSuppliers] = useState([]);
  const [department, setDepartment] = useState([]);

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const fetchDataSuppliers = async () => {
      try {
        const supplierData = await getSuppliers();
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
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const navigate = useNavigate();
  const handleDownloadPDF = async () => {
    const formData = new FormData();

    items.forEach((item, index) => {
      formData.append(`recipes[${index}][id]`, item.recipeId);
      formData.append(`recipes[${index}][quantity]`, item.quantity);
      formData.append(`recipes[${index}][expire_date]`, item.expireDate);
    });

    // formData.append("type", lastItem);
    // formData.append("invoice_date", invoiceDate);
    // formData.append("code", invoiceCode);
    formData.append("to_department_id", selectedDepartment);

    formData.append("title", title);
    // Add other fields as needed
    // formData.append("image", invoiceImage);
    // formData.append("discount", lastItem === "in_coming" ? discount : 0);
    // formData.append("tax", lastItem === "in_coming" ? tax : 0);

    try {
      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/store/request/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      // console.log(response.data);
      // navigate("/warehouse/invoices/show");
      // console.log("Invoice created successfully!");
      message.success("تم اضافة طلب بنجاح");
      // Optionally, you can redirect or show a success message here
    } catch (error) {
      console.error("Error creating invoice:", error);
      // Handle error condition, show error message, etc.
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">اضافة طلب من المخزن</h1>

      <div>
        <label className="form-label" htmlFor="supplierSelect">
          اختر قسم:
        </label>
        <select
          className="form-select"
          id="supplierSelect"
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="" selected disabled>
            اختر قسم
          </option>
          {department.map(
            (supplier) =>
              supplier.name !== "مخزن" && (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              )
          )}
        </select>
      </div>
      <div>
        <label className="form-label">العنوان:</label>
        <input
          className="form-input"
          type="textarea"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <CahierWearhouseDetailes
        onAddItem={handleAddItem}
        selectedSupplier={selectedSupplier}
      // InvoiceType={lastItem}
      />
      <ItemCashierWearhouse items={items} onDeleteItem={handleDeleteItem} />
      <TotalAmount total={calculateTotalAmount()} />
      <button className="form-btn" onClick={handleDownloadPDF}>
        حفظ البيانات
      </button>
    </div>
  );
};

export default CashierWarehouseRequests;
