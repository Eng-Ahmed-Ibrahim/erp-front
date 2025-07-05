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
  Tag
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
  LogoutOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { 
  getApartments,
  getBuildings, 
  getBookings,
  createBooking,
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
  PAYMENT_METHOD_LABELS
} from '../../apis/reception/receptionApi';
import ReceptionFilters from '../../components/reception/ReceptionFilters';
import ApartmentCard from '../../components/reception/ApartmentCard';
import VisitorModal from '../../components/reception/VisitorModal';
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
    search: ''
  });
  const [searchValue, setSearchValue] = useState('');
  const [visitorModalVisible, setVisitorModalVisible] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [selectedDateRange, setSelectedDateRange] = useState([moment(), moment().add(1, 'days')]);
  const [currentTime, setCurrentTime] = useState(moment());
  
  // Visitor Preview Modal State
  const [visitorPreviewVisible, setVisitorPreviewVisible] = useState(false);
  const [previewApartment, setPreviewApartment] = useState(null);
  
  // Checkout Modal State
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [checkoutApartment, setCheckoutApartment] = useState(null);
  const [checkoutBooking, setCheckoutBooking] = useState(null);

  const queryClient = useQueryClient();

  // Fetch data with React Query
  const { data: apartmentsData, isLoading: apartmentsLoading, error: apartmentsError, refetch: refetchApartments } = useQuery({
    queryKey: ['apartments', filters],
    queryFn: () => getApartments({ 
      ...filters, 
      search: searchValue,
      include: 'building,current_booking.visitor'
    }),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10000
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

  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = useQuery({
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
    mutationFn: ({ bookingId, checkoutData }) => checkOutBooking(bookingId, checkoutData),
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
      message.error('فشل في تسجيل المغادرة: ' + (error.response?.data?.message || error.message));
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

  const handleApartmentClick = (apartment) => {
    console.log('CashierPage - Apartment clicked:', apartment);
    console.log('CashierPage - Current booking:', apartment.current_booking);
    console.log('CashierPage - Is occupied:', apartment.is_occupied);
    
    // Consistent booking data access
    const booking = apartment.current_booking || apartment.booking;
    const isOccupied = booking || apartment.is_occupied;
    
    if (isOccupied) {
      // Show visitor preview for occupied apartments
      console.log('CashierPage - Showing preview for occupied apartment');
      setPreviewApartment(apartment);
      setVisitorPreviewVisible(true);
    } else {
      // Show booking modal for available apartments
      console.log('CashierPage - Showing booking modal for available apartment');
      setSelectedApartment(apartment);
      setModalMode('create');
      setVisitorModalVisible(true);
    }
  };

  const handleVisitorModalSave = async (formData) => {
    try {
      // Debug: Log received form data
      console.log('CashierPage received formData: ------------', formData);

      if (modalMode === 'create') {
        // Prepare booking data with nested visitor object for the backend
        const bookingData = {
          apartment_id: selectedApartment.id,
          visitor: {
            name: formData.visitor_name,
            client_type_id: formData.client_type_id,
            id_type: formData.id_type,
            id_number: formData.id_number,
            nationality: formData.nationality,
            phone: formData.phone || null,
            emergency_contact: formData.emergency_contact || null
          },
          arrival_datetime: formData.arrival_datetime || formData.check_in_date,
          checkout_datetime: formData.checkout_datetime || formData.check_out_date,
          duration_days: formData.duration_days || formData.duration,
          meals: formData.meals || [],
          products: formData.products || [],
          total_amount: formData.total_amount || 0,
          payment_method: formData.payment_method,
          notes: formData.notes || null
        };

        // Validate booking data
        if (!bookingData.arrival_datetime) {
          console.error('Missing arrival_datetime');
          message.error('تاريخ الوصول مطلوب');
          return;
        }

        if (!bookingData.duration_days || bookingData.duration_days < 1) {
          console.error('Invalid duration_days:', bookingData.duration_days);
          message.error('مدة الإقامة يجب أن تكون يوم واحد على الأقل');
          return;
        }

        // Debug: Log prepared booking data
        console.log('Prepared bookingData for backend:', bookingData);
        console.log('Visitor object:', bookingData.visitor);

        // Final validation before API call
        if (!bookingData.visitor || typeof bookingData.visitor !== 'object') {
          console.error('ERROR: Visitor object is missing or invalid');
          message.error('بيانات الزائر غير مكتملة');
          return;
        }

        const requiredVisitorProps = ['name', 'client_type_id', 'id_type', 'id_number', 'nationality'];
        const missingProps = requiredVisitorProps.filter(prop => !bookingData.visitor[prop]);
        
        if (missingProps.length > 0) {
          console.error('ERROR: Missing visitor properties:', missingProps);
          message.error(`Missing visitor data: ${missingProps.join(', ')}`);
          return;
        }

        console.log('✅ All validation passed, calling API...');

        // Create booking using the new backend API structure
        await createBookingMutation.mutateAsync(bookingData);
      } else if (modalMode === 'edit') {
        // Update existing booking - use consistent booking access
        const currentBooking = selectedApartment.current_booking || selectedApartment.booking;
        if (!currentBooking?.id) {
          message.error('خطأ: لا يمكن العثور على معرف الحجز');
          return;
        }
        
        const updateData = {
          arrival_datetime: formData.arrival_datetime || formData.check_in_date,
          checkout_datetime: formData.checkout_datetime || formData.check_out_date,
          duration_days: formData.duration_days || formData.duration,
          meals: formData.meals || [],
          products: formData.products || [],
          total_amount: formData.total_amount || 0,
          payment_method: formData.payment_method,
          notes: formData.notes
        };

        await updateBookingMutation.mutateAsync({
          id: currentBooking.id,
          data: updateData
        });
      }
    } catch (error) {
      console.error('Error saving visitor/booking:', error);
      console.error('Error details:', error.response?.data);
      message.error('فشل في حفظ البيانات: ' + (error.response?.data?.message || error.message || 'خطأ غير معروف'));
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
    setCheckoutBooking(booking);
    setCheckoutModalVisible(true);
  };

  const handleCheckoutConfirm = (checkoutData) => {
    if (!checkoutBooking?.id) {
      message.error('خطأ: لا يمكن العثور على معرف الحجز');
      return;
    }

    checkoutMutation.mutate({
      bookingId: checkoutBooking.id,
      checkoutData: {
        ...checkoutData,
        actual_checkout_datetime: moment().toISOString(),
        notes: checkoutData.notes || null,
        early_checkout_reason: moment().isBefore(moment(checkoutBooking.checkout_datetime || checkoutBooking.check_out_date), 'day') 
          ? (checkoutData.early_checkout_reason || 'مغادرة مبكرة بناءً على طلب الزائر')
          : null
      }
    });
  };

  const handleCheckoutCancel = () => {
    setCheckoutModalVisible(false);
    setCheckoutApartment(null);
    setCheckoutBooking(null);
  };

  const handleQuickFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? '' : value
    }));
  };

  const getTodayArrivals = () => {
    return apartmentsData?.data.filter(apt => 
      apt.booking && 
      moment(apt.booking.check_in_date).isSame(moment(), 'day') &&
      apt.booking.status === 'confirmed'
    ).length;
  };

  const getTodayDepartures = () => {
    return apartmentsData?.data.filter(apt => 
      apt.booking && 
      moment(apt.booking.check_out_date).isSame(moment(), 'day') &&
      apt.booking.status === 'checked_in'
    ).length;
  };

  const getOverdueCheckouts = () => {
    return apartmentsData?.data.filter(apt => 
      apt.booking && 
      moment(apt.booking.check_out_date).isBefore(moment(), 'day') &&
      apt.booking.status === 'checked_in'
    ).length;
  };

  // Prepare data
  const apartments = apartmentsData?.data || [];
  const buildings = buildingsData?.data || [];
  
  // Filter apartments based on occupancy status
  const filteredApartments = apartments.filter(apartment => {
    // Apply occupancy status filter
    if (filters.occupancy_status === 'available') {
      const isOccupied = apartment.current_booking || apartment.booking || apartment.is_occupied;
      return !isOccupied;
    } else if (filters.occupancy_status === 'occupied') {
      const isOccupied = apartment.current_booking || apartment.booking || apartment.is_occupied;
      return isOccupied;
    }
    
    // If no occupancy filter is set, return all apartments
    return true;
  });

  const totalApartments = apartments.length;
  const availableApartments = apartments.filter(apt => !apt.current_booking && !apt.booking && !apt.is_occupied).length;
  const occupiedApartments = apartments.filter(apt => apt.current_booking || apt.booking || apt.is_occupied).length;
  const occupancyRate = totalApartments > 0 ? Math.round((occupiedApartments / totalApartments) * 100) : 0;

  // Stats for quick view
  const stats = {
    total_apartments: totalApartments,
    available_apartments: availableApartments,
    occupied_apartments: occupiedApartments,
    occupancy_rate: occupancyRate,
    today_arrivals: getTodayArrivals(),
    today_departures: getTodayDepartures(),
    overdue_checkouts: getOverdueCheckouts()
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
                  marginLeft: 12 
                }} 
              />
              <div className="title-content">
                <Title level={2} style={{ margin: 0 }}>
                  {user?.name || 'المستخدم'}
                </Title>
                <Text type="secondary">كاشير قسم - {user?.department?.name }</Text>
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
                type={filters.occupancy_status === 'available' ? 'primary' : 'default'}
                onClick={() => handleQuickFilter('occupancy_status', 'available')}
                icon={<CheckCircleOutlined />}
                style={{ 
                  color: filters.occupancy_status === 'available' ? '#fff' : '#52c41a', 
                  borderColor: '#52c41a',
                  backgroundColor: filters.occupancy_status === 'available' ? '#52c41a' : '#f6ffed'
                }}
              >
                متاحة ({availableApartments})
              </Button>
              <Button 
                type={filters.occupancy_status === 'occupied' ? 'primary' : 'default'}
                onClick={() => handleQuickFilter('occupancy_status', 'occupied')}
                icon={<ExclamationCircleOutlined />}
                style={{ 
                  color: filters.occupancy_status === 'occupied' ? '#fff' : '#ff4d4f', 
                  borderColor: '#ff4d4f',
                  backgroundColor: filters.occupancy_status === 'occupied' ? '#ff4d4f' : '#fff2f0'
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
          />

          <div className="apartments-section">
            <div className="section-header">
              <Title level={4}>الشقق ({apartments.length})</Title>
              <Text type="secondary">اضغط على الشقة لعرض التفاصيل أو إجراء حجز</Text>
            </div>

            <Spin spinning={apartmentsLoading}>
              {apartments.length === 0 ? (
                <div className="empty-state">
                  <HomeOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                  <Title level={4} type="secondary">لا توجد شقق</Title>
                  <Text type="secondary">لا توجد شقق متاحة بناءً على المرشحات المحددة</Text>
                </div>
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
          {previewApartment && (
            <div className="visitor-preview-content">
              {/* Header */}
              <div className="preview-header" style={{
                background: 'linear-gradient(135deg, #803D3B 0%, #A0522D 100%)',
                margin: '-24px -24px 24px -24px',
                padding: '20px 24px',
                borderRadius: '8px 8px 0 0',
                color: '#fff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <HomeOutlined style={{ fontSize: '24px', marginLeft: 12 }} />
                    <div>
                      <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>
                        {previewApartment.building?.name} - شقة {previewApartment.apartment_number}
                      </h3>
                      <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>
                        تفاصيل الزائر والحجز
                      </p>
                    </div>
                  </div>
                  <Badge status="error" text={<span style={{ color: '#FFE4E1' }}>مشغولة</span>} />
                </div>
              </div>

              {/* Visitor Information */}
              {previewApartment.current_booking?.visitor && (
                <div className="visitor-section">
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <Avatar 
                      size={60} 
                      icon={<UserOutlined />} 
                      style={{ 
                        backgroundColor: '#803D3B',
                        marginLeft: 16
                      }} 
                    />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '18px', color: '#262626' }}>
                        {previewApartment.current_booking.visitor.name}
                      </h4>
                      <Tag color="#803D3B" style={{ marginTop: 4 }}>
                        {previewApartment.current_booking.visitor.client_type?.name || 'عميل'}
                      </Tag>
                    </div>
                  </div>

                  <Divider />

                  {/* Personal Details */}
                  <Row gutter={[16, 12]}>
                    <Col span={12}>
                      <div className="detail-item">
                        <IdcardOutlined style={{ color: '#803D3B', marginLeft: 8 }} />
                        <span style={{ color: '#8c8c8c' }}>نوع الهوية:</span>
                        <span style={{ fontWeight: '600', marginRight: 8 }}>
                          {previewApartment.current_booking.visitor.id_type || 'غير محدد'}
                        </span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="detail-item">
                        <CreditCardOutlined style={{ color: '#803D3B', marginLeft: 8 }} />
                        <span style={{ color: '#8c8c8c' }}>رقم الهوية:</span>
                        <span style={{ fontWeight: '600', marginRight: 8 }}>
                          {previewApartment.current_booking.visitor.id_number || 'غير محدد'}
                        </span>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="detail-item">
                        <span style={{ color: '#803D3B', marginLeft: 8 }}>🏳️</span>
                        <span style={{ color: '#8c8c8c' }}>الجنسية:</span>
                        <span style={{ fontWeight: '600', marginRight: 8 }}>
                          {previewApartment.current_booking.visitor.nationality || 'غير محدد'}
                        </span>
                      </div>
                    </Col>
                    {previewApartment.current_booking.visitor.phone && (
                      <Col span={12}>
                        <div className="detail-item">
                          <PhoneOutlined style={{ color: '#803D3B', marginLeft: 8 }} />
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
                    <h5 style={{ color: '#803D3B', marginBottom: 16 }}>تفاصيل الحجز</h5>
                    <Row gutter={[16, 12]}>
                      <Col span={8}>
                        <div className="detail-item" style={{ textAlign: 'center' }}>
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                          <div style={{ marginTop: 8 }}>
                            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>تاريخ الوصول</div>
                            <div style={{ fontWeight: '600', color: '#262626' }}>
                              {moment(previewApartment.current_booking.arrival_datetime).format('DD/MM/YYYY')}
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="detail-item" style={{ textAlign: 'center' }}>
                          <ClockCircleOutlined style={{ color: '#fa8c16', fontSize: '20px' }} />
                          <div style={{ marginTop: 8 }}>
                            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>تاريخ المغادرة</div>
                            <div style={{ fontWeight: '600', color: '#262626' }}>
                              {moment(previewApartment.current_booking.checkout_datetime || previewApartment.current_booking.check_out_date).format('DD/MM/YYYY')}
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="detail-item" style={{ textAlign: 'center' }}>
                          <CalendarOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                          <div style={{ marginTop: 8 }}>
                            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>مدة الإقامة</div>
                            <div style={{ fontWeight: '600', color: '#262626' }}>
                              {previewApartment.current_booking.duration_days || 'غير محدد'} أيام
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* Financial Information */}
                    <Divider />
                    <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <div className="detail-item">
                            <DollarOutlined style={{ color: '#faad14', marginLeft: 8 }} />
                            <span style={{ color: '#8c8c8c' }}>المبلغ الإجمالي:</span>
                            <span style={{ fontWeight: '700', color: '#faad14', marginRight: 8, fontSize: '16px' }}>
                              {previewApartment.current_booking.total_amount || 0} جنيه
                            </span>
                          </div>
                        </Col>
                        {previewApartment.current_booking.payment_method && (
                          <Col span={12}>
                            <div className="detail-item">
                              <span style={{ color: '#803D3B', marginLeft: 8 }}>💳</span>
                              <span style={{ color: '#8c8c8c' }}>طريقة الدفع:</span>
                              <span style={{ fontWeight: '600', marginRight: 8 }}>
                                {previewApartment.current_booking.payment_method}
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
                          style={{ backgroundColor: '#803D3B', borderColor: '#803D3B' }}
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
          )}
        </Modal>

        {/* Checkout Confirmation Modal */}
        <Modal
          title={null}
          open={checkoutModalVisible}
          onCancel={handleCheckoutCancel}
          footer={null}
          width={500}
          className="checkout-modal"
          centered
        >
          {checkoutApartment && checkoutBooking && (
            <div className="checkout-content">
              {/* Header */}
              <div className="checkout-header" style={{
                background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                margin: '-24px -24px 24px -24px',
                padding: '20px 24px',
                borderRadius: '8px 8px 0 0',
                color: '#fff'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <LogoutOutlined style={{ fontSize: '32px', marginBottom: 8 }} />
                  <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>
                    تأكيد المغادرة
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>
                    {checkoutApartment.building?.name} - شقة {checkoutApartment.apartment_number}
                  </p>
                </div>
              </div>

              {/* Visitor Info */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <Avatar 
                    size={50} 
                    icon={<UserOutlined />} 
                    style={{ 
                      backgroundColor: '#803D3B',
                      marginLeft: 12
                    }} 
                  />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', color: '#262626' }}>
                      {checkoutBooking.visitor?.name || 'زائر'}
                    </h4>
                    <Tag color="#803D3B">
                      {checkoutBooking.visitor?.client_type?.name || 'عميل'}
                    </Tag>
                  </div>
                </div>

                {/* Checkout Details */}
                <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="detail-item">
                        <CalendarOutlined style={{ color: '#1890ff', marginLeft: 8 }} />
                        <span style={{ color: '#8c8c8c' }}>تاريخ المغادرة المحدد:</span>
                        <div style={{ fontWeight: '600', marginTop: 4 }}>
                          {moment(checkoutBooking.checkout_datetime || checkoutBooking.check_out_date).format('DD/MM/YYYY')}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="detail-item">
                        <ClockCircleOutlined style={{ color: '#fa8c16', marginLeft: 8 }} />
                        <span style={{ color: '#8c8c8c' }}>الوقت الحالي:</span>
                        <div style={{ fontWeight: '600', marginTop: 4 }}>
                          {moment().format('DD/MM/YYYY - HH:mm')}
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* Early Checkout Warning */}
                  {moment().isBefore(moment(checkoutBooking.checkout_datetime || checkoutBooking.check_out_date), 'day') && (
                    <Alert
                      message="مغادرة مبكرة"
                      description="هذه مغادرة قبل التاريخ المحدد. يرجى التأكد من استكمال جميع الإجراءات المطلوبة."
                      type="warning"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  )}
                </div>

                {/* Total Amount */}
                {checkoutBooking.total_amount && (
                  <div style={{ 
                    backgroundColor: '#fff7e6', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    marginTop: 16,
                    border: '1px solid #ffd591'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <DollarOutlined style={{ color: '#faad14', fontSize: '24px', marginBottom: 8 }} />
                      <div style={{ color: '#8c8c8c', fontSize: '14px' }}>المبلغ الإجمالي</div>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: '#faad14' 
                      }}>
                        {checkoutBooking.total_amount} جنيه
                      </div>
                    </div>
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
                      onClick={() => handleCheckoutConfirm({})}
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