import Table from "../../../../../components/shared/table/Table";
import "../../../../../components/shared/table/Table.scss";
import { getSupplierInvoicesReport } from "../../../../../apis/reports";
const ShowSupplierInvoicesReport = () => {
    const tableHeaders = [
        { key: "code", value: "كود الفاتورة" },
        { key: "supplier", nestedKey: "name", value: "اسم المورد " },
        { key: "status", value: "الحالة" },
        { key: "invoice_date", value: "تاريخ الإصدار" },
        { key: "registration_date", value: "تاريخ التسجيل" },
        { key: "discount", value: "الخصم" },
        { key: "total_price", value: "سعر الفاتورة" },

    ];
    const filters = [
        { key: "from_date", type: "date", id: "من تاريخ" },
        { key: "to_date", type: "date", id: "إلى تاريخ" },

    ];
    // const actions = [
    //     {
    //         type: "edit",
    //         label: "تعديل",
    //         route: "/warehouse/departments/:id/edit-departments",
    //     },
    //     {
    //         type: "delete",
    //         label: "حذف",
    //     },


    //     {
    //         type: "add",
    //         label: "إضافة قسم ",
    //         route: "/warehouse/departments/add-departments",
    //     },
    // ];

    return (
        <div>
            <Table
                headers={tableHeaders}
                title=" تقارير فواتير الموردين"

                filters={filters}
                fetchData={(filterValues, currentPage, setIsLoading) =>
                    getSupplierInvoicesReport(filterValues, currentPage, setIsLoading)
                }
            // actions={actions}
            // deleteFn={deleteDeaprtment}


            />
        </div>
    );
};

export default ShowSupplierInvoicesReport;
