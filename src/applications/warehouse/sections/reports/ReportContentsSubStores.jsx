import { Link } from "react-router-dom";
import Report2 from "../../../../../public/assets/images/2.jpg";
import Report1 from "../../../../../public/assets/images/1.jpg";
import Report5 from "../../../../../public/assets/images/cost5.jpg";
import Report3 from "../../../../../public/assets/images/5.jpg";
import { useAuth } from "../../../../context/AuthContext";
import React, { useEffect, useState } from "react";

const ReportContentsSubStores = () => {
  const tabTwoUsers =['9c10de53-14b1-4ae9-89d6-665ce7c0ccc5']
  const { user } = useAuth();
  const [viewProductsReport, setViewProductsReportOnly] = useState(false);

  useEffect(() => {
    setViewProductsReportOnly(false);

    if (tabTwoUsers.includes(user.roles[0])) {
      setViewProductsReportOnly(true);
    }
  }, []);
  const reports = [
   {
      id: 1,
      name: "تقرير المبيعات المفصل عن مده",
      img: `${Report2}`,
      route: "/warehouse/reports/ShowAllOrdersReport/Reports",
    },
   {
      id: 2,
      name: "تقرير الايرادات المفصل عن مده",
      img: `${Report1}`,
      route: "/warehouse/reports/ShowAllSalesDetails/Reports",
    },
    {
      id: 3,
      name: " تقرير مبيعات المنتجات المفصل عن مدة ",
      img: `${Report1}`,
      route: "/warehouse/reports/ShowDepartments",
    },
    {
      id: 4,
      name: "تقرير أرباح الأوردرات الخارجية ",
      img: `${Report3}`,
      route: "/warehouse/reports/external-orders/show",
    },
    {
      id: 5,
      name: "تقارير مراجعة الجرد",
      img: `${Report5}`,
      route: "/warehouse/reports/inventory-discrepancy-reviews/show",
    },
  ];

  if (viewProductsReport) {
    reports.shift()
    reports.shift()
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "24px",
        padding: "24px",
      }}
    >
      {reports?.map((item) => (
        <Link
          key={item.id}
          to={item?.route}
          style={{ textDecoration: "none", flex: "1 1 260px", maxWidth: "280px" }}
        >
          <div
            className="card shadow-sm rounded-4 h-100"
            style={{
              height: "100%",
              minHeight: "320px",
              display: "flex",
              flexDirection: "column",
              border: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "180px",
                overflow: "hidden",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
              }}
            >
              <img
                src={item?.img}
                alt={item?.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div
              className="card-body d-flex align-items-center justify-content-center text-center"
              style={{ padding: "20px" }}
            >
              <h5 className="card-title mb-0" style={{ fontWeight: 600 }}>
                {item?.name}
              </h5>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ReportContentsSubStores;
