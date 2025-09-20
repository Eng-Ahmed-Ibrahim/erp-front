import React, { useState, useEffect } from "react";
import "./ShowDataModal.scss";
import { getOrderById, deleteOrder } from "../../../apis/orders";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../../../context/AuthContext";

import {
  addRecipeToInvoice,
  removeRecipeFromInvoice,
} from "../../../apis/invoices";
import AddRecipeToInvoice from "../../shared/AddRecipeToInvoice/AddRecipeToInvoice";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { message, Modal } from "antd";

import PrintAfterSubmit from "../../../applications/warehouse/sections/cashier/pages/KitchenRequests/PrintAfterSubmit";
const ShowDataModal = ({
  id,
  responseData,
  detailsHeaders,
  updateFn,
  changeStatusFn,
  handleModalVisible,
  closeAfterEdit,
  rejectTitle,
  acceptTitle,
}) => {
  const { user } = useAuth();
  const [editedData, setEditedData] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [table_noo, setTable_noo] = useState("");
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchorderData = async () => {
      const InvoiceData = await getOrderById(responseData.id);
      setTable_noo(InvoiceData.data.table_number);
    };

    const handleClickOutside = (event) => {
      // Don't close if the AddRecipeToInvoice modal is open
      if (showAddRecipeModal) {
        return;
      }

      const modalContent = document.querySelector(".modal-content");
      if (modalContent && !modalContent.contains(event.target)) {
        handleModalVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    fetchorderData();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleModalVisible, showAddRecipeModal]);

  useEffect(() => {
    const initialEditedData = {};
    detailsHeaders.forEach((header) => {
      initialEditedData[header.key] = responseData[header.key];
      initialEditedData["id"] = responseData["id"];
      initialEditedData["product_id_in_order"] =
        responseData["product_id_in_order"];
    });

    setEditedData(initialEditedData);
    console.log(editedData);
  }, [detailsHeaders]);

  const handleInputChange = (header, value, index, subKey) => {
    console.log(`header`, header);
    console.log(`value`, value);
    console.log(`index`, index);
    console.log(`subKey`, subKey);

    if (header === "recipes") {
      setEditedData((prevState) => {
        const updatedRecipes = [...prevState.recipes];
        if (subKey) {
          updatedRecipes[index] = {
            ...updatedRecipes[index],
            [subKey]: value,
          };
        } else {
          updatedRecipes[index] = value;
        }

        return { ...prevState, recipes: updatedRecipes };
      });
    } else {
      setEditedData((prevState) => ({
        ...prevState,
        [header]: value,
      }));
    }
  };

  const handleEditClick = async () => {
    console.log("entered");

    const modifiedRecipes = editedData.recipes.filter((editedRecipe, index) => {
      const originalRecipe = responseData.recipes[index];
      return Object.keys(editedRecipe).some(
        (key) => editedRecipe[key] !== originalRecipe[key]
      );
    });
    const dataToSend = {
      ...editedData,
      recipes: modifiedRecipes,
    };

    await updateFn(dataToSend, responseData.id, id);

    handleModalVisible(false);

    if (closeAfterEdit) {
      window.location.reload();
    }
  };

  const handleRejectClick = () => {
    console.log("ressssssssssssssss data", responseData);
    changeStatusFn(responseData.id, rejectTitle.value);

    if (
      !responseData.hasOwnProperty("deleted_by") ||
      !responseData.deleted_by
    ) {
      setShouldPrint(true);
    }
  };

  const handleAcceptClick = () => {
    changeStatusFn(responseData.id, acceptTitle.value);
    handleModalVisible(false);
  };

  const handleCloseClick = () => {
    handleModalVisible(false);
  };

  // New functions for recipe management
  const handleAddRecipe = async (recipeData) => {
    try {
      setIsLoading(true);
      await addRecipeToInvoice(responseData.id, recipeData);
      // Refresh the modal data or close it
      handleModalVisible(false);
      if (closeAfterEdit) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error adding recipe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRecipe = async (recipeId) => {
    Modal.confirm({
      title: "تأكيد الحذف",
      content: "هل أنت متأكد من حذف هذا المكون من الفاتورة؟",
      okText: "نعم",
      cancelText: "لا",
      centered: true,
      width: 500,
      zIndex: 10001, // Higher than AddRecipeToInvoice modal
      className: "recipe-remove-confirm-modal",
      okButtonProps: {
        style: {
          background: "#8d2517",
          color: "white",
          padding: "8px 16px",
          borderRadius: "6px",

          fontSize: " 16px",
          margin: "15px 10px 20px",
        },
      },
      cancelButtonProps: {
        style: {
          background: "#495057",
          color: "white",
          padding: "8px 16px",
          borderRadius: "6px",

          fontSize: " 16px",
          margin: "15px 0 20px",
        },
      },
      onOk: async () => {
        try {
          setIsLoading(true);
          await removeRecipeFromInvoice(responseData.id, recipeId);
          // Refresh the modal data or close it
          handleModalVisible(false);
          if (closeAfterEdit) {
            window.location.reload();
          }
        } catch (error) {
          console.error("Error removing recipe:", error);
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const renderInputField = (header, value, index, subKey) => {
    if (!editedData) return;
    const inputValue = subKey
      ? editedData[header][index][subKey]
      : editedData[header];

    return (
      <input
        className="form-input xd"
        type="text"
        value={inputValue}
        onChange={(e) => {
          handleInputChange(header, e.target.value, index, subKey);
        }}
      />
    );
  };

  const nonArrayHeaders = detailsHeaders.filter((header) => !header.isArray);
  const arrayHeaders = detailsHeaders.filter((header) => header.isArray);

  // Check if this is an invoice and if it's not approved
  const isInvoice =
    responseData.type &&
    ["in_coming", "out_going", "returned", "transfare"].includes(
      responseData.type
    );
  const isNotApproved =
    responseData.status && responseData.status !== "approved";
  const canManageRecipes =
    isInvoice &&
    isNotApproved &&
    user?.permissions.some((permission) => permission.name === "add-remove invoice_recipes");

  return (
    <div className="show-data-modal">
      <div className="modal-content">
        <button
          onClick={handleCloseClick}
          style={{
            background: "red",
            width: "65px",
            color: "white",
            borderRadius: "5px",
            display: "flex",
            justifyContent: "center", // This centers horizontally
            alignItems: "center", // This centers vertically
            textAlign: "center", // Ensures the text itself is centered
            height: "30px", // Optional: Set height for better vertical centering
            padding: "0", // Optional: Remove extra padding if needed
          }}
        >
          رجوع
        </button>
        <div className="data-table-container">
          <div className="data-table-diagram">
            <table className="data-table">
              <thead>
                <tr>
                  {nonArrayHeaders.map((header) => (
                    <th key={header.key}>{header.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {nonArrayHeaders.map((header, index) => (
                    <td key={index}>
                      {header.isInput
                        ? renderInputField(
                            header.key,
                            responseData[header.key],
                            null,
                            null
                          )
                        : header.key === "quantity"
                        ? renderInputField(
                            header.key,
                            responseData[header.key],
                            null,
                            null
                          )` ${responseData.unit?.name || ""}`
                        : responseData[header.key]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {arrayHeaders.map((header, index) => (
          <div key={header.key}>
            <div className="header-with-actions">
              <h4 className="data-table-title">{header.label}</h4>
              {canManageRecipes && header.key === "recipes" && (
                <button
                  className="pdf-button"
                  onClick={() => setShowAddRecipeModal(true)}
                  disabled={isLoading}
                >
                  <PlusOutlined /> إضافة مكون
                </button>
              )}
            </div>
            <div className="data-table-container">
              <div className="data-table-diagram">
                <table className="data-table">
                  <thead>
                    <tr>
                      {header.details.map((detail) => (
                        <th key={detail.key}>{detail.label}</th>
                      ))}
                      {canManageRecipes && header.key === "recipes" && (
                        <th>الإجراءات</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {responseData[header.key]?.map((item, itemIndex) => (
                      <tr key={itemIndex}>
                        {header.details.map((detail, detailIndex) => (
                          <td key={detail.key}>
                            {detail.isInput
                              ? renderInputField(
                                  header.key,
                                  item[detail.key],
                                  itemIndex,
                                  detail.key
                                )
                              : item[detail.key]}
                          </td>
                        ))}
                        {canManageRecipes && header.key === "recipes" && (
                          <td>
                            <button
                              className="remove-recipe-btn"
                              onClick={() =>
                                handleRemoveRecipe(item.id || item.recipe_id)
                              }
                              disabled={isLoading}
                              title="حذف المكون"
                            >
                              <>
                                <DeleteOutlined />
                                <span
                                  style={{
                                    marginRight: "10px",
                                    alignItems: "center",
                                    alignContent: "center",
                                    borderRadius: "5px",
                                  }}
                                >
                                  حذف{" "}
                                </span>
                              </>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
        <div className="button-container">
          {updateFn && (
            <button className="data-modal-btn edit" onClick={handleEditClick}>
              تعديل
            </button>
          )}
          {changeStatusFn && rejectTitle && responseData.status === "closed" ? (
            <p className="status done">تم الدفع</p>
          ) : (
            <>
              {changeStatusFn && rejectTitle && (
                <button
                  className="data-modal-btn delete"
                  onClick={handleRejectClick}
                >
                  {responseData.status === "closed"
                    ? "تم الدفع"
                    : rejectTitle.label}
                </button>
              )}
            </>
          )}

          {changeStatusFn && acceptTitle && (
            <button onClick={handleAcceptClick} className="data-modal-btn show">
              {acceptTitle.label}
            </button>
          )}
        </div>
        {shouldPrint && (
          <PrintAfterSubmit id={responseData.id} table_no={table_noo} />
        )}{" "}
        {/* Conditional rendering */}
      </div>

      {/* Add Recipe Modal */}
      {showAddRecipeModal && (
        <AddRecipeToInvoice
          onAddRecipe={handleAddRecipe}
          onClose={() => setShowAddRecipeModal(false)}
          invoiceType={responseData.type}
        />
      )}
    </div>
  );
};

export default ShowDataModal;
