import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Tag,
  Tooltip,
  Avatar,
  Button,
  Typography,
  DatePicker,
  Space,
  Spin,
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  PlusOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getApartments } from '../../apis/reception/receptionApi';
import moment from 'moment';
import 'moment/locale/ar-sa';
import './CalendarView.scss';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// Configure Arabic locale with custom settings
moment.locale('ar-sa', {
  months:
    'يناير_فبراير_مارس_أبريل_مايو_يونيو_يوليو_أغسطس_سبتمبر_أكتوبر_نوفمبر_ديسمبر'.split(
      '_'
    ),
  monthsShort:
    'يناير_فبراير_مارس_أبريل_مايو_يونيو_يوليو_أغسطس_سبتمبر_أكتوبر_نوفمبر_ديسمبر'.split(
      '_'
    ),
  weekdays: 'الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت'.split('_'),
  weekdaysShort: 'أحد_إثنين_ثلاثاء_أربعاء_خميس_جمعة_سبت'.split('_'),
  weekdaysMin: 'ح_ن_ث_ر_خ_ج_س'.split('_'),
  longDateFormat: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD/MM/YYYY',
    LL: 'D MMMM YYYY',
    LLL: 'D MMMM YYYY HH:mm',
    LLLL: 'dddd D MMMM YYYY HH:mm',
  },
});
moment.locale('ar-sa');

// Helper function to format dates in Arabic
const formatArabicDate = (date, format) => {
  return moment(date).locale('ar-sa').format(format);
};

