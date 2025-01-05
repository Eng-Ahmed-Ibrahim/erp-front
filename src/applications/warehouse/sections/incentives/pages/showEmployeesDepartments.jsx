import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import { DownloadTableExcel } from "react-export-table-to-excel";

import axios from "axios";
import { API_ENDPOINT } from "../../../../../../config";
import { Pagination, Select, Modal, message } from "antd";

function DataModal({ show, onHide, itemId, department }) {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [name, setName] = useState(department?.name || " ");
  const [pointsPercentage, setPointsPercentage] = useState(
    department?.points_percentage || 0
  );

  useEffect(() => {
    setName(department?.name || 0);
    setPointsPercentage(department?.points_percentage || 0);
  }, [department]);

  const validatePercentageNumber = async (percentage) => {
    if (percentage < 0 || percentage > 100) {
      message.error("يرجي إدخال نسبة البنط بشكل صحيح");
      return false;
    }
    return true;
  };

  const handleEditDepartment = async () => {
    if (!validatePercentageNumber(pointsPercentage)) {
      return;
    }
    const res = await axios.put(
      `${API_ENDPOINT}/api/v1/employee-departments/${itemId}`,

      { name: name, points_percentage: pointsPercentage },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    if (res.data) {
      message.success("تم تعديل القسم بنجاح");
      onHide();
    }
  };

  const handleAddDepartment = async () => {
    if (!validatePercentageNumber(pointsPercentage)) {
        return;
      }
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/employee-departments/`,

      {
        name: name,
        points_percentage: pointsPercentage,
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    if (res.data) {
      message.success("تم اضافة القسم بنجاح");
      onHide;
    }
  };

  return (
    <Modal
      title={itemId ? "   تعديل القسم   " : "اضافة قسم جديد"}
      centered
      open={show}
      onOk={itemId ? handleEditDepartment : handleAddDepartment}
      onCancel={onHide}
      width={1000}
    >
      <div className="mb-3">
        <label for="exampleInputPassword" className="form-label">
          {" "}
          الاسم{" "}
        </label>
        <input
          type="text"
          className="form-control"
          id="exampleInputEmail1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label for="exampleInputPassword" className="form-label">
          {" "}
          نسبة البنط{" "}
        </label>
        <input
          type="number"
          className="form-control"
          id="exampleInputEmail1"
          value={pointsPercentage}
          onChange={(e) => setPointsPercentage(e.target.value)}
          required
        />
      </div>
    </Modal>
  );
}

const showEmployeesDepartments = () => {
  // const item = useLocation()?.state?.item;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [data, setData] = useState([]);
  const [item, setItem] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentFilter, setdepartmentFilter] = useState("");
  const tableRef = useRef(null);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const [itemId, setItemId] = useState(null);

  const handleDepartmentChange = (e) => {
    setdepartmentFilter(e.target.value);
  };

  const handelDelete = async (id) => {
    const res = await axios.delete(
      `${API_ENDPOINT}/api/v1/employee-departments/${id}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    if (res.data) {
      message.success("تم الحذف بنجاح");
    }
  };
  const handelEdit = async (item) => {
    setItemId(item.id); // Store the id of the employee to be edited
    setItem(item);
    setIsModalVisible(true);
  };
  useEffect(() => {
    const filters = {
      name: departmentFilter,
    };

    axios
      .get(`${API_ENDPOINT}/api/v1/employee-departments/`, {
        params: filters,
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        setData(response.data.data.departments);
      })
      .catch((error) => {});
  }, [departmentFilter, Token]);
  return (
    <div>
      <div className="my-1 ">
        <h1 className="heading text-center p-3"> أقسام الموظفين </h1>
      </div>
      {/* Department Filter */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>
          <label
            className="form-label"
            style={{
              fontWeight: "bold",
              marginBottom: "8px",
              display: "block",
            }}
          >
            {" "}
            القسم
          </label>
          <input
            className="form-input"
            value={departmentFilter}
            onChange={handleDepartmentChange}
            placeholder="ابحث بالقسم"
            style={{ width: "250px" }}
          />
        </div>
      </div>

      <div>
        <button
          type="button"
          className="pdf-button white-space-nowrap"
          style={{
            backgroundColor: "#AF8260",
            margin: " 0px 20px",
          }}
          onClick={() => setIsModalVisible(true)}
        >
          اضافه قسم جديد
        </button>
        <DownloadTableExcel
          filename="وظائف العاملين بالدار "
          sheet="users"
          currentTableRef={tableRef.current}
        >
          <button className="pdf-button white-space-nowrap">حفظ اكسيل </button>
        </DownloadTableExcel>
      </div>

      <table
        className="table table table-hover mt-2"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: "var(--text-color-inverted)",
        }}
        ref={tableRef}
      >
        <thead>
          <tr className="fw-bold fs-5 my-3">
            <th scope="col" style={{ background: "#edede9" }}>
              الاسم
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              نسبة البنط
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              ألاجرائات
            </th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index} className="content-area-table">
              <td
                style={{
                  padding: " 14px 12px",
                  border: "1px solid #E4C59E",
                  color: "#803D3B",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {item.name}
              </td>
              <td
                style={{
                  padding: " 14px 12px",
                  border: "1px solid #E4C59E",
                  color: "#803D3B",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {item.points_percentage}
              </td>

              <td
                style={{
                  padding: " 14px 12px",
                  border: "1px solid #E4C59E",
                  color: "#803D3B",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "row", gap: "7px" }}
                >
                  <button
                    type="button"
                    className="btn text-light fs-bold px-3"
                    style={{ backgroundColor: "#AF8260" }}
                    onClick={() => handelEdit(item)}
                  >
                    تعديل{" "}
                  </button>
                  <button
                    type="button"
                    className="btn text-light fs-bold px-3"
                    style={{ backgroundColor: "red" }}
                    onClick={() => handelDelete(item.id)}
                  >
                    خذف{" "}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <DataModal
        show={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        itemId={itemId}
        department={item}
      />
      {data?.length > 0 && (
        <Pagination
          className="pagination"
          current={currentPage}
          onChange={handlePageChange}
          total={data?.pagination?.total || 1}
          showSizeChanger={false}
        />
      )}
    </div>
  );
};

export default showEmployeesDepartments;
