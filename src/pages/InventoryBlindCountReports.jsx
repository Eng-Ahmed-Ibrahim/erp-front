import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Table from "../components/shared/table/Table";
import {
  getAllWaiters,
  getBlindCountReports,
} from "../apis/apis/inventories";
import { getAllDeaprtments } from "../apis/apis/department";

const varianceOptions = [
  { value: "all", label: "الكل" },
  { value: "under", label: "عجز" },
  { value: "over", label: "زيادة" },
];

const InventoryBlindCountReports = () => {
  const { user } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [waiters, setWaiters] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const departmentsResponse = await getAllDeaprtments();
        const departmentList = departmentsResponse?.data ?? departmentsResponse;
        setDepartments(departmentList ?? []);
      } catch (error) {
        // handled within helper when possible
      }

      try {
        const waitersResponse = await getAllWaiters();
        const waiterList = waitersResponse?.waiters ?? waitersResponse;
        setWaiters(waiterList ?? []);
      } catch (error) {
        // handled within helper when possible
      }
    })();
  }, []);

  const departmentOptions = useMemo(() => {
    const options = (departments ?? []).map((department) => ({
      value: department.id,
      label: department.name,
    }));

    if (user?.department?.id && !options.some((opt) => opt.value === user.department.id)) {
      options.unshift({
        value: user.department.id,
        label: user.department.name,
      });
    }
    return [{ value: "all", label: "كل الأقسام" }, ...options];
  }, [departments, user?.department]);

  const waiterOptions = useMemo(() => {
    const options = (waiters ?? []).map((waiter) => ({
      value: waiter.id,
      label: waiter.name,
    }));
    return [{ value: "all", label: "كل الويتر" }, ...options];
  }, [waiters]);

  const headers = [
    {
      key: "department",
      nestedKey: "name",
      value: "القسم",
    },
    {
      key: "cashier",
      nestedKey: "name",
      value: "الكاشير",
    },
    {
      key: "waiter_old",
      nestedKey: "name",
      value: "ويتر الشفت السابق",
    },
    {
      key: "waiter_new",
      nestedKey: "name",
      value: "ويتر الشفت الحالي",
    },
    {
      key: "submitted_at",
      value: "تاريخ الجرد",
    },
    {
      key: "items_count",
      value: "عدد الأصناف",
    },
    {
      key: "total_under_quantity",
      value: "كمية العجز",
    },
    {
      key: "total_over_quantity",
      value: "كمية الزيادة",
    },
    {
      key: "total_fine_amount",
      value: "إجمالي الغرامة",
    },
  ];

  const filters = [
    {
      key: "department_id",
      type: "selection",
      id: "القسم",
      placeholder: "اختر القسم",
      options: departmentOptions,
    },
    {
      key: "waiter_id",
      type: "selection",
      id: "الويتر",
      placeholder: "اختر الويتر",
      options: waiterOptions,
    },
    {
      key: "variance_type",
      type: "selection",
      id: "نوع الفرق",
      placeholder: "اختر الحالة",
      options: varianceOptions,
    },
    {
      key: "from_date",
      type: "date",
      id: "من تاريخ",
    },
    {
      key: "to_date",
      type: "date",
      id: "إلى تاريخ",
    },
  ];

  const fetchBlindCountReports = async (filterValues = {}) => {
    const payload = { ...filterValues };

    if (payload.department_id === "all") {
      delete payload.department_id;
    }
    if (payload.waiter_id === "all") {
      delete payload.waiter_id;
    }
    if (payload.variance_type === "all") {
      delete payload.variance_type;
    }

    if (
      payload.department_id === undefined &&
      user?.department?.id
    ) {
      payload.department_id = user.department.id;
    }

    try {
      const response = await getBlindCountReports(payload);

      // Transform response to match Table component expectations
      const data = response?.data || [];
      return {
        data: data,
        pagination: {
          total: data.length,
          current_page: 1,
          per_page: data.length,
          last_page: 1,
        }
      };
    } catch (error) {
      return {
        data: [],
        pagination: {
          total: 0,
          current_page: 1,
          per_page: 10,
          last_page: 1,
        }
      };
    }
  };

  const actions = [
    {
      type: "navigate",
      label: "عرض التفاصيل",
      route: "/warehouse/reports/inventory-blind-counts/:id",
    },
  ];

  return (
    // <div className="content-wrapper">
      <Table
        headers={headers}
        title="تقارير جرد المخزون"
        filters={filters}
        actions={actions}
        fetchData={fetchBlindCountReports}
      />  
    // </div>
  );
};

export default InventoryBlindCountReports;

