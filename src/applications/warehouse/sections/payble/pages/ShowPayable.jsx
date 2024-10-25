import Table from "../../../../../components/shared/table/Table";

import { deletePayable, getPayable } from "../../../../../apis/payable";
import { useAuth } from "../../../../../context/AuthContext";

const ShowPayables = () => {
    const { user } = useAuth()

    const tableHeaders = [

        { key: "amount", value: "القيمه بالجنية" },
        { key: "invoice", value: "القيمه الفعليه", nestedKey: "total_price" },
        { key: "type", value: "النوع" },

        { key: "invoice", value: "كود الفاتورة", nestedKey: "code" },
        { key: "note", value: "الملاحظه" },
        { key: "registration_date", value: "تاريخ الدفع" },
        // { key: "image", value: "الصوره", type: "image" },
    ];

    const actions = [

       
        {
            type: `${user?.permissions.some(
              (permission) => permission.name === "add payable"
            )
                ? "add"
                : ""
              }`,
              label: "إضافة مدفوعات",
               route: "/warehouse/payable/add-payable",
          },
    ];
    const filters = [{ key: "from_date", type: "date", id: "من تاريخ" },
    { key: "to_date", type: "date", id: "إلى تاريخ" }, {
        key: "type",
        type: "selection",
        id: "نوع  الدفع",
        placeholder: "نوع الدفع",
        options: [
            {
                value: "",
                label: "",
            },
            {
                value: "invoices",
                label: "الفواتير",
            },
            {
                value: "expenses",
                label: " نثريات",
            },
            {
                value: "incentives",
                label: "الحوافز",
            },
            {
                value: "salaries",
                label: " مرتبات",
            },
        ],
    },];
    return (
        <div>
            <Table
                headers={tableHeaders}
                filters={filters}
                title="مدفوعات"
                actions={actions}
                fetchData={(filters, id, setIsLoading) =>
                    getPayable(filters, id, setIsLoading)
                }
                deleteFn={deletePayable}
            />
        </div>
    );
};

export default ShowPayables;
