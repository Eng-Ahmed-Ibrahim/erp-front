

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../../../context/AuthContext";
import { message } from "antd";
import axios from "axios";
import { API_ENDPOINT } from "../../../../../../../config";

const OrdersReports = () => {
    const [data, setData] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectID, setSelectId] = useState();
    const [selectedUser, setSelectUser] = useState();
    const [selectStats, setSelectedStatus] = useState();
    const [department, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectWatier, setSelectedWatier] = useState()

    const [waiterName, setWaiterName] = useState([])

    const { user } = useAuth();
    const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const domain = API_ENDPOINT;

    const reInitializeStates = () => {
        setWaiterName([])
        setSelectedWatier()
        setData([])
    }

    const handleGettingReports = async () => {
        try {
            if (fromDate && toDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                const fromDateObj = new Date(fromDate);
                fromDateObj.setHours(0, 0, 0, 0);

                const toDateObj = new Date(toDate);
                toDateObj.setHours(0, 0, 0, 0);

                // Check if fromDate is exactly yesterday and toDate is exactly today
                const isFromDateYesterday = fromDateObj.getTime() === yesterday.getTime();
                const isToDateToday = toDateObj.getTime() === today.getTime();
                if (user.department?.type === "reciver") {
                    if (!isFromDateYesterday || !isToDateToday || !selectWatier) {
                        return message.info("يرجى ملئ جميع البيانات بشكل صحيح");
                    }
                }
                console.log({
                    fromDate,
                    toDate,
                    fromDateObj,
                    toDateObj,
                    isFromDateYesterday,
                    isToDateToday
                })

                await getAllWaiters();
            } else {
                message.info("يرجى ملئ جميع البيانات بشكل صحيح")
            }
        } catch (err) {
            console.log({ err });
        }
    };



    const getAllWaiters = async () => {
        try {
            const Token =
                localStorage.getItem("token") || sessionStorage.getItem("token");
            const response = await axios.get(
                `${API_ENDPOINT}/api/v1/store/waiter/all`,
                {
                    headers: {
                        Authorization: `Bearer ${Token}`,
                    },
                }
            );
            setWaiterName(response.data.data)
            if (Array.isArray(waiterName) && waiterName?.length > 0) {
                getOrdersReportes();
            }
        } catch (error) {
            message.error("لايوجد واتر")
        }
    }
    useEffect(() => {
        getAllWaiters()
    }, [])

    useEffect(() => {
        axios.get(`${API_ENDPOINT}/api/v1/store/department/all`, {
            headers: {
                Authorization: `Bearer ${Token}`,
            },
        })
            .then(res => {
                setDepartments(res?.data);
            });
    }, [selectID]);

    useEffect(() => {
        axios.get(`${API_ENDPOINT}/api/v1/shifts/cashiers`, {
            headers: {
                Authorization: `Bearer ${Token}`,
            },
        })
            .then(res => {
                setUsers(res?.data);
                console.log(`usersss`, users)
            });
    }, [selectedUser, selectStats, selectWatier]);

    async function getOrdersReportes() {
        try {
            if (user.department?.type === "reciver") {
                const res = await axios.get(`${domain}/api/v1/store/department/orders/${user.department.id}`, {
                    params: {
                        "from": fromDate,
                        "to": toDate,
                        "user_id": user.id,
                        "waiter_id": selectWatier,

                    },
                    headers: {
                        Authorization: `Bearer ${Token}`,
                    },
                });
                if (!res.data.success) {
                    message.info(res?.data?.error?.message)
                    reInitializeStates()
                    return;
                }
                if (selectWatier) {
                    setData(res.data);
                }


            }
            else if (user.department?.type === "master") {
                console.log("master ")
                const res = await axios.get(`${domain}/api/v1/store/department/orders/${selectID}`, {
                    params: {
                        "from": fromDate,
                        "to": toDate,
                        "user_id": selectedUser,
                        "waiter_id": selectWatier,
                        "status": selectStats,
                        "store_id": selectID
                    },
                    headers: {
                        Authorization: `Bearer ${Token}`,
                    },
                });
                setData(res.data);
                console.log(data, `master data `)
            }

        } catch (error) {
            message.info(error);
        }
    }

    return (
        <div>
            <div className="shadow p-3 my-5 text-light text-center rounded" style={{ backgroundColor: "rgb(128, 61, 59)" }}>
                <h3>تقرير المبيعات</h3>
            </div>
            <div className="container text-center text-xl">
                <div className="row align-items-center">
                    {
                        user.department?.type === 'reciver' ? null : user.department?.type === "master" ?
                            <>

                                <div className="col">
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">الحاله</label>
                                        <select className="form-control" onChange={(e) => setSelectedStatus(e.target.value)} >
                                            <option>اختر نوع الحاله</option>
                                            <option value="processing">
                                                تحت النجهيز
                                            </option>
                                            <option value="returned">
                                                مرتجع
                                            </option>
                                            <option value="paid">
                                                مدفوع
                                            </option>
                                            <option value="completed">
                                                تم التجهيز
                                            </option>
                                            <option value="closed">
                                                منتهية
                                            </option>
                                        </select>

                                    </div>
                                </div>
                                <div className="col">
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">اسم المنفذ</label>
                                        <select className="form-control" onChange={(e) => { setSelectId(e.target.value) }}>
                                            <option>اختر اسم المنفذ</option>
                                            {department?.data?.map((method) => (
                                                method?.type === "reciver" ? <option value={method.id} key={method.id}>{method.name}</option> : null
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="mb-3">
                                        <label htmlFor="exampleFormControlInput1" className="form-label">اسم الكاشير</label>
                                        <select className="form-control" onChange={(e) => { setSelectUser(e.target.value) }}>
                                            <option>اختر اسم كاشير</option>
                                            {users?.data?.map((method) => (
                                                <option value={method.id} key={method.id}>{method.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </> : null


                    }



                    <div className="col">
                        <div className="mb-3">
                            <label htmlFor="exampleFormControlInput1" className="form-label">اسم الويتر:</label>
                            <select onChange={(e) => {
                                if (e.target.value === "اختر اسم الويتر") {
                                    setSelectedWatier(null)
                                    setData([])
                                    return
                                }
                                setSelectedWatier(e.target.value)
                            }} className="form-control" aria-label=".form-select-lg example">
                                <option >اختر اسم الويتر</option>
                                {waiterName.map((method) => (
                                    <option key={method.id} value={method.id}>
                                        {method.name}
                                    </option>
                                ))}

                            </select>
                        </div>
                    </div>
                    <div className="col">
                        <div className="mb-3">
                            <label htmlFor="exampleFormControlInput1" className="form-label">من</label>
                            <input type="date" className="form-control" value={fromDate} onChange={(e) => { setFromDate(e.target.value) }} />
                        </div>
                    </div>
                    <div className="col">
                        <div className="mb-3">
                            <label htmlFor="exampleFormControlInput1" className="form-label">الى</label>
                            <input type="date" className="form-control" value={toDate} onChange={(e) => { setToDate(e.target.value.toString().split("T")[0]) }} />
                        </div>
                    </div>
                    <div className="col">
                        <div className="mb-3">
                            {/* <label htmlFor="exampleFormControlInput1" className="form-label"></label> */}
                            <button className="form-cashier-btn"
                                onClick={() => { handleGettingReports() }}
                                style={{ width: "100%", marginTop: `27%`, transition: `all 0.3s` }}>تأكيد</button>
                        </div>
                    </div>
                </div>
            </div>

            <table className="table table-hover mt-5 mb-20">
                <thead>
                    <tr>
                        <th scope="col" > مدفوعات الفيزا</th>
                        <th scope="col" > مدفوعات الكاش</th>
                        <th scope="col"> مدفوعات الاجل</th>
                        <th scope="col">اجمالى المدفوعات</th>
                    </tr>


                </thead>
                <tbody>
                    <tr>
                        <td >
                            {data?.data?.totals.total_visa.toFixed(5)}
                        </td>
                        <td scope="row">
                            {data?.data?.totals.total_cash.toFixed(5)}
                        </td>
                        <td scope="row">
                            {data?.data?.totals.total_post_paid.toFixed(5)}
                        </td>
                        <td scope="row">
                            {data?.data?.totals.total.toFixed(5)}
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className="table table-hover mt-5">
                <thead>
                    <tr>
                        <th scope="col">الرقم</th>
                        <th scope="col">رقم الطلب</th>
                        <th scope="col">الحالة</th>
                        <th scope="col">تاريخ الطلب</th>
                        <th scope="col">اسم العميل</th>
                        <th scope="col">قيمة الفاتورة</th>
                        <th scope="col">نوع العميل</th>
                        <th scope="col">المنتجات</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.data && Object.keys(data.data).map((key, index) => {
                        const order = data.data[key];

                        return (
                            <React.Fragment key={index}>
                                <tr>
                                    <th scope="row">{index + 1}</th>
                                    <td>{order.code}</td>
                                    <td>{order.status}</td>
                                    <td>{order.order_date}</td>
                                    <td>{order.client == "" ? "Guest" : order.client}</td>
                                    <td>{order.total_price} </td>
                                    <td>{order.client_type}</td>
                                    <td>
                                        <ul>
                                            {order.products?.map((product, index) => (
                                                <li key={index}>{product.name} - {product.quantity} × {product.price} = {product.total_price}</li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default OrdersReports;


