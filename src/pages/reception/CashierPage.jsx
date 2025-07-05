import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Button,
  Space,
  Spin,
  message,
  Empty,
  Row,
  Col,
  Breadcrumb,
  Card,
  Statistic,
  Badge,
  Alert,
  Tooltip,
  Calendar,
  DatePicker,
  Avatar,
  Modal,
  Divider,
  Tag,
  InputNumber,
  Input,
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  ReloadOutlined,
  PlusOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CreditCardOutlined,
  LogoutOutlined,
  CloseOutlined,
  AppstoreOutlined,
  TableOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import {
  getApartments,
  getAvailableApartments,
  getBuildings,
  getBookings,
  createBooking,
  createReservation,
  updateBooking,
  deleteBooking,
  checkInBooking,
  checkOutBooking,
  getVisitors,
  createVisitor,
  updateVisitor,
  getReceptionStats,
  getPaymentMethods,
  getClientTypes,
  ROOM_TYPES,
  ROOM_TYPE_LABELS,
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from '../../apis/reception/receptionApi';
import ReceptionFilters from '../../components/reception/ReceptionFilters';
import ApartmentCard from '../../components/reception/ApartmentCard';
import VisitorModal from '../../components/reception/VisitorModal';
import CalendarView from '../../components/reception/CalendarView';
import './CashierPage.scss';
import moment from 'moment';
import 'moment/locale/ar';

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

moment.locale('ar');

const CashierPage = () => {
  // Get user from auth context
  const { user } = useAuth();

  // State management
  const [filters, setFilters] = useState({
    building_id: '',
    room_type: '',
    visitor_type: '',
    occupancy_status: '',
    search: '',
  });
  const [searchValue, setSearchValue] = useState('');
  const [visitorModalVisible, setVisitorModalVisible] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [selectedDateRange, setSelectedDateRange] = useState([
    moment(),
    moment().add(1, 'days'),
  ]);
  const [currentTime, setCurrentTime] = useState(moment());

  // Date range filter state - moved to filters component
  const [availabilityMode, setAvailabilityMode] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState([]);

  // Calendar date range state for navigation
  const [calendarDateRange, setCalendarDateRange] = useState([]);

  // View mode state
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'calendar'

  // Calendar apartments data (when calendar is independent)
  const [calendarApartments, setCalendarApartments] = useState([]);

  // Visitor Preview Modal State
  const [visitorPreviewVisible, setVisitorPreviewVisible] = useState(false);
  const [previewApartment, setPreviewApartment] = useState(null);

  // Checkout Modal State
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [checkoutApartment, setCheckoutApartment] = useState(null);
  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutDiscountReason, setCheckoutDiscountReason] = useState('');

  // Add early checkout calculations
  const isEarlyCheckout =
    checkoutBooking &&
    moment().isBefore(
      moment(
        checkoutBooking.checkout_datetime || checkoutBooking.check_out_date
      ),
      'day'
    );

  const actualStayedDays = checkoutBooking
    ? Math.ceil(
        moment().diff(moment(checkoutBooking.arrival_datetime), 'hours') / 24
      )
    : 0;

  const dailyRate =
    checkoutBooking?.total_amount && checkoutBooking?.duration_days
      ? checkoutBooking.total_amount / checkoutBooking.duration_days
      : 0;

  const adjustedAmount = isEarlyCheckout
    ? Math.round(actualStayedDays * dailyRate * 100) / 100
    : checkoutBooking?.total_amount;

  const queryClient = useQueryClient();

  // Fetch data with React Query (only for card view)
  const {
    data: apartmentsData,
    isLoading: apartmentsLoading,
    error: apartmentsError,
    refetch: refetchApartments,
  } = useQuery({
    queryKey: [
      'apartments',
      filters,
      searchValue,
      availabilityMode,
      dateRangeFilter,
      viewMode,
    ],
    queryFn: () => {
      // For card view only, use availability mode logic
      if (availabilityMode && dateRangeFilter.length === 2) {
        return getAvailableApartments({
          ...filters,
          search: searchValue,
          from_date: dateRangeFilter[0].format('YYYY-MM-DD'),
          to_date: dateRangeFilter[1].format('YYYY-MM-DD'),
          include:
            'building,current_booking.visitor,bookings.visitor,pending_bookings.visitor,reservations.visitor',
        });
      }

      return getApartments({
        ...filters,
        search: searchValue,
        include:
          'building,current_booking.visitor,bookings.visitor,pending_bookings.visitor,reservations.visitor',
      });
    },
    enabled: viewMode === 'cards', // Only fetch for cards view
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10000,
  });

  const { data: buildingsData, isLoading: buildingsLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => getBuildings(),
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['cashier-dashboard'],
    queryFn: () => getReceptionStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } =
    useQuery({
      queryKey: ['payment-methods'],
      queryFn: () => getPaymentMethods(),
    });

  const { data: clientTypesData, isLoading: clientTypesLoading } = useQuery({
    queryKey: ['client-types'],
    queryFn: () => getClientTypes(),
  });

  // Mutations
  const createBookingMutation = useMutation({
    mutationFn: (data) => createBooking(data),
    onSuccess: () => {
      message.success('تم إنشاء الحجز بنجاح!');
      setVisitorModalVisible(false);
      queryClient.invalidateQueries(['apartments']);
      queryClient.invalidateQueries(['cashier-dashboard']);
    },
    onError: (error) => {
      message.error('فشل في إنشاء الحجز: ' + error.message);
    },
  });

  const createReservationMutation = useMutation({
    mutationFn: (data) => createReservation(data),
    onSuccess: () => {
      message.success('تم إنشاء الحجز المسبق بنجاح!');
      setVisitorModalVisible(false);
      queryClient.invalidateQueries(['apartments']);
      queryClient.invalidateQueries(['cashier-dashboard']);
    },
    onError: (error) => {
      message.error('فشل في إنشاء الحجز المسبق: ' + error.message);
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }) => updateBooking(id, data),
    onSuccess: () => {
      message.success('تم تحديث الحجز بنجاح!');
      setVisitorModalVisible(false);
      queryClient.invalidateQueries(['apartments']);
      queryClient.invalidateQueries(['cashier-dashboard']);
    },
    onError: (error) => {
      message.error('فشل في تحديث الحجز: ' + error.message);
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: ({ bookingId, checkoutData }) =>
      checkOutBooking(bookingId, checkoutData),
    onSuccess: (data) => {
      const isEarly = data?.isEarlyCheckout;
      message.success(
        isEarly
          ? 'تم تسجيل المغادرة المبكرة بنجاح!'
          : 'تم تسجيل المغادرة بنجاح!'
      );
      setCheckoutModalVisible(false);
      setCheckoutApartment(null);
      setCheckoutBooking(null);
      queryClient.invalidateQueries(['apartments']);
      queryClient.invalidateQueries(['cashier-dashboard']);
    },
    onError: (error) => {
      message.error(
        'فشل في تسجيل المغادرة: ' +
          (error.response?.data?.message || error.message)
      );
    },
  });

  // Event handlers
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchValue('');
  };

  // Helper function to validate if apartment is actually occupied (same logic as ApartmentCard)
  const isApartmentActuallyOccupied = (apartment) => {
    const currentBooking = apartment.current_booking;
    if (!currentBooking) return false;

    const now = moment();
    const arrivalDate = moment(
      currentBooking.arrival_datetime || currentBooking.check_in_date
    );
    const checkoutDate = moment(
      currentBooking.checkout_datetime || currentBooking.check_out_date
    );

    // Check if booking is within the active period
    const isWithinPeriod =
      now.isSameOrAfter(arrivalDate, 'day') &&
      now.isBefore(checkoutDate, 'day');

    // Check if booking has a status that indicates it's completed
    const isCompleted =
      currentBooking.status === 'completed' ||
      currentBooking.status === 'checked_out';

    // Booking is active if it's within period and not completed
    return isWithinPeriod && !isCompleted;
  };

  const handleApartmentClick = (apartment) => {
    // In availability mode, all apartments are available for the selected date range
    if (availabilityMode) {
      setSelectedApartment(apartment);
      setModalMode('create');
      setVisitorModalVisible(true);
      return;
    }

    // Normal mode - check if apartment is actually occupied using date validation
    const isActuallyOccupied = isApartmentActuallyOccupied(apartment);

    // Debug logging
    console.log(
      `CashierPage - Apartment ${apartment.apartment_number} clicked:`,
      {
        hasCurrentBooking: !!apartment.current_booking,
        isActuallyOccupied,
        currentBooking: apartment.current_booking,
        action: isActuallyOccupied
          ? 'Opening visitor preview'
          : 'Opening booking modal',
      }
    );

    if (isActuallyOccupied) {
      // Show visitor preview ONLY for apartments that are truly occupied
      setPreviewApartment(apartment);
      setVisitorPreviewVisible(true);
    } else {
      // Show booking modal for available apartments (including expired bookings)
      setSelectedApartment(apartment);
      setModalMode('create');
      setVisitorModalVisible(true);
    }
  };

  // Handle calendar cell click for new bookings
  const handleCalendarCellClick = (apartment, date) => {
    setSelectedApartment(apartment);
    setSelectedDateRange([moment(date), moment(date).add(1, 'days')]);
    setModalMode('create');
    setVisitorModalVisible(true);
  };

  // Handle calendar date range change for API requests
  const handleCalendarDateRangeChange = (newDateRange, calendarFilters) => {
    console.log('📅 Calendar Date Range Changed:', {
      newRange: newDateRange.map((d) => d.format('YYYY-MM-DD')),
      filters: calendarFilters,
      currentFilters: filters,
    });

    // Update calendar date range state
    setCalendarDateRange(newDateRange);

    // Sync with availability filter in card view
    if (newDateRange.length === 2) {
      setDateRangeFilter(newDateRange);
      setAvailabilityMode(true);
    }
  };

  // Handle calendar apartments data change
  const handleCalendarApartmentDataChange = (apartments) => {
    setCalendarApartments(apartments);
  };

  // Handle view mode toggle
  const handleViewModeChange = (mode) => {
    setViewMode(mode);

    // When switching to calendar view, initialize date range if not set
    if (mode === 'calendar' && dateRangeFilter.length === 0) {
      const defaultRange = [
        moment().startOf('week'),
        moment().startOf('week').add(13, 'days'),
      ];
      setDateRangeFilter(defaultRange);
      setCalendarDateRange(defaultRange);
      setAvailabilityMode(true);
    }
  };

  const handleVisitorModalSave = async (formData) => {
    try {
      // Extract booking data from FormData
      const bookingDataStr = formData.get('booking_data');
      if (!bookingDataStr) {
        message.error('خطأ في البيانات المرسلة');
        return;
      }

      const bookingData = JSON.parse(bookingDataStr);

      // Prepare visitor data
      const visitorData = {
        name: bookingData.visitor_name,
        client_type_id: bookingData.client_type_id,
        id_type: bookingData.id_type,
        id_number: bookingData.id_number,
        nationality: bookingData.nationality,
        phone: bookingData.phone,
        emergency_contact: bookingData.emergency_contact,
      };

      // Prepare final booking data
      const finalBookingData = {
        apartment_id: selectedApartment?.id,
        visitor: visitorData,
        arrival_datetime: bookingData.arrival_datetime,
        checkout_datetime: bookingData.checkout_datetime,
        duration_days: bookingData.duration_days || bookingData.duration,
        meals: bookingData.meals || [],
        products: bookingData.products || [],
        additional_services: bookingData.additional_services || [],
        total_amount: bookingData.total_amount || 0,
        deposit_amount: bookingData.deposit_amount || 0,
        payment_method: bookingData.payment_method,
        notes: bookingData.notes || null,
        price_breakdown: bookingData.price_breakdown || {},
      };

      // Validate booking data
      if (!finalBookingData.arrival_datetime) {
        console.error('Missing arrival_datetime');
        message.error('تاريخ الوصول مطلوب');
        return;
      }

      if (
        !finalBookingData.duration_days ||
        finalBookingData.duration_days < 1
      ) {
        console.error('Invalid duration_days:', finalBookingData.duration_days);
        message.error('مدة الإقامة يجب أن تكون يوم واحد على الأقل');
        return;
      }

      // Final validation before API call
      if (
        !finalBookingData.visitor ||
        typeof finalBookingData.visitor !== 'object'
      ) {
        console.error('ERROR: Visitor object is missing or invalid');
        message.error('بيانات الزائر غير مكتملة');
        return;
      }

      const requiredVisitorProps = [
        'name',
        'client_type_id',
        'id_type',
        'id_number',
        'nationality',
      ];
      const missingProps = requiredVisitorProps.filter(
        (prop) => !finalBookingData.visitor[prop]
      );

      if (missingProps.length > 0) {
        console.error('ERROR: Missing visitor properties:', missingProps);
        message.error(`بيانات الزائر غير مكتملة: ${missingProps.join(', ')}`);
        return;
      }

      console.log('✅ All validation passed, calling API...');

      // Create booking or reservation based on booking type
      if (bookingData.booking_type === 'reservation') {
        await createReservationMutation.mutateAsync(finalBookingData);
      } else {
        await createBookingMutation.mutateAsync(finalBookingData);
      }
    } catch (error) {
      console.error('Error saving visitor/booking:', error);
      console.error('Error details:', error.response?.data);
      message.error(
        'فشل في حفظ البيانات: ' +
          (error.response?.data?.message || error.message || 'خطأ غير معروف')
      );
    }
  };

  const handleRefresh = () => {
    refetchApartments();
    queryClient.invalidateQueries(['buildings']);
    queryClient.invalidateQueries(['cashier-dashboard']);
    message.success('تم تحديث البيانات بنجاح');
  };

  const handleVisitorModalClose = () => {
    setVisitorModalVisible(false);
    setSelectedApartment(null);
    // Refetch data to get updated information
    queryClient.invalidateQueries(['apartments']);
    queryClient.invalidateQueries(['cashier-dashboard']);
  };

  const handleVisitorPreviewClose = () => {
    setVisitorPreviewVisible(false);
    setPreviewApartment(null);
  };

  const handleEditBookingFromPreview = () => {
    setVisitorPreviewVisible(false);
    setSelectedApartment(previewApartment);
    setModalMode('edit');
    setVisitorModalVisible(true);
    setPreviewApartment(null);
  };

  const handleCheckout = (apartment, booking) => {
    setCheckoutApartment(apartment);
    console.log(
      'CashierPage - handleCheckout called with booking:',
      booking || {}
    );

    // Get the current booking from apartment.booking array
    const currentBooking =
      apartment.booking?.find((b) => b.id === booking.id) || booking;

    // Parse existing checkout discount if any
    const existingDiscount = parseFloat(
      currentBooking.checkout_discount_amount || 0
    );

    // Set the checkout discount state
    setCheckoutDiscount(existingDiscount);
    setCheckoutDiscountReason(currentBooking.checkout_discount_reason || '');

    // Set the checkout booking with all necessary data
    setCheckoutBooking({
      ...currentBooking,
      deposit_amount: parseFloat(currentBooking.deposit_amount || 0),
      total_amount: parseFloat(currentBooking.total_amount || 0),
      remaining_amount: parseFloat(currentBooking.remaining_amount || 0),
      final_amount: parseFloat(
        currentBooking.final_amount || currentBooking.total_amount || 0
      ),
      checkout_discount_amount: existingDiscount,
      checkout_discount_reason: currentBooking.checkout_discount_reason || '',
    });

    setCheckoutModalVisible(true);
  };

  const handleCheckoutConfirm = async () => {
    try {
      const checkoutData = {
        actual_checkout_datetime: moment().format(),
        checkout_discount_amount: checkoutDiscount || 0,
        checkout_discount_reason: checkoutDiscountReason,
        // Add early checkout information
        ...(isEarlyCheckout && {
          early_checkout_reason: `مغادرة مبكرة - إقامة فعلية: ${actualStayedDays} أيام من أصل ${checkoutBooking.duration_days} يوم`,
          final_amount: adjustedAmount,
          deposit_refund_amount: depositRefund > 0 ? depositRefund : undefined,
          payment_status: finalStatus,
        }),
      };

      await checkoutMutation.mutateAsync({
        bookingId: checkoutBooking.id,
        checkoutData,
      });

      message.success(
        finalStatus === 'refund'
          ? `تم تسجيل المغادرة بنجاح. يجب استرداد ${depositRefund.toLocaleString()} جنيه للنزيل`
          : 'تم تسجيل المغادرة بنجاح'
      );

      setCheckoutModalVisible(false);
      setCheckoutApartment(null);
      setCheckoutBooking(null);
      setCheckoutDiscount(0);
      setCheckoutDiscountReason('');

      // Refresh data
      queryClient.invalidateQueries(['apartments']);
      queryClient.invalidateQueries(['bookings']);
    } catch (error) {
      console.error('Error during checkout:', error);
      message.error('حدث خطأ أثناء تسجيل المغادرة');
    }
  };

  const handleCheckoutCancel = () => {
    setCheckoutModalVisible(false);
    setCheckoutApartment(null);
    setCheckoutBooking(null);
    setCheckoutDiscount(0);
    setCheckoutDiscountReason('');
  };

  const handleQuickFilter = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType] === value ? '' : value,
    }));
  };

  const handleDateRangeChange = (dates) => {
    setDateRangeFilter(dates || []);
    if (dates && dates.length === 2) {
      setAvailabilityMode(true);
      // Also sync with calendar view if it's active
      if (viewMode === 'calendar') {
        setCalendarDateRange(dates);
      }
    } else {
      setAvailabilityMode(false);
      // Clear calendar date range as well
      if (viewMode === 'calendar') {
        setCalendarDateRange([]);
      }
    }
  };

  const handleAvailabilityModeToggle = () => {
    if (availabilityMode) {
      // Exit availability mode
      setAvailabilityMode(false);
      setDateRangeFilter([]);
    } else {
      // Enter availability mode - set default date range if not set
      if (dateRangeFilter.length === 0) {
        const defaultRange = [moment(), moment().add(1, 'days')];
        setDateRangeFilter(defaultRange);
      }
      setAvailabilityMode(true);
    }
  };

  const handleClearAvailabilityFilter = () => {
    setAvailabilityMode(false);
    setDateRangeFilter([]);
  };

  const getTodayArrivals = () => {
    // Count current active bookings that arrived today
    return (
      apartmentsData?.data.filter(
        (apt) =>
          apt.current_booking &&
          moment(apt.current_booking.arrival_datetime).isSame(moment(), 'day')
      ).length || 0
    );
  };

  const getTodayDepartures = () => {
    // Count bookings scheduled to checkout today
    return (
      apartmentsData?.data.filter(
        (apt) =>
          apt.current_booking &&
          moment(
            apt.current_booking.checkout_datetime ||
              apt.current_booking.check_out_date
          ).isSame(moment(), 'day')
      ).length || 0
    );
  };

  const getOverdueCheckouts = () => {
    // Count active bookings that should have checked out before today
    return (
      apartmentsData?.data.filter(
        (apt) =>
          apt.current_booking &&
          moment(
            apt.current_booking.checkout_datetime ||
              apt.current_booking.check_out_date
          ).isBefore(moment(), 'day')
      ).length || 0
    );
  };

  // Prepare data based on view mode
  const apartments =
    viewMode === 'calendar' ? calendarApartments : apartmentsData?.data || [];
  const buildings = buildingsData?.data || [];

  // Filter apartments based on occupancy status
  const filteredApartments = apartments.filter((apartment) => {
    // Apply occupancy status filter
    if (filters.occupancy_status === 'available') {
      // Available = no current active booking and apartment is active
      return !apartment.current_booking && apartment.is_active;
    } else if (filters.occupancy_status === 'occupied') {
      // Occupied = has current active booking
      return apartment.current_booking;
    }

    // If no occupancy filter is set, return all apartments
    return true;
  });

  const totalApartments = apartments.length;

  // Calculate stats based on current_booking (active bookings only)
  const availableApartments = apartments.filter(
    (apt) => !apt.current_booking && apt.is_active
  ).length;

  const occupiedApartments = apartments.filter(
    (apt) => apt.current_booking && apt.is_active
  ).length;

  // Count active bookings (apartments with current_booking)
  const activeBookings = apartments.filter((apt) => apt.current_booking).length;

  const occupancyRate =
    totalApartments > 0
      ? Math.round((occupiedApartments / totalApartments) * 100)
      : 0;

  // Stats for quick view
  const stats = {
    total_apartments: totalApartments,
    available_apartments: availableApartments,
    occupied_apartments: occupiedApartments,
    active_bookings: activeBookings,
    occupancy_rate: occupancyRate,
    today_arrivals: getTodayArrivals(),
    today_departures: getTodayDepartures(),
    overdue_checkouts: getOverdueCheckouts(),
  };

  const paymentMethods = paymentMethodsData?.data || [];
  const clientTypes = clientTypesData?.data || [];

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Add deposit refund calculations
  const depositAmount = parseFloat(checkoutBooking?.deposit_amount || 0);
  const depositRefund =
    isEarlyCheckout && depositAmount > adjustedAmount
      ? depositAmount - adjustedAmount
      : 0;

  const remainingAmount = Math.max(
    0,
    parseFloat(
      isEarlyCheckout ? adjustedAmount : checkoutBooking?.total_amount || 0
    ) - depositAmount
  );

  const finalStatus = isEarlyCheckout
    ? depositAmount > adjustedAmount
      ? 'refund'
      : depositAmount === adjustedAmount
      ? 'equal'
      : depositAmount < adjustedAmount
      ? 'remaining'
      : 'equal'
    : 'normal';

  if (apartmentsError) {
    return (
      <Layout className="cashier-page">
        <Content style={{ padding: '20px' }}>
          <Alert
            message="خطأ في تحميل البيانات"
            description="حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى."
            type="error"
            action={
              <Button size="small" onClick={handleRefresh}>
                إعادة المحاولة
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="cashier-page">
      <Content>
        <div className="page-header">
          <div className="page-title">
            <div className="title-section">
              <Avatar
                size={40}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#1890ff',
                  marginLeft: 12,
                }}
              />
              <div className="title-content">
                <Title level={2} style={{ margin: 0 }}>
                  {user?.name || 'المستخدم'}
                </Title>
                <Text type="secondary">
                  كاشير قسم - {user?.department?.name}
                </Text>
              </div>
            </div>
            <Space>
              <div className="current-time">
                <ClockCircleOutlined />
                <Text strong>{currentTime.format('DD/MM/YYYY - HH:mm')}</Text>
              </div>
              <Tooltip title="تحديث البيانات">
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={apartmentsLoading}
                >
                  تحديث
                </Button>
              </Tooltip>
            </Space>
          </div>
        </div>

        <div className="page-content">
          {/* Quick Status Filters */}
          <div className="quick-filters">
            <Space size="middle">
              <Button
                type={filters.occupancy_status === '' ? 'primary' : 'default'}
                onClick={() => handleQuickFilter('occupancy_status', '')}
                icon={<HomeOutlined />}
              >
                جميع الشقق ({totalApartments})
              </Button>
              <Button
                type={
                  filters.occupancy_status === 'available'
                    ? 'primary'
                    : 'default'
                }
                onClick={() =>
                  handleQuickFilter('occupancy_status', 'available')
                }
                icon={<CheckCircleOutlined />}
                style={{
                  color:
                    filters.occupancy_status === 'available'
                      ? '#fff'
                      : '#52c41a',
                  borderColor: '#52c41a',
                  backgroundColor:
                    filters.occupancy_status === 'available'
                      ? '#52c41a'
                      : '#f6ffed',
                }}
              >
                متاحة ({availableApartments})
              </Button>
              <Button
                type={
                  filters.occupancy_status === 'occupied'
                    ? 'primary'
                    : 'default'
                }
                onClick={() =>
                  handleQuickFilter('occupancy_status', 'occupied')
                }
                icon={<ExclamationCircleOutlined />}
                style={{
                  color:
                    filters.occupancy_status === 'occupied'
                      ? '#fff'
                      : '#ff4d4f',
                  borderColor: '#ff4d4f',
                  backgroundColor:
                    filters.occupancy_status === 'occupied'
                      ? '#ff4d4f'
                      : '#fff2f0',
                }}
              >
                مشغولة ({occupiedApartments})
              </Button>
            </Space>
          </div>

          <ReceptionFilters
            buildings={buildings}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            searchValue={searchValue}
            onClearFilters={handleClearFilters}
            showStats={true}
            stats={stats}
            loading={buildingsLoading}
            // Pass availability filter props
            availabilityMode={availabilityMode}
            dateRangeFilter={dateRangeFilter}
            onDateRangeChange={handleDateRangeChange}
            onClearAvailabilityFilter={handleClearAvailabilityFilter}
            // Pass client types props
            clientTypes={clientTypes}
            clientTypesLoading={clientTypesLoading}
          />

          <div className="apartments-section">
            <div className="section-header">
              <div className="section-title">
                <Title level={4}>
                  {availabilityMode || viewMode === 'calendar'
                    ? `الشقق المتاحة (${apartments.length})`
                    : `الشقق (${apartments.length})`}
                </Title>
                <Text type="secondary">
                  {viewMode === 'calendar'
                    ? 'اضغط على خلية التاريخ لإجراء حجز جديد، أو على الحجز لعرض التفاصيل'
                    : availabilityMode
                    ? 'اضغط على الشقة للحجز (فوري أو مسبق) للفترة المحددة'
                    : 'اضغط على الشقة لعرض التفاصيل أو إجراء حجز'}
                </Text>
              </div>
              <div className="view-toggle">
                <Button.Group>
                  <Button
                    type={viewMode === 'cards' ? 'primary' : 'default'}
                    icon={<AppstoreOutlined />}
                    onClick={() => handleViewModeChange('cards')}
                  >
                    البطاقات
                  </Button>
                  <Button
                    type={viewMode === 'calendar' ? 'primary' : 'default'}
                    icon={<TableOutlined />}
                    onClick={() => handleViewModeChange('calendar')}
                  >
                    التقويم
                  </Button>
                </Button.Group>
              </div>
            </div>

            <Spin spinning={viewMode === 'cards' ? apartmentsLoading : false}>
              {apartments.length === 0 && viewMode === 'cards' ? (
                <div className="empty-state">
                  <HomeOutlined
                    style={{ fontSize: '48px', color: '#d9d9d9' }}
                  />
                  <Title level={4} type="secondary">
                    لا توجد شقق
                  </Title>
                  <Text type="secondary">
                    لا توجد شقق متاحة بناءً على المرشحات المحددة
                  </Text>
                </div>
              ) : viewMode === 'calendar' ? (
                <CalendarView
                  onCellClick={handleCalendarCellClick}
                  onBookingClick={handleApartmentClick}
                  dateRangeFilter={dateRangeFilter}
                  availabilityMode={availabilityMode}
                  filters={filters}
                  onDateRangeChange={handleCalendarDateRangeChange}
                  onApartmentDataChange={handleCalendarApartmentDataChange}
                />
              ) : (
                <div className="apartments-grid">
                  {filteredApartments.map((apartment) => (
                    <ApartmentCard
                      key={apartment.id}
                      apartment={apartment}
                      onClick={() => handleApartmentClick(apartment)}
                      showActions={true}
                      showDetails={true}
                      onCheckout={handleCheckout}
                    />
                  ))}
                </div>
              )}
            </Spin>
          </div>
        </div>

        {/* Visitor Modal */}
        <VisitorModal
          visible={visitorModalVisible}
          onClose={handleVisitorModalClose}
          apartment={selectedApartment}
          mode={modalMode}
          onSuccess={handleVisitorModalSave}
          paymentMethods={paymentMethods}
          paymentMethodsLoading={paymentMethodsLoading}
          clientTypes={clientTypes}
          clientTypesLoading={clientTypesLoading}
          dateRange={dateRangeFilter}
          availabilityMode={availabilityMode}
        />

        {/* Visitor Preview Modal */}
        <Modal
          title={null}
          open={visitorPreviewVisible}
          onCancel={handleVisitorPreviewClose}
          footer={null}
          width={600}
          className="visitor-preview-modal"
          centered
        >
          {previewApartment &&
          previewApartment.current_booking &&
          isApartmentActuallyOccupied(previewApartment) ? (
            <div className="visitor-preview-content">
              {/* Header */}
              <div
                className="preview-header"
                style={{
                  background:
                    'linear-gradient(135deg, #803D3B 0%, #A0522D 100%)',
                  margin: '-24px -24px 24px -24px',
                  padding: '20px 24px',
                  borderRadius: '8px 8px 0 0',
                  color: '#fff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <HomeOutlined
                      style={{ fontSize: '24px', marginLeft: 12 }}
                    />
                    <div>
                      <h3
                        style={{ color: '#fff', margin: 0, fontSize: '18px' }}
                      >
                        {previewApartment.building?.name} - شقة{' '}
                        {previewApartment.apartment_number}
                      </h3>
                      <p
                        style={{
                          color: 'rgba(255,255,255,0.8)',
                          margin: 0,
                          fontSize: '14px',
                        }}
                      >
                        تفاصيل الزائر والحجز
                      </p>
                    </div>
                  </div>
                  <Badge
                    status="error"
                    text={<span style={{ color: '#FFE4E1' }}>مشغولة</span>}
                  />
                </div>
              </div>

              {/* Visitor Information */}
              {previewApartment.current_booking?.visitor && (
                <div className="visitor-section">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <Avatar
                      size={60}
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: '#803D3B',
                        marginLeft: 16,
                      }}
                    />
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '18px',
                          color: '#262626',
                        }}
                      >
                        {previewApartment.current_booking.visitor.name}
                      </h4>
                      <Tag color="#803D3B" style={{ marginTop: 4 }}>
                        {previewApartment.current_booking.visitor.client_type
                          ?.name || 'عميل'}
                      </Tag>
                    </div>
                  </div>

                  <Divider />

                  {/* Personal Details */}
                  <Row gutter={[16, 12]}>
                    <Col span={12}>
                      <div className="detail-item">
                        <IdcardOutlined
                          style={{ color: '#803D3B', marginLeft: 8 }}
                        />
                        <span style={{ color: '#8c8c8c' }}>نوع الهوية:</span>
                        <span style={{ fontWeight: '600', marginRight: 8 }}>
                          {previewApartment.current_booking.visitor.id_type ||
                            'غير محدد'}
                        </span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="detail-item">
                        <CreditCardOutlined
                          style={{ color: '#803D3B', marginLeft: 8 }}
                        />
                        <span style={{ color: '#8c8c8c' }}>رقم الهوية:</span>
                        <span style={{ fontWeight: '600', marginRight: 8 }}>
                          {previewApartment.current_booking.visitor.id_number ||
                            'غير محدد'}
                        </span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="detail-item">
                        <span style={{ color: '#803D3B', marginLeft: 8 }}>
                          🏳️
                        </span>
                        <span style={{ color: '#8c8c8c' }}>الجنسية:</span>
                        <span style={{ fontWeight: '600', marginRight: 8 }}>
                          {previewApartment.current_booking.visitor
                            .nationality || 'غير محدد'}
                        </span>
                      </div>
                    </Col>
                    {previewApartment.current_booking.visitor.phone && (
                      <Col span={12}>
                        <div className="detail-item">
                          <PhoneOutlined
                            style={{ color: '#803D3B', marginLeft: 8 }}
                          />
                          <span style={{ color: '#8c8c8c' }}>الهاتف:</span>
                          <span style={{ fontWeight: '600', marginRight: 8 }}>
                            {previewApartment.current_booking.visitor.phone}
                          </span>
                        </div>
                      </Col>
                    )}
                  </Row>

                  <Divider />

                  {/* Booking Details */}
                  <div className="booking-section">
                    <h5 style={{ color: '#803D3B', marginBottom: 16 }}>
                      تفاصيل الحجز
                    </h5>
                    <Row gutter={[16, 12]}>
                      <Col span={8}>
                        <div
                          className="detail-item"
                          style={{ textAlign: 'center' }}
                        >
                          <CheckCircleOutlined
                            style={{ color: '#52c41a', fontSize: '20px' }}
                          />
                          <div style={{ marginTop: 8 }}>
                            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                              تاريخ الوصول
                            </div>
                            <div
                              style={{ fontWeight: '600', color: '#262626' }}
                            >
                              {moment(
                                previewApartment.current_booking
                                  .arrival_datetime
                              ).format('DD/MM/YYYY')}
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div
                          className="detail-item"
                          style={{ textAlign: 'center' }}
                        >
                          <ClockCircleOutlined
                            style={{ color: '#fa8c16', fontSize: '20px' }}
                          />
                          <div style={{ marginTop: 8 }}>
                            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                              تاريخ المغادرة
                            </div>
                            <div
                              style={{ fontWeight: '600', color: '#262626' }}
                            >
                              {moment(
                                previewApartment.current_booking
                                  .checkout_datetime ||
                                  previewApartment.current_booking
                                    .check_out_date
                              ).format('DD/MM/YYYY')}
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div
                          className="detail-item"
                          style={{ textAlign: 'center' }}
                        >
                          <CalendarOutlined
                            style={{ color: '#1890ff', fontSize: '20px' }}
                          />
                          <div style={{ marginTop: 8 }}>
                            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                              مدة الإقامة
                            </div>
                            <div
                              style={{ fontWeight: '600', color: '#262626' }}
                            >
                              {previewApartment.current_booking.duration_days ||
                                'غير محدد'}{' '}
                              أيام
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* Financial Information */}
                    <Divider />
                    <div
                      style={{
                        backgroundColor: '#f9f9f9',
                        padding: '16px',
                        borderRadius: '8px',
                      }}
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <div className="detail-item">
                            <DollarOutlined
                              style={{ color: '#faad14', marginLeft: 8 }}
                            />
                            <span style={{ color: '#8c8c8c' }}>
                              المبلغ الإجمالي:
                            </span>
                            <span
                              style={{
                                fontWeight: '700',
                                color: '#faad14',
                                marginRight: 8,
                                fontSize: '16px',
                              }}
                            >
                              {previewApartment.current_booking.total_amount ||
                                0}{' '}
                              جنيه
                            </span>
                          </div>
                        </Col>
                        {previewApartment.current_booking.payment_method && (
                          <Col span={12}>
                            <div className="detail-item">
                              <span style={{ color: '#803D3B', marginLeft: 8 }}>
                                💳
                              </span>
                              <span style={{ color: '#8c8c8c' }}>
                                طريقة الدفع:
                              </span>
                              <span
                                style={{ fontWeight: '600', marginRight: 8 }}
                              >
                                {
                                  previewApartment.current_booking
                                    .payment_method
                                }
                              </span>
                            </div>
                          </Col>
                        )}
                      </Row>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                      <Space>
                        <Button
                          type="primary"
                          style={{
                            backgroundColor: '#803D3B',
                            borderColor: '#803D3B',
                          }}
                          onClick={handleEditBookingFromPreview}
                        >
                          تعديل الحجز
                        </Button>
                        <Button onClick={handleVisitorPreviewClose}>
                          إغلاق
                        </Button>
                      </Space>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Alert
                message="لا توجد بيانات زائر"
                description="هذه الشقة غير مشغولة حالياً أو انتهت مدة الإقامة"
                type="info"
                showIcon
              />
            </div>
          )}
        </Modal>

        {/* Checkout Confirmation Modal */}
        <Modal
          title={null}
          open={checkoutModalVisible}
          onCancel={handleCheckoutCancel}
          footer={null}
          width={900}
          className="checkout-modal"
          centered
        >
          {checkoutApartment && checkoutBooking && (
            <div className="checkout-content">
              <div
                className="checkout-header"
                style={{
                  background: '#803D3B',
                  borderRadius: '8px',
                  margin: '-24px -24px 24px -24px',
                  padding: '20px 24px',
                  borderRadius: '8px 8px 0 0',
                  color: '#fff',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <LogoutOutlined
                    style={{ fontSize: '32px', marginBottom: 8 }}
                  />
                  <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>
                    تأكيد المغادرة
                  </h3>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      margin: 0,
                      fontSize: '14px',
                    }}
                  >
                    {checkoutApartment.building?.name} - شقة{' '}
                    {checkoutApartment.apartment_number}
                  </p>
                </div>
              </div>

              {/* Visitor Info */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Avatar
                    size={50}
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: '#803D3B',
                      marginLeft: 12,
                    }}
                  />
                  <div>
                    <h4
                      style={{ margin: 0, fontSize: '16px', color: '#262626' }}
                    >
                      {checkoutBooking.visitor?.name || 'زائر'}
                    </h4>
                    <Tag color="#803D3B">
                      {checkoutBooking.visitor?.client_type?.name || 'عميل'}
                    </Tag>
                  </div>
                </div>

                {/* Checkout Details */}
                <div
                  style={{
                    backgroundColor: '#f9f9f9',
                    padding: '16px',
                    borderRadius: '8px',
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="detail-item">
                        <CalendarOutlined
                          style={{ color: '#1890ff', marginLeft: 8 }}
                        />
                        <span style={{ color: '#8c8c8c' }}>
                          تاريخ المغادرة المحدد:
                        </span>
                        <div style={{ fontWeight: '600', marginTop: 4 }}>
                          {moment(
                            checkoutBooking.checkout_datetime ||
                              checkoutBooking.check_out_date
                          ).format('DD/MM/YYYY')}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="detail-item">
                        <ClockCircleOutlined
                          style={{ color: '#fa8c16', marginLeft: 8 }}
                        />
                        <span style={{ color: '#8c8c8c' }}>الوقت الحالي:</span>
                        <div style={{ fontWeight: '600', marginTop: 4 }}>
                          {moment().format('DD/MM/YYYY - HH:mm')}
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* Early Checkout Warning */}
                  {moment().isBefore(
                    moment(
                      checkoutBooking.checkout_datetime ||
                        checkoutBooking.check_out_date
                    ),
                    'day'
                  ) && (
                    <>
                      <Alert
                        message="مغادرة مبكرة"
                        description={
                          <div>
                            <p>
                              هذه مغادرة قبل التاريخ المحدد. سيتم تعديل المبلغ
                              وفقاً لمدة الإقامة الفعلية.
                            </p>
                            <div style={{ marginTop: 8 }}>
                              <strong>مدة الإقامة المخططة:</strong>{' '}
                              {checkoutBooking.duration_days} أيام
                              <br />
                              <strong>مدة الإقامة الفعلية:</strong>{' '}
                              {Math.ceil(
                                moment().diff(
                                  moment(checkoutBooking.arrival_datetime),
                                  'hours'
                                ) / 24
                              )}{' '}
                              أيام
                            </div>
                          </div>
                        }
                        type="warning"
                        showIcon
                        style={{ marginTop: 16 }}
                      />

                      {/* Early Checkout Payment Adjustment */}
                      <Card
                        size="small"
                        style={{
                          backgroundColor: '#fff7e6',
                          border: '1px solid #ffa940',
                          marginTop: 16,
                        }}
                      >
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                          <CalculatorOutlined
                            style={{ fontSize: '24px', color: '#fa8c16' }}
                          />
                          <div
                            style={{
                              fontSize: '16px',
                              fontWeight: 'bold',
                              color: '#fa8c16',
                              marginTop: 8,
                            }}
                          >
                            تعديل المبلغ للمغادرة المبكرة
                          </div>
                        </div>

                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <div style={{ textAlign: 'center' }}>
                              <div
                                style={{ color: '#8c8c8c', fontSize: '13px' }}
                              >
                                المبلغ الأصلي
                              </div>
                              <div
                                style={{
                                  fontSize: '18px',
                                  textDecoration: 'line-through',
                                  color: '#595959',
                                  marginTop: 4,
                                }}
                              >
                                {checkoutBooking.total_amount?.toLocaleString()}{' '}
                                جنيه
                              </div>
                              <div
                                style={{ fontSize: '12px', color: '#8c8c8c' }}
                              >
                                ({checkoutBooking.duration_days} أيام ×{' '}
                                {(
                                  checkoutBooking.total_amount /
                                  checkoutBooking.duration_days
                                ).toLocaleString()}{' '}
                                جنيه/يوم)
                              </div>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div style={{ textAlign: 'center' }}>
                              <div
                                style={{ color: '#389e0d', fontSize: '13px' }}
                              >
                                المبلغ المعدل
                              </div>
                              <div
                                style={{
                                  fontSize: '18px',
                                  fontWeight: 'bold',
                                  color: '#52c41a',
                                  marginTop: 4,
                                }}
                              >
                                {(
                                  Math.ceil(
                                    moment().diff(
                                      moment(checkoutBooking.arrival_datetime),
                                      'hours'
                                    ) / 24
                                  ) *
                                  (checkoutBooking.total_amount /
                                    checkoutBooking.duration_days)
                                ).toLocaleString()}{' '}
                                جنيه
                              </div>
                              <div
                                style={{ fontSize: '12px', color: '#389e0d' }}
                              >
                                (
                                {Math.ceil(
                                  moment().diff(
                                    moment(checkoutBooking.arrival_datetime),
                                    'hours'
                                  ) / 24
                                )}{' '}
                                أيام ×{' '}
                                {(
                                  checkoutBooking.total_amount /
                                  checkoutBooking.duration_days
                                ).toLocaleString()}{' '}
                                جنيه/يوم)
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </>
                  )}
                </div>

                {checkoutBooking.total_amount && (
                  <div style={{ marginTop: 16 }}>
                    {/* Payment Summary Header */}
                    <Card
                      size="small"
                      style={{
                        backgroundColor: '#f0f7ff',
                        border: '2px solid #1890ff',
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <CreditCardOutlined
                          style={{
                            color: '#1890ff',
                            fontSize: '28px',
                            marginBottom: 8,
                          }}
                        />
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#1890ff',
                            marginBottom: 4,
                          }}
                        >
                          ملخص الدفع والمستحقات
                        </div>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          طريقة الدفع:{' '}
                          {checkoutBooking.payment_method || 'نقداً'}
                        </Text>
                      </div>
                    </Card>

                    {/* Payment Breakdown Cards */}
                    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                      {/* Total Amount Card */}
                      <Col xs={24} sm={8}>
                        <Card
                          size="small"
                          style={{
                            backgroundColor: '#f6f6f6',
                            border: '1px solid #d9d9d9',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                            المبلغ الإجمالي
                          </div>
                          <div
                            style={{
                              fontSize: '20px',
                              fontWeight: 'bold',
                              color: '#262626',
                              marginTop: 4,
                            }}
                          >
                            {isEarlyCheckout ? (
                              <>
                                <span
                                  style={{
                                    textDecoration: 'line-through',
                                    color: '#8c8c8c',
                                    fontSize: '16px',
                                    marginRight: 8,
                                  }}
                                >
                                  {checkoutBooking.total_amount?.toLocaleString()}
                                </span>
                                {adjustedAmount?.toLocaleString()}
                              </>
                            ) : (
                              checkoutBooking.total_amount?.toLocaleString()
                            )}{' '}
                            جنيه
                          </div>
                          <div style={{ color: '#595959', fontSize: '11px' }}>
                            {isEarlyCheckout
                              ? `تم تعديل المبلغ (${actualStayedDays} أيام)`
                              : 'إجمالي تكلفة الإقامة'}
                          </div>
                        </Card>
                      </Col>

                      {/* Paid Amount Card */}
                      <Col xs={24} sm={8}>
                        <Card
                          size="small"
                          style={{
                            backgroundColor:
                              finalStatus === 'refund' ? '#fff2e8' : '#f6ffed',
                            border: `1px solid ${
                              finalStatus === 'refund' ? '#fa8c16' : '#52c41a'
                            }`,
                            textAlign: 'center',
                          }}
                        >
                          <div
                            style={{
                              color:
                                finalStatus === 'refund'
                                  ? '#d46b08'
                                  : '#389e0d',
                              fontSize: '12px',
                            }}
                          >
                            {finalStatus === 'refund'
                              ? 'العربون المدفوع (يستحق استرداد)'
                              : 'المبلغ المدفوع'}
                          </div>
                          <div
                            style={{
                              fontSize: '20px',
                              fontWeight: 'bold',
                              color:
                                finalStatus === 'refund'
                                  ? '#fa8c16'
                                  : '#52c41a',
                              marginTop: 4,
                            }}
                          >
                            {depositAmount.toLocaleString()} جنيه
                          </div>

                          {finalStatus === 'refund' && (
                            <div style={{ color: '#fa8c16', fontSize: '11px' }}>
                              يجب استرداد: {depositRefund.toLocaleString()} جنيه
                            </div>
                          )}
                        </Card>
                      </Col>

                      {/* Final Amount Card */}
                      <Col xs={24} sm={8}>
                        <Card
                          size="small"
                          style={{
                            backgroundColor:
                              finalStatus === 'refund' ? '#fff2e8' : '#fff2e8',
                            border: `2px solid ${
                              finalStatus === 'refund'
                                ? '#fa8c16'
                                : remainingAmount > 0
                                ? '#fa8c16'
                                : '#52c41a'
                            }`,
                            textAlign: 'center',
                          }}
                        >
                          <div
                            style={{
                              color:
                                finalStatus === 'refund'
                                  ? '#d46b08'
                                  : remainingAmount > 0
                                  ? '#d46b08'
                                  : '#389e0d',
                              fontSize: '12px',
                            }}
                          >
                            {finalStatus === 'refund'
                              ? 'مبلغ الاسترداد'
                              : 'المبلغ المستحق'}
                          </div>
                          <div
                            style={{
                              fontSize: '20px',
                              fontWeight: 'bold',
                              color:
                                finalStatus === 'refund'
                                  ? '#fa8c16'
                                  : remainingAmount > 0
                                  ? '#fa8c16'
                                  : '#52c41a',
                              marginTop: 4,
                            }}
                          >
                            {finalStatus === 'refund'
                              ? depositRefund.toLocaleString()
                              : remainingAmount.toLocaleString()}{' '}
                            جنيه
                          </div>
                          <div
                            style={{
                              color:
                                finalStatus === 'refund'
                                  ? '#d46b08'
                                  : remainingAmount > 0
                                  ? '#d46b08'
                                  : '#389e0d',
                              fontSize: '11px',
                            }}
                          >
                            {finalStatus === 'refund'
                              ? 'يجب إرجاعه للنزيل'
                              : remainingAmount > 0
                              ? 'يجب دفعه الآن'
                              : 'مُدفع بالكامل'}
                          </div>
                        </Card>
                      </Col>
                    </Row>

                    {/* Payment Status Alert */}
                    {finalStatus === 'refund' ? (
                      <Alert
                        message="يجب استرداد جزء من العربون"
                        description={
                          <div>
                            <p>
                              نظراً للمغادرة المبكرة وكون العربون المدفوع (
                              {depositAmount.toLocaleString()} جنيه) أكبر من
                              تكلفة الإقامة الفعلية (
                              {adjustedAmount.toLocaleString()} جنيه)، يجب
                              استرداد مبلغ {depositRefund.toLocaleString()} جنيه
                              للنزيل.
                            </p>
                          </div>
                        }
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                    ) : remainingAmount > 0 ? (
                      <Alert
                        message="مطلوب استكمال الدفع"
                        description={`يتوجب على النزيل دفع مبلغ ${remainingAmount.toLocaleString()} جنيه قبل إتمام المغادرة.`}
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                    ) : (
                      <Alert
                        message="تم استكمال الدفع"
                        description="تم دفع كامل المبلغ المستحق. يمكن إتمام المغادرة."
                        type="success"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                    )}

                    {/* Discount Section */}
                    <Card
                      title="خصم عند الخروج (اختياري)"
                      size="small"
                      style={{
                        backgroundColor: '#fafafa',
                        border: '1px solid #d9d9d9',
                      }}
                    >
                      <Row gutter={[16, 12]}>
                        <Col xs={24} md={12}>
                          <div style={{ marginBottom: 8 }}>
                            <Text strong style={{ fontSize: '14px' }}>
                              مبلغ الخصم
                            </Text>
                          </div>
                          <InputNumber
                            style={{ width: '100%' }}
                            placeholder="أدخل مبلغ الخصم"
                            min={0}
                            max={
                              parseFloat(
                                isEarlyCheckout
                                  ? adjustedAmount
                                  : checkoutBooking.total_amount
                              ) -
                              parseFloat(checkoutBooking.deposit_amount || 0)
                            }
                            value={checkoutDiscount}
                            onChange={(value) =>
                              setCheckoutDiscount(value || 0)
                            }
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            size="large"
                          />
                          <Text
                            type="secondary"
                            style={{ fontSize: '12px', display: 'block' }}
                          >
                            الحد الأقصى:{' '}
                            {(
                              parseFloat(
                                isEarlyCheckout
                                  ? adjustedAmount
                                  : checkoutBooking.total_amount
                              ) -
                              parseFloat(checkoutBooking.deposit_amount || 0)
                            ).toLocaleString()}{' '}
                            جنيه
                            {isEarlyCheckout && (
                              <span style={{ color: '#fa8c16' }}>
                                {' '}
                                (بعد تعديل المغادرة المبكرة)
                              </span>
                            )}
                          </Text>
                        </Col>
                        <Col xs={24} md={12}>
                          <div style={{ marginBottom: 8 }}>
                            <Text strong style={{ fontSize: '14px' }}>
                              سبب الخصم
                            </Text>
                          </div>
                          <Input
                            value={checkoutDiscountReason}
                            onChange={(e) =>
                              setCheckoutDiscountReason(e.target.value)
                            }
                            size="large"
                            placeholder={
                              isEarlyCheckout
                                ? 'خصم إضافي بعد تعديل المغادرة المبكرة'
                                : 'سبب الخصم'
                            }
                          />
                          {checkoutDiscount > 0 && !checkoutDiscountReason && (
                            <Text
                              type="warning"
                              style={{ fontSize: '12px', display: 'block' }}
                            >
                              يرجى ذكر سبب الخصم
                            </Text>
                          )}
                        </Col>
                      </Row>

                      {checkoutDiscount > 0 && (
                        <div
                          style={{
                            marginTop: 16,
                            padding: 12,
                            backgroundColor: '#f6ffed',
                            borderRadius: 6,
                            border: '1px solid #b7eb8f',
                          }}
                        >
                          <Row gutter={16}>
                            <Col span={12}>
                              <Text
                                style={{ color: '#389e0d', fontSize: '14px' }}
                              >
                                <strong>قيمة الخصم:</strong> -
                                {checkoutDiscount.toLocaleString()} جنيه
                              </Text>
                            </Col>
                            <Col span={12}>
                              <Text
                                style={{ color: '#389e0d', fontSize: '14px' }}
                              >
                                <strong>المبلغ النهائي:</strong>{' '}
                                {(
                                  parseFloat(
                                    isEarlyCheckout
                                      ? adjustedAmount
                                      : checkoutBooking.total_amount
                                  ) -
                                  parseFloat(
                                    checkoutBooking.deposit_amount || 0
                                  ) -
                                  checkoutDiscount
                                ).toLocaleString()}{' '}
                                جنيه
                                {isEarlyCheckout && (
                                  <span
                                    style={{
                                      fontSize: '12px',
                                      color: '#fa8c16',
                                    }}
                                  >
                                    {' '}
                                    (بعد تعديل المغادرة المبكرة)
                                  </span>
                                )}
                              </Text>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Space size="large">
                    <Button
                      type="primary"
                      danger
                      size="large"
                      icon={<LogoutOutlined />}
                      onClick={handleCheckoutConfirm}
                      loading={checkoutMutation.isLoading}
                    >
                      تأكيد المغادرة
                    </Button>
                    <Button
                      size="large"
                      onClick={handleCheckoutCancel}
                      disabled={checkoutMutation.isLoading}
                    >
                      إلغاء
                    </Button>
                  </Space>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default CashierPage; 