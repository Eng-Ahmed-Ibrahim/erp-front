import React, { useState, useEffect } from 'react';
import {
  Card,
  Badge,
  Tag,
  Tooltip,
  Avatar,
  Divider,
  Button,
  Alert,
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import './ApartmentCard.scss';
import moment from 'moment';
import { getServerTime } from '../../apis/reception/receptionApi';

const ApartmentCard = ({
  apartment,
  onClick,
  showActions = false,
  onEdit,
  onDelete,
  onCheckout,
}) => {
  // Handle active, confirmed, and pending bookings
  // apartment.current_booking contains only the active booking
  // apartment.pending_bookings contains pending bookings (array)
  // apartment.confirmed_bookings contains confirmed bookings (array)
  const currentBooking = apartment.current_booking;
  const pendingBookings = apartment.pending_bookings || [];
  const confirmedBookings = apartment.confirmed_bookings || [];

  // Validate if current booking is actually active based on dates
  const isBookingActuallyActive = (booking) => {
    if (!booking) return false;

    const now = moment();
    const arrivalDate = moment(
      booking.arrival_datetime || booking.check_in_date
    );
    const checkoutDate = moment(
      booking.checkout_datetime || booking.check_out_date
    );

    // Check if booking is within the active period
    const isWithinPeriod =
      now.isSameOrAfter(arrivalDate, 'day') &&
      now.isBefore(checkoutDate, 'day');

    // Check if booking has a status that indicates it's completed
    const isCompleted =
      booking.status === 'completed' || booking.status === 'checked_out';

    // Booking is active if it's within period and not completed
    return isWithinPeriod && !isCompleted;
  };

  // Validate if confirmed booking is for today or future
  const isConfirmedBookingValid = (booking) => {
    if (!booking) return false;

    const now = moment();
    const arrivalDate = moment(
      booking.arrival_datetime || booking.check_in_date
    );

    // Confirmed booking is valid if arrival is today or in the future
    return arrivalDate.isSameOrAfter(now, 'day');
  };

  // Determine actual booking status
  const activeBooking = isBookingActuallyActive(currentBooking)
    ? currentBooking
    : null;

  // Filter valid confirmed bookings
  const validConfirmedBookings = confirmedBookings.filter(
    isConfirmedBookingValid
  );
  const hasConfirmedBooking = validConfirmedBookings.length > 0;
  const confirmedBooking = hasConfirmedBooking
    ? validConfirmedBookings[0]
    : null;

  const hasPendingBooking = pendingBookings.length > 0;
  const pendingBooking = hasPendingBooking ? pendingBookings[0] : null;

  // Determine which booking to display (active > confirmed > pending)
  const booking = activeBooking || confirmedBooking || pendingBooking;
  const visitor = booking?.visitor;
  const bookingStatus = activeBooking
    ? 'active'
    : hasConfirmedBooking
    ? 'confirmed'
    : hasPendingBooking
    ? 'pending'
    : null;

  // Enhanced room type configurations with sophisticated business colors
  const getRoomTypeConfig = (roomType) => {
    const configs = {
      single: {
        icon: '🛏️',
        label: 'فردي',
        color: '#803D3B', // Primary accent
        bgColor: '#F8F4F2', // Light background
        borderColor: '#AF8260', // Secondary accent
        headerBg: 'linear-gradient(135deg, #803D3B 0%, #AF8260 100%)',
      },
      double: {
        icon: '🏠',
        label: 'مزدوج',
        color: '#803D3B',
        bgColor: '#F8F4F2',
        borderColor: '#AF8260',
        headerBg: 'linear-gradient(135deg, #AF8260 0%, #803D3B 100%)',
      },
      suite: {
        icon: '🏰',
        label: 'جناح',
        color: '#803D3B',
        bgColor: '#F8F4F2',
        borderColor: '#AF8260',
        headerBg: 'linear-gradient(135deg, #803D3B 0%, #AF8260 100%)',
      },
      family: {
        icon: '👨‍👩‍👧‍👦',
        label: 'عائلي',
        color: '#803D3B',
        bgColor: '#F8F4F2',
        borderColor: '#AF8260',
        headerBg: 'linear-gradient(135deg, #AF8260 0%, #803D3B 100%)',
      },
    };
    return configs[roomType] || configs.single;
  };

  const roomConfig = getRoomTypeConfig(apartment.room_type);

  // Helper to determine if apartment is truly available
  const isApartmentAvailable = () => {
    return !activeBooking && !hasConfirmedBooking && !hasPendingBooking;
  };

  // Enhanced apartment card style with softer business colors
  const getCardStyle = () => {
    const baseStyle = {
      borderWidth: '2px',
      borderStyle: 'solid',
      position: 'relative',
      borderRadius: '16px',
      overflow: 'hidden',
    };
    if (activeBooking) {
      return {
        ...baseStyle,
        borderColor: '#803D3B',
        backgroundColor: '#F8F4F2',
        boxShadow: '0 4px 20px rgba(128, 61, 59, 0.10)',
      };
    }
    if (hasConfirmedBooking) {
      return {
        ...baseStyle,
        borderColor: '#AF8260',
        backgroundColor: '#F8F4F2',
        boxShadow: '0 4px 20px rgba(175, 130, 96, 0.10)',
      };
    }
    if (hasPendingBooking) {
      return {
        ...baseStyle,
        borderColor: '#AF8260',
        backgroundColor: '#F8F4F2',
        boxShadow: '0 4px 20px rgba(175, 130, 96, 0.08)',
      };
    }
    return {
      ...baseStyle,
      borderColor: '#803D3B',
      backgroundColor: '#F8F4F2',
      boxShadow: '0 4px 20px rgba(128, 61, 59, 0.08)',
    };
  };

  // Check if booking is early checkout
  const isEarlyCheckout = () => {
    if (!booking?.checkout_datetime && !booking?.check_out_date) return false;

    const scheduledCheckout = moment(
      booking.checkout_datetime || booking.check_out_date
    );
    const today = moment().startOf('day');

    return today.isBefore(scheduledCheckout, 'day');
  };

  // Calculate actual stayed days
  const getActualStayedDays = () => {
    if (!booking?.arrival_datetime) return null;

    const arrival = moment(booking.arrival_datetime);
    const now = moment();

    // Calculate actual days stayed (including partial days)
    return Math.max(1, Math.ceil(now.diff(arrival, 'hours') / 24));
  };

  // Get adjusted amount for early checkout
  const getAdjustedAmount = () => {
    if (!booking?.total_amount || !booking?.duration_days) return null;

    const actualDays = getActualStayedDays();
    if (!actualDays) return null;

    const dailyRate = booking.total_amount / booking.duration_days;
    return Math.round(dailyRate * actualDays * 100) / 100;
  };

  // Format booking dates
  const formatBookingDate = (date) => {
    if (!date) return 'غير محدد';
    return moment(date).format('DD/MM/YYYY');
  };

  const formatBookingTime = (date) => {
    if (!date) return 'غير محدد';
    return moment(date).format('HH:mm');
  };

  const getBookingDuration = () => {
    if (!booking?.arrival_datetime || !booking?.checkout_datetime) return null;

    const arrival = moment(booking.arrival_datetime);
    const checkout = moment(
      booking.checkout_datetime || booking.check_out_date
    );
    const duration = checkout.diff(arrival, 'days');

    return duration;
  };

  // Enhanced Status Badge Component with softer colors
  const getStatusBadge = () => {
    if (activeBooking) {
      return (
        <div
          className="status-badge-new occupied"
          style={{ background: '#803D3B', borderColor: '#AF8260' }}
        >
          <ExclamationCircleOutlined
            className="status-icon"
            style={{ color: '#fff' }}
          />
          <span className="status-text">مشغولة</span>
          {isEarlyCheckout() && (
            <div
              className="early-checkout-tag"
              style={{ background: '#AF8260' }}
            >
              مغادرة مبكرة
            </div>
          )}
        </div>
      );
    }
    if (hasConfirmedBooking) {
      return (
        <div
          className="status-badge-new confirmed"
          style={{ background: '#AF8260', borderColor: '#803D3B' }}
        >
          <CheckCircleOutlined
            className="status-icon"
            style={{ color: '#fff' }}
          />
          <span className="status-text">مؤكد</span>
        </div>
      );
    }
    if (hasPendingBooking) {
      return (
        <div
          className="status-badge-new pending"
          style={{ background: '#AF8260', borderColor: '#803D3B' }}
        >
          <ClockCircleOutlined
            className="status-icon"
            style={{ color: '#fff' }}
          />
          <span className="status-text">حجز معلق</span>
        </div>
      );
    }
    return (
      <div
        className="status-badge-new available"
        style={{ background: '#803D3B', borderColor: '#AF8260' }}
      >
        <CheckCircleOutlined
          className="status-icon"
          style={{ color: '#fff' }}
        />
        <span className="status-text">متاحة</span>
      </div>
    );
  };

  // Determine apartment status class
  const getStatusClass = () => {
    if (activeBooking) return 'occupied';
    if (hasConfirmedBooking) return 'confirmed';
    if (hasPendingBooking) return 'pending';
    return 'available';
  };

  return (
    <div className={`apartment-card-wrapper ${getStatusClass()}`}>
      <Card
        className={`apartment-card-new ${apartment.room_type}-room`}
        style={getCardStyle()}
        hoverable
        onClick={onClick}
        title={
          <div
            className="apartment-header-new"
            style={{
              background:
                // activeBooking
                // ? 'linear-gradient(135deg, #9B2C2C 0%, #C05621 100%)'          :
                hasConfirmedBooking
                  ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                  : hasPendingBooking
                  ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                  : 'linear-gradient(135deg, #AF8260 0%, #803D3B 100%)',
              margin: '-16px -24px 12px -24px',
              padding: '16px 24px',
              borderRadius: '14px 14px 0 0',
              position: 'relative',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="apartment-info-new">
              <div className="apartment-main-info">
                <HomeOutlined
                  className="apartment-icon"
                  style={{ marginRight: '10px' }}
                />
                <div className="apartment-details">
                  <div className="apartment-number">
                    <span className="number">{apartment.apartment_number}</span>
                    <span className="building-name">
                      {apartment.building?.name}
                    </span>
                  </div>
                  <div className="apartment-tags">
                    {/* <Tag className="room-type-tag">
                      {roomConfig.icon} {roomConfig.label}
                    </Tag> */}
                    {apartment.max_occupancy && (
                      <Tag className="capacity-tag">
                        👥 {apartment.max_occupancy} أشخاص
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* {getStatusBadge()} */}
          </div>
        }
        actions={[
          ...(showActions && activeBooking && onEdit
            ? [
                <Tooltip title="تعديل الحجز">
                  <SettingOutlined
                    className="action-icon edit-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(apartment, activeBooking);
                    }}
                  />
                </Tooltip>,
              ]
            : []),
          ...(activeBooking && onCheckout
            ? [
                <Tooltip title="تسجيل مغادرة">
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '0 16px',
                    }}
                  >
                    <Button
                      type="primary"
                      danger
                      icon={<LogoutOutlined />}
                      className="checkout-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCheckout(apartment, activeBooking);
                      }}
                      style={{
                        background: '#803D3B',
                        borderColor: '#AF8260',
                        boxShadow: '0 2px 8px rgba(128, 61, 59, 0.15)',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '0 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      مغادرة
                    </Button>
                  </div>
                </Tooltip>,
              ]
            : []),
        ]}
      >
        <div className="apartment-content-new">
          {booking ? (
            <div className="booking-info-new">
              <div className="visitor-section">
                <Avatar
                  size={50}
                  icon={<UserOutlined />}
                  className="visitor-avatar"
                  style={{
                    backgroundColor: activeBooking
                      ? '#52c41a' // Green for active
                      : hasConfirmedBooking
                      ? '#1890ff' // Blue for confirmed
                      : '#8B5CF6', // Purple for pending
                    marginLeft: 16,
                  }}
                />
                <div className="visitor-details-new">
                  <div className="visitor-name-with-status">
                    <h3 className="visitor-name">
                      {visitor?.name || 'زائر غير محدد'}
                    </h3>
                    <Tag
                      color={
                        activeBooking
                          ? 'success'
                          : hasConfirmedBooking
                          ? 'processing'
                          : 'warning'
                      }
                      className="booking-status-tag"
                    >
                      {activeBooking
                        ? 'نشط'
                        : hasConfirmedBooking
                        ? 'مؤكد'
                        : 'معلق'}
                    </Tag>
                  </div>
                  <div className="visitor-meta-new">
                    <Tag color="#0EA5E9" className="client-type-tag">
                      {visitor?.client_type?.name || 'عميل'}
                    </Tag>
                    {visitor?.nationality && (
                      <Tag color="#6366F1" className="nationality-tag">
                        🏳️ {visitor.nationality}
                      </Tag>
                    )}
                  </div>
                  {visitor?.phone && (
                    <div className="visitor-contact">
                      <PhoneOutlined
                        style={{ marginLeft: 8, color: '#059669' }}
                      />
                      <span>{visitor.phone}</span>
                    </div>
                  )}
                  {visitor?.id_number && (
                    <div className="visitor-contact">
                      <IdcardOutlined
                        style={{ marginLeft: 8, color: '#0EA5E9' }}
                      />
                      <span>{visitor.id_number}</span>
                    </div>
                  )}
                </div>
              </div>

              <Divider className="section-divider" />

              <div className="booking-details-new">
                <div className="details-grid">
                  <div className="detail-card arrival">
                    <CheckCircleOutlined className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">وصول</span>
                      <span className="detail-value">
                        {formatBookingDate(booking.arrival_datetime)}
                      </span>
                      <span className="detail-time">
                        {formatBookingTime(booking.arrival_datetime)}
                      </span>
                    </div>
                  </div>

                  <div className="detail-card checkout">
                    <ClockCircleOutlined className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">مغادرة</span>
                      <span className="detail-value">
                        {formatBookingDate(
                          booking.checkout_datetime || booking.check_out_date
                        )}
                      </span>
                      <span className="detail-time">
                        {formatBookingTime(
                          booking.checkout_datetime || booking.check_out_date
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="detail-card duration">
                    <CalendarOutlined className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">المدة</span>
                      <span className="detail-value">
                        {booking.duration_days ||
                          getBookingDuration() ||
                          'غير محدد'}{' '}
                        أيام
                      </span>
                    </div>
                  </div>

                  <div className="detail-card amount">
                    <DollarOutlined className="detail-icon" />
                    <div className="detail-content">
                      <span className="detail-label">المبلغ</span>
                      <span className="detail-value price">
                        {booking.total_amount || 0} جنيه
                      </span>
                    </div>
                  </div>

                </div>

                {booking.payment_method && (
                  <div className="payment-info">
                    <span className="payment-icon">💳</span>
                    <span className="payment-method">
                      {booking.payment_method}
                    </span>
                  </div>
                )}

                {booking.meals && booking.meals.length > 0 && (
                  <div className="meals-info">
                    <span className="meals-icon">🍽️</span>
                    <span className="meals-text">
                      {Array.isArray(booking.meals)
                        ? booking.meals.join(', ')
                        : booking.meals}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-apartment-new">
              <div className="empty-icon-new">
                <HomeOutlined />
              </div>
              <h3 className="empty-title">شقة متاحة</h3>
              <p className="empty-text">اضغط للحجز </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ApartmentCard;
