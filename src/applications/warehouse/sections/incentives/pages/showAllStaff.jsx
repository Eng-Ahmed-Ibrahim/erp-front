import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../config";
import { Pagination, Select, Modal, message } from "antd";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { useAuth } from "../../../../../context/AuthContext";

function DataModal({ show, onHide, itemId, departments, item, employeeTypes }) {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [name, setName] = useState("");
  const [nationalID, setNationalID] = useState("");
  const [job, setJob] = useState("");
  const [department, setDepartment] = useState("");
  const [jobs, setJobs] = useState([]);
  const [data, setData] = useState([]);
  const [employeeType, setemployeeType] = useState([]);

  useEffect(() => {
    setName(item?.name || 0);
    setJob(item?.job?.id || "");
    setNationalID(item?.national_id || 0);
    setDepartment(item?.department?.id || "");
    setemployeeType(item?.employee_type_id);
  }, [item]);

  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/employees`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        setData(response.data.data);
        const employee = data.map((user) => user.id === itemId);
      })
      .catch((error) => {});
  }, []);

  const handleAddEmployee = async () => {
    // console.log('ggggggggggggggggggggg')

    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/employees`,

      {
        national_id: nationalID,
        name: name,
        job_id: job,
        department_id: department,
        points: null,
        employee_type_id: employeeType,
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    if (res.data) {
      message.success("تم اضافه الموظف بنجاح");
      onHide;
    }
  };

  const handleEditEmployee = async () => {
    const res = await axios.put(
      `${API_ENDPOINT}/api/v1/employees/${itemId}`,

      {
        national_id: nationalID,
        name: name,
        job_id: job,
        department_id: department,
        points: null,
        employee_type_id: employeeType,
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    if (res.data) {
      message.success("تم تعديل الموظف بنجاح");
      onHide;
    }
  };

  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/jobs`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        setJobs(response.data.data.jobs);
      })
      .catch((error) => {});
  }, []);
  return (
    <Modal
      title={itemId ? "   تعديل موظف   " : "اضافة موظف جديد"}
      centered
      open={show}
      onOk={itemId ? handleEditEmployee : handleAddEmployee}
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
          الرقم القومي{" "}
        </label>
        <input
          type="text"
          className="form-control"
          id="exampleInputEmail1"
          value={nationalID}
          onChange={(e) => setNationalID(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label for="exampleInputPassword" className="form-label">
          {" "}
          اختر القسم التابع له
        </label>
        <select
          className="form-select"
          aria-label="Default select example"
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
          }}
        >
          <option selected>اختر مكان</option>
          {departments?.data?.map((item, index) => (
            <option key={index} value={item?.id}>
              {item?.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label for="exampleInputPassword" className="form-label">
          {" "}
          اختر الوظيفه التابع له
        </label>
        <select
          className="form-select"
          aria-label="Default select example"
          value={job}
          onChange={(e) => {
            setJob(e.target.value);
          }}
        >
          <option selected>اختر مكان</option>
          {jobs?.map((item, index) => (
            <option key={index} value={item?.id}>
              {item?.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label for="exampleInputPassword" className="form-label">
          {" "}
          اختر فئة الموظف
        </label>
        <select
          className="form-select"
          value={employeeType}
          onChange={(e) => {
            setemployeeType(e.target.value);
          }}
          placeholder="اختر القسم"
          style={{ height: "45px" }}
          dropdownAlign={{ overflow: "auto", align: "bottomCenter" }} // Ensures dropdown opens downwards
          // showSearch={true}
        >


          {employeeTypes && Array.isArray(employeeTypes) && employeeTypes.length > 0 ? ( 
            employeeTypes?.map((type) => (
              <option key={type.id} value={type.id}>
                {type?.name}
              </option>
            ))
          ) : (
            <option disabled>
                  لا يوجد فئات 
                </option>
          )}
        </select>
      </div>
    </Modal>
  );
}
const ShowAllStaff = () => {
  // const item = useLocation()?.state?.item;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const [nationalID, setNationalID] = useState("");
  const [job, setJob] = useState("");
  const [departments, setDepartments] = useState([]);
  const [point, setPoint] = useState("");
  const [itemId, setItemId] = useState(null);
  const [nameFilter, setNameFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [totalEmployees, setTotalEmployees] = useState([]);
  const [item, setItem] = useState("");
  const [employeeType, setEmployeeType] = useState([]);
  const [employeeTypes, setEmployeesTypes] = useState([]);
  const [nationalId, setNationalId] = useState("");

  const tableRef = useRef(null);
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handelEdit = async (item) => {
    setItemId(item.id);
    setItem(item);
    setIsModalVisible(true);
  };
  const handleDepartmentChange = (value) => {
    setDepartmentFilter(value);
  };

  const handleNameChange = (e) => {
    setNameFilter(e.target.value);
  };

  const handleJobChange = (e) => {
    setJobFilter(e.target.value);
  };

  const handleNationalIdChange = (e) => {
    setNationalId(e.target.value);
  };
  const handleEmplyeeTypChange = (type) => {
    setEmployeeType(type);
  };
  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/departments`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        setDepartments(response);
      })
      .catch((error) => {});
  }, []);
  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/types`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        console.log("reeeeeeeee", response);
        setEmployeesTypes(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, []);
  const handelDelete = async (id) => {
    const res = await axios.delete(`${API_ENDPOINT}/api/v1/employees/${id}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    if (res.data) {
      message.success("تم الحذف بنجاح");
    }
  };

  useEffect(() => {
    const filters = {
      department: departmentFilter,
      name: nameFilter,
      job: jobFilter,
      national_id: nationalId,
      employee_type: employeeType,
    };

    axios
      .get(`${API_ENDPOINT}/api/v1/employees`, {
        params: filters,
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        console.log(response.data.data.employees);
        setData(response.data.data.employees);
        setTotalEmployees(response.data.data.count);
        setName();
      })
      .catch((error) => {});
  }, [
    departmentFilter,
    nameFilter,
    jobFilter,
    Token,
    nationalId,
    employeeType,
  ]);
  return (
    <div>
      <div className="my-1 ">
        <h1 className="heading text-center p-3">
          {" "}
          العاملين بالدار ({totalEmployees}){" "}
        </h1>
      </div>
      <div
        className="filters-container"
        style={{
          marginBottom: "0px",
          padding: "10px",
          backgroundColor: "#f7f7f7",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {/* Department Filter */}
          <div>
            <label
              className="form-label"
              style={{
                fontWeight: "bold",
                marginBottom: "8px",
                display: "block",
              }}
            >
              القسم
            </label>
            <Select
              className="form-input"
              value={departmentFilter}
              onChange={handleDepartmentChange}
              placeholder="اختر القسم"
              style={{ width: "200px", height: "42px" }}
              dropdownalign={{ overflow: "auto", align: "bottomCenter" }} // Ensures dropdown opens downwards
            >
              {departments &&
                departments?.data?.map((dept) => (
                  <Select.Option key={dept.id} value={dept.id}>
                    {dept?.name}
                  </Select.Option>
                ))}
            </Select>
          </div>

          {/* Name Filter */}
          <div>
            <label
              className="form-label"
              style={{
                fontWeight: "bold",
                marginBottom: "8px",
                display: "block",
              }}
            >
              اسم الموظف
            </label>
            <input
              className="form-input"
              value={nameFilter}
              onChange={handleNameChange}
              placeholder="ابحث باسم الموظف"
              style={{ width: "250px" }}
            />
          </div>

          {/* Job Filter */}
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
              الوظيفة
            </label>
            <input
              className="form-input"
              value={jobFilter}
              onChange={handleJobChange}
              placeholder="ابحث بالوظيفة"
              style={{ width: "250px" }}
            />
          </div>
          <div>
            <label
              className="form-label"
              style={{
                fontWeight: "bold",
                marginBottom: "8px",
                display: "block",
              }}
            >
              الرقم القومي
            </label>
            <input
              className="form-input"
              value={nationalId}
              onChange={handleNationalIdChange}
              placeholder="ابحث بالرقم القومي"
              style={{ width: "250px" }}
            />
          </div>

          <div>
            <label
              className="form-label"
              style={{
                fontWeight: "bold",
                marginBottom: "8px",
                display: "block",
              }}
            >
              فئة الموظف
            </label>
            <Select
              className="form-input"
              value={employeeType}
              onChange={handleEmplyeeTypChange}
              placeholder="اختر القسم"
              style={{ width: "200px", height: "45px" }}
              dropdownAlign={{ overflow: "auto", align: "bottomCenter" }} // Ensures dropdown opens downwards
              // showSearch={true}
            >
              {employeeTypes &&
                employeeTypes?.map((type) => (
                  <Select.Option key={type.id} value={type.id}>
                    {type?.name}
                  </Select.Option>
                ))}
            </Select>
          </div>
        </div>
      </div>

      <div>
        <button
          type="button"
          className="pdf-button white-space-nowrap"
          style={{
            backgroundColor: "#AF8260",
            margin: "20px",
            marginTop: "0px",

            alignItems: "center",
          }}
          onClick={() => setIsModalVisible(true)}
        >
          اضافه موظف
        </button>
        <DownloadTableExcel
          filename="العاملين بالدار"
          sheet="users"
          currentTableRef={tableRef.current}
        >
          <button className="pdf-button white-space-nowrap">حفظ اكسيل </button>
        </DownloadTableExcel>
      </div>
      <table
        ref={tableRef}
        className="table table table-hover mt-5"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: "var(--text-color-inverted)",
        }}
      >
        <thead>
          <tr className="fw-bold fs-5 my-3">
            <th scope="col" style={{ background: "#edede9" }}>
              الاسم
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              القسم
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              الوظيفه
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              البونط
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              الرقم القومي
            </th>

            {user.permissions.some(
              (permission) => permission.name === "edit-employees-departments"
            ) && (
              <th scope="col" style={{ background: "#edede9" }}>
                الاجرائات
              </th>
            )}
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
                {item?.name}
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
                {item.department?.name}
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
                {item.job?.name}
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
                {item.points ? item.points : "لا يوجد"}
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
                {item.national_id}
              </td>
              {user.permissions.some(
                (permission) => permission.name === "edit-employees-departments"
              ) && (
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
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "7px",
                    }}
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
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <DataModal
        show={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        itemId={itemId}
        departments={departments}
        item={item}
        employeeTypes={employeeTypes}
      />
      {data?.data?.length > 0 && (
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

export default ShowAllStaff;
