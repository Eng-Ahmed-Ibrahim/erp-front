import React, { useEffect, useState } from "react";
import { getAllTables } from "../../../../../../apis/cashier";
import TableCard from "../../../../../../components/ui/TableCard/TableCard";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./OpenedTables.scss";
const OpenedTables = () => {
  const [tables, setTables] = useState([]);
  const [order, setOrder] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const getTables = async () => {
      const res = await getAllTables(setIsLoading);
      setTables(res.data);
      // console.log(res.data);
    };
    getTables();
  }, []);
  return (
    <div className="table-cards-container">
      <h1 className="tables-title">الترابيزات المفتوحة</h1>

      <div className="row">
        {tables.length > 0 &&
          tables.map((table) => {
            return (
              <TableCard
                key={table.id}
                id={table.id}
                number={table.table_number}
                setOrder={setOrder}
              />
            );
          })}
        {tables.length === 0 && !isLoading && <p>لا يوجد نتائج</p>}
        {isLoading && tables.length === 0 && (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 56 }} spin />} />
        )}
      </div>
    </div>
  );
};

export default OpenedTables;
