import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Pagination, Select, message, Modal } from "antd";
import "./Table.scss";
import { API_ENDPOINT } from "../../../../config";
import DeleteModal from "../../ui/DeleteModal/DeleteModal";
import ShowDataModal from "../../ui/ShowDataModal/ShowDataModal";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { usePDF } from "react-to-pdf";
import { DownloadTableExcel } from "react-export-table-to-excel";
import soundFile from "./beem.mp3";
import axios from "axios";
import TotalAmount from "../../shared/totalAmount/TotalAmount";
import PrintCopy from "../../../applications/warehouse/sections/cashier/pages/KitchenRequests/PrintCopy";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");

const SoundPlayer = ({ play }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (play && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing sound:", error);
      });
    }
  }, [play]);

  return <audio ref={audioRef} src={soundFile} />;
};

const Table = ({
  headers,
  title,
  filters,
  fetchData,
  actions,
  ordersRecieve,
  id,
  deleteFn,
  adminlogin,
  detailsHeaders,
  header,
  updateFn,
  changeStatusFn,
  rejectTitle,
  acceptTitle,
  closeAfterEdit,
  isRequests,
  getTotalPrice,
  pdfHeader,
}) => {
  const tableRef = useRef();
  const { user } = useAuth();
  const timeoutRef = useRef(null); // Ref to store the timeout ID

  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState({});
  const [isDeleteModalVisible, setisDeleteModalVisible] = useState(false);
  const [isShowModalVisible, setisShowModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterValues, setFilterValues] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isBeeming, setIsBeeming] = useState(false);
  const navigate = useNavigate();
  const { location } = useLocation();
  const { toPDF, targetRef } = usePDF({ filename: "page.pdf" });
  const [playSound, setPlaySound] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [ids, setIds] = useState("");
  const [table_ids, setTable_ids] = useState("");
  const [isKitchien, setIsKitchien] = useState(false);
  const [dataLen, setDataLen] = useState(0);
  const [editedCell, setEditedCell] = useState({});
  const [cellValue, setCellValue] = useState("");
  const [editedItems, setEditedItems] = useState([]);

  const KITCHEN_DEPARTMENTS = [
    "3d1e1d26-91ff-40b8-9b2c-139aa79430e9",
    "01j45gtesjz0mm3qf0sz6bzvn9",
  ];

  useEffect(() => {
    if (
      user.department.type == "both" ||
      KITCHEN_DEPARTMENTS.includes(user.department.id)
    ) {
      setIsKitchien(true);
    }

    (async () => {
      try {
        const total_price = await getTotalPrice(
          { ...filterValues, page: currentPage },
          id,
          setIsLoading
        );
        setTotalPrice(total_price);
      } catch (e) {
        console.log(`err`, e);
      }
    })();

    fetchData({ ...filterValues, page: currentPage }, id, setIsLoading).then(
      (result) => {
        if (result && result.data) {
          setData(result);
        } else {
          console.error("Unexpected data format:", result);
          setData({ pagination: { total: 0 }, data: [] });
        }
      }
    );
  }, [filterValues, currentPage]);
  //174611
  useEffect(() => {
    let intervalId;
    if (isRequests) {
      intervalId = setInterval(() => {
        fetchData(
          { ...filterValues, page: currentPage },
          id,
          setIsLoading
        ).then((result) => {
          if (result?.pagination?.total > data?.pagination?.total) {
            setPlaySound(true);
            setTimeout(() => {
              setPlaySound(false);
            }, 6000);
          }
          setData(result);
        });
      }, 20000);
    }
    return () => clearInterval(intervalId); // Cleanup
  }, [isRequests, filterValues, currentPage, data]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key, value) => {
    setFilterValues((prevFilterValues) => ({
      ...prevFilterValues,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleItemClick = (itemId, route) => {
    if (route) {
      navigate(route.replace(":id", itemId));
    }
  };
  const handleFinish = async (id) => {
    setShouldPrint(true);
    setIds(id);
  };

  const handleAction = (actionType, item) => {
    switch (actionType) {
      case "delete":
        handleDelete(item, id);
        break;
      case "admin-login":
        handleAdminLogin(item, id);
        break;
      case "print":
        handlePrintData(item);
        break;
      case "show":
        handleShowData(item);
        break;
      case "edit":
        handleEdit(item);
        break;
      case "navigate":
        handleNavigate(item);
        break;
      case "edit-inv":
        handleEditInv(item);
        break;
      default:
        break;
    }
  };
  const handleEditInv = async (item) => {
    setSelectedItem(item);
    const editedItem = editedItems.find((edItem) => edItem.id === item.id);
    const formattedDate = editedItem?.invoice_date || item.invoice_date;

    const dataToSend = {
      code: editedItem?.code || item.code,
      invoice_date: formattedDate,
    };

    try {
      const response = await axios.put(
        `${API_ENDPOINT}/api/v1/store/invoice/update_data/${item.id}`,
        {
          data: dataToSend,
        },
        {
          headers: { Authorization: `Bearer ${Token}` },
        }
      );

      const modal = Modal.success({
        title: "Success",
        content: (
          <div style={{ fontSize: "24px", textAlign: "center" }}>
            Data updated successfully!
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleDelete = (item, id) => {
    setSelectedItem(item);
    setisDeleteModalVisible(true);
  };
  const handleAdminLogin = (item, id) => {
    setSelectedItem(item);
    adminlogin(item);
  };

  const handleShowData = (item) => {
    console.log("rhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh", item);
    setSelectedItem(item);
    setisShowModalVisible(true);
  };

  const handlePrintData = async (item) => {
    try {
      const res = await axios.get(
        `${API_ENDPOINT}/api/v1/orders/print-order/${item.id}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      if (res.data.status) {
        message.success("تم الطباعة بنجاح");
      }

      fetchData({ ...filterValues, page: currentPage }, id, setIsLoading).then(
        (result) => {
          if (result && result.data) {
            setData(result);
          } else {
            console.error("Unexpected data format:", result);
            setData({ pagination: { total: 0 }, data: [] });
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };
  const handleNavigate = (item) => {
    navigate(
      actions
        .find((action) => action.type === "navigate")
        .route.replace(":id", item.id)
    );
  };
  const handleEdit = (item) => {
    setSelectedItem(item);
    navigate(
      actions
        .find((action) => action.type === "edit")
        .route.replace(":id", item.id)
    );
  };
  const handleAdd = () => {
    const addAction = actions.find((action) => action.type === "add");
    if (addAction) {
      navigate(addAction.route);
    }
  };

  const handleSavePDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 190;
    const pageHeight = 297;

    const rows = Array.from(tableRef.current.querySelectorAll("tr"));
    let position = 10;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowCanvas = await html2canvas(row, { scale: 2 });
      const rowImgData = rowCanvas.toDataURL("image/png");
      const rowHeight = (rowCanvas.height * pageWidth) / rowCanvas.width;

      if (position + rowHeight > pageHeight - 10) {
        pdf.addPage();
        position = 10;
      }

      pdf.addImage(rowImgData, "PNG", 10, position, pageWidth, rowHeight);
      position += rowHeight;
    }

    pdf.save("تقرير المبيعات المفصل.pdf");
  };

  // const handleSavePDF = async () => {
  //   const pdf = new jsPDF("p", "mm", "a4");
  //   const pageWidth = 190; // Width for content
  //   const pageHeight = 297; // A4 height
  //   const margin = 10; // Margin
  //   let position = margin;
  // console.log('hello this is me ', po)
  //   // Add Arabic table header comment at the beginning
  //   pdf.setFont("helvetica", "bold");
  //   pdf.setFontSize(12);
  //   pdf.text("تقرير المبيعات المفصل", pageWidth / 2, position, { align: "center" });
  //   position += 10;
  
  //   const table = tableRef.current; // Reference to your table
  //   const canvas = await html2canvas(table, { scale: 2 });
  //   const tableImage = canvas.toDataURL("image/png");
  
  //   const imageHeight = (canvas.height * pageWidth) / canvas.width;
  
  //   // Split table into pages if it exceeds the page height
  //   let remainingHeight = imageHeight;
  
  //   while (remainingHeight > 0) {
  //     const currentHeight = Math.min(remainingHeight, pageHeight - position - margin);
  
  //     pdf.addImage(
  //       tableImage,
  //       "PNG",
  //       margin,
  //       position,
  //       pageWidth,
  //       currentHeight
  //     );
  
  //     remainingHeight -= currentHeight;
  //     position = margin;
  
  //     if (remainingHeight > 0) {
  //       pdf.addPage();
  //     }
  //   }
  
  //   pdf.save("تقرير المبيعات المفصل.pdf");
  // };

  
  const generateTableRowHTML = (index, row) => {
    return `
      <tr style="border-bottom:1px solid var(--brown-color); padding:5px;">
        <td style="padding: 5px; text-align: center; font-size: 24px; font-wight:400;">${index}</td> 
        <td style="padding: 5px; text-align: center; font-size: 24px; font-wight:400;">${row.name}</td>
        <td style="padding: 5px; text-align: center; font-size: 24px; font-wight:400;">${row.total_quantity}</td>
      </tr>
    `;
  };

  const renderStatus = (status) => {
    switch (status) {
      case "pending":
        return <p className="status pending">تحت المراجعة</p>;
      case "approved":
        return <p className="status approved">تم المراجعة</p>;
      case "rejected":
        return <p className="status rejected">مرفوض</p>;
      case "done":
        return <p className="status done">تم الصرف</p>;
      case "processing":
        return <p className="status pending">تحت التجهيز</p>;
      case "completed":
        return <p className="status approved">تم التجهيز</p>;
      case "closed":
        return <p className="status done">تم الدفع</p>;
      case "returned":
        return <p className="status rejected"> تم الحذف</p>;
      default:
        break;
    }
  };
  const renderType = (type) => {
    // console.log("test");
    switch (type) {
      case "contracted":
        return <p>متعاقد</p>;
      case "local":
        return <p>سوق محلى</p>;
      case "invoices":
        return <p> الفواتير</p>;
      case "expenses":
        return <p> نثريات</p>;
      case "incentives":
        return <p> الحوافز</p>;
      case "salaries":
        return <p> مرتبات</p>;
      case "out_going":
        return <p> اذن صرف</p>;
      case "in_coming":
        return <p> فاتورة مورد </p>;
      case "returnd":
        return <p> فاتورة مرتجع </p>;
    }
  };
  const renderClient = (type) => {
    switch (type) {
      case 0:
        return <p> جديد</p>;
      case 1:
        return <p> قديم</p>;
    }
  };
  const renderWorker = (type) => {
    switch (type) {
      case 0:
        return <p> عامل بالدار</p>;
      case 1:
        return <p> غير عامل بالدار</p>;
    }
  };
  const handleInputChange = (headerKey, value, itemId) => {
    setEditedItems((prevState) => {
      const updatedItems = [...prevState];
      const itemIndex = updatedItems.findIndex((item) => item.id === itemId);
      if (itemIndex > -1) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          [headerKey]: value,
        };
      } else {
        updatedItems.push({ id: itemId, [headerKey]: value });
      }
      return updatedItems;
    });
  };
  const renderInputField = (headerKey, value, id, code, date) => {
    const editedValue = editedItems.find((item) => item.id === id)?.[headerKey];

    if (headerKey === "invoice_date") {
      return (
        <input
          className="form-input xd"
          type="date"
          value={editedValue || value || ""}
          onChange={(e) => handleInputChange(headerKey, e.target.value, id)}
        />
      );
    }

    return (
      <input
        className="form-input xd"
        type="text"
        value={editedValue || value || ""}
        onChange={(e) => handleInputChange(headerKey, e.target.value, id)}
      />
    );
  };
  const renderFilterInput = (filter) => {
    const { key, type, placeholder, options } = filter;
    if (type === "number") {
      return (
        <input
          className="filter-input"
          type="number"
          placeholder={placeholder}
          value={filterValues[key] || ""}
          onChange={(e) => handleFilterChange(key, e.target.value)}
        />
      );
    } else if (type === "date") {
      return (
        <input
          className="filter-input"
          type="date"
          value={filterValues[key] || ""}
          onChange={(e) => handleFilterChange(key, e.target.value)}
        />
      );
    } else if (type === "selection") {
      return (
        <Select
          className="selection-input"
          showSearch
          placeholder={placeholder}
          optionFilterProp="children"
          onChange={(value) => handleFilterChange(key, value)}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={options}
        />
      );
    } else {
      return (
        <input
          className="filter-input"
          type="text"
          placeholder={placeholder}
          value={filterValues[key] || ""}
          onChange={(e) => handleFilterChange(key, e.target.value)}
        />
      );
    }
  };

  return (
    <div>
      <section className="content-area-table">
        <div className="data-table-info">
          <h4 className="data-table-title">
            {title} -{" "}
            <span className="text-warning fw-bold fs-3">
              ({data?.data?.length})
            </span>
          </h4>
          {filters && (
            <div className="data-table-filters">
              {filters?.map((filter) => {
                if (!filter) return;
                return (
                  <span key={filter.id}>
                    <label htmlFor="">{filter.id}</label>
                    {renderFilterInput(filter)}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: `flex`,
              flexWrap: `nowrap`,
              gap: 10,
              alignItems: "center",
            }}
          >
            {actions && actions.some((action) => action.type === "add") && (
              <button
                className="add-btn white-space-nowrap"
                onClick={handleAdd}
              >
                {"+ "} {actions.find((action) => action.type === "add").label}
              </button>
            )}

            <DownloadTableExcel
              filename="users table"
              sheet="users"
              currentTableRef={tableRef.current}
            >
              <button className="pdf-button white-space-nowrap">
                حفظ اكسيل{" "}
              </button>
            </DownloadTableExcel>

            <button
              onClick={handleSavePDF}
              className="pdf-button white-space-nowrap"
            >
              {" "}
              حفظ PDF
            </button>
          </div>
          <div style={{ width: "100%" }} className="center">
            {!totalPrice ? (
              ""
            ) : (
              <TotalAmount className={`mt-0`} total={totalPrice} />
            )}
          </div>
        </div>
        <div></div>
        <div className="data-table-diagram" ref={targetRef}>
          <table className="data-table" ref={tableRef}>
            <thead>
              <tr>
                <th>الرقم</th>
                {headers.map((header) => (
                  <th key={header.key}>{header.value}</th>
                ))}
                {ordersRecieve && <th>اشعارإستلام الاوردر</th>}
                {actions && <th>الإجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {data?.data?.length &&
                !isLoading &&
                data?.data?.map((item, index) => (
                  <tr
                    key={item.id}
                    className={` ${item?.is_printed ? "printed" : ""}`}
                  >
                    <td>{index + 1 + (currentPage - 1) * 10} </td>
                    {headers.map((header) => (
                      <td
                        key={header.key}
                        onClick={() =>
                          header.clickable &&
                          handleItemClick(item.id, header.route)
                        }
                        className={header.clickable ? "clickable-cell" : ""}
                      >
                        {header.isInput &&
                        (header.key === "code" ||
                          header.key === "invoice_date") ? (
                          renderInputField(
                            header.key,
                            item[header.key],
                            item.id
                          )
                        ) : header.type === "image" ? (
                          <img
                            src={`${item.image}`}
                            alt={`alt-${item.name}`}
                            style={{ width: "50px", height: "50px" }}
                          />
                        ) : header.nestedKey ? (
                          item[header.key][header.nestedKey] || "لا يوجد"
                        ) : header.key === "status" ? (
                          renderStatus(item[header.key])
                        ) : header.key === "type" ? (
                          renderType(item[header.key])
                        ) : header.key === "new_client" ? (
                          renderClient(item[header.key])
                        ) : header.key === "is_worker" ? (
                          renderWorker(item[header.key])
                        ) : (
                          item[header.key] || "لا يوجد"
                        )}
                      </td>
                    ))}
                    {ordersRecieve && (
                      <td>
                        <div className="buttons">
                          {ordersRecieve.map((order, index) => {
                            if (order.type === "add" || order.type === "")
                              return;
                            return (
                              <button
                                className={`button ${
                                  !item.is_printed ? "notPrinted" : "printedBtn"
                                }`}
                                key={index}
                                onClick={() => {
                                  {
                                    item.is_printed
                                      ? handleFinish(item.id)
                                      : handleFinish(item.id);
                                    handlePrintData(item);
                                  }
                                }}
                              >
                                <span
                                  className={`${
                                    !item.is_printed
                                      ? "notPrintedText"
                                      : "printedText"
                                  }`}
                                >
                                  {item.is_printed ? "تم الطباعة" : order.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                    {actions && (
                      <td>
                        <div className="buttons">
                          {actions.map((action, index) => {
                            if (action.type === "add" || action.type === "")
                              return;
                            return (
                              <button
                                className={`button ${action.type}`}
                                key={index}
                                style={{ background: "red", color: "white" }}
                                onClick={() => {
                                  handleAction(action.type, item);
                                }}
                              >
                                {action.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              {data?.data?.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      headers.length +
                      (actions ? 1 : 0) +
                      (ordersRecieve ? 1 : 0) +
                      1
                    }
                  >
                    لا يوجد نتائج
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td
                    colSpan={
                      headers.length +
                      (actions ? 1 : 0) +
                      (ordersRecieve ? 1 : 0) +
                      1
                    }
                    style={{ textAlign: "center" }}
                  >
                    <Spin
                      indicator={
                        <LoadingOutlined style={{ fontSize: 56 }} spin />
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data?.data?.length > 0 && !isLoading && (
          <Pagination
            className="pagination"
            current={currentPage}
            onChange={handlePageChange}
            total={data?.pagination?.total || 1}
            pageSize={10}
            showSizeChanger={false}
          />
        )}
        {isDeleteModalVisible && (
          <DeleteModal
            item={selectedItem}
            id={id}
            onDelete={deleteFn}
            handleModalVisible={setisDeleteModalVisible}
          />
        )}

        {isShowModalVisible && (
          <ShowDataModal
            id={id}
            acceptTitle={acceptTitle}
            rejectTitle={rejectTitle}
            responseData={selectedItem}
            header={header}
            handleModalVisible={setisShowModalVisible}
            detailsHeaders={detailsHeaders}
            updateFn={updateFn}
            changeStatusFn={changeStatusFn}
            closeAfterEdit={closeAfterEdit}
          />
        )}
      </section>
      {isKitchien && <SoundPlayer play={playSound} />}
      {shouldPrint && <PrintCopy id={ids} />}
    </div>
  );
};

export default Table;
