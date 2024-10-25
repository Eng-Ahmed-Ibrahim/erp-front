import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Pagination, Select } from "antd";
import "./Table.scss";
import { API_ENDPOINT } from "../../../../config";
import DeleteModal from "../../ui/DeleteModal/DeleteModal";
import ShowDataModal from "../../ui/ShowDataModal/ShowDataModal";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { usePDF } from 'react-to-pdf';
import { DownloadTableExcel } from 'react-export-table-to-excel';
const Table = ({
  headers,
  title,
  filters,
  fetchData,
  actions,
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
}) => {
  const tableRef = useRef(null);
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [item, setItem] = useState({});
  const [isDeleteModalVisible, setisDeleteModalVisible] = useState(false);
  const [isShowModalVisible, setisShowModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterValues, setFilterValues] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { location } = useLocation();
  const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });

  useEffect(() => {
    // console.log(filterValues);
    fetchData({ ...filterValues, page: currentPage }, id, setIsLoading).then(
      (result) => {
        setData(result);
        // // console.log('mnfxkjfdjfddfdjfd;lo',result);
      }
    );
  }, [
    fetchData,
    filterValues,
    currentPage,
    isDeleteModalVisible,
    isShowModalVisible,
  ]);
  useEffect(() => {
    if (isRequests) {
      setInterval(() => {
        fetchData(
          { ...filterValues, page: currentPage },
          id,
          setIsLoading
        ).then((result) => {
          setData(result);
          // console.log(result);
        });
      }, 20000);
    }
  }, []);
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

  const handleAction = (actionType, item) => {
    switch (actionType) {
      case "delete":
        handleDelete(item);
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
    // console.log(item);
    setItem(item);
    setisDeleteModalVisible(true);
  };

  const handleShowData = (item) => {
    // console.log(item);
    setItem(item);
    setisShowModalVisible(true);
  };
  const handleNavigate = (item) => {
    navigate(
      actions
        .find((action) => action.type === "navigate")
        .route.replace(":id", item.id)
    );
  };
  const handleEdit = (item) => {
    // console.log(item);
    setItem(item);
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
        {actions && actions.some((action) => action.type === "add") && (
          <button className="add-btn" onClick={handleAdd}>
            {"+ "} {actions.find((action) => action.type === "add").label}
          </button>
        )}
      </div>

      <DownloadTableExcel
        filename="users table"
        sheet="users"
        currentTableRef={tableRef.current}
      >
        <button className="pdf-button">حفظ اكسيل </button>

      </DownloadTableExcel>
      <button onClick={() => toPDF()} className="pdf-button"> حفظ PDF</button>
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
              {actions && <th>الإجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {data?.data &&
              !isLoading &&
              data?.data.map((item, index) => (
                <tr key={item.id}>
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
            {data?.data?.length === 0 && !isLoading && (
              <tr>
                <td colSpan={headers.length + (actions ? 1 : 0) + 1}>
                  لا يوجد نتائج
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td
                  colSpan={headers.length + (actions ? 1 : 0) + 1}
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
          item={item}
          onDelete={deleteFn}
          handleModalVisible={setisDeleteModalVisible}
        />
      )}
      {isShowModalVisible && (
        <ShowDataModal
          id={id}
          acceptTitle={acceptTitle}
          rejectTitle={rejectTitle}
          responseData={item}
          header={header}
          handleModalVisible={setisShowModalVisible}
          detailsHeaders={detailsHeaders}
          updateFn={updateFn}
          changeStatusFn={changeStatusFn}
          closeAfterEdit={closeAfterEdit}
        />
      )}
    </section>
  );
};

export default Table;