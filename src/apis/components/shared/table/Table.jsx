import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Pagination, Select, message } from "antd";
import "./Table.scss";
import { API_ENDPOINT } from "../../../../config";
import DeleteModal from "../../ui/DeleteModal/DeleteModal";
import ShowDataModal from "../../ui/ShowDataModal/ShowDataModal";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { usePDF } from 'react-to-pdf';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import soundFile from './beem.mp3'
import axios from "axios";
import { composeInitialProps } from "react-i18next";
import TotalAmount from '../../shared/totalAmount/TotalAmount'
import PrintCopy from "../../../applications/warehouse/sections/cashier/pages/KitchenRequests/PrintCopy";

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
  detailsHeaders,
  header,
  updateFn,
  changeStatusFn,
  rejectTitle,
  acceptTitle,
  closeAfterEdit,
  isRequests,
  getTotalPrice
}) => {
  const tableRef = useRef(null);
  const { user } = useAuth();
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
  const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });
  const [playSound, setPlaySound] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0)
  const [shouldPrint, setShouldPrint] = useState(false);
  const [ids, setIds] = useState("");

  // useEffect(() => {
  //   // console.log(filterValues);
  //   fetchData({ ...filterValues, page: currentPage }, id, setIsLoading).then(
  //     (result) => {
  //       setData(result);
  //       // // console.log('mnfxkjfdjfddfdjfd;lo',result);
  //     }
  //   );
  // }, [
  //   // fetchData,
  //   filterValues,
  //   currentPage,
  //   isDeleteModalVisible,
  //   isShowModalVisible,
  // ]);

  useEffect(() => {
    (async () => {
      try {

        const total_price = await getTotalPrice({ ...filterValues, page: currentPage }, id, setIsLoading);
        setTotalPrice(total_price)
      } catch (e) {
        console.log(`err`, e)
      }
    })();
    fetchData({ ...filterValues, page: currentPage }, id, setIsLoading).then(
      (result) => {
        if (result && result.data) {
          setData(result);
        } else {
          console.error("Unexpected data format:", result);
          setData({ pagination: { total: 0 }, data: [] }); // Fallback
        }
      }
    );
  }, [filterValues, currentPage]);

  // useEffect(() => {
  //     console.log("Data is in 101: ", data)
  //   }
  // ,[data])

  // useEffect(() => {
  //   if (isRequests) {
  //     setInterval(() => {
  //       fetchData(
  //         { ...filterValues, page: currentPage },
  //         id,
  //         setIsLoading
  //       ).then((result) => {
  //         // data length before n
  //         // results length x
  //         console.log("data len: ", data);

  //         console.log("res len: ", result?.pagination?.total );
  //         console.log("data len: ", data?.pagination?.total);

  //         if (data){
  //           if (result?.pagination?.total > data?.pagination?.total) {
  //             console.log("Addedd");
  //             alert("renderedddd");
  //           }
  //         }
  //         setData(result)
  //       });
  //     }, 20000);
  //   }
  // }, []);
  useEffect(() => {
    let intervalId;
    if (isRequests) {
      intervalId = setInterval(() => {
        fetchData({ ...filterValues, page: currentPage }, id, setIsLoading).then(
          (result) => {
            if (result?.pagination?.total > data?.pagination?.total) {
              setPlaySound(true);
              setTimeout(() => {
                setPlaySound(false);
              }, 5000);
            }
            setData(result);
          }
        );
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
    setShouldPrint(true)
    setIds(id)

  };

  const handleAction = (actionType, item) => {
    switch (actionType) {
      case "delete":
        handleDelete(item);
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
      default:
        break;
    }
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setisDeleteModalVisible(true);
  };

  const handleShowData = (item) => {
    setSelectedItem(item);
    setisShowModalVisible(true);
  };

  const handlePrintData = async (item) => {

    try {
      const res = await axios.get(`${API_ENDPOINT}/api/v1/orders/print-order/${item.id}`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      });
      if (res.data.status) {
        message.success('تم الطباعة بنجاح')
      }

      fetchData({ ...filterValues, page: currentPage }, id, setIsLoading).then(
        (result) => {
          if (result && result.data) {
            setData(result);
          } else {
            console.error("Unexpected data format:", result);
            setData({ pagination: { total: 0 }, data: [] }); // Fallback
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  }


  const handleNavigate = (item) => {
    navigate(
      actions
        .find((action) => action.type === "navigate")
        .route.replace(":id", item.id)
    );
  };
  const handleEdit = (item) => {
    console.log(item);
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
      case "returned":
        return <p> فاتورة مورد </p>;
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
          <h4 className="data-table-title">{title} - <span className="text-warning fw-bold fs-3">({data?.pagination?.total})</span></h4>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: `flex`, flexWrap: `nowrap`, gap: 10, alignItems: "center" }}>
            {actions && actions.some((action) => action.type === "add") && (
              <button className="add-btn white-space-nowrap" onClick={handleAdd}>
                {"+ "} {actions.find((action) => action.type === "add").label}
              </button>
            )}
            <DownloadTableExcel
              filename="users table"
              sheet="users"
              currentTableRef={tableRef.current}
            >
              <button className="pdf-button white-space-nowrap">حفظ اكسيل </button>

            </DownloadTableExcel>
            <button onClick={() => toPDF()} className="pdf-button white-space-nowrap"> حفظ PDF</button>
          </div>
          <div style={{ width: "100%" }} className="center">

            {!totalPrice ? "" : <TotalAmount className={`mt-0`} total={totalPrice} />}

          </div>
        </div>
        <div></div>
        <div className="data-table-diagram" ref={targetRef}>
          <table className="data-table"
            // ref={targetRef}
            ref={tableRef}
          >
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
              {
                data?.data?.length &&
                !isLoading &&
                data?.data?.map((item, index) => (
                  <tr key={item.id}
                    // style={{backgroundColor: `${item.id === selectedItem.id ? "#53a86e": ""}`}}
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
                        {header.type === "image" ? (
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
                                className={`button ${!item.is_printed ? "notPrinted" : "printedBtn"}`}
                                key={index}
                                onClick={() => {

                                  {
                                    item.is_printed ?
                                      handleFinish(item.id) :
                                      handleFinish(item.id)
                                    handlePrintData(item)
                                  }
                                }}
                              >
                                <span
                                  className={`${!item.is_printed ? "notPrintedText" : "printedText"}`}
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
                  <td colSpan={headers.length + (actions ? 1 : 0) + (ordersRecieve ? 1 : 0) + 1}>
                    لا يوجد نتائج
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td
                    colSpan={headers.length + (actions ? 1 : 0) + (ordersRecieve ? 1 : 0) + 1}
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
            showSizeChanger={false}
          />
        )}
        {isDeleteModalVisible && (
          <DeleteModal
            item={selectedItem}
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

      <SoundPlayer play={playSound} />
      {shouldPrint && <PrintCopy id={ids} />} {/* Conditional rendering */}

    </div>
  );
};

export default Table;