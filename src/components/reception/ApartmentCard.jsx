import React from "react";
import { Card, Badge, Tag, Tooltip, Avatar, Divider, Button } from "antd";
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
} from "@ant-design/icons";
import "./ApartmentCard.scss";
import moment from "moment";

const ApartmentCard = ({
  apartment,
  onClick,
  showActions = false,
  onEdit,
  onDelete,
  onCheckout,
}) => {
  // Consistent booking data access - prioritize current_booking from API
  const booking = apartment.current_booking || apartment.booking;
  const visitor = booking?.visitor;

  // Debug logging for booking data
  React.useEffect(() => {
    if (booking) {
      console.log("ApartmentCard - Booking data:", booking);
      console.log("ApartmentCard - Visitor data:", visitor);
    }
  }, [booking, visitor]);

  // Enhanced room type configurations with sophisticated business colors
  const getRoomTypeConfig = (roomType) => {
    const configs = {
      single: {
        icon: "🛏️",
        label: "فردي",
        color: "#0EA5E9", // Sky blue - professional and calming
        bgColor: "#F0F9FF",
        borderColor: "#7DD3FC",
        headerBg: "linear-gradient(135deg, #567A88 0%, #90CFEC 100%)",
        // headerBg: "#BCD4DF",
      },
      double: {
        icon: "🏠",
        label: "مزدوج",
        color: "#6366F1", // Indigo - sophisticated and trustworthy
        bgColor: "#F8FAFC",
        borderColor: "#A5B4FC",
        headerBg: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
      },
      suite: {
        icon: "🏰",
        label: "جناح",
        color: "#8B5A2B", // Warm brown - luxury and elegance
        bgColor: "#FDF6E3",
        borderColor: "#D4A574",
        headerBg: "linear-gradient(135deg, #8B5A2B 0%, #6B4423 100%)",
      },
      family: {
        icon: "👨‍👩‍👧‍👦",
        label: "عائلي",
        color: "#059669", // Forest green - family-friendly and natural
        bgColor: "#F0FDF4",
        borderColor: "#6EE7B7",
        headerBg: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      },
    };
    return configs[roomType] || configs.single;
  };

  const roomConfig = getRoomTypeConfig(apartment.room_type);

  // Enhanced apartment card style with softer business colors
  const getCardStyle = () => {
    const baseStyle = {
      borderWidth: "2px",
      borderStyle: "solid",
      position: "relative",
      borderRadius: "16px",
      overflow: "hidden",
    };

    // Check both booking and is_occupied status
    const isOccupied = booking || apartment.is_occupied;

    if (!isOccupied) {
      // Available apartment - Soft teal/mint theme (welcoming and professional)
      return {
        ...baseStyle,
        borderColor: "#14B8A6",
        backgroundColor: "#F0FDFA",
        boxShadow: "0 4px 20px rgba(20, 184, 166, 0.12)",
      };
    }

    // Occupied apartment - Warm amber theme (professional, not alarming)
    return {
      ...baseStyle,
      borderColor: "#F59E0B",
      backgroundColor: "#FFFBEB",
      boxShadow: "0 4px 20px rgba(245, 158, 11, 0.12)",
    };
  };

  // Check if booking is early checkout
  const isEarlyCheckout = () => {
    if (!booking?.checkout_datetime && !booking?.check_out_date) return false;

    const scheduledCheckout = moment(
      booking.checkout_datetime || booking.check_out_date
    );
    const today = moment().startOf("day");

    return today.isBefore(scheduledCheckout, "day");
  };

  // Format booking dates
  const formatBookingDate = (date) => {
    if (!date) return "غير محدد";
    return moment(date).format("DD/MM/YYYY");
  };

  const formatBookingTime = (date) => {
    if (!date) return "غير محدد";
    return moment(date).format("HH:mm");
  };

  const getBookingDuration = () => {
    if (!booking?.arrival_datetime || !booking?.checkout_datetime) return null;

    const arrival = moment(booking.arrival_datetime);
    const checkout = moment(
      booking.checkout_datetime || booking.check_out_date
    );
    const duration = checkout.diff(arrival, "days");

    return duration;
  };

  // Enhanced Status Badge Component with softer colors
  const getStatusBadge = () => {
    const isOccupied = booking || apartment.is_occupied;

    if (!isOccupied) {
      return (
        <div className="status-badge-new available">
          <CheckCircleOutlined className="status-icon" />
          <span className="status-text">متاحة</span>
        </div>
      );
    }

    return (
      <div className="status-badge-new occupied">
        <ExclamationCircleOutlined className="status-icon" />
        <span className="status-text">مشغولة</span>
        {isEarlyCheckout() && (
          <div className="early-checkout-tag">مغادرة مبكرة</div>
        )}
      </div>
    );
  };

  // Determine if apartment is occupied
  const isOccupied = booking || apartment.is_occupied;

  return (
    <div
      className={`apartment-card-wrapper ${
        isOccupied ? "occupied" : "available"
      }`}
    >
      <Card
        className={`apartment-card-new ${apartment.room_type}-room`}
        style={getCardStyle()}
        hoverable
        onClick={onClick}
        title={
          <div
            className="apartment-header-new"
            style={{
              background: isOccupied
                ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" // Warm amber for occupied
                : roomConfig.headerBg,
              margin: "-16px -24px 16px -24px",
              padding: "20px 24px",
              borderRadius: "14px 14px 0 0",
              position: "relative",
            }}
          >
            <div className="apartment-info-new">
              <div className="apartment-main-info">
                <HomeOutlined
                  className="apartment-icon"
                  style={{ marginRight: "10px" }}
                />
                <div className="apartment-details">
                  <span className="apartment-number">
                    {apartment.building?.name} - شقة{" "}
                    {apartment.apartment_number}
                  </span>
                  <div className="apartment-tags">
                    <Tag className="room-type-tag">
                      {roomConfig.icon} {roomConfig.label}
                    </Tag>
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
          // ...(showActions
          //   ? [
          //       <Tooltip title="تعديل">
          //         <SettingOutlined
          //           className="action-icon edit-icon"
          //           onClick={(e) => {
          //             e.stopPropagation();
          //             onEdit(apartment);
          //           }}
          //         />
          //       </Tooltip>,
          //       <Tooltip title="حذف">
          //         <span
          //           className="action-icon delete-icon"
          //           onClick={(e) => {
          //             e.stopPropagation();
          //             onDelete(apartment);
          //           }}
          //         >
          //           🗑️
          //         </span>
          //       </Tooltip>,
          //     ]
          //   : []),
          ...(booking && onCheckout
            ? [
                <Tooltip title="تسجيل مغادرة">
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<LogoutOutlined />}
                    className="checkout-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCheckout(apartment, booking);
                    }}
                    style={{ padding: "0px" }}
                  >
                    مغادرة
                  </Button>
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
                    backgroundColor: "#6366F1", // Sophisticated indigo instead of harsh red
                    marginLeft: 16,
                  }}
                />
                <div className="visitor-details-new">
                  <h3 className="visitor-name">
                    {visitor?.name || "زائر غير محدد"}
                  </h3>
                  <div className="visitor-meta-new">
                    <Tag color="#0EA5E9" className="client-type-tag">
                      {visitor?.client_type?.name || "عميل"}
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
                        style={{ marginLeft: 8, color: "#059669" }}
                      />
                      <span>{visitor.phone}</span>
                    </div>
                  )}
                  {visitor?.id_number && (
                    <div className="visitor-contact">
                      <IdcardOutlined
                        style={{ marginLeft: 8, color: "#0EA5E9" }}
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
                          "غير محدد"}{" "}
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
                        ? booking.meals.join(", ")
                        : booking.meals}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // <div className="empty-apartment-new">
            //   {/* <div className="empty-icon-new">
            //     <HomeOutlined />
            //   </div> */}
            //   {/* <h3 className="empty-title">شقة متاحة</h3> */}
            //   {/* <p className="empty-text">اضغط لإجراء حجز جديد</p> */}
            //   <Tag
            //     color="success"
            //     className="available-tag"
            //     style={{
            //       background: roomConfig.headerBg,
            //       borderRadius: "100px",
            //       padding: "40px",
            //       color: "#fffff",
            //     }}
            //   >
            //     <strong style={{ color: "#fffF" , font}}> {apartment?.apartment_number}</strong>
            //     <br />
            //     إضغط للحجز
            //   </Tag>
            // </div>

            <div className="empty-apartment-new">
              <div className="empty-icon-new">
                <HomeOutlined />
              </div>
              <h3 className="empty-title">شقة متاحة</h3>
              <p className="empty-text">اضغط لإجراء حجز جديد</p>
              
            
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ApartmentCard;
