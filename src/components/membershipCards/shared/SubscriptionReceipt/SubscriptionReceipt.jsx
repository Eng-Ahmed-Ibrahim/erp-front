import React, { useEffect, useRef } from "react";
import LogoDAR from "../../../../../public/assets/images/Dar_logo.svg";
import {
  Cut,
  Printer,
} from "react-thermal-printer";
import { useReactToPrint } from "react-to-print";
import '../../../../applications/warehouse/sections/cashier/pages/KitchenRequests/styles.css';
import './SubscriptionReceipt.scss';

function SubscriptionReceipt({
  subscriptionData,
  onPrintComplete,
}) {
  const componentRef = useRef();

  const generatePDF = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `اشتراك-${subscriptionData?.id || 'new'}`,
    onAfterPrint: () => {
      if (onPrintComplete) {
        onPrintComplete();
      }
    },
  });

  useEffect(() => {
    if (subscriptionData && subscriptionData.id) {
      // Small delay to ensure component is rendered
      setTimeout(() => {
        generatePDF();
      }, 100);
    }
  }, [subscriptionData]);

  if (!subscriptionData) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `${parseFloat(amount || 0).toFixed(2)} ج.م`;
  };

  // Get fees from paid amounts or fee plan if paid amounts are 0
  const getEstablishmentFee = () => {
    const paid = parseFloat(subscriptionData.paid_establishment_fee || 0);
    if (paid > 0) return paid;
    return parseFloat(subscriptionData.fee_plan?.establishment_fee || 0);
  };

  const getAnnualFee = () => {
    const paid = parseFloat(subscriptionData.paid_annual_fee || 0);
    if (paid > 0) return paid;
    return parseFloat(subscriptionData.fee_plan?.annual_subscription_fee || 0);
  };

  const getIssuanceFee = () => {
    const paid = parseFloat(subscriptionData.paid_issuance_fee || 0);
    if (paid > 0) return paid;
    return parseFloat(subscriptionData.fee_plan?.issuance_fee || 0);
  };

  const establishmentFee = getEstablishmentFee();
  const annualFee = getAnnualFee();
  const issuanceFee = getIssuanceFee();
  const totalPaid = (establishmentFee + annualFee + issuanceFee).toFixed(2);

  return (
    <div
      id="subscription-receipt-container"
      ref={componentRef}
      dir="rtl"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <Printer ref={componentRef} className="main subscription-receipt">
        {/* Header Section */}
        <div className="receipt-header">
          <div className="header-img">
            <img src={LogoDAR} alt="Logo" />
          </div>
          <div className="header-title">
            <h1>إيصال اشتراك</h1>
            <p className="subtitle">منظومة بطاقات العضوية</p>
          </div>
        </div>

        <div className="receipt-divider"></div>

        {/* Receipt Info */}
        <div className="receipt-meta">
          <div className="meta-row">
            <span className="meta-label">رقم الإيصال:</span>
            <span className="meta-value">#{subscriptionData.id}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">التاريخ:</span>
            <span className="meta-value">{formatDate(new Date().toISOString())}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">الوقت:</span>
            <span className="meta-value">{formatTime()}</span>
          </div>
        </div>

        <div className="receipt-divider dashed"></div>

        {/* Officer Information */}
        <div className="receipt-section">
          <h3 className="section-title">بيانات الضابط</h3>
          <div className="info-grid">
            <div className="info-row">
              <span className="info-label">الاسم:</span>
              <span className="info-value">{subscriptionData.officer?.full_name || 'غير محدد'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">الرقم العسكري:</span>
              <span className="info-value">{subscriptionData.officer?.membership_number || 'غير محدد'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">الرتبة:</span>
              <span className="info-value">{subscriptionData.officer?.rank || 'غير محدد'}</span>
            </div>
          </div>
        </div>

        {/* Beneficiary Information (if exists) */}
        {subscriptionData.beneficiary && (
          <>
            <div className="receipt-divider dashed"></div>
            <div className="receipt-section">
              <h3 className="section-title">بيانات المستفيد</h3>
              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">الاسم:</span>
                  <span className="info-value">{subscriptionData.beneficiary.full_name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">صلة القرابة:</span>
                  <span className="info-value">{subscriptionData.beneficiary.relationship_type}</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="receipt-divider dashed"></div>

        {/* Subscription Details */}
        <div className="receipt-section">
          <h3 className="section-title">تفاصيل الاشتراك</h3>
          <div className="info-grid">
            <div className="info-row">
              <span className="info-label">تاريخ البداية:</span>
              <span className="info-value">{formatDate(subscriptionData.start_date)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">تاريخ النهاية:</span>
              <span className="info-value">{formatDate(subscriptionData.end_date)}</span>
            </div>
            {subscriptionData.fee_plan && (
              <div className="info-row">
                <span className="info-label">خطة الرسوم:</span>
                <span className="info-value">{subscriptionData.fee_plan.name}</span>
              </div>
            )}
            {subscriptionData.is_honorary_membership && (
              <div className="info-row highlight">
                <span className="info-label">نوع العضوية:</span>
                <span className="info-value">عضوية فخرية</span>
              </div>
            )}
          </div>
        </div>

        <div className="receipt-divider"></div>

        {/* Fees Table */}
        <div className="receipt-section fees-section">
          <h3 className="section-title">تفاصيل الرسوم المدفوعة</h3>
          <table className="fees-table">
            <thead>
              <tr>
                <th>البند</th>
                <th>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>رسم التأسيس</td>
                <td className="amount">{formatCurrency(establishmentFee)}</td>
              </tr>
              <tr>
                <td>الاشتراك السنوي</td>
                <td className="amount">{formatCurrency(annualFee)}</td>
              </tr>
              <tr>
                <td>رسم الإصدار</td>
                <td className="amount">{formatCurrency(issuanceFee)}</td>
              </tr>
            </tbody>
          </table>
          
          {/* Subtotal */}
          <div className="subtotal-section">
            <div className="subtotal-row">
              <span>المجموع الفرعي:</span>
              <span>{formatCurrency(totalPaid)}</span>
            </div>
          </div>
          
          {/* Total */}
          <div className="total-section">
            <div className="total-row">
              <span className="total-label">الإجمالي المدفوع</span>
              <span className="total-amount">{formatCurrency(totalPaid)}</span>
            </div>
          </div>
        </div>

        <div className="receipt-divider"></div>

        {/* Footer */}
        <div className="receipt-footer">
          <p className="thank-you">شكراً لاستخدامكم خدماتنا</p>
          <p className="footer-note">يرجى الاحتفاظ بهذا الإيصال</p>
          <div className="receipt-barcode">
            ║║│║║│║│║║║│║║│║│║║║
          </div>
        </div>

        <Cut />
      </Printer>
    </div>
  );
}

export default SubscriptionReceipt;
