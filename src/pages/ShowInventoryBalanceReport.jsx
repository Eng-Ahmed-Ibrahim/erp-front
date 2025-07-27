import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINT } from '../../config';
import { Pagination, Select, message } from 'antd';
import { usePDF } from 'react-to-pdf';
import { useAuth } from '../context/AuthContext';
import '../fonts/Amiri-Regular-normal.js';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import LogoDAR from '../../public/assets/images/Dar_logo.svg';
import { useMemo } from 'react';
import generatePDF, { Resolution, Margin } from 'react-to-pdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DownloadTableExcel } from 'react-export-table-to-excel';

const ShowInventoryBalanceReport = () => {
  const tableRef = useRef();

  const item = useLocation()?.state?.item;
  const [isPending, setIsPending] = useState(false);
  const [searchItem, setSearchItem] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [reportType, setReportType] = useState('');
  const [recipeCategoryParents, setRecipeCategoryParents] = useState([]);

  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const startDate = new Date(2024 - 11 - 12);
  const Token =
    localStorage.getItem('token') || sessionStorage.getItem('token');
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { id } = useParams();
  console.log(id);
  useEffect(() => {
    fetchRecipeCategoryParents();

    setIsPending(true);
    axios
      ?.get(`${API_ENDPOINT}/api/v1/store/inventory_balance`, {
        params: {
          data: {
            from: '2024-11-12',
            to: toDate,
            department_id: id,
          },
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        setIsPending(false);
        setData(res?.data);
      })
      .catch((err) => {
        setIsPending(false);
      });
  }, [currentPage]);
  const fetchRecipeCategoryParents = async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/store/recipe_category_parent/all`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const data = await response.json();
      setRecipeCategoryParents(data.data);
    } catch (error) {
      console.error('Error fetching recipe category parents:', error);
    }
  };

  const options = [
    { name: 'كميات ', id: 1 },
    { name: 'أسعار', id: 2 },
  ];

  const handleSavePDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = 190;
      const pageHeight = 277;
      const leftMargin = 10;
      const topMargin = 5;

      const table = tableRef.current;

      const canvas = await html2canvas(table, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowHeight: table.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.85);

      const imgWidth = pageWidth;
      const totalHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = totalHeight;
      let position = topMargin;
      let pageNumber = 1;
      pdf.setFont('Amiri-Regular');
      pdf.setFontSize(11);
      // pdf.text("تقرير المخازن", 105, 10, { align: "center" });

      pdf.addImage(
        imgData,
        'JPEG',
        leftMargin,
        position,
        imgWidth,
        totalHeight
      );
      heightLeft -= pageHeight - position;
      while (heightLeft > 0) {
        pdf.addPage();
        pageNumber++;
        position = -(totalHeight - heightLeft);

        pdf.text('تقرير المخازن (استمرار)', leftMargin, 15);

        pdf.addImage(
          imgData,
          'JPEG',
          leftMargin,
          position,
          imgWidth,
          totalHeight
        );
        heightLeft -= pageHeight;
      }

      const totalPages = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        pdf.setFontSize(10);

        const text = `الصفحة ${i} من ${totalPages}`;
        const textWidth = 190;
        const textHeight = 5;

        const textX = pageWidth + leftMargin - 5;
        const textY = pageHeight + 12;
        const bgX = textX - textWidth;
        const bgY = textY - textHeight;

        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, bgY, textWidth + 10, textHeight + 15, 'F');

        if (i) {
          pdf.rect(0, 0, textWidth + 10, 5, 'F');
        }

        pdf.text(text, 105, textY, { align: 'right' });
      }

      pdf.save('ميزان مخزني.pdf');
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    }
  };

  const handleFilterData = () => {
    setIsPending(true);
    axios
      ?.get(`${API_ENDPOINT}/api/v1/store/inventory_balance`, {
        params: {
          data: {
            from: fromDate,
            to: toDate,
            department_id: id,
            name: searchItem,
            category_id: categoryId,
            report_type: reportType,
          },
        },
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      })
      .then((res) => {
        setIsPending(false);
        setData(res?.data);
      })
      .catch((err) => {
        setIsPending(false);
        message.error(err.response.data.message);
        console.error('Error fetching data:', err);
      });
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  // Calculate column sums
  const columnSums = (data?.data || []).reduce(
    (acc, item) => {
      acc.initial_stock += Number(item.initial_stock) || 0;
      acc.total_incoming += Number(item.total_incoming) || 0;
      acc.total_outgoing += Number(item.total_outgoing) || 0;
      acc.total_returned_to += Number(item.total_returned_to) || 0;
      acc.total_returned_from += Number(item.total_returned_from) || 0;
      acc.total_tainted += Number(item.total_tainted) || 0;
      acc.total += Number(item.total) || 0;
      return acc;
    },
    {
      initial_stock: 0,
      total_incoming: 0,
      total_outgoing: 0,
      total_returned_to: 0,
      total_returned_from: 0,
      total_tainted: 0,
      total: 0,
    }
  );

  const sumRowStyles = `
.sum-row {
  background: #f3efe6;
  font-weight: bold;
  color: #6d4c1b;
  font-size: 19px;
  box-shadow: 0 2px 8px rgba(128,61,59,0.04);
}
.sum-cell {
  padding: 14px 12px;
  border: 1px solid #E4C59E;
  font-size: 19px;
  font-weight: 700;
  color: #803D3B;
  background: #f3efe6;
}
.sum-cell-first {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  background: #e9dcc9;
}
.sum-cell-last {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  background: #e9dcc9;
}
`;

  if (
    typeof window !== 'undefined' &&
    !document.getElementById('sum-row-styles')
  ) {
    const style = document.createElement('style');
    style.id = 'sum-row-styles';
    style.innerHTML = sumRowStyles;
    document.head.appendChild(style);
  }

  return (
    <div>
      <div className="my-5 ">
        <h1 className="heading text-center p-3"> الميزان المخزنى</h1>
      </div>
      <div className="row-display">
        <div className="mb-3">
          <label htmlFor="exampleFormControlInput1" className="form-label">
            من
          </label>
          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
            }}
            min="2024-11-12"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="exampleFormControlInput1" className="form-label">
            الى
          </label>
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value.toString().split('T')[0]);
            }}
            min="2024-11-12"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="exampleFormControlInput1" className="form-label">
            الاسم
          </label>
          <input
            className="form-control"
            type="text"
            placeholder="إبحث باللإسم"
            onChange={(e) => {
              setSearchItem(e.target.value.toString());
            }}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            القسم :
          </label>
          <select
            className="form-control"
            aria-label="المنفذ"
            value={categoryId}
            onChange={(e) => {
              const selectedText = e.target.selectedOptions[0].text;
              setCategoryId(e.target.value);
            }}
          >
            <option value=""> من فضلك اختر القسم</option>
            {recipeCategoryParents.map((parent, index) => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
            نوع التقرير
          </label>
          <select
            className="form-control"
            aria-label="المنفذ"
            value={reportType}
            onChange={(e) => {
              // const selectedText = e.target.selectedOptions[0].text;
              setReportType(e.target.value);
            }}
          >
            <option value=""> إختر نوع التقرير</option>
            {options.map((option, index) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={handleSavePDF} className="pdf-button">
          {' '}
          حفظ PDF
        </button>

        <DownloadTableExcel
          filename="ميزان مخزني"
          sheet="users"
          currentTableRef={tableRef.current}
        >
          <button className="pdf-button white-space-nowrap">حفظ اكسيل </button>
        </DownloadTableExcel>

        <button onClick={handleFilterData} className="pdf-button">
          {' '}
          فلتره
        </button>
      </div>
      <table
        className="table table table-hover mt-5"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          color: 'var(--text-color-inverted)',
        }}
        ref={tableRef}
      >
        <thead>
          <tr className="fw-bold fs-5 my-3">
            <th scope="col" style={{ background: '#edede9' }}>
              الرقم
            </th>

            <th scope="col" style={{ background: '#edede9' }}>
              الصنف
            </th>
            <th scope="col" style={{ background: '#edede9' }}>
              رصيد اول المده
            </th>
            <th scope="col" style={{ background: '#edede9' }}>
              مورد
            </th>
            <th scope="col" style={{ background: '#edede9' }}>
              صرف
            </th>
            <th scope="col" style={{ background: '#edede9' }}>
              مرتجع منه
            </th>
            <th scope="col" style={{ background: '#edede9' }}>
              مرتجع اليه
            </th>
            <th scope="col" style={{ background: '#edede9' }}>
              الهالك
            </th>
            <th scope="col" style={{ background: '#edede9' }}>
              الجرد الفعلى
            </th>
            <th scope="col" style={{ background: '#edede9' }}>
            الاجمالى
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Sum row */}
          {data?.data?.length > 0 && (
            <tr className="sum-row">
              <td className="sum-cell sum-cell-first">المجموع</td>
              <td className="sum-cell"></td>
              <td className="sum-cell">
                {Number(columnSums.initial_stock).toFixed(2)}
              </td>
              <td className="sum-cell">
                {Number(columnSums.total_incoming).toFixed(2)}
              </td>
              <td className="sum-cell">
                {Number(columnSums.total_outgoing).toFixed(2)}
              </td>
              <td className="sum-cell">
                {Number(columnSums.total_returned_to).toFixed(2)}
              </td>
              <td className="sum-cell">
                {Number(columnSums.total_returned_from).toFixed(2)}
              </td>
              <td className="sum-cell">
                {Number(columnSums.total_tainted).toFixed(2)}
              </td>
              <td className="sum-cell"></td>
              <td className="sum-cell sum-cell-last">
                {Number(columnSums.total).toFixed(2)}
              </td>
            </tr>
          )}
          {data?.data?.map((item, index) => (
            <tr key={index} className="content-area-table">
              <th scope="row">{index + 1}</th>
              <td
                className="clickable-cell"
                style={{
                  padding: ' 14px 12px',
                  border: '1px solid #E4C59E',
                  color: '#803D3B',
                  fontSize: '18px',
                  fontWeight: '700',
                }}
              >
                {item.recipe_name}
              </td>
              <td
                className="clickable-cell"
                style={{
                  padding: ' 14px 12px',
                  border: '1px solid #E4C59E',
                  color: '#803D3B',
                  fontSize: '18px',
                  fontWeight: '700',
                }}
              >
                {item.initial_stock}
              </td>
              <td
                className="clickable-cell"
                style={{
                  padding: ' 14px 12px',
                  border: '1px solid #E4C59E',
                  color: '#803D3B',
                  fontSize: '18px',
                  fontWeight: '700',
                }}
              >
                {item.total_incoming}
              </td>
              <td
                className="clickable-cell"
                style={{
                  padding: ' 14px 12px',
                  border: '1px solid #E4C59E',
                  color: '#803D3B',
                  fontSize: '18px',
                  fontWeight: '700',
                }}
              >
                {item.total_outgoing}
              </td>
              <td
                className="clickable-cell"
                style={{
                  padding: ' 14px 12px',
                  border: '1px solid #E4C59E',
                  color: '#803D3B',
                  fontSize: '18px',
                  fontWeight: '700',
                }}
              >
                {item.total_returned_to}
              </td>
              <td
                className="clickable-cell"
                style={{
                  padding: ' 14px 12px',
                  border: '1px solid #E4C59E',
                  color: '#803D3B',
                  fontSize: '18px',
                  fontWeight: '700',
                }}
              >
                {item.total_returned_from}
              </td>
              <td
                className="clickable-cell"
                style={{
                  padding: ' 14px 12px',
                  border: '1px solid #E4C59E',
                  color: '#803D3B',
                  fontSize: '18px',
                  fontWeight: '700',
                }}
              >
                {item.total_tainted}
              </td>
              <td
                className="clickable-cell"
                style={{
                  padding: ' 14px 12px',
                  border: '1px solid #E4C59E',
                  color: '#803D3B',
                  fontSize: '18px',
                  fontWeight: '700',
                }}
              ></td>
              <td
                className="clickable-cell"
                style={{
                  padding: ' 14px 12px',
                  border: '1px solid #E4C59E',
                  color: '#803D3B',
                  fontSize: '18px',
                  fontWeight: '700',
                }}
              >
                {item.total}
              </td>
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

export default ShowInventoryBalanceReport;
