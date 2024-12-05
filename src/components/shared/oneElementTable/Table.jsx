import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Pagination, Select } from "antd";
import "./Table.scss";
import { API_ENDPOINT } from "../../../../config";
import DeleteModal from "../../ui/DeleteModal/DeleteModal";
import ShowDataModal from "../../ui/showDataModalTakeaway/ShowDataModalTakeaway";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { usePDF } from 'react-to-pdf';
import { DownloadTableExcel } from 'react-export-table-to-excel';
const Table = ({
    title,
    fetchData,
    id,
    deleteFn,
    detailsHeaders,
    updateFn,
    changeStatusFn,
    rejectTitle,
    acceptTitle,
    closeAfterEdit,
    isRequests,
}) => {
    const tableRef = useRef(null);
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [item, setItem] = useState({});
    const [isDeleteModalVisible, setisDeleteModalVisible] = useState(false);
    const [isShowModalVisible, setisShowModalVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [filterValues, setFilterValues] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const { location } = useLocation();
    const { toPDF, targetRef } = usePDF({ filename: 'page.pdf' });

    useEffect(() => {
        fetchData()
            .then((result) => {
                setData(result.data);
                setItem(result.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setIsLoading(false);
            });
    }, [
        fetchData,
        isShowModalVisible,
    ]);

    return (
        <section className="content-area-table">
            {isShowModalVisible && (
                <ShowDataModal
                    id={id}
                    acceptTitle={acceptTitle}
                    rejectTitle={rejectTitle}
                    responseData={item}
                    handleModalVisible={setisShowModalVisible}
                    detailsHeaders={detailsHeaders}
                    updateFn={updateFn}
                    changeStatusFn={changeStatusFn}
                    closeAfterEdit={closeAfterEdit}
                />
            )}
        </section>
    );
};
export default Table;