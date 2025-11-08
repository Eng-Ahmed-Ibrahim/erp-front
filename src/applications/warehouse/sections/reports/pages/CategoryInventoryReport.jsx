import React, { useState, useEffect } from 'react';
import { Select, DatePicker, Button, Spin, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { getCategoryInventoryReport } from '../../../../../apis/reports';
import { getRecipeCategoryParent } from '../../../../../apis/recipes/recipeCategoryParent';
import { API_ENDPOINT } from '../../../../../../config';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import './CategoryInventoryReport.scss';

const { Option } = Select;

const CategoryInventoryReport = () => {
  const { id: departmentId } = useParams();
  const navigate = useNavigate();
  const tableRef = React.useRef();
  
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [sections, setSections] = useState([]);
  const defaultFrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const defaultTo = new Date().toISOString().split('T')[0];

  const [filterValues, setFilterValues] = useState({
    from: defaultFrom,
    to: defaultTo,
    department_id: departmentId || '',
    warehouse_section: '',
    parent_category_id: '',
    report_type: '1', // 1 = quantity, 2 = price
  });

  // Filter data states
  const [parentCategories, setParentCategories] = useState([]);

  // Fetch sections and parent categories
  useEffect(() => {
    if (!departmentId) {
      navigate('/warehouse/reports/show-reports/category-inventory-departments');
      return;
    }

    const fetchInitialData = async () => {
      try {
        // Fetch warehouse sections
        const sectionsResponse = await fetch(
          `${API_ENDPOINT}/api/v1/store/warehouse_sections`,
          {
            headers: {
              Authorization: `Bearer ${
                localStorage.getItem('token') || sessionStorage.getItem('token')
              }`,
            },
          }
        );
        const sectionsData = await sectionsResponse.json();
        setSections(sectionsData.data || []);

        // Fetch parent categories
        const parentCategoriesData = await getRecipeCategoryParent({}, '');
        setParentCategories(parentCategoriesData.data || []);
        
        // Set department name as ready
        setDepartmentName('loaded');
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('حدث خطأ في تحميل البيانات');
      }
    };

    fetchInitialData();
  }, [departmentId, navigate]);

  // Auto-fetch report data when department is loaded or filters change
  useEffect(() => {
    if (filterValues.from && filterValues.to && filterValues.department_id && departmentName) {
      fetchReportData();
    }
  }, [filterValues, departmentName]);


  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle date change
  const handleDateChange = (field, date) => {
    setFilterValues((prev) => ({
      ...prev,
      [field]: date ? date.format('YYYY-MM-DD') : null,
    }));
  };

  // Fetch report data
  const fetchReportData = async () => {
    if (!filterValues.from || !filterValues.to || !filterValues.department_id) {
      return;
    }

    try {
      const response = await getCategoryInventoryReport(filterValues, setIsLoading);
      if (response && response.data) {
        setData(response.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setData([]);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    if (data.length === 0) return null;

    return data.reduce(
      (acc, record) => ({
        initial_stock: acc.initial_stock + parseFloat(record.initial_stock || 0),
        total_incoming: acc.total_incoming + parseFloat(record.total_incoming || 0),
        total_outgoing: acc.total_outgoing + parseFloat(record.total_outgoing || 0),
        total_returned_to: acc.total_returned_to + parseFloat(record.total_returned_to || 0),
        total_returned_from: acc.total_returned_from + parseFloat(record.total_returned_from || 0),
        total_transferred: acc.total_transferred + parseFloat(record.total_transferred || 0),
        total_tainted: acc.total_tainted + parseFloat(record.total_tainted || 0),
        total: acc.total + parseFloat(record.total || 0),
      }),
      {
        initial_stock: 0,
        total_incoming: 0,
        total_outgoing: 0,
        total_returned_to: 0,
        total_returned_from: 0,
        total_transferred: 0,
        total_tainted: 0,
        total: 0,
      }
    );
  };

  const totals = calculateTotals();

  return (
    <div className="category-inventory-report">
      <h2
        className="heading text-center mb-4"
        style={{
          color: '#FFFFF',
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '30px',
          textShadow: '0 2px 4px rgba(128, 61, 59, 0.1)',
        }}
      >
        تقرير المخزون حسب التصنيفات
      </h2>

      {/* Filters Section */}
      <div
        className="mb-4"
        style={{
          padding: '0',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            alignItems: 'flex-end',
            width: '100%',
          }}
        >
          {/* Report Type */}
          <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
            <label
              className="form-label fw-bold"
              style={{
                color: 'var(--brown-color)',
                fontSize: '16px',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              نوع التقرير
            </label>
            <Select
              style={{ width: '100%' }}
              value={filterValues.report_type}
              onChange={(value) => handleFilterChange('report_type', value)}
              options={[
                { value: '1', label: 'كمية' },
                { value: '2', label: 'قيمة' },
              ]}
            />
          </div>

          {/* Warehouse Section Filter */}
          <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
            <label
              className="form-label fw-bold"
              style={{
                color: 'var(--brown-color)',
                fontSize: '16px',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              قسم المخزن
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر قسم المخزن"
              value={filterValues.warehouse_section}
              onChange={(value) => handleFilterChange('warehouse_section', value)}
              options={sections.map((section) => ({
                value: typeof section === 'string' ? section : section.id,
                label: typeof section === 'string' ? section : section.name,
              }))}
              allowClear
            />
          </div>

          {/* Parent Category Filter */}
          <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
            <label
              className="form-label fw-bold"
              style={{
                color: 'var(--brown-color)',
                fontSize: '16px',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              التصنيف الرئيسي
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر التصنيف الرئيسي"
              value={filterValues.parent_category_id}
              onChange={(value) => handleFilterChange('parent_category_id', value)}
              options={parentCategories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
              allowClear
            />
          </div>

          {/* From Date */}
          <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
            <label
              className="form-label fw-bold"
              style={{
                color: 'var(--brown-color)',
                fontSize: '16px',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              من تاريخ
            </label>
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              defaultValue={filterValues.from ? dayjs(filterValues.from) : null}
              onChange={(date) => handleDateChange('from', date)}
            />
          </div>

          {/* To Date */}
          <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
            <label
              className="form-label fw-bold"
              style={{
                color: 'var(--brown-color)',
                fontSize: '16px',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              إلى تاريخ
            </label>
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              defaultValue={filterValues.to ? dayjs(filterValues.to) : null}
              onChange={(date) => handleDateChange('to', date)}
            />
          </div>

          {/* Submit Button */}
          <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
            <Button
              type="primary"
              onClick={fetchReportData}
              loading={isLoading}
              style={{
                width: '100%',
                backgroundColor: 'var(--brown-color)',
                borderColor: 'var(--brown-color)',
              }}
            >
              عرض التقرير
            </Button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </div>
      ) : data.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
            ref={tableRef}
          >
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                  التصنيف الرئيسي
                </th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                  رصيد أول المدة
                </th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                  الوارد
                </th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                  المنصرف
                </th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                  المرتجع للمخزن
                </th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                  المرتجع من المخزن
                </th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                  المحول
                </th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                  الهالك
                </th>
                <th style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: 'bold' }}>
                  الرصيد النهائي
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>
                    {row.parent_category_name}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {parseFloat(row.initial_stock).toFixed(3)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {parseFloat(row.total_incoming).toFixed(3)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {parseFloat(row.total_outgoing).toFixed(3)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {parseFloat(row.total_returned_to).toFixed(3)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {parseFloat(row.total_returned_from).toFixed(3)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {parseFloat(row.total_transferred).toFixed(3)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {parseFloat(row.total_tainted).toFixed(3)}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center', fontWeight: 'bold' }}>
                    {parseFloat(row.total).toFixed(3)}
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              {totals && (
                <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                    الإجمالي
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {totals.initial_stock.toFixed(3)}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {totals.total_incoming.toFixed(3)}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {totals.total_outgoing.toFixed(3)}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {totals.total_returned_to.toFixed(3)}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {totals.total_returned_from.toFixed(3)}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {totals.total_transferred.toFixed(3)}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                    {totals.total_tainted.toFixed(3)}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'center', fontWeight: 'bold' }}>
                    {totals.total.toFixed(3)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ fontSize: '18px', color: '#666' }}>لا توجد بيانات لعرضها</p>
        </div>
      )}
    </div>
  );
};

export default CategoryInventoryReport;

