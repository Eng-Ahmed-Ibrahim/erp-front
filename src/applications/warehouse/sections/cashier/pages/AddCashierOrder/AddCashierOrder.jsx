import React, { useState, useEffect, useCallback, useRef } from 'react';
import TotalAmount from '../../../../../../components/shared/totalAmount/TotalAmount';
import LogoDAR from '../../../../../../../public/assets/images/Dar_logo.svg';
import './AddCashierOrder.scss';
import axios from 'axios';
import { API_ENDPOINT } from '../../../../../../../config';
import { message, Select, Modal } from 'antd';
import { useAuth } from '../../../../../../context/AuthContext';
// import { checkTableNumber } from "../../../../../../apis/orders";
import CashierOrderDetailes from '../../../../../../components/shared/CashierOrderDetails/CashierOrderDetailes';
import CashierItemList from '../../../../../../components/shared/CashierItemList/CashierItemList';
import { getClientTypeById } from '../../../../../../apis/clients/ClientType';
import Table from '../../../../../../components/shared/oneElementTable/Table';
import {
  changeOrderStatus,
  getOrders,
  deleteOrder,
  getOrderById,
  checkTableNumber,
  reviewOrderPrice,
} from '../../../../../../apis/orders';
import { readCardAndGetMembershipId } from '../../../../../../apis/membershipCards';
// import { getOrderById, deleteOrder } from "../../../../../../apis/orders";
import { getRoles } from '../../../../../../apis/roles';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print'; // Import the hook
import {
  Br,
  Cut,
  Line,
  Printer,
  Text,
  Row,
  render,
} from 'react-thermal-printer';
import { is } from 'date-fns/locale';
import { use } from 'i18next';

