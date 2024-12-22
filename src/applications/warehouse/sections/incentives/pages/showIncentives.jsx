import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../config";
// import { Pagination, Select, Modal } from "antd";
import { Pagination, Select, Modal, message } from "antd";

import { DownloadTableExcel } from "react-export-table-to-excel";

function DataModal({ show, onHide, item, itemId }) {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [discount, setDiscount] = useState(0);
  const [reward, setReward] = useState(0);
  const [points, setPoints] = useState(0);

  // When modal closes or item changes, reset fields to reflect item data
  useEffect(() => {
    setDiscount(item?.discount || 0);
    setReward(item?.reward || 0);
    setPoints(item?.points || 0);
  }, [item]);

  const handleEditPoints = async () => {
    const res = await axios.put(
      `${API_ENDPOINT}/api/v1/incentives/${itemId}`,
      {
        discount: discount,
        reward: reward,
        points: points,
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );

    console.log(res.data.data)
    // onHide();

    if (res.data.data) {
      message.success("تم تعديل الحافز بنجاح");
      onHide();
    }
  };

  return (
    <Modal
      title="   تعديل الحوافز   "
      centered
      open={show}
      onOk={handleEditPoints}
      onCancel={onHide}
      width={1000}
    >
      <div className="mb-3">
        <label htmlFor="exampleInputPassword" className="form-label">
          {" "}
          الاثابه{" "}
        </label>
        <input
          type="number"
          className="form-control"
          id="exampleInputEmail1"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="exampleInputPassword" className="form-label">
          {" "}
          الخصم{" "}
        </label>
        <input
          type="number"
          className="form-control"
          id="exampleInputEmail1"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="exampleInputPassword" className="form-label">
          {" "}
          عدد البونط{" "}
        </label>
        <input
          type="number"
          className="form-control"
          id="exampleInputEmail1"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          required
        />
      </div>
    </Modal>
  );
}
const ShowInventives = () => {
  const [departments, setDepartments] = useState([]);
  const [itemId, setItemId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pointValue, setPointValue] = useState();
  const [editedPointValue, setEditedPointValue] = useState(pointValue);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [item, setItem] = useState([]);
  const [totalIncentives, setTotalIncentives] = useState([]);
  const [incentivesCount, setIncentivesCount] = useState([]);
  const tableRef = useRef(null);

  const month = new Date().toISOString().split("-")[1] - 1;

  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
  const handleFilterApply = () => {
    // Trigger the re-fetch based on the selected filters
    setCurrentPage(1); // Optionally reset to page 1
  };

  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/departments`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        setDepartments(response.data);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch incentives with filters
    const filters = {
      department: departmentFilter,
      name: nameFilter,
      job: jobFilter,
    };

    axios
      .get(`${API_ENDPOINT}/api/v1/incentives`, {
        params: filters,
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        setData(response.data.data.incentives);
        setPointValue(response.data.data.incentives[0]?.point_value);
        setEditedPointValue(response.data.data.incentives[0]?.point_value);
        setTotalIncentives(response.data.data.total)
        setIncentivesCount(response.data.data.count)
      })
      .catch((error) => {
        console.error("Error fetching incentives:", error);
      });
  }, [departmentFilter, nameFilter, jobFilter, Token]);

  const handelEditPoints = async () => {
    const res = await axios.put(
      `${API_ENDPOINT}/api/v1/incentives/`,
      {
        point_value: editedPointValue,
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );

    if (res) {
      message.success("تم تعديل الحافز بنجاح");
      onHide;
    }
  };
  const handelEdit = async (item) => {
    setItemId(item.id);
    setItem(item);
    setIsModalVisible(true);
  };
  const getDepartmentName = (departmentId) => {
    const department = departments?.find((dept) => dept.id === departmentId);
    return department ? department.name : "غير معروف";
  };
  return (
    <div>
      <div className="my-1 ">
        <h1 className="heading text-center p-3"> الحوافز ({ incentivesCount}) : {totalIncentives} جنيه</h1>
      </div>

      <div
        className="filters-container"
        style={{
          marginBottom: "0 20px",
          padding: "20px",
          backgroundColor: "#f7f7f7",
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {/* Department Filter */}
          <div>
            <label
              style={{
                fontWeight: "bold",
                marginBottom: "8px",
                display: "block",
              }}
            >
              القسم
            </label>
            <Select
              value={departmentFilter}
              onChange={handleDepartmentChange}
              placeholder="اختر القسم"
              style={{ width: "200px" }}
              dropdownAlign={{ overflow: "auto", align: "bottomCenter" }} // Ensures dropdown opens downwards
              // showSearch={true} 
            >
              {departments &&
                departments.map((dept) => (
                  <Select.Option key={dept.id} value={dept.id}>
                    {dept.name}
                  </Select.Option>
                ))}
            </Select>
          </div>

          {/* Name Filter */}
          <div>
            <label
              style={{
                fontWeight: "bold",
                marginBottom: "8px",
                display: "block",
              }}
            >
              اسم الموظف
            </label>
            <input
              value={nameFilter}
              onChange={handleNameChange}
              placeholder="ابحث باسم الموظف"
              style={{ width: "250px" }}
            />
          </div>



          
          {/* Job Filter */}
          <div>
            <label
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
              value={jobFilter}
              onChange={handleJobChange}
              placeholder="ابحث بالوظيفة"
              style={{ width: "250px" }}
            />
          </div>
        </div>
      </div>

      {/* Points Value Section */}
      <div className="my-3">
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <p style={{ fontSize: "25px", marginBottom: "0" }}>
            قيمة البونط لشهر {month}:
          </p>
          <input
            type="number"
            className="form-control"
            value={editedPointValue}
            onChange={(e) => setEditedPointValue(e.target.value)}
            style={{
              width: "90px",
              fontSize: "20px",
              textAlign: "center",
              height: "30px",
            }}
            required
          />
          <span style={{ fontSize: "25px" }}>جنيه</span>

          <div
            style={{
              display: "flex",
              alignItems: "right",
              gap: "25px",
              width: "60%",
              alignItems:"center"
            }}
          >
            <button
              type="button"
               disabled = {true}

               
              // className="pdf-button white-space-nowrap"
              style={{
                backgroundColor: "#AF8260",
                fontSize: "16px",
                height: '43px',
                margin: "15px 0 20px"







              }}
              onClick={handelEditPoints}
              className="btn text-light fs-bold px-3"

            >
              تعديل
            </button>
            <DownloadTableExcel
              filename="حوافز العاملين بالدار"
              sheet="users"
              currentTableRef={tableRef.current}
            >
              <button className="pdf-button white-space-nowrap">
                حفظ اكسيل{" "}
              </button>
            </DownloadTableExcel>
          </div>
        </div>
      </div>
      <table
        className="table table table-hover mt-5"
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
              القسم
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              {" "}
              عدد الأبناط
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              الخصم
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              الاثابه
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              {" "}
              اجمالي الحافز
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              الوظيفه
            </th>
            <th scope="col" style={{ background: "#edede9" }}>
              الرقم القومي
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
                {item.employee.name}
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
                {" "}
                {item.employee.department.name}
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
                {item.points
                  ? item.points
                  : item.job.points
                  ? item.job.points
                  : "لا يوجد"}
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
                {item.discount}
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
                {item.reward}
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
                {item.total_incentives}
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
                {item.job.name}
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
                {" "}
                {item.employee.national_id}
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
                {" "}
                <button
                  type="button"
                  className="btn text-light fs-bold px-3"
                  style={{ backgroundColor: "#AF8260" }}
                  onClick={() => handelEdit(item)}
                  disabled = {true}
                >
                  تعديل
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <DataModal
        show={isModalVisible}
        onHide={() => setIsModalVisible(false)}
        itemId={itemId}
        item={item}
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

export default ShowInventives;
