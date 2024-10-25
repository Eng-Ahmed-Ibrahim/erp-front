import Table from "../../../../../components/shared/table/Table";
import { getSuppliers, deleteSupplier } from "../../../../../apis/suppliers";
import "../../../../../components/shared/table/Table.scss";
const ShowAllSupplier = () => {
    const tableHeaders = [
        {
            key: "name", value: "الإسم", clickable: true,
            route: "/warehouse/reports/show-reports/get-allsupllier/recipes/:id",
        },
        { key: "phone", value: "الرقم" },
        { key: "type", value: "النوع" },
    ];
    const filters = [
        { key: "name", type: "text", placeholder: "إبحث باللإسم", id: "الإسم" },
        {
            key: "phone",
            type: "text",
            placeholder: "إبحث برقم الموبايل",
            id: "رقم الموبايل",
        },
        {
            key: "type",
            type: "selection",
            id: "نوع المورد",
            placeholder: "نوع المورد",
            options: [
                {
                    value: "",
                    label: "",
                },
                {
                    value: "contracted",
                    label: "متعاقد",
                },
                {
                    value: "local",
                    label: "سوق محلى",
                },
            ],
        },
    ];
    const actions = [
        {
            type: "edit",
            label: "تعديل",
            route: "/warehouse/suppliers/:id/edit-supplier",
        },
        {
            type: "delete",
            label: "حذف",
        },
        {
            type: "navigate",
            label: "فواتير",
            route: "/warehouse/suppliers/:id/show-invoices",
        },

        {
            type: "add",
            label: "إضافة موردين",
            route: "/warehouse/suppliers/add-supplier",
        },
    ];

    return (
        <div>
            <Table
                headers={tableHeaders}
                title="الموردين"
                filters={filters}
                fetchData={(filterValues, currentPage, setIsLoading) =>
                    getSuppliers(filterValues, currentPage, setIsLoading)
                }
            // actions={actions}
            // deleteFn={deleteSupplier}
            />
        </div>
    );
};

export default ShowAllSupplier;
