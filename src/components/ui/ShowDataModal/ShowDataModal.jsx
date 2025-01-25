import React, { useState, useEffect } from "react";
import "./ShowDataModal.scss";
import { getOrderById, deleteOrder } from "../../../apis/orders";
import { useNavigate } from "react-router-dom"; // Import useNavigate

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
  const [editedData, setEditedData] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [table_noo, setTable_noo] = useState("");

  useEffect(() => {
    const fetchorderData = async () => {
      const InvoiceData = await getOrderById(responseData.id);
      setTable_noo(InvoiceData.data.table_number);
    };

    const handleClickOutside = (event) => {
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
  }, [handleModalVisible]);

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
            <h4 className="data-table-title">{header.label}</h4>
            <div className="data-table-container">
              <div className="data-table-diagram">
                <table className="data-table">
                  <thead>
                    <tr>
                      {header.details.map((detail) => (
                        <th key={detail.key}>{detail.label}</th>
                      ))}
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
    </div>
  );
};

export default ShowDataModal;