function PrintAfterFinish({ id, table_no, user }) {
  const componentRef = useRef();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // New loading state
  const [data, setData] = useState({
    code: '',
    status: '',
    client: '',
    invoice_date: '',
    client_type: '',
    recipeData: [],
    total_price: 0,
    total_price_after_discount_and_tax: 0,
    departmentName: '',
    cashier: '',
    payment: '',
    secondary_currency: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await changeOrderStatus(id, 'closed');

        await new Promise((resolve) => setTimeout(resolve, 500));

        const OrderData = await getOrderById(id);

        if (OrderData.data && OrderData.data.status === 'closed') {
          setData({
            code: OrderData.data.code,
            cashier: OrderData.data.casher,
            products: OrderData.data.products,
            payment_method: OrderData.data.payment_method,
            order_date: OrderData.data.order_date,
            client: OrderData.data.client,
            payment: OrderData.data.payment_method,
            status: OrderData.data.status,
            invoice_date: OrderData.data.order_date,
            table_number: OrderData.data.table_number,
            client_type: OrderData.data.client_type,
            recipeData: OrderData.data.products,
            price: OrderData.data.price,
            total_price: OrderData.data.total_price,
            waiter_name: OrderData.data.waiter.name,
            total_price_after_discount_and_tax:
              OrderData.data.total_price_after_discount_and_tax,
            departmentName: OrderData.data.department,
            secondary_currency: OrderData.data.secondary_currency,
          });
        }
      } catch (error) {
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchData();
  }, [id]);

  const generatePDF = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${data.code + '-' + 'أوردر كود'}`,
    onAfterPrint: () => {
      window.location.reload();
    },
  });

  useEffect(() => {
    if (!loading && data.code) {
      generatePDF();
    }
  }, [loading, data]);

  return (
    <div
      id="invoice-container"
      ref={componentRef}
      dir="rtl"
      style={{ display: 'flex', justifyContent: 'center' }}
    >
      <Printer ref={componentRef} className="main">
        <div className="headers-wrapper">
          <div className="main-title">
            <p> أوردر من {data.departmentName}</p>
          </div>
          <div className="header-img">
            <img
              src={LogoDAR}
              alt=""
              style={{ width: '64px', marginBottom: '5px', marginLeft: '5px' }}
            />
          </div>
        </div>
        <div className="invoice-info">
          <div className="invoice-info-item">
            <p>كـــــود الأوردر : {data.code}</p>
            <p>تـاريـــخ الأوردر : {data.order_date}</p>
            <p>رقم الترابيزة : {table_no}</p>
          </div>
          <div className="invoice-info-item">
            <p>اسم الكاشير : {data.cashier}</p>
            <p>اسم الويتر : {data.waiter_name}</p>
            <p>اسم العميل : {data.client === '' ? 'Guest' : data.client}</p>
            <p>الفئة : {data.client_type}</p>
            <p>طريقة الدفع : {data.payment_method}</p>
          </div>
        </div>
        <div className="invoice-items">
          <h2>محــــــتويات الأوردر</h2>
          <table>
            <thead>
              <tr>
                <th className="text-center">رقم العنصر</th>
                <th className="text-center">اسم العنصر</th>
                <th className="text-center">سعر العنصر الواحد</th>
                <th className="text-right">الكمية</th>
              </tr>
            </thead>
            <tbody>
              {data.products?.map((recipe, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">{recipe.name}</td>
                  <td className="text-center">{recipe.price}</td>
                  <td className="text-right">{recipe.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="text-price" colSpan={2}>
                  السعر الكلي
                </td>
                <td className="text-price" colSpan={2}>
                  {data.secondary_currency
                    ? `${data?.products?.map((product) => product.quantity).reduce((acc, curr) => acc + curr, 0)} ${data.secondary_currency.name_ar || data.secondary_currency.code}`
                    : `${data.price?.toFixed(2)} ج.م`
                  }
                </td>
              </tr>
              <tr>
                <td className="text-price" colSpan={2}>
                  السعر الكلي بعد الخصم
                </td>
                <td className="text-price" colSpan={2}>
                  {data.secondary_currency
                    ? `${data?.products?.map((product) => product.quantity).reduce((acc, curr) => acc + curr, 0)}  ${data.secondary_currency.name_ar || data.secondary_currency.code}`
                    : `${data.total_price?.toFixed(2)} ج.م`
                  }
                </td>
              </tr>
            </tfoot>
          </table>

          <p></p>
          <hr />
          {user.department?.has_instructions &&
            user.department?.instructions.split(',').length > 0 && (
              <>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col"> تعليمات {user?.department?.name} </th>
                    </tr>
                  </thead>

                  <tbody>
                    {user.department?.instructions
                      ?.split(',')
                      .map((instruction, index) => (
                        <tr>
                          <th scope="row">{index + 1}</th>

                          <td>{instruction}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </>
            )}
        </div>
        <Cut />
      </Printer>
    </div>
  );
}

// Scanner Modal Component for Subscription Attendance
function SubscriptionScannerModal({ show, onHide }) {
  const [scannedData, setScannedData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [subscriberInfo, setSubscriberInfo] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const fetchSubscriberInfo = async (scannedData) => {
    try {
      setVerificationLoading(true);
      setError('');

      const Token =
        localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/activities-subscriptions/subscriptions/verify`,
        {
          scanned_data: scannedData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Token}`,
          },
        }
      );

      if (response.data.success) {
        setSubscriberInfo(response.data);
        setShowVerification(true);
      }
    } catch (error) {
      console.error('Error fetching subscriber info:', error);
      const errorMessage =
        error.response?.data?.message || 'حدث خطأ في جلب بيانات المشترك';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleScan = async () => {
    if (!scannedData.trim()) {
      setError('يرجى إدخال بيانات الباركود');
      return;
    }

    if (autoSubmit) {
      // Auto-submit mode: directly submit attendance
      await submitAttendance();
    } else {
      // Verification mode: fetch subscriber info first
      await fetchSubscriberInfo(scannedData);
    }
  };

  const submitAttendance = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const Token =
        localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/activities-subscriptions/subscriptions/attendance`,
        {
          scanned_data: scannedData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Token}`,
          },
        }
      );

      if (response.data.success) {
        setResult({
          success: true,
          message: response.data.message,
          subscription: response.data.subscription,
          remaining_classes: response.data.remaining_classes,
          remaining_hours: response.data.remaining_hours,
        });

        message.success('تم تسجيل الحضور بنجاح!');
        setScannedData('');
        setShowVerification(false);
        setSubscriberInfo(null);
      }
    } catch (error) {
      console.error('Error scanning subscription:', error);
      const errorMessage =
        error.response?.data?.message || 'حدث خطأ في مسح الباركود';
      setError(errorMessage);
      setResult({
        success: false,
        message: errorMessage,
      });

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setScannedData('');
    setResult(null);
    setError('');
    setSubscriberInfo(null);
    setShowVerification(false);
    setVerificationLoading(false);
    onHide();
  };

  return (
    <Modal
      title="مسح باركود الاشتراك"
      open={show}
      onCancel={handleClose}
      onOk={handleClose}
      width={600}
      centered
      className="subscription-scanner-modal"
      footer={[
        // Show scan button when not in verification mode
        !showVerification && (
          <button
            key="scan"
            onClick={handleScan}
            disabled={loading || verificationLoading || !scannedData.trim()}
            className="btn btn-primary scanner-button"
            style={{
              backgroundColor: '#803D3B',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor:
                loading || verificationLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            {loading
              ? 'جاري المعالجة...'
              : verificationLoading
              ? 'جاري التحقق...'
              : 'مسح الباركود'}
          </button>
        ),
        // Show confirm button when in verification mode
        showVerification && (
          <button
            key="confirm"
            onClick={submitAttendance}
            disabled={loading}
            className="btn btn-success scanner-button"
            style={{
              backgroundColor: '#803D3B',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor:
                loading || verificationLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            {loading ? 'جاري التسجيل...' : 'تأكيد وتسجيل الحضور'}
          </button>
        ),
        // Show cancel button when in verification mode
        showVerification && (
          <button
            key="cancel"
            onClick={() => {
              setShowVerification(false);
              setSubscriberInfo(null);
              setScannedData('');
            }}
            className="btn btn-secondary scanner-button"
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              marginRight: '8px',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            إلغاء
          </button>
        ),
        // Show close button when not in verification mode
        !showVerification && (
          <button
            key="close"
            onClick={handleClose}
            className="btn btn-secondary scanner-button"
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              marginRight: '8px',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            إغلاق
          </button>
        ),
      ]}
    >
      <div style={{ padding: '20px 0', fontFamily: 'Cairo, sans-serif' }}>
        {/* Auto-submit toggle */}
        <div
          style={{
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <input
            type="checkbox"
            id="autoSubmit"
            checked={autoSubmit}
            onChange={(e) => setAutoSubmit(e.target.checked)}
            style={{ transform: 'scale(1.2)' }}
          />
          <label
            htmlFor="autoSubmit"
            style={{
              fontWeight: 'bold',
              fontFamily: 'Cairo, sans-serif',
              cursor: 'pointer',
            }}
          >
            تلقائي (تسجيل الحضور مباشرة)
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            className="scanner-label"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            بيانات الباركود:
          </label>
          <input
            type="text"
            value={scannedData}
            onChange={(e) => setScannedData(e.target.value)}
            placeholder="أدخل بيانات الباركود الممسوح"
            className="scanner-input"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              fontFamily: 'Cairo, sans-serif',
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleScan();
              }
            }}
          />
        </div>

        {error && (
          <div
            className="scanner-error"
            style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px',
              border: '1px solid #f5c6cb',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            <strong>خطأ:</strong> {error}
          </div>
        )}

        {/* Verification UI */}
        {verificationLoading && (
          <div
            style={{
              backgroundColor: '#e3f2fd',
              color: '#1565c0',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px',
              border: '1px solid #bbdefb',
              fontFamily: 'Cairo, sans-serif',
              textAlign: 'center',
            }}
          >
            <strong>جاري التحقق من بيانات المشترك...</strong>
          </div>
        )}

        {showVerification && subscriberInfo && (
          <div
            className="verification-info"
            style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              border: '2px solid #803D3B',
              borderRadius: '12px',
              marginBottom: '20px',
              fontFamily: 'Cairo, sans-serif',
              boxShadow: '0 4px 12px rgba(128, 61, 59, 0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #803D3B 0%, #6B2D2B 100%)',
                color: 'white',
                padding: '16px 20px',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ color: 'white' }}
                >
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h4
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '700',
                  fontFamily: 'Cairo, sans-serif',
                }}
              >
                تأكيد بيانات المشترك
              </h4>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
              {/* Subscriber Info Card */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#803D3B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: '8px',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ color: 'white' }}
                    >
                      <path
                        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div
                    style={{
                      fontSize: '15px',
                      color: '#495057',
                      fontFamily: 'Cairo, sans-serif',
                      lineHeight: '1.6',
                    }}
                  >
                    <strong>اسم المشترك:</strong>
                    {'     '}
                    <span
                      style={{
                        color: '#803D3B',
                        fontWeight: '600',
                        marginRight: '10px',
                      }}
                    >
                      {subscriberInfo.subscription?.subscriber_name ||
                        'غير محدد'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Academy & Offer Info Card */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#803D3B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: '8px',
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ color: 'white' }}
                    >
                      <path
                        d="M22 12h-4l-3 9L9 3l-3 9H2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '15px',
                    color: '#495057',
                    fontFamily: 'Cairo, sans-serif',
                    lineHeight: '1.6',
                  }}
                >
                  <div>
                    <strong>الأكاديمية:</strong>{' '}
                    <span style={{ color: '#803D3B', fontWeight: '600' }}>
                      {subscriberInfo.subscription?.academy_name || 'غير محدد'}
                    </span>
                  </div>
                  <div>
                    <strong>العرض:</strong>{' '}
                    <span style={{ color: '#803D3B', fontWeight: '600' }}>
                      {subscriberInfo.subscription?.offer_name || 'غير محدد'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remaining Balance Card */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                ></div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    fontSize: '15px',
                    color: '#495057',
                    fontFamily: 'Cairo, sans-serif',
                    lineHeight: '1.6',
                  }}
                >
                  {subscriberInfo.remaining_classes !== undefined && (
                    <div
                      style={{
                        backgroundColor: '#f8f9fa',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#803D3B',
                          marginBottom: '4px',
                        }}
                      >
                        {subscriberInfo.remaining_classes}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6c757d' }}>
                        الحصص المتبقية
                      </div>
                    </div>
                  )}
                  {subscriberInfo.remaining_hours !== undefined && (
                    <div
                      style={{
                        backgroundColor: '#f8f9fa',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '24px',
                          fontWeight: '700',
                            color: '#803D3B',
                          marginBottom: '4px',
                        }}
                      >
                        {subscriberInfo.remaining_hours}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6c757d' }}>
                        الساعات المتبقية
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div
            className="scanner-result"
            style={{
              backgroundColor: result.success ? '#d4edda' : '#f8d7da',
              color: result.success ? '#155724' : '#721c24',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px',
              border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            <strong>{result.success ? 'نجح:' : 'فشل:'}</strong> {result.message}
            {result.success && result.subscription && (
              <div
                style={{ marginTop: '10px', fontFamily: 'Cairo, sans-serif' }}
              >
                <p>
                  <strong>اسم المشترك:</strong>{' '}
                  {result.subscription.subscriber_name}
                </p>
                <p>
                  <strong>اسم الأكاديمية:</strong>{' '}
                  {result.subscription.academy_name}
                </p>
                {result.remaining_classes !== undefined && (
                  <p>
                    <strong>الحصص المتبقية:</strong> {result.remaining_classes}
                  </p>
                )}
                {result.remaining_hours !== undefined && (
                  <p>
                    <strong>الساعات المتبقية:</strong> {result.remaining_hours}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function OrderReviewModal({ show, onHide, items, clientType, client }) {
  const { user } = useAuth();

  const [data, setData] = useState({
    client: 'Guest',
    products: [],
    client_type: '',
    total_price: 0,
    departmentName: user?.department?.name,
    cashier: user?.name || '',
    price: 0,
  });

  const fetchData = async () => {
    if (!items.length) return;

    try {
      const OrderData = await reviewOrderPrice(
        items,
        clientType?.id,
        client?.id,
        user?.department?.id
      );
      setData((prevData) => ({
        ...prevData,
        products: items,
        client: client?.name || 'Guest',
        client_type: clientType?.name || '',
        price: OrderData?.data?.price || 0,
        total_price: OrderData?.data?.total_price || 0,
      }));
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [items, client, clientType]);
  return (
    <Modal
      centered
      open={show}
      onCancel={onHide}
      onOk={onHide}
      width={900}
      footer={null}
    >
      <div className="headers-wrapper">
        <div className="main-title">
          <p> أوردر من {data.departmentName}</p>
        </div>
        <div className="header-img">
          <img
            src={LogoDAR}
            alt=""
            style={{
              width: '64px',
              marginBottom: '5px',
              marginLeft: '5px',
            }}
          />
        </div>
      </div>
      <div className="invoice-info">
        <div className="invoice-info-item">
          <p>تـاريـــخ الأوردر : {new Date().toISOString().split('T')[0]}</p>
        </div>
        <div className="invoice-info-item">
          <p>اسم الكاشير : {data?.cashier}</p>
          <p>اسم العميل : {data.client === '' ? 'Guest' : data.client}</p>
          <p>الفئة : {data.client_type}</p>
        </div>
      </div>
      <div className="invoice-items">
        <h2>محــــــتويات الأوردر</h2>
        <table>
          <thead>
            <tr>
              <th className="text-center">رقم العنصر</th>
              <th className="text-center">اسم العنصر</th>
              <th className="text-center">سعر العنصر الواحد</th>
              <th className="text-right">الكمية</th>
            </tr>
          </thead>
          <tbody>
            {data.products?.map((product, index) => (
              <tr key={index}>
                <td className="text-center">{index + 1}</td>
                <td className="text-center">{product.name}</td>
                <td className="text-center">{product.price}</td>
                <td className="text-right">{product.quantity}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="text-price" colSpan={2}>
                السعر الكلي
              </td>
              <td className="text-price" colSpan={2}>
                {data.price?.toFixed(2)} ج.م
              </td>
            </tr>
            <tr>
              <td className="text-price" colSpan={2}>
                الخصم
              </td>
              <td className="text-price" colSpan={2}>
                {(data?.price - data?.total_price)?.toFixed(2)} ج.م
              </td>
            </tr>
            <tr>
              <td className="text-price" colSpan={2}>
                السعر الكلي بعد الخصم
              </td>
              <td className="text-price" colSpan={2}>
                {data.total_price?.toFixed(2)} ج.م
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Modal>
  );
}

const { Option } = Select;

const AddCashierOrder = () => {
  const { user } = useAuth();
  const [clientTypes, setClientTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [errors, setErrors] = useState({});
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [discountReasons, setDiscountReasons] = useState([]);
  const [flag, setFlag] = useState(false);
  const [printData, setPrintData] = useState();
  const [selectedPaymentMethodNakdy, setSelectedPaymentMethodNakdy] =
    useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    'dc2a3eb5-0efd-4bed-a297-8f5b43e8dc13'
  );
  const [selectedClientTypeName, setselectedClientTypeName] = useState(`guest`);
  const [items, setItems] = useState([]);
  const [showTable, setShowTable] = useState(false); // Controls table display
  const [showDetails, setShowDetails] = useState(false);
  const [isTakeAway, setIsTakeAway] = useState(false);
  const [isguest, setIsGuest] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [orderID, setOrderID] = useState('');
  const [selectedClientType, setSelectedClientType] = useState('');
  const [waiterName, setWaiterName] = useState([]);
  const [clientData, setClientData] = useState();
  const [discount, setDiscount] = useState();
  const [reseditType, setResedent] = useState();
  const [selectWaiter, setSelectedWatier] = useState(
    localStorage.getItem('DefaultWaiterId') || ''
  );
  const [hasInstantClosing, setHasInstantClosing] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);

  const SUPPORT_MILITARY_ID = [
    '01j593bhrndb11k7rdhtacz7ht',
    '01jat25db9xbgfbskk9zygj5kq',
    '01jepaexvvm7s2zv7d9970nf5p',
    '',
  ];

  message.config({
    duration: 3,
    top: '50%',
    maxCount: 3,
  });
  const [newUserValues, setNewUserValues] = useState({
    deleviery_type: 'kitchen',
    name: '',
    phone: '',
    military_number: '',
    client_type_id: '',
    discount_reason_id: '',
    payment_method_id: '',
    table_number: '',
    comment: '',
    client_id: '',
    waiter_id: '',
  });
  const ExternalOrderCashierRole = '9db56bb2-7a34-4aad-8fbd-3f9b26a93e35';

  useEffect(() => {
    const fetchData = async () => {
      await fetchPaymentMethods();
      // await fetchDiscountReasons();
    };
    fetchData();
  }, []);

  useEffect(() => {
    setHasInstantClosing(user?.department?.has_instant_order_closing);
    handlePaymentMethodChange('dc2a3eb5-0efd-4bed-a297-8f5b43e8dc13');
  }, []);

  const validateSelection = (value) => {
    if (!value && newUserValues['client_id'] !== '') {
      return 'يجب اختيار قيمة';
    }
    return '';
  };
  const validateTableNumber = (value) => {
    if (!isTakeAway) {
      if (value <= 0 || !value) {
        return 'رقم التربيزة يجب أن يكون أكبر من صفر';
      }
    }
    return '';
  };
  const validateUser = () => {
    if (newUserValues['client_id'] === 'add-new') {
      if (
        !newUserValues['name'] ||
        !newUserValues['phone'] ||
        !newUserValues['military_number'] ||
        !newUserValues['client_type_id'] ||
        !newUserValues['waiter_id'] ||
        !newUserValues['discount_reason_id'] ||
        !newUserValues['payment_method_id']
      )
        return 'يجب اختيار قيم للمستخدم الجديد';
    } else {
      return '';
    }
  };

  const validateForm = () => {
    const errors = {};

    if (clients.length > 0 && !newUserValues.client_id && !isguest) {
      setIsDisabled(false);

      const modal = Modal.error({
        title: 'Error',
        content: (
          <div style={{ fontSize: '24px', textAlign: 'center' }}>
            {' '}
            يجب اختيار اسم العميل{' '}
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 4000);
      e;

      errors.mustChooseClientName = 'يجب اختيار اسم العميل';
    }

    if (selectedClientTypeName == 'ظابط مشاه' && !militryIdInputValue) {
      setIsDisabled(false);
      const modal = Modal.error({
        title: 'Error',
        content: (
          <div style={{ fontSize: '24px', textAlign: 'center' }}>
            {' '}
            يجب اضافة رقم العضوية
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 4000);
      errors.mustHaveMilitryNumber = 'يجب اضافة رقم العضوية';
    }

    if (selectedClientType != '01hzf60qrasrm5x2ytvyrsne1j') {
      if (selectWaiter == 'اختر اسم الويتر' || selectWaiter == '') {
        setIsDisabled(false);
        const modal = Modal.error({
          title: 'Error',
          content: (
            <div style={{ fontSize: '24px', textAlign: 'center' }}>
              يجب اختيار اسم الويتر
            </div>
          ),
          centered: true,
          width: 400,
        });

        setTimeout(() => {
          modal.destroy();
        }, 4000);
        return Object.values(errors).every((error) => error === '');
      }
    }

    errors.userError = validateUser();
    errors.tableNumber = validateTableNumber(newUserValues['table_number']);
    errors.selectedClient = validateSelection(newUserValues['client_id']);
    errors.clientType = validateSelection(newUserValues['client_type_id']);
    errors.deliveryType = validateSelection(newUserValues['deleviery_type']);
    errors.paymentMethod = validateSelection(
      newUserValues['payment_method_id']
    );
    setErrors(errors);
    return Object.values(errors).every((error) => error === '');
  };

  const fetchDiscountReasons = async () => {
    try {
      const Token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/orders/discount/reasons`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const data = await response.json();
      setDiscountReasons(data.data);
    } catch (error) {
      console.error('Error fetching Product categories:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const Token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(
        `${API_ENDPOINT}/api/v1/store/payment_method`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const data = await response.json();
      setPaymentMethods(data.data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };
  const handlePaymentMethodChange = async (value) => {
    setSelectedPaymentMethodNakdy(value);
    setNewUserValues((prevState) => ({
      ...prevState,
      payment_method_id: value,
    }));
    try {
      const Token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(
        `${API_ENDPOINT}/api/v1/store/client_type/payment_method/${value}`,
        {
          params: {
            department_id: user.department.id,
          },
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      setClientTypes(response.data.data);
      if (response?.data?.data?.length == 1) {
        handleClientTypeChange(response?.data?.data[0]?.id);
      }
    } catch (error) {
      console.error('Error fetching client types for payment method:', error);
    }
  };
  const handleClientTypeChange = async (value) => {
    const selectedClient = clientTypes.find((ele) => ele.id == value)?.id;

    setselectedClientTypeName(clientTypes.find((ele) => ele.id == value)?.name);

    if (SUPPORT_MILITARY_ID.includes(selectedClient)) {
      setAddFormVisible(true);
    } else {
      setAddFormVisible(false);
      setSelectedClientType(false);
    }
    setSelectedClientType(value);

    if (selectedClient == '01j593a427a3kfrrxj8bkn115k') {
      setIsTakeAway(true);
    } else {
      setIsTakeAway(false);
    }
    if (selectedClient == '01j49hpdjbqher813xrp68ejz1') {
      setIsGuest(true);
    } else {
      setIsGuest(false);
    }

    if (selectedClient == '01jedx6za4e8ra7b5777qwzs45') {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
    setNewUserValues((prevState) => ({
      ...prevState,
      client_type_id: value,
    }));

    handleNewUserFormChange('client_id', ``);
    try {
      const Token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(
        `${API_ENDPOINT}/api/v1/orders/clients/${value}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      setClients(response.data.data);
      fetchClientType(newUserValues['client_type_id']);
    } catch (error) {
      console.error('Error fetching clients for client type:', error);
    }
  };
  const handleNewUserFormChange = (key, value) => {
    setNewUserValues((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
  const getAllWaiters = async () => {
    try {
      const Token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(
        `${API_ENDPOINT}/api/v1/store/waiter/all`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      setWaiterName(response.data.data);
    } catch (error) {
      const modal = Modal.error({
        title: 'Error',
        content: (
          <div style={{ fontSize: '24px', textAlign: 'center' }}>
            لايوجد ويتر
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 4000);
    }
  };

  const fetchClientType = async (id) => {
    try {
      const recipeData = await getClientTypeById(id);
      setClientData(recipeData?.data);
      setDiscount(recipeData.data.discount);
      setResedent(recipeData.data.name);
    } catch (error) {}
  };
  useEffect(
    () => {
      fetchClientType(newUserValues['client_type_id']);
      getAllWaiters();
    },
    [newUserValues['client_type_id']],
    selectWaiter
  );

  const handleAddItem = (item) => {
    setItems([...items, item]);
  };
  const handleDeleteItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };
  const calculateTotalAmount = () => {
    return items?.reduce(
      (total, item) => total + item?.quantity * item?.price,
      0
    );
  };

  const handleFinish = async () => {
    if (selectedClientType == '') {
      const modal = Modal.error({
        title: 'Error',
        content: (
          <div style={{ fontSize: '24px', textAlign: 'center' }}>
            ادخل نوع العميل من فضلك{' '}
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 5000);
      return;
    }

    if (selectWaiter == 'اختر اسم الويتر' || selectWaiter == '') {
      setIsDisabled(false);
      const modal = Modal.error({
        title: 'Error',
        content: (
          <div style={{ fontSize: '24px', textAlign: 'center' }}>
            يجب اختيار اسم الويتر
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 5000);
      return;
    }
    setIsDisabled(true);

    const formData = new FormData();
    const productQuantities = new Map();
    items.forEach((item) => {
      const { productId, productType, quantity } = item;
      if (productQuantities.has(productId)) {
        const existingItem = productQuantities.get(productId);
        existingItem.quantity += quantity;
      } else {
        productQuantities.set(productId, {
          productType,
          quantity,
        });
      }
    });
    Array.from(productQuantities.entries()).forEach(
      ([productId, { productType, quantity }], index) => {
        formData.append(`products[${index}][product_id]`, productId);
        formData.append(`products[${index}][product_type]`, productType);
        formData.append(`products[${index}][quantity]`, quantity);
      }
    );
    const date = new Date();
    const datetype = new Date(date.toLocaleString());
    const year = datetype.getFullYear();
    const month = String(datetype.getMonth() + 1).padStart(2, '0');
    const day = String(datetype.getDate()).padStart(2, '0');
    const hours = String(datetype.getHours()).padStart(2, '0');
    const minutes = String(datetype.getMinutes()).padStart(2, '0');
    const seconds = String(datetype.getSeconds()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    formData.append('order_date', formattedDate);
    formData.append('discount', discount);
    formData.append('table_number', '');
    formData.append('comment', newUserValues['comment']);
    formData.append('deleviery_type', newUserValues['deleviery_type']);
    formData.append('payment_method_id', newUserValues['payment_method_id']);
    formData.append(
      'client_id',
      newUserValues['client_id'] === 'add-new' ? '' : newUserValues['client_id']
    );
    formData.append('client_type_id', newUserValues['client_type_id']);
    formData.append('military_number', newUserValues['military_number']);
    formData.append('department_id', user?.department.id);
    {
      selectedClientType != '01hzf60qrasrm5x2ytvyrsne1j' &&
        formData.append('waiter_id', selectWaiter);
    }
    formData.append('name', newUserValues['name']);
    formData.append('phone', newUserValues['phone']);
    formData.append('tax', 0);
    try {
      const Token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/orders/create`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-cashier-data',
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      if (response.data) {
        setPrintData(response.data.data);
        const modal = Modal.success({
          title: 'success',
          content: (
            <div style={{ fontSize: '24px', textAlign: 'center' }}>
              لقد تم اضافة الاوردر بنجاح
            </div>
          ),
          centered: true,
          width: 400,
        });

        setTimeout(() => {
          modal.destroy();
        }, 2000);
        setItems([]);
        setOrderID(response.data.data.id);
        getOrderById(response.data.data.id)
          .then((datsss) => {})
          .catch((error) => {
            setIsDisabled(false);
            console.error('Error fetching order by ID:', error);
          });
        setShouldPrint(true);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      const modal = Modal.error({
        title: 'Error',
        content: (
          <div style={{ fontSize: '24px', textAlign: 'center' }}>
            {error.response.data.error.message}
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 4000);
    }
  };

  const detailsHeaders = [
    {
      key: 'products',
      label: 'المنتجات',
      isArray: true,
      isInput: true,
      details: [
        { key: 'name', label: 'الإسم', isInput: false },
        { key: 'price', label: 'السعر', isInput: false },
        { key: 'quantity', label: 'الكمية', isInput: false },
      ],
    },
  ];
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  const handleSubmit = async () => {
    if (newUserValues['table_number'] == '') {
      const modal = Modal.error({
        title: 'Error',
        content: (
          <div style={{ fontSize: '24px', textAlign: 'center' }}>
            لقد نسيت رقم الترابيزه
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 5000);
      return;
    }

    if (selectedClientType == '') {
      const modal = Modal.error({
        title: 'Error',
        content: (
          <div style={{ fontSize: '24px', textAlign: 'center' }}>
            ادخل نوع العميل من فضلك{' '}
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 5000);
      return;
    }
    setIsDisabled(true);

    if (newUserValues['client_type_id'] != '01j593a427a3kfrrxj8bkn115k') {
      const resMessage = await checkTableNumber(newUserValues['table_number']);
      if (resMessage === false) {
        setIsDisabled(false);
        const modal = Modal.error({
          title: 'Error',
          content: (
            <div style={{ fontSize: '24px', textAlign: 'center' }}>
              هذه الترابيزة مشغولة
            </div>
          ),
          centered: true,
          width: 400,
        });

        setTimeout(() => {
          modal.destroy();
        }, 5000);

        return;
      }
    }

    if (selectedClientType != '01hzf60qrasrm5x2ytvyrsne1j') {
      if (selectWaiter == 'اختر اسم الويتر' || selectWaiter == '') {
        setIsDisabled(false);
        const modal = Modal.error({
          title: 'Error',
          content: (
            <div style={{ fontSize: '24px', textAlign: 'center' }}>
              يجب اختيار اسم الويتر
            </div>
          ),
          centered: true,
          width: 400,
        });

        setTimeout(() => {
          modal.destroy();
        }, 5000);
        return;
      }
    }

    if (!validateForm()) return;

    const formData = new FormData();
    const productQuantities = new Map();

    items.forEach((item) => {
      const { productId, productType, quantity } = item;
      if (productQuantities.has(productId)) {
        const existingItem = productQuantities.get(productId);
        existingItem.quantity += quantity; // Sum the quantities
      } else {
        productQuantities.set(productId, {
          productType,
          quantity,
        });
      }
    });

    Array.from(productQuantities.entries()).forEach(
      ([productId, { productType, quantity }], index) => {
        formData.append(`products[${index}][product_id]`, productId);
        formData.append(`products[${index}][product_type]`, productType);
        formData.append(`products[${index}][quantity]`, quantity);
      }
    );

    const date = new Date();
    const datetype = new Date(date.toLocaleString());
    const year = datetype.getFullYear();
    const month = String(datetype.getMonth() + 1).padStart(2, '0');
    const day = String(datetype.getDate()).padStart(2, '0');
    const hours = String(datetype.getHours()).padStart(2, '0');
    const minutes = String(datetype.getMinutes()).padStart(2, '0');
    const seconds = String(datetype.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    formData.append('order_date', formattedDate);

    formData.append('discount', discount);
    if (newUserValues['client_type_id'] == '01j593a427a3kfrrxj8bkn115k') {
      formData.append('table_number', '');
    } else {
      formData.append('table_number', newUserValues['table_number']);
    }
    //  formData.append("table_number", newUserValues["table_number"]);
    formData.append('comment', newUserValues['comment']);
    formData.append('deleviery_type', newUserValues['deleviery_type']);
    formData.append('payment_method_id', newUserValues['payment_method_id']);
    formData.append(
      'client_id',
      newUserValues['client_id'] === 'add-new' ? '' : newUserValues['client_id']
    );
    formData.append('client_type_id', newUserValues['client_type_id']);
    formData.append('military_number', militryIdInputValue);
    formData.append('department_id', user?.department.id);

    {
      selectedClientType != '01hzf60qrasrm5x2ytvyrsne1j' &&
        formData.append('waiter_id', selectWaiter);
    }

    formData.append('name', newUserValues['name']);
    formData.append('phone', newUserValues['phone']);
    formData.append('tax', 0);

    try {
      const Token =
        localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.post(
        `${API_ENDPOINT}/api/v1/orders/create`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-cashier-data',
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      setIsDisabled(false);
      setFlag(true);
      setPrintData(response.data.data);
      const modal = Modal.success({
        title: 'success',
        content: (
          <div style={{ fontSize: '24px', textAlign: 'center' }}>
            لقد تم اضافة الاوردر بنجاح
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 2000);
      setItems([]);
      //}
    } catch (error) {
      setIsDisabled(false);

      console.error('Error creating order:', error);
      const modal = Modal.error({
        title: 'Error',
        content: (
          <div style={{ fontSize: '24px', textAlign: 'center' }}>
            {error.response.data.error.message}
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 5000);
    }
  };

  const [militryIdInputValue, setMilitryIdInputValue] = useState('');
  const [militryIdGotClicked, setMilitryIdGotClicked] = useState(false);
  const [timer, setTimer] = useState(null);
  const [messageVisible, setMessageVisible] = useState(false);
  const [isOrderReviewModalVisible, setIsOrderReviewModalVisible] =
    useState(false);
  const [scanningMembershipCard, setScanningMembershipCard] = useState(false);
  const [membershipCardError, setMembershipCardError] = useState('');
  const debouncedHandleSubmit = useCallback(debounce(handleSubmit, 200), [
    handleSubmit,
  ]);

  // useEffect(() => {
  //   // Clear previous timer on input change
  //   // if (timer) {
  //   //   clearTimeout(timer);
  //   // }

  //   const newTimer = setTimeout(() => {
  //     if (militryIdInputValue.length < 2 && militryIdGotClicked) {
  //       if (!messageVisible) {
  //         setMilitryIdInputValue('');
  //         message.info('يجب استعمال الاسكانر');
  //         setMessageVisible(true);
  //       }
  //     } else {
  //       handleNewUserFormChange("military_number", militryIdInputValue);
  //     }
  //   }, 20);

  //   setTimer(newTimer);

  //   // Cleanup timer on component unmount or input change
  //   return () => clearTimeout(newTimer);
  // }, [militryIdInputValue, militryIdGotClicked]);

  const handleOrderPriceReview = () => {
    if (selectedClientType == '') {
      const modal = Modal.error({
        title: 'Error',
        content: (
          <div style={{ fontSize: '24px', textAlign: 'center' }}>
            ادخل نوع العميل من فضلك{' '}
          </div>
        ),
        centered: true,
        width: 400,
      });

      setTimeout(() => {
        modal.destroy();
      }, 5000);
      return;
    }

    if (clients.length > 0 && !newUserValues.client_id && !isguest) {
      const modal = Modal.error({
        title: 'Error',
        content: (
          <div style={{ fontSize: '24px', textAlign: 'center' }}>
            {' '}
            يجب اختيار اسم العميل{' '}
          </div>
        ),
        centered: true,
        width: 400,
      });
      return;
    }

    newUserValues['client_name'] = clients.find(
      (ele) => ele.id == newUserValues.client_id
    )?.name;
    if (items.length < 1) {
      const modal = Modal.error({
        title: 'Error',
        content: (
          <div style={{ fontSize: '24px', textAlign: 'center' }}>
            {' '}
            برجاء إضافة منتجات للأوردر{' '}
          </div>
        ),
        centered: true,
        width: 400,
      });
      return;
    }
    setIsOrderReviewModalVisible(true);
  };
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMilitryIdInputValue(value);
    setMilitryIdGotClicked(true);
  };

  // Handle membership card reading from NFC agent
  const handleReadMembershipCard = async () => {
    try {
      setScanningMembershipCard(true);
      setMembershipCardError('');

      const response = await readCardAndGetMembershipId();

      if (response.success && response.data && response.data.membership_id) {
        const membershipNumber = response.data.membership_id;
        setMilitryIdInputValue(membershipNumber);
        handleNewUserFormChange('military_number', membershipNumber);

        message.success(`تم قراءة رقم العضوية: ${membershipNumber}`);
        setMembershipCardError('');
      } else {
        const errorMsg = response.message || 'فشل في قراءة البطاقة';
        setMembershipCardError(errorMsg);
        message.error(errorMsg);
      }
    } catch (error) {
      console.error('Error reading membership card:', error);
      const errorMessage =
        error.response?.data?.message || 'حدث خطأ في قراءة البطاقة. تأكد من وضع البطاقة على القارئ';
      setMembershipCardError(errorMessage);
      message.error(errorMessage);
    } finally {
      setScanningMembershipCard(false);
    }
  };

  // Auto-update form when membership number is manually entered
  useEffect(() => {
    if (militryIdInputValue && militryIdGotClicked) {
      const cleanValue = militryIdInputValue.trim();
      if (cleanValue.length > 0) {
        handleNewUserFormChange('military_number', cleanValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [militryIdInputValue, militryIdGotClicked]);

  useEffect(() => {
    const resetMessageVisibility = () => setMessageVisible(false);
    return () => resetMessageVisibility();
  }, [messageVisible]);

  return (
    <div className="form-cashier-container fs-5">
      <h1 className="form-cashier-title"> {user?.department.name}</h1>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ width: '100%' }}>
          <label className="form-cashier-label fw-bold">اسم الكاشير:</label>
          <input
            className="form-cashier-name-input"
            type="text"
            disabled={true}
            style={{ cursor: 'not-allowed' }}
            value={user?.name}
          />
        </div>

        <div style={{ width: '100%' }}>
          <label className="form-cashier-label">اسم الويتر:</label>
          <select
            onChange={(e) => {
              setSelectedWatier(e.target.value);
              localStorage.setItem('DefaultWaiterId', e.target.value);
            }}
            className="form-cashier-name-input"
            aria-label=".form-select-lg example"
          >
            <option>اختر اسم الويتر</option>
            {waiterName.map((method) => {
              if (selectWaiter == method.id) {
                return (
                  <option selected key={selectWaiter} value={selectWaiter}>
                    {method.name}
                  </option>
                );
              }
              return (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div className="form-cashier-product-category-parent">
        <div className="form-cashier-product-category">
          <div className="form-cashier-select-wrraper">
            <label className="form-cashier-label">طرق الدفع</label>
            <Select
              required
              showSearch
              className="form-cashier-select"
              placeholder="اختر طريقة دفع"
              value={selectedPaymentMethodNakdy}
              onChange={handlePaymentMethodChange}
              filterOption={(input, option) => {
                return (option?.children ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
              optionFilterProp="children"
            >
              {paymentMethods.map((method) => (
                <Option
                  key={method.id}
                  value={method.id}
                  style={{ fontSize: '22px', weight: '800' }}
                >
                  {method.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="form-cashier-select-wrraper">
            <label className="form-cashier-label">نوع العميل</label>
            <Select
              required
              showSearch
              className="form-cashier-select"
              placeholder="اختر نوع العميل"
              value={selectedClientType}
              onChange={handleClientTypeChange}
              filterOption={(input, option) => {
                return (option?.children ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
              optionFilterProp="children"
            >
              {clientTypes.map((type) => (
                <Option
                  key={type.id}
                  value={type.id}
                  style={{ fontSize: '22px', weight: '800' }}
                >
                  {type.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="form-cashier-select-wrraper">
            <label className="form-cashier-label">العميل</label>
            <Select
              required
              showSearch
              className="form-cashier-select"
              placeholder="اختر العميل"
              onChange={(value) => {
                handleNewUserFormChange('client_id', value);
              }}
              filterOption={(input, option) => {
                return (option?.children ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
              optionFilterProp="children"
              value={newUserValues.client_id}
            >
              <option>اختر اسم العميل</option>
              {clients.map((client) => (
                <Option
                  key={client.id}
                  value={client.id}
                  style={{ fontSize: '22px', weight: '800' }}
                >
                  {client.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {addFormVisible && (
          <div className="form-cashier-details-parent">
            <div style={{ width: '100%' }}>
              <label className="form-cashier-label"> الرقم العضوية:</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  className="form-cashier-input"
                  type="text"
                  value={militryIdInputValue}
                  onWheel={(event) => event.currentTarget.blur()}
                  autoComplete="new-password"
                  onChange={handleInputChange}
                  placeholder="امسح البطاقة أو أدخل رقم العضوية"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleReadMembershipCard}
                  disabled={scanningMembershipCard}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#803D3B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: scanningMembershipCard ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Cairo, sans-serif',
                    opacity: scanningMembershipCard ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="قراءة البطاقة من القارئ"
                >
                  {scanningMembershipCard ? (
                    <>
                      <span className="loading-spinner-small" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                      <span>جاري القراءة...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 3H7V7H3V3Z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M17 3H21V7H17V3Z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 17H7V21H3V17Z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M17 17H21V21H17V17Z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7 3V7H17V3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7 17V21H17V17" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 7H7V17H3V7Z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M17 7H21V17H17V7Z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>قراءة البطاقة</span>
                    </>
                  )}
                </button>
              </div>
              {membershipCardError && (
                <div
                  style={{
                    color: '#d32f2f',
                    fontSize: '14px',
                    marginTop: '4px',
                    fontFamily: 'Cairo, sans-serif',
                  }}
                >
                  {membershipCardError}
                </div>
              )}
              <small
                style={{
                  color: '#666',
                  fontSize: '12px',
                  display: 'block',
                  marginTop: '4px',
                  fontFamily: 'Cairo, sans-serif',
                }}
              >
                ضع البطاقة على القارئ وانقر على زر "قراءة البطاقة" أو أدخل رقم العضوية يدوياً
              </small>
            </div>
          </div>
        )}
      </div>

      <div className="form-cashier-details-parent">
        <div>
          {!isTakeAway ? (
            <>
              <label className="form-cashier-label">رقم التربيزة:</label>
              <input
                required
                className="form-cashier-input"
                type="number"
                min={1}
                value={newUserValues['table_number']}
                onChange={(e) =>
                  handleNewUserFormChange('table_number', e.target.value)
                }
                onWheel={(event) => event.currentTarget.blur()}
              />
              {errors.tableNumber && (
                <span className="error cashier-input-error">
                  {errors.tableNumber}
                </span>
              )}
            </>
          ) : null}
        </div>
        <div>
          <label className="form-cashier-label">ملاحظة : </label>
          <textarea
            className="form-cashier-txt-area"
            onChange={(e) => handleNewUserFormChange('comment', e.target.value)}
          ></textarea>
        </div>
      </div>

      <CashierOrderDetailes
        onAddItem={handleAddItem}
        clientTypePrice={newUserValues['client_type_id']}
      />

      <CashierItemList items={items} onDeleteItem={handleDeleteItem} />
      <TotalAmount total={calculateTotalAmount()} />

      <div className="btns">
        {!hasInstantClosing && (
          <button
            className="form-cashier-btn"
            onClick={handleOrderPriceReview}
            style={{
              backgroundColor: '#803D3B',
            }}
          >
            مراجعة سعر الأوردر
          </button>
        )}
        {!isTakeAway && !hasInstantClosing ? (
          <>
            <button
              className="form-cashier-btn"
              onClick={debouncedHandleSubmit}
              disabled={isDisabled}
              style={{
                backgroundColor: isDisabled ? '#d3d3d3' : '#AF8260',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                color: isDisabled ? '#a9a9a9' : 'white',
              }}
            >
              حفظ البيانات
            </button>
          </>
        ) : null}

        {!isguest &&
        !isHidden &&
        !user.permissions.some(
          (permission) => permission.name === 'cannot_close_order'
        ) ? (
          <>
            <button
              className="finish-cashier"
              onClick={() => handleFinish()}
              disabled={isDisabled}
              style={{
                backgroundColor: isDisabled ? '#d3d3d3' : '#b51424',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                color: isDisabled ? '#a9a9a9' : 'white',
                height: '45px',
              }}
            >
              إنهاء الأوردر
            </button>
          </>
        ) : null}
      </div>

      {shouldPrint && <PrintAfterFinish id={orderID} user={user} />}

      <OrderReviewModal
        show={isOrderReviewModalVisible}
        onHide={() => setIsOrderReviewModalVisible(false)}
        items={items}
        clientType={{
          id: selectedClientType,
          name: selectedClientTypeName,
        }}
        client={{
          id: newUserValues?.client_id,
          name: newUserValues?.client_name,
        }}
      />

      {/* Floating Scanner Icon */}
      <div
        onClick={() => setShowScannerModal(true)}
        className="floating-scanner-icon"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '60px',
          height: '60px',
          backgroundColor: '#803D3B',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          fontFamily: 'Cairo, sans-serif',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.backgroundColor = '#6B2D2B';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.backgroundColor = '#803D3B';
        }}
        title="مسح باركود الاشتراك"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: 'white' }}
        >
          <path
            d="M3 3H7V7H3V3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 3H21V7H17V3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 17H7V21H3V17Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 17H21V21H17V17Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 3V7H17V3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 17V21H17V17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 7H7V17H3V7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 7H21V17H17V7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Scanner Modal */}
      <SubscriptionScannerModal
        show={showScannerModal}
        onHide={() => setShowScannerModal(false)}
      />
    </div>
  );
};

export default AddCashierOrder;
