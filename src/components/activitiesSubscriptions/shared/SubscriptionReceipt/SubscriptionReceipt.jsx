import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import './SubscriptionReceipt.scss';

const SubscriptionReceipt = ({
  subscription,
  academy,
  offer,
  subscriber,
  onAfterPrint,
}) => {
  const componentRef = useRef();

  const generatePDF = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `subscription-${subscription?.id || 'receipt'}`,
    onAfterPrint: () => {
      if (onAfterPrint) onAfterPrint();
    },
  });

  const handlePrint = () => {
    generatePDF();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const arabicMonths = [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];
    const day = date.getDate();
    const month = arabicMonths[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatDays = (days) => {
    if (!days || !Array.isArray(days)) return '';
    const dayNames = {
      Monday: 'الاثنين',
      Tuesday: 'الثلاثاء',
      Wednesday: 'الأربعاء',
      Thursday: 'الخميس',
      Friday: 'الجمعة',
      Saturday: 'السبت',
      Sunday: 'الأحد',
    };
    return days.map((day) => dayNames[day] || day).join('، ');
  };

  return (
    <div className="receipt-container">
      <button onClick={handlePrint} className="print-receipt-btn">
        🖨️ طباعة الإيصال
      </button>

      <div ref={componentRef} className="receipt-paper" dir="rtl">
        {/* Header with Logo and Academy */}
        <div className="receipt-header">
          <div className="logo-square">
            <div className="logo-placeholder">
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="header-info">
            <h1 className="academy-name">
              {subscription?.academy_name || academy?.name || 'N/A'}
            </h1>
            <h2 className="receipt-title">إيصال اشتراك</h2>
            <div className="receipt-number">
              رقم الإيصال: {subscription?.id || 'N/A'}
              <br />
              رقم المشترك: {subscription?.subscriber_id || 'N/A'}
              <br /> رقم الاشتراك: {subscription?.id || 'N/A'}
              <br /> تاريخ الإصدار: {new Date().toISOString().split('T')[0]}
            </div>
          </div>
        </div>

        <div className="receipt-content">
          <div className="info-section compact-section">
            <h3 className="section-title">معلومات المشترك</h3>
            <div className="compact-grid">
              <div className="compact-item">
                <span className="compact-label">الاسم :</span>
                <span className="compact-value">
                  {subscription?.subscriber_name || 'N/A'}
                </span>
              </div>
              <div className="compact-item">
                <span className="compact-label"> الهاتف:</span>
                <span className="compact-value">
                  {subscription?.subscriber_data?.phone || 'N/A'}
                </span>
              </div>
              <div className="compact-item">
                <span className="compact-label">الفئة</span>
                <span className="compact-value">
                  {subscription?.subscriber_data?.type === 'infantry'
                    ? 'مشاة'
                    : subscription?.subscriber_data?.type === 'civilian'
                    ? 'مدني'
                    : subscription?.subscriber_data?.type === 'other'
                    ? 'أسلحة أخرى'
                    : 'غير محدد'}
                </span>
              </div>
              <div className="compact-item">
                <span className="compact-label">الرقم:</span>
                <span className="compact-value">
                  {subscription?.subscriber_data?.type === 'civilian'
                    ? subscription?.subscriber_data?.national_id || 'N/A'
                    : subscription?.subscriber_data?.military_id || 'N/A'}
                </span>
              </div>
              {/* <div className="compact-item">
                <span className="compact-label">أنشأ بواسطة:</span>
                <span className="compact-value">
                  {subscription?.creator_data?.name || 'غير محدد'}
                </span>
              </div> */}
            </div>
          </div>

          {/* Academy & Offer Info - Compact */}
          <div className="info-section compact-section">
            <h3 className="section-title">تفاصيل الاشتراك</h3>
            <div className="compact-grid">
              <div className="compact-item">
                <span className="compact-label">الأكاديمية:</span>
                <span className="compact-value">
                  {subscription?.academy_name || 'N/A'}
                </span>
              </div>
              <div className="compact-item">
                <span className="compact-label">العرض:</span>
                <span className="compact-value">
                  {subscription?.offer_name || 'N/A'}
                </span>
              </div>
              <div className="compact-item">
                <span className="compact-label">المدة:</span>
                <span className="compact-value">
                  {subscription?.offer_data?.duration_days || 0} يوم
                </span>
              </div>
              <div className="compact-item">
                <span className="compact-label">عدد الحصص:</span>
                <span className="compact-value">
                  {subscription?.remaining_classes ||
                    subscription?.remaining_hours ||
                    0}{' '}
                  {subscription?.remaining_classes ? 'حصص' : 'ساعة'}
                </span>
              </div>
              <div className="compact-item">
                <span className="compact-label"> البداية:</span>
                <span className="compact-value">
                  {formatDate(subscription?.start_date)}
                </span>
              </div>
              <div className="compact-item">
                <span className="compact-label"> النهاية:</span>
                <span className="compact-value">
                  {formatDate(subscription?.end_date)}
                </span>
              </div>

              <div className="compact-item compact-item-days">
                <span className="compact-label">الأيام المختارة:</span>
                <span className="compact-value">
                  {formatDays(subscription?.chosen_days)}
                </span>
              </div>

              <div className="compact-item total-price">
                <span className="compact-label">السعر المدفوع:</span>
                <span className="compact-value">
                  {subscription?.subscriber_data?.type === 'infantry' &&
                  subscription?.offer_data?.price_infantry
                    ? subscription.offer_data.price_infantry
                    : subscription?.subscriber_data?.type === 'civilian' &&
                      subscription?.offer_data?.price_civilian
                    ? subscription.offer_data.price_civilian
                    : subscription?.subscriber_data?.type === 'other' &&
                      subscription?.offer_data?.price_other
                    ? subscription.offer_data.price_other
                    : subscription?.offer_data?.price_infantry || 0}{' '}
                  ج.م
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Barcode and QR Code */}
        {/* <div className="receipt-footer"> */}
        <div className="codes-section">
          <div className="barcode-container">
            <h4>باركود الاشتراك</h4>
            <div className="barcode-placeholder">
              {subscription?.barcode_svg ? (
                <div
                  className="barcode-svg-display"
                  dangerouslySetInnerHTML={{
                    __html: subscription.barcode_svg,
                  }}
                />
              ) : subscription?.id ? (
                <div className="barcode-display">
                  <div className="barcode-text">#{subscription.id}</div>
                  <div className="barcode-bars">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div
                        key={i}
                        className="bar"
                        style={{
                          height: `${Math.random() * 40 + 20}px`,
                          width: '2px',
                          backgroundColor: '#000',
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-code">لا يوجد باركود</div>
              )}
            </div>
          </div>

          {/* <div className="qr-container">
              <h4>رمز QR</h4>
              <div className="qr-placeholder">
                {subscription?.qr_code_svg ? (
                  <div
                    className="qr-svg-display"
                    dangerouslySetInnerHTML={{
                      __html: subscription.qr_code_svg,
                    }}
                  />
                ) : subscription?.id ? (
                  <div className="qr-display">
                    <div className="qr-grid">
                      {Array.from({ length: 64 }, (_, i) => (
                        <div
                          key={i}
                          className="qr-cell"
                          style={{
                            backgroundColor:
                              Math.random() > 0.5 ? '#000' : '#fff',
                          }}
                        />
                      ))}
                    </div>
                    <div className="qr-text">#{subscription.id}</div>
                  </div>
                ) : (
                  <div className="no-code">لا يوجد رمز QR</div>
                )}
              </div>
            </div> */}
          {/* </div> */}

          <div className="footer-text">
            <p>
              شكراً لاختياركم{' '}
              {subscription?.academy_name || academy?.name || 'N/A'}: دار المشاة
            </p>
            <p>Mohamed Khattab </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionReceipt;
