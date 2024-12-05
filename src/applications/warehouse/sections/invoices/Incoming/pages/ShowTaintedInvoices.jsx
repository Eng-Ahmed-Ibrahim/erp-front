import React, { useEffect, useState } from "react";
import {
    updateInvoice,
    getTaintedInvoices,
    getTaintedInvoiceById,
    updateTaintedInvoice,
    changeInvoiceStatus,
} from "../../../../../../apis/invoices";
import Table from "../../../../../../components/shared/table/Table";
import { getSuppliers } from "../../../../../../apis/suppliers";
import { useAuth } from "../../../../../../context/AuthContext";
function ShowTaintedInvoices() {
    const [supplier, setAllSupplier] = useState([]);
    const { user } = useAuth()
const [canAddTained,setCanAddTained]=useState(false);

    useEffect(() => {
        const userPermissions= user.permissions.filter(permission=>permission.name==="add tainted")
        if(userPermissions.length>0){
            setCanAddTained(true)
            console.log("okk")
        }
        const fetchSupplier = async () => {
            const res = await getSuppliers({}, "", () => { });
            setAllSupplier(
                [{ label: "", value: "" }].concat(
                    res.data.map((item) => {
                        return { label: item.name, value: item.id };
                    })
                )
            );
        };
        fetchSupplier();
    }, []);
    const statusOptions = [
        { value: "", label: "" },
        { value: "approved", label: "تم المراجعة" },
        { value: "pending", label: "تحت المراجعة" },
        { value: "rejected", label: "مرفوضة" },
    ];
    const tableHeaders = [
        { key: "code", value: "  كود الفاتوره" },
        { key: "invoice_date", value: "تاريخ الإصدار" },
        { key: "registration_date", value: "تاريخ التسجيل" },
    ];
    const detailsHeaders = [
        {
            key: "recipes",
            label: "المواد الخام",
            isArray: true,
            isInput: true,
            details: [

                { key: "name", label: "الإسم", isInput: false },
                { key: "quantity", label: "الكمية", isInput: user?.department.type === "source" ? true : false },
                { key: "price", label: "السعر", isInput: user?.department.type === "master" ? true : false },
                { key: "expire_date", label: "تاريخ الصلاحية", isInput: false },
            ],
        }
    ];
    const filtersIncoming = [
        {
            key: "code",
            type: "text",
            placeholder: "إبحث بكود الفاتورة",
            id: "كود فاتورة",
        },
        {
            key: "invoice_price",
            type: "text",
            placeholder: "إبحث بسعر الفاتورة",
            id: "سعر الفاتورة",
        },
        {
            key: "supplier_id",
            type: "selection",
            id: "اختر المورد",
            placeholder: "المورد",
            options: supplier,
        },
        {
            key: "status",
            type: "selection",
            id: "اختر الحالة",
            placeholder: "الحالة",
            options: statusOptions,
        },
        { key: "from_date", type: "date", id: "من تاريخ" },
        { key: "to_date", type: "date", id: "إلى تاريخ" },
    ];

    const actionsIncoming = canAddTained ? [
        {
            type: "add",
            label: "اضافة فاتورة هالك",
            route: "/warehouse/invoices/add-tainted-invoices",
        },
        {
            type: "show",
            label: "مراجعة",
        },
        {
            type: "navigate",
            label: "طباعه",
            route: "/warehouse/invoices/print/:id"
        },
    ] : [
       
        {
            type: "show",
            label: "مراجعة",
        },
        {
            type: "navigate",
            label: "طباعه",
            route: "/warehouse/invoices/print/:id"
        },
    ];
    



    return (
        <>
            <div className="invoice-container">


                <Table
                    headers={tableHeaders}
                    filters={filtersIncoming}
                    title="الفواتير الهالكة"
                    actions={actionsIncoming}
                    fetchData={(filters, id, setIsLoading) =>
                        getTaintedInvoices(filters, id, setIsLoading)
                    }

                    detailsHeaders={detailsHeaders}
                    updateFn={updateTaintedInvoice}
                    changeStatusFn={changeInvoiceStatus}
                />


            </div>
        </>
    );
}

export default ShowTaintedInvoices;
