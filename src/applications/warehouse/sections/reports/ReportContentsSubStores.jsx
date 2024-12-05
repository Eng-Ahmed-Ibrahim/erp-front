import { Link } from "react-router-dom";
import Report2 from "../../../../../public/assets/images/2.jpg";
import Report1 from "../../../../../public/assets/images/1.jpg";
import Report3 from "../../../../../public/assets/images/5.jpg";

const ReportContentsSubStores = () => {
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
    // {
    //   id: 2,
    //   name: "تقرير الايرادات المفصل عن مده",
    //   img: `${Report3}`,
    //   route: "/warehouse/reports/ShowAllSalesDetails/Reports",
    // },
  ];
  return (
    <div style={{ display:"flex",flexDirection:"row", padding: "20px 20px",gap:"40px" }}>
      {reports?.map((item, index) => (
        <Link to={item?.route} style={{ textDecoration: 'none' }}>
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
