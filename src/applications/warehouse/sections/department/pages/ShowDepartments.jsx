import Table from '../../../../../components/shared/table/Table';
import '../../../../../components/shared/table/Table.scss';
import {
  deleteDeaprtment,
  getDeaprtments,
} from '../../../../../apis/department';
import { Pagination, Select } from 'antd';
import { useAuth } from '../../../../../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_ENDPOINT } from '../../../../../../config';
const ShowDepartment = () => {
  const Token =
    localStorage.getItem('token') || sessionStorage.getItem('token');
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [name, setName] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/store/department?page=${currentPage}`, {
        params: {
          name: name,
          include_invoices: false,
          section_id: selectedSection,
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        setData(res?.data);
      });
  }, [currentPage, name, selectedSection]);

  useEffect(() => {
    axios
      .get(`${API_ENDPOINT}/api/v1/department/sections`, {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        setSections(res.data?.data);
      });
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h2 className="heading text-center">المخازن الفرعية</h2>
      <div
        style={{
          alignItems: 'center',
          gap: '20px',
          justifyContent: 'center',
          display: 'flex',
        }}
      >
        <Select
          placeholder="اختر القسم"
          style={{ width: '250px', alignSelf: 'center' }}
          allowClear
          showSearch
          optionFilterProp="name"
          value={selectedSection}
          onChange={(value) => setSelectedSection(value)}
          className="form-select"
          size="large"
          options={sections?.map((section) => ({
            label: section?.name,
            value: section?.id,
          }))}
        />
        <input
          className="form-input"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          placeholder="ابحث باسم القسم"
          style={{ width: '250px', alignSelf: 'center' }}
        />
      </div>{' '}
      <table
        // className="table table  table-bordered table-hover mt-5"
        className="table table table-hover mt-5"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          color: 'var(--text-color-inverted)',
        }}
      >
        <thead>
          <tr className="fw-bold fs-5 my-3" style={{color : "803D3B"}}>
            <th scope="col" style={{ background: '#edede9' }}>
              الرقم
            </th>
            <th scope="col" style={{ background: '#edede9' }}>
              الكود
            </th>
            <th scope="col" style={{ background: '#edede9' }}>
              الاسم
            </th>
          </tr>
        </thead>
        <tbody style={{ borderColor: '#af8260' }}>
          {data?.data?.map((item, index) => (
            <tr key={index} className="content-area-table">
              <th
                className="clickable-cell"
                style={{
                  padding: ' 14px 12px',
                  border: '1px solid #E4C59E',
                  color: '#803D3B',
                  fontSize: '18px',
                  fontWeight: '700',
                }}
              >
                {index + 1}
              </th>
              <th
                className="clickable-cell"
                style={{
                  padding: ' 14px 12px',
                  border: '1px solid #E4C59E',
                  color: '#803D3B',
                  fontSize: '18px',
                  fontWeight: '700',
                }}
              >
                {item?.code}
              </th>
              <th
                className="clickable-cell"
                style={{
                  border: '1px solid #E4C59E',
                  color: '#803D3B',
                  fontSize: '18px',
                  fontWeight: '700',
                }}
              >
                <Link
                  to={`/warehouse/departments/show-departments/product2/${item?.id}`}
                  state={{ item }}
                  className="text-decoration-none text-dark"
                  style={{
                    padding: ' 14px 12px',
                    width: '100%',
                    height: '100%',
                    display: 'block',
                  }}
                >
                  {item?.name}
                </Link>
              </th>
            </tr>
          ))}
        </tbody>
      </table>
      {data?.data?.length > 0 && (
        <Pagination
          className="pagination"
          current={currentPage}
          onChange={handlePageChange}
          total={data?.pagination?.total || 1}
          showSizeChanger={false}
        />
      )}
    </div>
  );
};

export default ShowDepartment;
