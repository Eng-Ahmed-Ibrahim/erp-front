import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../config";
// import { Pagination, Select, Modal } from "antd";
import { Pagination, Select, Modal, message } from "antd";

import { DownloadTableExcel } from "react-export-table-to-excel";

function SaveIncentivesModal({ show, onHide, month, type }) {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handelSaveIncentives = async () => {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/incentives/lock-incentives`,
      {
        month: month,
        type: type,
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );

    if (true) {
      message.success("تم تعديل الحافز بنجاح");
      onHide;
    }
  };

  return (
    <Modal
      centered
      open={show}
      onCancel={onHide}
      onOk={onHide}
      width={900}
      footer={null}
    >
      <div className="mb-3">
        <h3
          htmlFor="exampleInputPassword"
          className="form-label"
          style={{ justifySelf: "center", margin: "20px" }}
        >
          هل أنت متأكد من حفظ حوافز شهر {month ? month : ""}
        </h3>
        <h3></h3>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            margin: "40px 20px 20px 20px",
          }}
        >
          {" "}
          <button
            type="button"
            // className="pdf-button white-space-nowrap"
            style={{
              backgroundColor: "#AF8260",
              fontSize: "16px",
              height: "43px",
              margin: "15px 0 20px",
              background: "firebrick",
            }}
            onClick={handelSaveIncentives}
            className="btn text-light fs-bold px-3"
          >
            حفظ البيانات
          </button>
          <button
            type="button"
            // className="pdf-button white-space-nowrap"
            style={{
              backgroundColor: "#AF8260",
              fontSize: "16px",
              height: "43px",
              margin: "15px 0 20px",
              background: "green",
            }}
            onClick={() => {
              onHide();
            }}
            className="btn text-light fs-bold px-3"
          >
            رجوع
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DataModal({ show, onHide, item, itemId, refreshFn }) {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const [discount, setDiscount] = useState(0);
  const [reward, setReward] = useState(0);
  const [points, setPoints] = useState(0);
  const [excellenceBonus, setExcellenceBonus] = useState(0);
  const [advanceDeduction, setAdvanceDeduction] = useState(0);
  const [simCardDeduction, setSimCardDeduction] = useState(0);
  const [otherDeduction, setOtherDeduction] = useState(0);

  useEffect(() => {
    setDiscount(item?.discount || 0);
    setReward(item?.reward || 0);
    setPoints(item?.points || 0);
    setExcellenceBonus(item?.excellence_bonus || 0);
    setAdvanceDeduction(item?.advance || 0);
    setSimCardDeduction(item?.sim_card_deduction || 0);
    setOtherDeduction(item?.other_deductions || 0);
  }, [item]);

  const handleEditPoints = async () => {
    const res = await axios.put(
      `${API_ENDPOINT}/api/v1/incentives/${itemId}`,
      {
        discount: discount,
        reward: reward,
        points: points,
        excellence_bonus: excellenceBonus,
        advance: advanceDeduction,
        sim_card_deduction: simCardDeduction,
        other_deductions: otherDeduction,
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    // onHide();

    if (res.data.data) {
      refreshFn();
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
      <div
        style={{
          padding: " 14px 12px",
          border: "1px solid #E4C59E",
          color: "#803D3B",
          borderRadius: "15px",
          fontSize: "16px",
        }}
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
        <div className="mb-3">
          <label htmlFor="exampleInputPassword" className="form-label">
            {" "}
            مكافأة التميز{" "}
          </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            value={excellenceBonus}
            onChange={(e) => setExcellenceBonus(e.target.value)}
            required
          />
        </div>

        <hr style={{ width: "50%", color: "#803D3B", margin: "5px auto" }} />
        <hr style={{ width: "50%", color: "#803D3B", margin: "5px auto" }} />

        <div className="mb-3">
          <label htmlFor="exampleInputPassword" className="form-label">
            {" "}
            السلفة{" "}
          </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            value={advanceDeduction}
            onChange={(e) => setAdvanceDeduction(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPassword" className="form-label">
            {" "}
            رسوم خطوط فودافون{" "}
          </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            value={simCardDeduction}
            onChange={(e) => setSimCardDeduction(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPassword" className="form-label">
            {" "}
            إستقطاعات اخرى{" "}
          </label>
          <input
            type="number"
            className="form-control"
            id="exampleInputEmail1"
            value={otherDeduction}
            onChange={(e) => setOtherDeduction(e.target.value)}
            required
          />
        </div>
      </div>
    </Modal>
  );
}

const ShowInventives = () => {
  const [departments, setDepartments] = useState([]);
  const [itemId, setItemId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSaveIncentivesModalVisable, setIsSaveIncentivesModalVisable] =
    useState(false);
  const [pointValue, setPointValue] = useState();
  const [editedPointValue, setEditedPointValue] = useState(pointValue);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [item, setItem] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [totalIncentives, setTotalIncentives] = useState([]);
  const [incentivesCount, setIncentivesCount] = useState([]);
  const [employeeType, setEmployeeType] = useState([]);
  const [employeeTypes, setEmployeesTypes] = useState([]);
  const [hasExcellenceBonus, setHasExcellenceBonus] = useState("all");
  const tableRef = useRef(null);
  const [saveButtonState, changeSaveButtonState] = useState(false);
  const [incetiveType, setIncentiveType] = useState(1);
  const [incetiveTypes, setIncentiveTypes] = useState([]);
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

  const handleNationalIdChange = (e) => {
    setNationalId(e.target.value);
  };
  const handleMonthFilterChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleEmplyeeTypChange = (type) => {
    setEmployeeType(type);
  };

  const handleExcellenceBonusFilterChange = (value) => {
    setHasExcellenceBonus(value);
  };

  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/departments`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        response?.data?.unshift({ id: null, name: "اختر قسم" });
        setDepartments(response.data);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/types`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        response?.data?.data?.unshift({ id: null, name: "اختر الفئة" });
        setEmployeesTypes(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/incentives-types`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((response) => {
        setIncentiveTypes(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, []);

  const fetchIncentives = async () => {
    const filters = {
      department: departmentFilter,
      name: nameFilter,
      job: jobFilter,
      national_id: nationalId,
      month: selectedMonth,
      employee_type: employeeType,
      type: incetiveType,
      has_excellence_bonus: hasExcellenceBonus,
    };

    await axios
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
        setTotalIncentives(response.data.data.total);
        setCanEdit(response.data.data.can_edit);
        setIncentivesCount(response.data.data.count);
      })
      .catch((error) => {
        console.error("Error fetching incentives:", error);
      });
  };
  useEffect(() => {
    fetchIncentives();
  }, [
    departmentFilter,
    nameFilter,
    jobFilter,
    Token,
    nationalId,
    selectedMonth,
    employeeType,
    saveButtonState,
    incetiveType,
    hasExcellenceBonus,
  ]);

  const handelEditPoints = async () => {
    const res = await axios.put(
      `${API_ENDPOINT}/api/v1/incentives`,
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
      changeSaveButtonState(!saveButtonState);

      // onHide();
    }
  };
  // zerox 6220
  const handelSaveIncentives = async () => {
    setIsSaveIncentivesModalVisable(true);
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

  const refreshIncentives = () => {
    fetchIncentives();
  };
  return (
    <div>
      <div className="my-1 ">
        <h1 className="heading text-center p-3">
          {" "}
          الحوافز ({incentivesCount}) : {totalIncentives} جنيه
        </h1>
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
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
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
              نوع الحافز
            </label>
            <Select
              className="form-input"
              value={incetiveType}
              onChange={(value) => {
                setIncentiveType(value);
              }}
              placeholder="اختر نوع الحافز"
              style={{ width: "200px", height: "45px" }}
              dropdownAlign={{ overflow: "auto", align: "bottomCenter" }}
              // showSearch={true}
            >
              {incetiveTypes &&
                incetiveTypes.map((type) => (
                  <Select.Option key={type.id} value={type.id}>
                    {type.name}
                  </Select.Option>
                ))}
            </Select>
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
              القسم
            </label>
            <Select
              className="form-input"
              value={departmentFilter}
              onChange={handleDepartmentChange}
              placeholder="اختر القسم"
              style={{ width: "200px", height: "45px" }}
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
          </div>{" "}
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
          </div>{" "}
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
              placeholder="اختر الفئة"
              style={{ width: "200px", height: "45px" }}
              dropdownAlign={{ overflow: "auto", align: "bottomCenter" }}
              // showSearch={true}
            >
              {employeeTypes &&
                employeeTypes?.map((type) => (
                  <Select.Option key={type.id} value={type.id}>
                    {type.name}
                  </Select.Option>
                ))}
            </Select>
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
              مكافأة التميز
            </label>
            <Select
              className="form-input"
              value={hasExcellenceBonus}
              onChange={handleExcellenceBonusFilterChange}
              placeholder="اختر الحالة"
              style={{ width: "200px", height: "45px" }}
              dropdownAlign={{ overflow: "auto", align: "bottomCenter" }}
            >
              <Select.Option value="all">الكل</Select.Option>
              <Select.Option value={true}>يوجد مكافأة</Select.Option>
              <Select.Option value={false}>لا يوجد مكافأة</Select.Option>
            </Select>
          </div>
        </div>
      </div>

      <div className="my-1">
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <p style={{ fontSize: "25px", marginBottom: "0" }}>
            قيمة البونط لشهر
          </p>

          <input
            className="filter-input"
            type="month"
            style={{ width: "200px", height: "42px" }}
            value={selectedMonth}
            onChange={handleMonthFilterChange}
          />

          <p style={{ fontSize: "25px", marginBottom: "0" }}>:</p>
          <input
            type="text"
            className="filter-input"
            value={editedPointValue}
            onChange={(e) => setEditedPointValue(e.target.value)}
            style={{
              width: "120px",
              fontSize: "22px",
              textAlign: "center",
              height: "42px",
              appearance: "textfield",
              WebkitAppearance: "none",
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
            }}
          >
            <button
              type="button"
              disabled={!canEdit}
              // className="pdf-button white-space-nowrap"
              style={{
                backgroundColor: "#AF8260",
                fontSize: "16px",
                height: "43px",
                margin: "15px 0 20px",
              }}
              onClick={handelEditPoints}
              className="btn text-light fs-bold px-3"
            >
              تعديل
            </button>

            <button
              type="button"
              disabled={!canEdit}
              style={{
                backgroundColor: "#AF8260",
                fontSize: "16px",
                height: "43px",
                margin: "15px 0 20px",
              }}
              onClick={handelSaveIncentives}
              className="btn text-light fs-bold px-3"
            >
              حفظ البيانات
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
              الإستقطاعات
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
                {item?.employee?.name}
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
                {item?.employee?.department?.name}
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
                {item?.discount}
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
                {item?.reward}
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
                {item?.sim_card_deduction +
                  item?.advance +
                  item?.other_deductions}
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
                {item?.total_incentives}
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
                {item?.job?.name}
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
                {item?.employee?.national_id}
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
                  disabled={!canEdit}
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
        refreshFn={refreshIncentives}
      />

      <SaveIncentivesModal
        show={isSaveIncentivesModalVisable}
        onHide={() => setIsSaveIncentivesModalVisable(false)}
        month={selectedMonth}
        type={incetiveType}
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
