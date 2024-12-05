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
import Invoice from "../../Invoice";
import TaintedInvoiceDetailes from "../../../../../../components/shared/InvoiveDetails/TaintedInvoiceDetailes";

import { useAuth } from "../../../../../../context/AuthContext";

const AddInvoices = () => {
  const Token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [department, setDepartment] = useState([]);

  const { user } = useAuth()

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceCode, setInvoiceCode] = useState("");
  const [invoiceNote, setInvoiceNote] = useState("");
  const [invoiceImage, setInvoiceImage] = useState(null);
  const [deparmentId, setDepartmentId] = useState("");

  const [discount, setDiscount] = useState(0);
  const [tax, setTx] = useState(0);
  const pathname = location.pathname;
  const lastItem = pathname.split("/").pop(); // This will give you "add-Invoices"

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


      } catch (error) {
        // console.log("Error fetching data:", error);
      }
    };

    fetchDepartment();
  }, []);

  const handleAddItem = (item) => {

    const isItemsExist = items.some(
      (existingItem) => existingItem.recipeId === item.recipeId
    )

    if (isItemsExist) {
      message.error(`  لا يمكن اضافة العنصر مرتين`);
      return
    }

    setItems([...items, item]);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const calculateTotalAmount = () => {
    if (lastItem === "in_coming") {
      return (items.reduce(
        (total, item) =>
          total +
          (item.quantity * item.price),
        0
      )) - (parseInt(discount)) + (parseInt(tax))
    }
    else {
      return items.reduce(
        (total, item) =>
          total +
          (item.quantity * item.price),
        0
      );
    }

  };

  const navigate = useNavigate();
  const handleDownloadPDF = async () => {
    const formData = new FormData();

    items.forEach((item, index) => {
      formData.append(`recipes[${index}][recipe_id]`, item.recipeId);
      { { lastItem === "out_going" ? null : formData.append(`recipes[${index}][price]`, item.price) } }
      // formData.append(`recipes[${index}][price]`, item.price);
      // Add other fields as needed, for example quantity, expire_date, etc.
      formData.append(`recipes[${index}][quantity]`, item.quantity);
      { lastItem === "in_coming" || lastItem === "returned" ? formData.append(`recipes[${index}][expire_date]`, item.expireDate) : null }
      // formData.append(`recipes[${index}][expire_date]`, item.expireDate);
    });

    if (lastItem === "out_going") {
      formData.append("to", selectedDepartment);
    }
    if (lastItem === "returned") {
      formData.append("to", user.department.id);
    }
    if (lastItem === "returned") {
      formData.append("from", selectedDepartment);
    }

    if (lastItem === "in_coming") {
      formData.append("supplier_id", selectedSupplier);
    }

    // if (lastItem === "returned") {
    //   formData.append("supplier_id", selectedSupplier || "");
    // }

    formData.append("type", lastItem);
    formData.append("invoice_date", invoiceDate);
    formData.append("code", invoiceCode);
    formData.append("note", invoiceNote);
    // Add other fields as needed
    {
      if (lastItem === "in_coming" || lastItem === "returned") {
        formData.append("image", invoiceImage);
      }
    }

    formData.append("discount", lastItem === "in_coming" ? discount : 0);
    formData.append("tax", lastItem === "in_coming" ? tax : 0);

    try {
      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/store/invoice/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      navigate("/warehouse/invoices/show");
      // console.log("Invoice created successfully!");
      message.success("تم اضافة  الفاتوره بنجاح ")
      // Optionally, you can redirect or show a success message here
    } catch (error) {
      console.error("Error creating invoice:", error);
      message.error(error.response.data.error.message, 10)
      // Handle error condition, show error message, etc.
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setInvoiceImage(file);
  };
  const [selectedType, setSelectedType] = useState()
  const MoveInvoiceToDepartment = async () => {
    try {
      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/store/invoice/move-invoice-to-department `,
        {
          to: selectedDepartment,
          from: user.department.id,
          code: invoiceCode
        },
        {


          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      navigate("/warehouse/invoices/show");
      // console.log("Invoice created successfully!");
      message.success("تم اضافة  الفاتوره بنجاح ")

    } catch (error) {
      message.error("حدث خطا", 10)
    }
  }


  return (
    <div className="form-container">
      <h1 className="form-title">
        {lastItem === "in_coming"
          ? "اضافة فاتورة مورد"
          : lastItem === "out_going"
            ? "اضافه فاتورة اذن صرف"
            : " اضافة فاتورة مرتجع"}
      </h1>
      {lastItem === "out_going" || lastItem === "returned" ? null : (
        <div>
          <label className="form-label" htmlFor="supplierSelect">
            اختر المورد:
          </label>
          <select
            className="form-select"
            id="supplierSelect"
            onChange={(e) => setSelectedSupplier(e.target.value)}
          >
            <option value="">اختر المورد</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {lastItem === "out_going" || lastItem === "returned" ? (
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
      ) : null}
      {lastItem === "out_going" ? <>
        <label className="form-label">هل تريد ارسال فاتورة كامله ام مكونات منفصله:</label>
        <select className="form-input" onChange={(e) => setSelectedType(e.target.value)}>
          <option value="">اختر النوع المناسب</option>
          <option value="MoveInoice">نقل مكونات فاتورة كامله</option>
          <option value="InvoiceRecipe">نقل كل مكون على حده</option>
        </select>
      </> : <></>}
      {selectedType === "MoveInoice" ? null : <div>
        <label className="form-label">اختر تاريخ الفاتورة:</label>
        <input
          className="form-input"
          type="date"
          value={invoiceDate}
          onChange={(e) => setInvoiceDate(e.target.value)}
          min = {new Date().toISOString().split('T')[0]}
        />
      </div>}

      {lastItem === "in_coming" ? (
        <div>
          <label className="form-label">كود الفاتورة:</label>
          <input
            className="form-input"
            type="number"
            value={invoiceCode}
            onChange={(e) => setInvoiceCode(e.target.value)}
            onWheel={(event) => event.currentTarget.blur()}
          />
        </div>
      ) : null}

      {lastItem === "in_coming" || lastItem === "returned" ? <>
        <div>
          <label className="form-label">صورة الفاتورة:</label>
          <input
            className="form-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
      </> : null}
      {lastItem === "in_coming" ? (
        <>
          <div>
            <label className="form-label"> خصم على الفاتورة:</label>
            <input
              className="form-input"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              onWheel={(event) => event.currentTarget.blur()}
            />
          </div>
          <div>
            <label className="form-label">
              {" "}
              مصروفات نثرية (نقل، مشال، ...) :
            </label>
            <input
              className="form-input"
              type="number"
              value={tax}
              onChange={(e) => setTx(e.target.value)}
              onWheel={(event) => event.currentTarget.blur()}
            />
          </div>
        </>
      ) : null}
      {selectedType === "MoveInoice" ? null : <div>
        <label className="form-label"> اضافة تعليق:</label>
        <input
          className="form-input"
          type="textarea"
          value={invoiceNote}
          onChange={(e) => setInvoiceNote(e.target.value)}
        />
      </div>}


      {
        selectedType === "MoveInoice" ? <div>
          <label className="form-label">كود الفاتورة:</label>
          <input
            className="form-input"
            type="number"
            value={invoiceCode}
            onChange={(e) => setInvoiceCode(e.target.value)}
            onWheel={(event) => event.currentTarget.blur()}
          />
        </div> : null
      }

      {
        lastItem === "in_coming" ? <>
          <InvoiceDetails
            onAddItem={handleAddItem}
            selectedSupplier={selectedSupplier}
            InvoiceType={lastItem}
          />
        </> : lastItem === "out_going" && selectedType === "InvoiceRecipe" ?
          <>
            <InvoiceDetails
              onAddItem={handleAddItem}
              selectedSupplier={selectedSupplier}
              InvoiceType={lastItem}
            />
          </>
          : lastItem === "returned" ? <><TaintedInvoiceDetailes
            onAddItem={handleAddItem}
            selectedSupplier={selectedSupplier}
            departmentId={selectedDepartment}


            InvoiceType={"tainted"}
          />
          </> : null
      }

      {selectedType === "MoveInoice" ? null : <ItemList items={items} onDeleteItem={handleDeleteItem} InvoiceType={lastItem} />}
      {lastItem === "returned" || selectedType === "MoveInoice" ? null : <TotalAmount total={calculateTotalAmount()} />}
      {selectedType === "MoveInoice" ? <button className="form-btn" onClick={MoveInvoiceToDepartment}>
        نقل جميع مكونات الفاتورة
      </button> : <button className="form-btn" onClick={handleDownloadPDF}>
        حفظ البيانات
      </button>}

    </div>
  );
};

export default AddInvoices;
