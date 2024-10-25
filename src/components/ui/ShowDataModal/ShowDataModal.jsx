import React, { useState, useEffect } from "react";
import "./ShowDataModal.scss";
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
  const [shouldPrint, setShouldPrint] = useState(false); // Add state for PrintAfterSubmit

  // console.log(id);
  useEffect(() => {
    const handleClickOutside = (event) => {
      const modalContent = document.querySelector(".modal-content");
      if (modalContent && !modalContent.contains(event.target)) {
        handleModalVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

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
    // console.log(responseData);
    setEditedData(initialEditedData);
  }, [detailsHeaders]);

  const handleInputChange = (header, value, index, subKey) => {
    // console.log(editedData);
    if (subKey) {
      setEditedData((prevState) => ({
        ...prevState,
        [header]: {
          ...prevState[header],
          [index]: {
            ...prevState[header][index],
            [subKey]: value,
          },
        },
      }));
    } else {
      setEditedData((prevState) => ({
        ...prevState,
        [`${header}`]: value,
      }));
    }
  };

  const handleEditClick = async () => {
    // // console.log(editedData, responseData.id);
    await updateFn(editedData, responseData.id, id);
    handleModalVisible(false);
    if (closeAfterEdit) window.location.reload();
  };

  const handleRejectClick = () => {
    changeStatusFn(responseData.id, rejectTitle.value);
  
      setShouldPrint(true); // Set the state to true
    
    // // console.log("Status Print ", responseData.status);
    
    
    // handleModalVisible(false);
  };

  const handleAcceptClick = () => {
    // // console.log(id);
    changeStatusFn(responseData.id, acceptTitle.value);
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
  // // console.log(nonArrayHeaders, arrayHeaders);
  return (
    <div className="show-data-modal">
      <div className="modal-content">
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
                  {nonArrayHeaders.map((header, index) => {
                    return (
                      <td key={index}>
                        {header.isInput
                          ? renderInputField(
                              header.key,
                              responseData[header.key],
                              null,
                              null
                            )
                          : responseData[header.key]}
                      </td>
                    );
                  })}
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
          {changeStatusFn && rejectTitle && responseData.status === "closed" ? <p  className="status done">تم الدفع</p> : <>
          {changeStatusFn && rejectTitle && (
            <button
              className="data-modal-btn delete"
              onClick={handleRejectClick}
            >
              {responseData.status === "closed" ? "تم الدفع" : rejectTitle.label}
            </button>
          )}
          </>}
         
          {changeStatusFn && acceptTitle && (
            <button onClick={handleAcceptClick} className="data-modal-btn show">
              {acceptTitle.label}
            </button>
          )}
        </div>
        {shouldPrint && <PrintAfterSubmit data={responseData} />} {/* Conditional rendering */}
      </div>
      
    </div>
  );
};

export default ShowDataModal;
