import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINT } from "../../config";
import { message, Select } from "antd";
import useDepartments from "../lib/services/hooks/useDepartment";
import useShifts from "../lib/services/hooks/useShifts";
import useCashiers from "../lib/services/hooks/useCashier";
import { addNewShiftSchema } from "../lib/schema/shift";
import { transformToDateTime } from "../lib/helpers/transformToDatetime";
import { Loading } from "../components/shared/Loading";
import useGeneralLoading from "../store/loadingStore";

const Shifts = () => {
  const { isGeneralLoading, setIsGeneralLoading } = useGeneralLoading();
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const hourOptions = [
    { from: "00:00", to: "08:00", appear: "نايت" },
    { from: "08:00", to: "16:00", appear: "صباحي" },
    { from: "16:00", to: "23:59", appear: "مسائي" },
  ];

  const [activeItemId, setActiveItemId] = useState(null);
  const [fromDate, setFromdate] = useState("");
  const [toDate, setToDate] = useState("");
  const [newShiftData, setNewShiftData] = useState({
    day: new Date().toISOString().split("T")[0],
    startHour: hourOptions[0].from,
    endHour: hourOptions[0].to,
    userId: null,
    departmentId: null,
  });

  const { data: departments, isError: isDepartmentError } = useDepartments(1);
  const { createShift, createError, createSuccess } = useShifts();

  const { data: cashiers } = useCashiers();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    Array.isArray(cashiers) &&
      setNewShiftData((p) => ({ ...p, userId: cashiers[0].id }));
  }, [cashiers]);
  const handeladdShift = async () => {
    const startDateTime = `${newShiftData.day}T${fromDate}:00`;
    const endDateTime = `${newShiftData.day}T${toDate}:00`;
    console.log(
      `test`,
      newShiftData.userId,
      startDateTime,
      endDateTime,
      newShiftData.departmentId
    );
    try {
      const response = await axios
        .post(
          `${API_ENDPOINT}/api/v1/shifts/create`,
          {
            user_id: newShiftData.userId,
            start: startDateTime,
            end: endDateTime,
            department_id: newShiftData.departmentId,
          },
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        )
        .then((response) => {
          message.success("تم اضافة الشيفت بنجاح");
        });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    !isGeneralLoading &&
      !createError &&
      createSuccess &&
      message.success("تم الاضافة بنجاح");

    if (createError) {
      message.info("حدث خطأ في ادخال البيانات");
    }
  }, [isGeneralLoading, createError, createSuccess]);
  // console.log('data from department', activeItemId);
  return (
    <div className="">
      {isGeneralLoading && <Loading />}
      <div className="shadow-lg p-3 mb-5 rounded text-center fs-2 fw-bold shifts text-light">
        الشيفتات
      </div>
      <div className="">
        <div className="container text-center ">
          <div className="row align-items-center">


            <div className="col-md-3">
              <div className="row g-2">
                <div className="col-md">
                  <div className="form-floating">


                    {/* <div className="flex flex-column gap-small">
                      <label className="form-label ps-3">الكاشير</label>
                      <Select
                        style={{ width: "100%" }}
                        options={
                          Array.isArray(cashiers)
                            ? cashiers.map((cashier) => ({
                                value: cashier.id,
                                label: (
                                  <div
                                    style={{
                                      textAlign: "center",
                                      width: "100%",
                                    }}
                                  >
                                    {cashier?.name}
                                  </div>
                                ),
                              }))
                            : []
                        }
                        onChange={(selectedCashier) => {
                          setNewShiftData((p) => ({
                            ...p,
                            userId: selectedCashier,
                          }));
                        }}
                        value={newShiftData.userId}
                      />
                    </div> */}

                    <div className="mb-3 d-flex text-center flex-column gap-small">
                      <label className="form-label ps-2">الكاشير</label>
                      <Select
                        style={{ width: "100%" }}
                        showSearch
                        options={
                          Array.isArray(cashiers)
                            ? cashiers.map((cashier) => ({
                                value: cashier.id,
                                label: cashier?.name,
                              }))
                            : []
                        }
                        onChange={(selectedCashier) => {
                          setNewShiftData((p) => ({
                            ...p,
                            userId: selectedCashier,
                          }));
                        }}
                        value={newShiftData.userId}
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        optionFilterProp="label"
                      />
                    </div>

                  </div>
                </div>
              </div>
            </div>



            <div className="col-md-3">
              <div className="mb-3 d-flex text-center flex-column gap-small">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label ps-3 "
                >
                  اليوم
                </label>
                <input
                  onChange={(e) => {
                    const selectedDay = e.target.value;
                    setNewShiftData((p) => ({ ...p, day: selectedDay }));
                  }}
                  value={newShiftData.day}
                  min={today}
                  type="date"
                  className="form-control"
                  id="exampleFormControlInput1"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="mb-3 d-flex text-center flex-column gap-small">
                <label
                  htmlFor="exampleFormControlInput1"
                  className="form-label ps-3 "
                >
                  الساعات
                </label>
                <Select
                  style={{ width: `100%` }}
                  options={hourOptions.map((ele) => ({
                    value: ele.from + " - " + ele.to,
                    label: (
                      <div style={{ textAlign: "center" }}>{ele.appear}</div>
                    ),
                  }))}
                  onChange={(selectedHourRange) => {
                    const [selectedStartHour, selectedEndHour] =
                      selectedHourRange.split("-").map((hour) => hour.trim());
                    setFromdate(selectedStartHour);
                    setToDate(selectedEndHour);
                    setNewShiftData((p) => ({
                      ...p,
                      startHour: selectedStartHour,
                      endHour: selectedEndHour,
                    }));
                  }}
                  defaultValue={hourOptions[0].appear}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-around flex-wrap">
          {!isDepartmentError &&
            departments?.map((item, index) => (
              <button
                onClick={() => {
                  setActiveItemId(item.id);
                  setNewShiftData((p) => ({ ...p, departmentId: item.id }));
                }}
                class={`form-check  pe-3 py-3 m-3 shadow rounded shift-hover ${
                  activeItemId === item.id ? "shifts" : ""
                } 
              `}
                key={index}
                style={{ border: "2px solid #803d3b", minWidth:"150px" }}
              >
                <label
                  className="form-check-label border-success border-3 "
                  htmlFor="defaultCheck1"
                >
                  {item?.name}
                </label>
              </button>
            ))}
        </div>
      </div>
      <div className="d-grid gap-2">
        <button
          onClick={handeladdShift}
          className="btn btn-primary bg-brown text-light m-auto mt-5"
          style={{ width: "50%", backgroundColor: "#803D3B", border: 0 }}
          type="button"
        >
          حفظ
        </button>
      </div>
    </div>
  );
};

export default Shifts;