const CalendarView = ({
  onCellClick,
  onBookingClick,
  dateRangeFilter = [],
  availabilityMode = false,
  filters = {},
  onDateRangeChange,
  onApartmentDataChange,
}) => {
  // Internal date range state for the calendar
  const [internalDateRange, setInternalDateRange] = useState(() => {
    if (dateRangeFilter.length === 2) {
      return dateRangeFilter;
    }
    return [moment().startOf('week'), moment().startOf('week').add(13, 'days')];
  });

  // State for current week view
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    return internalDateRange[0].clone().startOf('week');
  });

  const daysToShow = 14; // Show 2 weeks

  // Update internal date range when parent prop changes
  useEffect(() => {
    if (dateRangeFilter.length === 2) {
      const newRange = [moment(dateRangeFilter[0]), moment(dateRangeFilter[1])];
      setInternalDateRange(newRange);
      setCurrentWeekStart(newRange[0].clone().startOf('week'));
    }
  }, [dateRangeFilter[0]?.valueOf(), dateRangeFilter[1]?.valueOf()]);

  // Fetch apartments data independently
  const {
    data: apartmentsData,
    isLoading: apartmentsLoading,
    error: apartmentsError,
    refetch: refetchApartments,
  } = useQuery({
    queryKey: [
      'calendar-apartments',
      filters,
      internalDateRange[0]?.format('YYYY-MM-DD'),
      internalDateRange[1]?.format('YYYY-MM-DD'),
      currentWeekStart.format('YYYY-MM-DD'),
    ],
    queryFn: () => {
      const params = {
        ...filters,
        include:
          'building,current_booking.visitor,bookings.visitor,pending_bookings.visitor,reservations.visitor',
        from_date: internalDateRange[0].format('YYYY-MM-DD'),
        to_date: internalDateRange[1].format('YYYY-MM-DD'),
      };
      return getApartments(params);
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10000,
  });

  // Send apartment data to parent when it changes
  useEffect(() => {
    if (apartmentsData?.data && onApartmentDataChange) {
      onApartmentDataChange(apartmentsData.data);
    }
  }, [apartmentsData?.data, onApartmentDataChange]);

  // Generate dates for the current view
  const dates = useMemo(() => {
    const datesArray = [];
    for (let i = 0; i < daysToShow; i++) {
      datesArray.push(moment(currentWeekStart).add(i, 'days'));
    }
    return datesArray;
  }, [currentWeekStart, daysToShow]);

  const apartments = apartmentsData?.data || [];

  // Handle date range change from the picker
  const handleDateRangePickerChange = (dates) => {
    if (dates && dates.length === 2) {
      const newRange = [moment(dates[0]), moment(dates[1])];
      setInternalDateRange(newRange);
      setCurrentWeekStart(newRange[0].clone().startOf('week'));

      // Notify parent component about the change
      if (onDateRangeChange) {
        onDateRangeChange(newRange, filters);
      }
    }
  };

  // Navigation functions
  const goToPreviousWeek = () => {
    const newStartDate = moment(currentWeekStart).subtract(7, 'days');
    setCurrentWeekStart(newStartDate);

    // Update the date range to include the new week view
    const newDateRange = [
      moment(newStartDate),
      moment(newStartDate).add(daysToShow - 1, 'days'),
    ];
    setInternalDateRange(newDateRange);

    // Trigger API request with new date range and current filters
    if (onDateRangeChange) {
      onDateRangeChange(newDateRange, filters);
    }
  };

  const goToNextWeek = () => {
    const newStartDate = moment(currentWeekStart).add(7, 'days');
    setCurrentWeekStart(newStartDate);

    // Update the date range to include the new week view
    const newDateRange = [
      moment(newStartDate),
      moment(newStartDate).add(daysToShow - 1, 'days'),
    ];
    setInternalDateRange(newDateRange);

    // Trigger API request with new date range and current filters
    if (onDateRangeChange) {
      onDateRangeChange(newDateRange, filters);
    }
  };

  const goToToday = () => {
    const today = moment();
    const newStartDate = today.clone().startOf('week');
    setCurrentWeekStart(newStartDate);

    const newDateRange = [
      moment(newStartDate),
      moment(newStartDate).add(daysToShow - 1, 'days'),
    ];
    setInternalDateRange(newDateRange);

    // Trigger API request with new date range and current filters
    if (onDateRangeChange) {
      onDateRangeChange(newDateRange, filters);
    }
  };

  // Check if apartment has booking on specific date
  const getBookingForDate = (apartment, date) => {
    const allBookings = [];

    // Add current_booking (active booking)
    if (apartment.current_booking) {
      allBookings.push({
        ...apartment.current_booking,
        booking_type: 'active',
      });
    }

    // Add all bookings from booking array (apartment.booking contains ALL bookings)
    if (apartment.booking && Array.isArray(apartment.booking)) {
      apartment.booking.forEach((booking) => {
        // Skip if this is the same as current_booking
        if (
          apartment.current_booking &&
          booking.id === apartment.current_booking.id
        ) {
          return;
        }
        // Assign booking_type based on status
        let booking_type = 'pending';
        if (booking.status === 'confirmed') booking_type = 'confirmed';
        allBookings.push({
          ...booking,
          booking_type,
        });
      });
    }

    // Remove duplicates and filter valid bookings for the specified date
    const validBookings = allBookings.filter((booking, index, arr) => {
      if (!booking) return false;
      // Remove duplicates based on booking ID
      const isDuplicate =
        arr.findIndex((b) => b && b.id === booking.id) !== index;
      if (isDuplicate) return false;
      const arrivalDate = moment(
        booking.arrival_datetime ||
          booking.arrival_date ||
          booking.check_in_date
      );
      const checkoutDate = moment(
        booking.checkout_datetime ||
          booking.check_out_date ||
          booking.departure_date ||
          booking.departure_datetime
      );
      return (
        arrivalDate.isValid() &&
        checkoutDate.isValid() &&
        date.isBetween(arrivalDate, checkoutDate, 'day', '[]')
      );
    });

    if (validBookings.length === 0) return null;

    // Sort bookings by priority: active > confirmed > pending
    const sortedBookings = validBookings.sort((a, b) => {
      if (a.booking_type === 'active' && b.booking_type !== 'active') return -1;
      if (b.booking_type === 'active' && a.booking_type !== 'active') return 1;
      if (a.booking_type === 'confirmed' && b.booking_type === 'pending')
        return -1;
      if (b.booking_type === 'confirmed' && a.booking_type === 'pending')
        return 1;
      // If same type, prioritize by created date (newer first)
      const dateA = moment(a.created_at || a.arrival_datetime);
      const dateB = moment(b.created_at || b.arrival_datetime);
      return dateB.diff(dateA);
    });

    // Return the highest priority booking
    return sortedBookings[0];
  };

  // Get ALL bookings for a specific date (for displaying multiple bookings)
  const getAllBookingsForDate = (apartment, date) => {
    const allBookings = [];

    // Add current_booking (active booking)
    if (apartment.current_booking) {
      allBookings.push({
        ...apartment.current_booking,
        booking_type: 'active',
      });
    }

    // Add all bookings from booking array (apartment.booking contains ALL bookings)
    if (apartment.booking && Array.isArray(apartment.booking)) {
      apartment.booking.forEach((booking) => {
        // Skip if this is the same as current_booking
        if (
          apartment.current_booking &&
          booking.id === apartment.current_booking.id
        ) {
          return;
        }
        let booking_type = 'pending';
        if (booking.status === 'confirmed') booking_type = 'confirmed';
        allBookings.push({
          ...booking,
          booking_type,
        });
      });
    }

    // Remove duplicates and filter valid bookings for the specified date
    const validBookings = allBookings.filter((booking, index, arr) => {
      if (!booking) return false;
      // Remove duplicates based on booking ID
      const isDuplicate =
        arr.findIndex((b) => b && b.id === booking.id) !== index;
      if (isDuplicate) return false;
      const arrivalDate = moment(
        booking.arrival_datetime ||
          booking.arrival_date ||
          booking.check_in_date
      );
      const checkoutDate = moment(
        booking.checkout_datetime ||
          booking.check_out_date ||
          booking.departure_date ||
          booking.departure_datetime
      );
      return (
        arrivalDate.isValid() &&
        checkoutDate.isValid() &&
        date.isBetween(arrivalDate, checkoutDate, 'day', '[]')
      );
    });

    // Sort: active > confirmed > pending
    return validBookings.sort((a, b) => {
      if (a.booking_type === 'active' && b.booking_type !== 'active') return -1;
      if (b.booking_type === 'active' && a.booking_type !== 'active') return 1;
      if (a.booking_type === 'confirmed' && b.booking_type === 'pending')
        return -1;
      if (b.booking_type === 'confirmed' && a.booking_type === 'pending')
        return 1;
      const dateA = moment(a.created_at || a.arrival_datetime);
      const dateB = moment(b.created_at || b.arrival_datetime);
      return dateB.diff(dateA);
    });
  };

  // Get booking styling based on booking type
  const getBookingStyle = (booking) => {
    if (!booking) {
      return {
        backgroundColor: '#F0FDFA',
        color: '#10b981',
        borderLeft: '2px solid #10b981',
        avatarColor: '#10b981',
        textColor: '#10b981',
        statusLabel: 'متاح',
        cssClass: 'available',
      };
    }
    if (booking.booking_type === 'active') {
      return {
        backgroundColor: '#E3FCEC', // Soft green
        avatarColor: '#10b981',
        textColor: '#15803d',
        statusLabel: 'نشط',
        cssClass: 'active-booking',
      };
    } else if (booking.booking_type === 'confirmed') {
      return {
        backgroundColor: '#E3F2FD', // Soft blue
        avatarColor: '#1976d2',
        textColor: '#1565c0',
        statusLabel: 'مؤكد',
        cssClass: 'confirmed-booking',
      };
    } else {
      // pending
      return {
        backgroundColor: '#FFF8E1', // Soft yellow
        avatarColor: '#FFB300',
        textColor: '#B59F3B',
        statusLabel: 'معلق',
        cssClass: 'pending-booking',
      };
    }
  };

  // Check if date is the start of a booking
  const isBookingStart = (apartment, date) => {
    const booking = getBookingForDate(apartment, date);
    if (!booking) return false;

    const arrivalDate = moment(
      booking.arrival_datetime || booking.arrival_date || booking.check_in_date
    );
    return arrivalDate.isValid() && date.isSame(arrivalDate, 'day');
  };

  // Check if date is the end of a booking
  const isBookingEnd = (apartment, date) => {
    const booking = getBookingForDate(apartment, date);
    if (!booking) return false;

    const checkoutDate = moment(
      booking.checkout_datetime ||
        booking.check_out_date ||
        booking.departure_date ||
        booking.departure_datetime
    );
    return checkoutDate.isValid() && date.isSame(checkoutDate, 'day');
  };

  // Get booking span for continuous display
  const getBookingSpan = (apartment, date) => {
    const booking = getBookingForDate(apartment, date);
    if (!booking || !isBookingStart(apartment, date)) return 1;

    const arrivalDate = moment(
      booking.arrival_datetime || booking.arrival_date || booking.check_in_date
    );
    const checkoutDate = moment(
      booking.checkout_datetime ||
        booking.check_out_date ||
        booking.departure_date ||
        booking.departure_datetime
    );

    if (!arrivalDate.isValid() || !checkoutDate.isValid()) return 1;

    const span = checkoutDate.diff(arrivalDate, 'days') + 1;

    // Limit span to visible dates
    const maxSpan =
      dates.length - dates.findIndex((d) => d.isSame(date, 'day'));
    return Math.min(span, maxSpan);
  };

  // Check if cell should be rendered (not part of a previous booking span)
  const shouldRenderCell = (apartment, date) => {
    const booking = getBookingForDate(apartment, date);
    if (!booking) return true;

    return isBookingStart(apartment, date);
  };

  const getRoomTypeConfig = (roomType) => {
    const configs = {
      single: { color: '#0EA5E9', bgColor: '#F0F9FF', label: 'فردي' },
      double: { color: '#6366F1', bgColor: '#F8FAFC', label: 'مزدوج' },
      suite: { color: '#8B5A2B', bgColor: '#FDF6E3', label: 'جناح' },
      family: { color: '#059669', bgColor: '#F0FDF4', label: 'عائلي' },
    };
    return configs[roomType] || configs.single;
  };

  if (apartmentsError) {
    return (
      <div className="calendar-view">
        <div className="calendar-error">
          <Text type="danger">خطأ في تحميل بيانات الشقق</Text>
          <Button onClick={refetchApartments} type="primary" size="small">
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-view">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-navigation">
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={goToPreviousWeek}
            className="nav-button"
            disabled={apartmentsLoading}
          />
          <div className="current-period">
            <Title
              level={5}
              style={{ margin: 0, unicodeBidi: 'isolate' }}
              dir="rtl"
            >
              {formatArabicDate(currentWeekStart, 'DD MMMM YYYY')} -{' '}
              {formatArabicDate(
                moment(currentWeekStart).add(daysToShow - 1, 'days'),
                'DD MMMM YYYY'
              )}
            </Title>
          </div>
          <Button
            type="text"
            icon={<RightOutlined />}
            onClick={goToNextWeek}
            className="nav-button"
            disabled={apartmentsLoading}
          />
        </div>

        <div className="calendar-info">
          <Text type="secondary" style={{ marginLeft: 16, fontSize: '14px' }}>
            عدد الشقق: <strong>{apartments.length}</strong>
          </Text>
          <Button
            type="primary"
            icon={<CalendarOutlined />}
            onClick={goToToday}
            size="small"
            disabled={apartmentsLoading}
          >
            اليوم
          </Button>
        </div>
      </div>

      {/* Loading Overlay */}
      <Spin spinning={apartmentsLoading}>
        {/* Calendar Grid - n×m Layout */}
        <div
          className="calendar-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `150px repeat(${daysToShow}, 1fr)`,
            gridTemplateRows: `auto repeat(${apartments.length}, 100px)`,
            gap: '1px',
            backgroundColor: '#f0f0f0',
            border: '2px solid #d0d0d0',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Header Row */}
          {/* Top-left corner cell */}
          <div className="corner-header-cell">
            <Text strong style={{ fontSize: '12px' }}>
              الشقق / التواريخ
            </Text>
          </div>

          {/* Date header cells */}
          {dates.map((date, colIndex) => (
            <div
              key={`header-${date.format('YYYY-MM-DD')}`}
              className={`date-header-cell ${
                date.isSame(moment(), 'day') ? 'today' : ''
              }`}
              style={{ gridColumn: colIndex + 2, gridRow: 1 }}
              title={formatArabicDate(date, 'dddd، DD MMMM YYYY')}
            >
              <div className="date-day">{formatArabicDate(date, 'DD')}</div>
              <div className="date-weekday">
                {formatArabicDate(date, 'dddd').substring(0, 3)}
              </div>

              {date.isSame(moment(), 'day') && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '8px',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  اليوم
                </div>
              )}
            </div>
          ))}

          {/* Apartment rows */}
          {apartments.map((apartment, rowIndex) => {
            const roomConfig = getRoomTypeConfig(apartment.room_type);

            return (
              <React.Fragment key={apartment.id}>
                {/* Apartment info cell */}
                <div
                  className="apartment-info-cell"
                  style={{ gridColumn: 1, gridRow: rowIndex + 2 }}
                >
                  <HomeOutlined
                    style={{
                      color: '#AF8260',
                      fontSize: '13px',
                      opacity: 0.7,
                    }}
                  />
                  <div className="apartment-details">
                    <div className="apartment-number-main">
                      {apartment.apartment_number}
                    </div>
                    <div className="apartment-building-name">
                      {apartment.building?.name}
                    </div>
                  </div>
                </div>

                {/* Date cells for this apartment */}
                {dates.map((date, colIndex) => {
                  const allBookings = getAllBookingsForDate(apartment, date);
                  const primaryBooking =
                    allBookings.length > 0 ? allBookings[0] : null;
                  const bookingStyle = getBookingStyle(primaryBooking);
                  const cellKey = `${apartment.id}-${date.format(
                    'YYYY-MM-DD'
                  )}`;
                  const hasMultipleBookings = allBookings.length > 1;

                  return (
                    <div
                      key={cellKey}
                      className={`calendar-cell ${
                        primaryBooking ? 'occupied' : 'available'
                      } ${date.isSame(moment(), 'day') ? 'today' : ''} ${
                        primaryBooking ? bookingStyle.cssClass : ''
                      } ${primaryBooking ? 'non-clickable' : ''}`}
                      style={{
                        gridColumn: colIndex + 2,
                        gridRow: rowIndex + 2,
                        backgroundColor: bookingStyle.backgroundColor,
                        border: '1px solid #ccc',
                        borderLeft: bookingStyle.borderLeft,
                        cursor: primaryBooking ? 'not-allowed' : 'pointer',
                        opacity: primaryBooking ? 0.8 : 1,
                      }}
                      onClick={
                        primaryBooking
                          ? undefined
                          : () => {
                              onCellClick(apartment, date.toDate());
                            }
                      }
                      title={`${apartment.building?.name} شقة ${
                        apartment.apartment_number
                      } - ${formatArabicDate(date, 'DD/MM/YYYY')}${
                        primaryBooking
                          ? ` - ${bookingStyle.statusLabel} (غير قابل للنقر)`
                          : ' - متاح للحجز'
                      }${
                        hasMultipleBookings
                          ? ` (+${allBookings.length - 1} حجوزات أخرى)`
                          : ''
                      }`}
                    >
                      {primaryBooking ? (
                        <div className="booking-content">
                          {hasMultipleBookings && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                backgroundColor: '#fff',
                                borderRadius: '50%',
                                width: '16px',
                                height: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '8px',
                                fontWeight: 'bold',
                                color: '#666',
                                border: '1px solid #ddd',
                              }}
                            >
                              {allBookings.length}
                            </div>
                          )}
                          <Avatar
                            size={20}
                            icon={<UserOutlined />}
                            style={{
                              backgroundColor: bookingStyle.avatarColor,
                              marginBottom: 4,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: '10px',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              color: bookingStyle.textColor,
                            }}
                          >
                            {primaryBooking.visitor?.name?.substring(0, 8) ||
                              'زائر'}
                          </Text>
                          {primaryBooking.total_amount && (
                            <Text
                              style={{
                                fontSize: '9px',
                                color: '#faad14',
                                display: 'block',
                              }}
                            >
                              {primaryBooking.total_amount}ج
                            </Text>
                          )}
                          <Text
                            style={{
                              fontSize: '8px',
                              color: bookingStyle.textColor,
                              opacity: 0.8,
                              display: 'block',
                            }}
                          >
                            {bookingStyle.statusLabel}
                          </Text>
                        </div>
                      ) : (
                        <>
                          
                        </>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </Spin>
    </div>
  );
};

export default CalendarView;
