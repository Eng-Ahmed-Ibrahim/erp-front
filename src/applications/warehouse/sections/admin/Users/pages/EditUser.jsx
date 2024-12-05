import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, Button, Select, message } from "antd";
import { getUserById, updateUser,getAllUsers } from "../../../../../../apis/users";
import { getRoles ,getRoleById } from "../../../../../../apis/roles";
const { Option } = Select;
import { API_ENDPOINT } from "../../../../../../../config";
import axios from 'axios';
import useGeneralLoading from "../../../../../../store/loadingStore";
import useDepartments from "../../../../../../lib/services/hooks/useDepartment";
import useCashiers from "../../../../../../lib/services/hooks/useCashier";
import useShifts from "../../../../../../lib/services/hooks/useShifts";
import { transformToDateTime } from "../../../../../../lib/helpers/transformToDatetime";
const EditUser = () => {
  const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const navigate = useNavigate();
  const { id } = useParams();
  const [roles, setRoles] = useState([]);
  const [accsNames, setAccsNames] = useState([]);
  const [selectedAccountantName, setSelectedAccountantName] = useState(null);

  const [data, setData] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [userDepartment, setUserDepartment] = useState("");
  const [isSource, setIsSource] = useState(false)
  const [selectedDepatrment, setSelectedDepartment] = useState(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState([]);
  const [form] = Form.useForm();
  const [isPending, setIsPending] = useState(false)
  const [name, setName] = useState() 
  const [accountantname, setAccountantName] = useState()
  const [userName, setuserName] = useState()
  const [password, setPassword] = useState(null)
  const [password_confirmation, setPassword_confirmation] = useState(null)
//getUserById
  const [isWaiter, setIsWaiter] = useState(false)

  useEffect(() => {
    const fetchRoles = async () => {
      const res = await getRoles();
      setRoles(res.data);
    };
    const accountantNames = async (id) => {
      try {
        const ress = await getAllUsers();
            const filteredNames = ress.data
          ? ress.data.filter(user => user.department?.type === 'master')
          : [];
        setAccsNames(filteredNames);
    
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }
    
    fetchRoles();
    const fetchUser = async () => {
      const res = await getUserById(id);
      console.log(`reseres`,res)
       if(res.data.department.type == "reciver" ){setIsWaiter(true)}       
       else if (res.data.department.type == "source"){setIsSource(true)}
       else{
        setIsWaiter(false)
        setIsSource(false)
       }
      setData(res.data);
      setAccountantName(res.data.reviewer.name)
      setName(res.data.name)
      setUserDepartment(res.data.department.id)
      setuserName(res.data.username)
    };
    accountantNames("9c10deda-c41a-4c2c-9e5e-eb48322e038c");
    fetchUser();
  }, [selectedDepatrment]);

  const onFinish = async (values) => {
    const formData = {
      name: values.name,
      role: selectedRole,
      permissions: selectedRolePermissions,
      reviewer:selectedAccountantName
    };
    const res = await updateUser(formData, id);
    if (res instanceof Error)
      Object.keys(res.response.data.error.errors).map((key) =>
        message.error(res.response.data.error.errors[key])
      );
    else {
      message.success("تم تعديل مستخدم بنجاح");
      navigate(`/warehouse/users/show-users`);
    }
  };
  const onAccountantFinish = async (e) => {
    e.preventDefault();
    setIsPending(true);
    // setValue(e.target.value);
    try {
      await axios
        .post(
          `${API_ENDPOINT}/api/v1/store/user/update/${id}`, {
            name: name,
            username: userName,    
            department_id: userDepartment,
            reviewer:selectedAccountantName

          },
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        )
        .then((response) => {
          message.success('تم التعديل بنجاح')
        });
      setIsPending(false);
    } catch (err) {
      setIsPending(false);
      message.error('حدث خطا ما')
    }
  };

  const handleAccNameSelect = (value) => {
    console.log(`valuee`,value)
    const selectedRole = accsNames?.find((name) => name.name === value);
    console.log(`selectedRole`,selectedRole)
        if (selectedRole) {
      setSelectedAccountantName(selectedRole?.id);
    }
  };
  const handleRoleSelect = (value) => {
    const selectedRole = roles?.find((role) => role.name === value);
        if (selectedRole && selectedRole.permissions) {
      setSelectedRole(selectedRole?.id);
      setSelectedRolePermissions(selectedRole?.permissions); // Set the permissions here
    }
  };
  const today = new Date().toISOString().split("T")[0];

  const handleAddRoleClick = () => {
    navigate("/warehouse/roles/add-role");
  };
  const handelSubmit = async (e) => {
    e.preventDefault()
    setIsPending(true)
    try {
      await axios.post(`${API_ENDPOINT}/api/v1/store/user/update/${id}`, {
        name: name,
        username: userName,
        department_id: userDepartment,
        reviewer : selectedAccountantName
      },
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        })
        .then((response) => {
          setIsPending(false)
          message.success("تم تعديل بيانات مستخدم بنجاح");
        })
    } catch (err) {
      setIsPending(false);
    }
  }
  const handelPassword = async (e) => {
    e.preventDefault()
    setIsPending(true)
    try {
      await axios.post(`${API_ENDPOINT}/api/v1/store/user/update/${id}`, {
        name: name,
        username: userName,
        password: password,
        password_confirmation: password_confirmation,
        department_id: userDepartment
      },
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        })
        .then((response) => {
          setIsPending(false)
          message.success("تم تعديل الرقم السري للمستخدم بنجاح");
          navigate("/warehouse/users/show-users")
        })
    } catch (err) {
      setIsPending(false);
      message.error("الرقم السري غير متناسق");
    }
  }
  const [allDepartment, setAllDepartment] = useState([])
  useEffect(() => {
    setIsPending(true);
    axios.get(`${API_ENDPOINT}/api/v1/store/department`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    })
      .then((response) => {
        setIsPending(false);
        setAllDepartment(response.data);
        // console.log("contactForm", response.data);
      })
      .catch((error) => {
        setIsPending(false);
      });
  }, []);
  const getInitialState = () => {
    const value = "user";
    return value;
  };
  const [value, setValue] = useState(getInitialState);
  const handelDepartment = async (e) => {
    e.preventDefault();
    setIsPending(true);
    // setValue(e.target.value);
    try {
      await axios
        .post(
          `${API_ENDPOINT}/api/v1/store/user/update/${id}`, {
            name: name,
            username: userName,    
            department_id: selectedDepatrment
          },
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        )
        .then((response) => {
          message.success('تم التعديل بنجاح')
        });
      setIsPending(false);
    } catch (err) {
      setIsPending(false);
      message.error('حدث خطا ما')
    }
  };
  const { isGeneralLoading, setIsGeneralLoading } = useGeneralLoading()
  const hourOptions = [
    { from: '00:00', to: '08:00' ,appear:"نايت"},
    { from: '08:00', to: '16:00',appear:"صباحي" },
    { from: '16:00', to: '23:59',appear:"مسائي" },
  ]
  const [activeItemId, setActiveItemId] = useState(null);
  const [fromDate, setFromdate] = useState("");
  const [toDate, setToDate] = useState("");
  const [newShiftData, setNewShiftData] = useState({
    day: new Date().toISOString().split('T')[0],
    startHour: hourOptions[0].from, endHour: hourOptions[0].to,
    userId: null, departmentId: null
  })
  
  const { data: departments, isError: isDepartmentError } = useDepartments();
  const { createShift, createError,
    createSuccess
  } = useShifts();

  const { data: cashiers } = useCashiers();

  useEffect(() => {
    Array.isArray(cashiers) && setNewShiftData(p => ({ ...p, userId: cashiers[0].id }))
  }, [cashiers])
  const handeladdShift = async () => {
    const startDateTime = `${newShiftData.day}T${fromDate}:00`;
    const endDateTime = `${newShiftData.day}T${toDate}:00`;
    try {
      const response = await axios.post(`${API_ENDPOINT}/api/v1/shifts/create`, {
        user_id: id,
        start: startDateTime,
        end: endDateTime,
        department_id: newShiftData.departmentId
    },
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        })
        .then((response) => {
          message.success("تم اضافة الشيفت بنجاح");
        })
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
   !createError && createSuccess && message.success('تم الاضافة بنجاح')

    if (createError) {
      message.info('حدث خطأ في ادخال البيانات')
    }
  }, [isGeneralLoading, createError, createSuccess])
  return (
    <div className="form-container">
      <h1 className="form-title" style={{ marginBottom: "20px" }}>
        عدل مستخدم
      </h1>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={data}
      >
        <Form.Item
          label="الدور"
          name="role"
          rules={[{ required: true, message: "من فضلك إختر دور" }]}
          style={{ marginBottom: "20px" }}
        >
          <Select
            placeholder="إختر دور"
            onChange={handleRoleSelect}
            style={{ width: "100%" }}
          >
            {roles?.map((role) => (
              <Option key={role.id} value={role.name}>
                {role.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {selectedRolePermissions?.length > 0 && (
          <Form.Item label="صلاحيات الدور" style={{ marginBottom: "20px" }}>
            <Select
              mode="multiple"
              placeholder="Role permissions"
              value={selectedRolePermissions.map(
                (permission) => permission.name
              )}
              disabled
              style={{ width: "100%" }}
            >
              {selectedRolePermissions.map((permission) => (
                <Option key={permission} value={permission}>
                  {permission}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <div>
          <span>لم تعثر على دور؟</span>
          <Button style={{ marginLeft: "10px" }} onClick={handleAddRoleClick}>
            أضف هنا
          </Button>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            عدل مستخدم
          </Button>
        </Form.Item>
      </Form>

      <h1 className="form-title" style={{ marginBottom: "20px" }}>
        تعديل بيانات المستخدم
      </h1>
      <form onSubmit={handelSubmit}>
        <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          > الاسم </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          > اليوزرنيم (username) </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            value={userName}
            onChange={(e) => setuserName(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          class="btn btn-primary rounded p-2 fw-bold"
          style={{
            background: '#AF8260',
            border: "0px solid red"
          }}
        >تعديل بيانات المستخدم </button>
      </form>
      <h1 className="form-title mt-5" style={{ marginBottom: "20px" }}>
        تعديل الرقم السري المستخدم
      </h1>
      <form onSubmit={handelPassword}>
        <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          > الرقم السري</label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          > تاكيد الرقم السري </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputEmail1"
            value={password_confirmation}
            onChange={(e) => setPassword_confirmation(e.target.value)}
          />
        </div>
        <button
          type="submit"
          class="btn btn-primary rounded p-2 fw-bold"
          style={{
            background: '#AF8260',
            border: "0px solid red"
          }}
        >تعديل الرقم السري </button>
      </form>
      {isWaiter ? ( <>
      <h1 className="form-title mt-5" style={{ marginBottom: "20px" }}>
        تعديل مكان الكاشير التابع ليها
      </h1>
      <form onSubmit={handelDepartment}>
        <div class="mb-3">
          <label
            for="exampleInputPassword"
            className="form-label"
          > اختر نقطة البيع</label>
          <select
            class="form-select"
            aria-label="Default select example"
            value={userDepartment}
            onChange={(e) => {
              setUserDepartment(e.target.value)
              setValue(e.target.value)
              setSelectedDepartment(e.target.value)
              console.log("name" , e.target.value)
            }}
          >
            <option selected>اختر مكان</option>
            {allDepartment?.data?.map((item, index) => (
              <option key={index} value={item?.id}>{item?.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          class="btn btn-primary rounded p-2 fw-bold"
          style={{
            background: '#AF8260',
            border: "0px solid red"
          }}
        >تعديل  </button>
      </form> 
      </>) : null
      }
      {isSource && <>
          <h1 className="form-title" style={{ marginBottom: "20px" }}>
تعديل اسم المراجع
      </h1>
      <form onSubmit={onAccountantFinish}>
        <p>اسم المراجع الحالي : {accountantname}</p>
        <div
          label="اسم المراجع"
          name="AccountantName"
          rules={[{ required: true, message: "اختر اسم المراجع" }]}
          style={{ marginBottom: "20px" }}
        >
          <select
            placeholder="إختر اسم المراجع"
            onChange={(e) => {handleAccNameSelect(e.target.value)}}
            style={{ width: "100%" }}
          >
            <option key="" value="">
اختر اسم المراجع              </option>
            {accsNames?.map((AccountantName) => (
              <option key={AccountantName.id} value={AccountantName.name}>
                {AccountantName.name}
              </option>
            ))}
          </select>
        </div>
        <div>
        <button
          type="submit"
          class="btn btn-primary rounded p-2 fw-bold"
          style={{
            background: '#AF8260',
            border: "0px solid red"
          }}
        >عدل اسم المراجع   </button>
        </div>
      </form>
      </>}
      {isWaiter ? (
  <>
    <h1 className="form-title mt-5" style={{ marginBottom: "20px" }}>
      تعديل مكان وميعاد الشيفت
    </h1>
    <div className="col-md-3">
      <div className="mb-3 d-flex text-center flex-column gap-small">
        <label htmlFor="exampleFormControlInput1" className="form-label ps-3">اليوم</label>
        <input
          onChange={(e) => {
            const selectedDay = e.target.value;
            setNewShiftData((p) => ({ ...p, day: selectedDay }));
          }}
          min={today}
          value={newShiftData.day}
          type="date"
          className="form-control"
          id="exampleFormControlInput1"
          placeholder="name@example.com"
        />
      </div>
    </div>
    <div className="col-md-3">
      <div className="mb-3 d-flex text-center flex-column gap-small">
      <label htmlFor="exampleFormControlInput1" className="form-label ps-3 ">الساعات</label>
                <Select
                  style={{ width: `100%` }}
                  options={hourOptions.map(ele => ({
                    value: ele.from + ' - ' + ele.to,
                    label: <div
                      style={{ textAlign: "center" }}
                    >{ele.appear}
                    </div>
                  }))}
                  onChange={(selectedHourRange) => {
                    const [selectedStartHour, selectedEndHour] = selectedHourRange.split('-').map(hour => hour.trim());
                    setFromdate(selectedStartHour);
                    setToDate(selectedEndHour);
                    setNewShiftData(p => ({ ...p, startHour: selectedStartHour, endHour: selectedEndHour }));
                  }}
                  defaultValue={hourOptions[0].appear}
                />
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
            className={`form-check pe-3 py-3 m-3 shadow rounded shift-hover ${activeItemId === item.id ? "shifts" : ""}`}
            key={index}
            style={{ border: "2px solid #803d3b" }}
          >
            <label className="form-check-label border-success border-3" htmlFor="defaultCheck1">
              {item?.name}
            </label>
          </button>
        ))}
    </div>
    <div className="d-grid gap-2">
      <button
        onClick={handeladdShift}
        className="btn btn-primary bg-brown text-light m-auto mt-5"
        style={{ width: "50%", backgroundColor: '#803D3B', border: 0 }}
        type="button"
      >
        حفظ
      </button>
    </div>
  </>
) : null}

    </div>
  );
};

export default EditUser;
