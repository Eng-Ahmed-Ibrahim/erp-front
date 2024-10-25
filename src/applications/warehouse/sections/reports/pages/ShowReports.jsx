import React, { useEffect, useState } from "react";
// import "./Departments.scss";
import ReportCards from "../../../../../components/ui/ReportCards/ReportCards";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Report1 from "../../../../../../public/assets/images/1.jpg";
import Report2 from "../../../../../../public/assets/images/2.jpg";
import Report3 from "../../../../../../public/assets/images/3.jpg";
import Report4 from "../../../../../../public/assets/images/4.png";
import Report5 from "../../../../../../public/assets/images/5.jpg";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import ReportContentsSubStores from "../ReportContentsSubStores";
function ShowReports() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const reportData = [
    {
      image: `${Report1}`,
      name: "المنصرف لقسم عن مدة",
      route: "/warehouse/reports/show-reports/department",
    },
    {
      image: `${Report2}`,
      name: "اجمالى الوارد عن مدة",
      route: "/warehouse/reports/show-reports/supplier-invoieces",
    },
    {
      image: `${Report3}`,
      name: "اجمالى الوارد من مورد عن مدة",
      route: "/warehouse/reports/show-reports/get-allsupllier",
    },
    {
      image: `${Report4}`,
      name: "جرد المكونات فى الدار",
      route: "/warehouse/reports/show-reports/get-total-stores",
    },
    {
      image: `${Report5}`,
      name: "حركة صنف عن مدة",
      route: "/warehouse/reports/show-reports/get-recipe-report",
    },
    {
      image: `${Report5}`,
      name: "الميزان المخزنى",
      route: "/warehouse/reports/show-reports/inventory-balance",
    },
    {
      image: `${Report5}`,
      name: "جرد المدفوعات للمنفذ",
      route: "/warehouse/reports/show-reports/department-orders",
    },
  ];

  const handleCardClick = (route) => {
    navigate(`${route}`);
  };

  return (
    <>
      <h1 className="heading text-center p-3"> التقارير </h1>
      <Tabs>
        <TabList>
          <Tab>تقارير </Tab>
          <Tab>Title 2</Tab>
        </TabList>

        <TabPanel >
          <div className="cards-container">
            <div className="row">
              {reportData.map((department, index) => (
                <ReportCards
                  key={index}
                  img={department.image}
                  department={department.name}
                  onClick={() => handleCardClick(department.route)}
                />
              ))}
              {isLoading && (
                <>
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 56 }} spin />
                    }
                  />
                </>
              )}
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <ReportContentsSubStores />
        </TabPanel>
      </Tabs>
    </>
  );
}

export default ShowReports;
