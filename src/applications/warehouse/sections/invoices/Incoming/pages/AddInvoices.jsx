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
import { message, Modal, Select } from "antd";
import Invoice from "../../Invoice";
import TaintedInvoiceDetailes from "../../../../../../components/shared/InvoiveDetails/TaintedInvoiceDetailes";

import { useAuth } from "../../../../../../context/AuthContext";

const AddInvoices = () => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [department, setDepartment] = useState([]);

  const { user } = useAuth();

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [targetDepartment, setTargetDepartment] = useState(null);

  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceCode, setInvoiceCode] = useState("");
  const [invoiceNote, setInvoiceNote] = useState("");
  const [invoiceImage, setInvoiceImage] = useState(null);
  const [deparmentId, setDepartmentId] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  const [discount, setDiscount] = useState(0);
  const [tax, setTx] = useState(0);
  const pathname = location.pathname;
  const lastItem = pathname.split("/").pop();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDataSuppliers = async () => {
      try {
        const supplierData = await getSuppliers({}, "", () => {});
        setSuppliers(supplierData.data);
        //
      } catch (error) {
        //
      }
    };

    fetchDataSuppliers();
  }, []);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const departmentData = await getAllDepartments();
        const depWithoutStore = departmentData.data.filter(
          (item) => item.id !== "01hy3km07mf7fafqn2j6388d1t"
        );
        setDepartment(depWithoutStore);
      } catch (error) {
        //
      }
    };

    fetchDepartment();
  }, []);

  const handleAddItem = (item) => {
    const isItemsExist = items.some(
      (existingItem) => existingItem.recipeId === item.recipeId
    );
    if (lastItem === "in_coming") {
      if (isItemsExist) {
        message.error(`  لا يمكن اضافة العنصر مرتين`);
        return;
      }
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
      return (
        items.reduce((total, item) => total + item.quantity * item.price, 0) -
        parseInt(discount) +
        parseInt(tax)
      );
    } else {
      console.log(items);
      return items.reduce(
        (total, item) => total + item.quantity * item.price,
        0
      );
    }
  };

  const navigate = useNavigate();
  const handleDownloadPDF = async () => {
    setIsDisabled(true);
    const formData = new FormData();

    items.forEach((item, index) => {
      formData.append(`recipes[${index}][recipe_id]`, item.recipeId);
      {
        {
          lastItem === "out_going"
            ? null
            : formData.append(`recipes[${index}][price]`, item.price);
        }
      }

      {
        {
          lastItem === "out_going" || lastItem == "transfare"
            ? formData.append(`recipes[${index}][invoice_id]`, item.invoiceId)
            : null;
        }
      }

      formData.append(`recipes[${index}][quantity]`, item.quantity);

      {
        lastItem === "in_coming" ||
        lastItem === "returned" ||
        lastItem == "transfare"
          ? formData.append(`recipes[${index}][expire_date]`, item.expireDate)
          : null;
      }
    });

    if (lastItem == "transfare") {
      formData.append("from", selectedDepartment);
      formData.append("to", targetDepartment);
    }

    if (lastItem === "out_going") {
      formData.append("to", selectedDepartment);
      // formData.append("selected_invoice_id", reci);
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
    formData.append("type", lastItem);
    formData.append("invoice_date", invoiceDate);
    formData.append("code", invoiceCode);

    formData.append("note", invoiceNote);
    {
      if (lastItem === "in_coming" || lastItem === "returned") {
        formData.append("image", invoiceImage);
      }
    }

    formData.append("discount", lastItem === "in_coming" ? discount : 0);
    formData.append("tax", lastItem === "in_coming" ? tax : 0);

    try {
      // setErrorMessage("تاريخ انتهاء الصلاحية المحدد غير موجود في التفاصيل المتاحة.");

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
      //
      message.success("تم اضافة  الفاتوره بنجاح ");
    } catch (error) {
      setIsDisabled(false);
      Object.entries(error.response.data.error.errors).forEach(
        ([key, value]) => {
          // message.error(value)

          const modal = Modal.error({
            title: "Error",
            content: (
              <div style={{ fontSize: "24px", textAlign: "center" }}>
                {" "}
                {value}
              </div>
            ),
            centered: true,
            width: 400,
          });

          setTimeout(() => {
            modal.destroy();
          }, 4000);
          return;
        }
      );
      // message.error(error.response.data.error.message, 10);

      c;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setInvoiceImage(file);
  };
  const [selectedType, setSelectedType] = useState();

  const MoveInvoiceToDepartment = async () => {
    try {
      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/store/invoice/move-invoice-to-department `,
        {
          to: selectedDepartment,
          from: user.department.id,
          code: invoiceCode,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const modal = Modal.success({
        title: "success",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center" }}>
            {" "}
            تم اضافة الفاتوره بنجاح{" "}
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 2500);
      navigate("/warehouse/invoices/show");
    } catch (error) {
      const modal = Modal.error({
        title: "Error",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center" }}>
            {" "}
            {error.response.data.error.message}{" "}
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 4000);
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">
        {lastItem === 'in_coming'
          ? 'اضافة فاتورة مورد'
          : lastItem === 'out_going'
          ? 'اضافه فاتورة اذن صرف'
          : lastItem === 'returned'
          ? 'اضافة فاتورة مرتجع'
          : 'اضافة فاتورة تحويل '}
      </h1>

      {lastItem === 'out_going' ||
      lastItem === 'returned' ||
      lastItem === 'transfare' ? null : (
        <div>
          {/** MOWARED */}
          <label className="form-label" htmlFor="supplierSelect">
            اختر المورد:
          </label>
          <Select
            showSearch
            placeholder="اختر المورد"
            optionFilterProp="children"
            onChange={(value) => setSelectedSupplier(value)}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={suppliers.map((supplier) => ({
              value: supplier.id,
              label: supplier.name,
            }))}
            style={{ width: '100%', height: '40px' }}
            className="form-select"
          />
        </div>
      )}

      {lastItem === 'out_going' ||
      lastItem === 'returned' ||
      lastItem === 'transfare' ? (
        <div>
          <label className="form-label" htmlFor="supplierSelect">
            {lastItem === 'transfare' ? ' تحويل من' : 'اختر قسم:'}
          </label>
          <Select
            showSearch
            placeholder="اختر قسم"
            optionFilterProp="children"
            onChange={(value) => setSelectedDepartment(value)}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={department.map((dept) => ({
              value: dept.id,
              label: dept.name,
            }))}
            style={{ width: '100%', height: '40px' }}
            className="form-select"
          />
        </div>
      ) : null}

      {lastItem === 'transfare' ? (
        <div>
          <label className="form-label" htmlFor="supplierSelect">
            إلي
          </label>
          <Select
            showSearch
            placeholder="اختر قسم"
            optionFilterProp="children"
            onChange={(value) => setTargetDepartment(value)}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={department.map((dept) => ({
              value: dept.id,
              label: dept.name,
            }))}
            style={{ width: '100%', height: '40px' }}
            className="form-select"
          />
        </div>
      ) : null}

      {lastItem === 'out_going' ? (
        <>
          <label className="form-label">
            هل تريد ارسال فاتورة كامله ام مكونات منفصله:
          </label>
          <select
            className="form-input"
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">اختر النوع المناسب</option>
            <option value="MoveInoice">نقل مكونات فاتورة كامله</option>
            <option value="InvoiceRecipe">نقل كل مكون على حده</option>
          </select>
        </>
      ) : (
        <></>
      )}

      {selectedType === 'MoveInoice' ? null : (
        <div>
          <label className="form-label">اختر تاريخ الفاتورة:</label>
          <input
            className="form-input"
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
          />
        </div>
      )}

      {lastItem === 'in_coming' || lastItem == 'returned' ? (
        <div>
          <label className="form-label">كود الفاتوره</label>
          <input
            className="form-input"
            type="text"
            value={invoiceCode}
            onChange={(e) => setInvoiceCode(e.target.value)}
            onWheel={(event) => event.currentTarget.blur()}
          />
        </div>
      ) : null}

      {lastItem === 'in_coming' ||
      lastItem === 'returned' ||
      lastItem === 'transfare' ? (
        <>
          <div>
            <label className="form-label">صورة الفاتورة:</label>
            <input
              className="form-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </>
      ) : null}

      {lastItem === 'in_coming' ? (
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
              {' '}
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

      {selectedType === 'MoveInoice' ? null : (
        <div>
          <label className="form-label"> اضافة تعليق:</label>
          <input
            className="form-input"
            type="textarea"
            value={invoiceNote}
            onChange={(e) => setInvoiceNote(e.target.value)}
          />
        </div>
      )}

      {selectedType === 'InvoiceRecipe' ? (
        <div>
          <label className="form-label">كود فاتورة الصرف</label>
          <input
            className="form-input"
            type="text"
            value={invoiceCode}
            onChange={(e) => setInvoiceCode(e.target.value)}
            onWheel={(event) => event.currentTarget.blur()}
          />
        </div>
      ) : null}

      {selectedType === 'MoveInoice' ? (
        <div>
          <label className="form-label">كود فاتوره المورد:</label>
          <input
            className="form-input"
            type="text"
            value={invoiceCode}
            onChange={(e) => setInvoiceCode(e.target.value)}
            onWheel={(event) => event.currentTarget.blur()}
          />
        </div>
      ) : null}

      {lastItem === 'in_coming' ? (
        <>
          <InvoiceDetails
            onAddItem={handleAddItem}
            selectedSupplier={selectedSupplier}
            InvoiceType={lastItem}
            addedItems={items}
          />
        </>
      ) : lastItem === 'out_going' && selectedType === 'InvoiceRecipe' ? (
        <>
          <InvoiceDetails
            onAddItem={handleAddItem}
            selectedSupplier={selectedSupplier}
            InvoiceType={lastItem}
            addedItems={items}
          />
        </>
      ) : lastItem === 'returned' || lastItem === 'transfare' ? (
        <>
          <TaintedInvoiceDetailes
            onAddItem={handleAddItem}
            selectedSupplier={selectedSupplier}
            departmentId={selectedDepartment}
            InvoiceType={'tainted'}
            addedItems={items}
          />
        </>
      ) : null}

      {selectedType === 'MoveInoice' ? null : (
        <ItemList
          items={items}
          onDeleteItem={handleDeleteItem}
          InvoiceType={lastItem}
        />
      )}

      {lastItem === 'returned' || selectedType === 'MoveInoice' ? null : (
        <TotalAmount total={calculateTotalAmount()} />
      )}

      {selectedType === 'MoveInoice' ? (
        <button className="form-btn" onClick={MoveInvoiceToDepartment}>
          نقل جميع مكونات الفاتورة
        </button>
      ) : (
        <button
          className="form-btn"
          onClick={handleDownloadPDF}
          disabled={isDisabled}
          style={{
            backgroundColor: isDisabled ? '#d3d3d3' : '#AF842444460', // gray for disabled, green otherwise
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            color: isDisabled ? '#a9a9a9' : 'white', // adjust text color if needed
          }}
        >
          حفظ البيانات
        </button>
      )}
    </div>
  );
};

export default AddInvoices;
