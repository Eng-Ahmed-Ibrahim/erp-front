import { Link } from "react-router-dom";

const ReportContentsSubStores = () => {
  const reports = [
    {
      id: 1,
      name: "تقرير محتويات المخازن الفرعية عن مده",
      img: "http://10.0.0.6:50000/public/assets/images/1.jpg",
      route: "/warehouse/reports/ShowSupplierInvoicesReport/inventory",
    },
    {
      id: 2,
      name: "تقرير مبيعات الكاشير عن مده",
      img: "http://10.0.0.6:50000/public/assets/images/1.jpg",
      route: "/warehouse/reports/ShowSupplierInvoicesReport/cashier",
    },
  ];
  return (
    <div>
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
