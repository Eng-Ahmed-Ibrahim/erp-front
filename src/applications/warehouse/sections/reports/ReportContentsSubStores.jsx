import { Link } from "react-router-dom";
import Report2 from "../../../../../public/assets/images/2.jpg";
import Report1 from "../../../../../public/assets/images/1.jpg";
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
  ];

  if (viewProductsReport) {
    reports.shift()
    reports.shift()
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        padding: "20px 20px",
        gap: "40px",
      }}
    >
      {reports?.map((item, index) => (
        <Link to={item?.route} style={{ textDecoration: "none" }}>
          <div
            className="card shadow p-3 mb-5 bg-body-tertiary rounded"
            key={index}
            style={{ width: "18rem" }}
          >
            <img src={item?.img} className="card-img-top" alt={item?.name} />
            <div className="card-body">
              <h5 className="card-title">{item?.name}</h5>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ReportContentsSubStores;
