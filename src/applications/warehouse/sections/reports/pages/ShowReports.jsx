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
import { useAuth } from "../../../../../context/AuthContext";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import ReportContentsSubStores from "../ReportContentsSubStores";

function ShowReports() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [viewTabTwoOnly, setViewTabTwoOnly] = useState(false);
  const [viewTabOneOnly, setViewTabOneOnly] = useState(false);
  const [isTalaat, setIsTalaat] = useState(false);
  const repairId = "9d727355-cad2-48b4-9671-aebbcfdc6771";
  const chemicalId = "9d72735b-c904-4b4b-a613-f5f16ba8ad98";
  const talaatId = "9d7b0996-857f-4a59-997b-64d605af07c0";
  const tabTwoUsers = ["9c10de53-14b1-4ae9-89d6-665ce7c0ccc5"];
  const tabOneUsers = ["9de5c9c9-08e5-424b-86c5-11e71206f9f8"];
  const { user } = useAuth();
  useEffect(() => {
    if (user.roles[0] == talaatId) {
      setIsTalaat(true);
    }
    setViewTabTwoOnly(false);

    setViewTabOneOnly(false);

    if (tabTwoUsers.includes(user.roles[0])) {
      setViewTabTwoOnly(true);
    }

    if (tabOneUsers.includes(user.roles[0])) {
      setViewTabOneOnly(true);
    }
  }, []);
  const reportData = [
    {
      image: `${Report1}`,
      name: "المنصرف لقسم عن مدة",
      route: "/warehouse/reports/show-reports/department",
    },
    {
      image: `${Report1}`,
      name: "اجمالي المنصرف من المخزن عن مدة",
      route: "/warehouse/reports/show-reports/alldepartments",
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
      route: "/warehouse/reports/show-reports/departmentbalance",
      // route: "/warehouse/reports/show-reports/inventory-balance",
    },
    {
      image: `${Report5}`,
      name: "جرد المدفوعات للمنفذ",
      route: "/warehouse/reports/show-reports/department-orders",
    },
    {
      image: `${Report3}`,
      name: "كارت الصنف ",
      route: "/warehouse/reports/show-reports/type-card",
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
          {!(viewTabTwoOnly || isTalaat) && <Tab>تقارير </Tab>}

          {!viewTabOneOnly ? (
            viewTabTwoOnly || isTalaat ? (
              <Tab>تقارير</Tab>
            ) : (
              <Tab>التقارير 2</Tab>
            )
          ) : null}
          
        </TabList>
        {!(viewTabTwoOnly || isTalaat) && (
          <TabPanel>
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
        )}
        <TabPanel>
          <ReportContentsSubStores />
        </TabPanel>
      </Tabs>
    </>
  );
}

export default ShowReports;
