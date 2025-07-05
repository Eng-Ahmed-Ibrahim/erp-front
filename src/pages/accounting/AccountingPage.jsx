import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Table,
  DatePicker,
  Select,
  Button,
  Statistic,
  Tag,
  Space,
  Typography,
  Tabs,
  Timeline,
  Progress,
  Avatar,
  Divider,
  message,
  Spin,
  Empty,
  Tooltip,
  Badge,
  Input,
  Modal,
} from 'antd';
import {
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  CreditCardOutlined,
  TrophyOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  FallOutlined,
  TeamOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import 'moment/locale/ar';
import {
  getBookingFinancials,
  getBookingsByDateRange,
  getRevenueAnalytics,
  getStaffPerformance,
  // getPaymentMethodBreakdown,
  getAccountingDashboardStats,
  getTopPerformingStaff,
  exportBookingData,
  getUserBookingReports,
} from '../../apis/accounting/accountingApi';
import {
  uploadBookingAttachment,
  getBookingAttachments,
} from '../../apis/reception/receptionApi';
import { useAuth } from '../../context/AuthContext';
import './AccountingPage.scss';

const { Title, Text } = Typography;
const { Content } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;

moment.locale('ar');

function AccountingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState(() => {
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');
    return startOfMonth && endOfMonth ? [startOfMonth, endOfMonth] : [];
  });
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [userNameFilter, setUserNameFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBookingDetailVisible, setIsBookingDetailVisible] = useState(false);
  const [allBookingsDateRange, setAllBookingsDateRange] = useState([
    moment().subtract(3, 'months').startOf('day'),
    moment().endOf('day'),
  ]);
  const [bookingSearchText, setBookingSearchText] = useState('');
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Check if user has admin permissions
  const canViewAll =
    user?.permissions?.some((p) => p.name === 'view all accounting data') ||
    user?.roleName === 'admin' ||
    user?.roleName === 'مدير';

  // Fetch dashboard statistics
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['accounting-dashboard-stats'],
    queryFn: getAccountingDashboardStats,
    refetchInterval: 60000,
  });

  // Fetch booking financials
  const {
    data: bookingFinancials,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: [
      'booking-financials',
      dateRange,
      selectedStaff,
      selectedPaymentMethod,
    ],
    queryFn: () =>
      getBookingFinancials({
        start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
        end_date: dateRange?.[1]?.format('YYYY-MM-DD'),
        staff_id: selectedStaff,
        payment_method_id: selectedPaymentMethod,
      }),
    enabled: !!(dateRange?.[0] && dateRange?.[1]),
  });

  // Fetch revenue analytics
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-analytics', period, dateRange],
    queryFn: () =>
      getRevenueAnalytics(period, {
        start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
        end_date: dateRange?.[1]?.format('YYYY-MM-DD'),
      }),
    enabled: !!(dateRange?.[0] && dateRange?.[1]),
  });

  // Fetch staff performance
  const { data: staffPerformance, isLoading: staffLoading } = useQuery({
    queryKey: ['staff-performance', dateRange],
    queryFn: () =>
      getStaffPerformance({
        start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
        end_date: dateRange?.[1]?.format('YYYY-MM-DD'),
      }),
    enabled: !!(dateRange?.[0] && dateRange?.[1]),
  });

  // // Fetch payment method breakdown
  // const {
  //     data: paymentBreakdown,
  //     isLoading: paymentsLoading
  // } = useQuery({
  //     queryKey: ['payment-breakdown', dateRange],
  //     queryFn: () => getPaymentMethodBreakdown(
  //         dateRange[0]?.format('YYYY-MM-DD'),
  //         dateRange[1]?.format('YYYY-MM-DD')
  //     ),
  //     enabled: !!dateRange[0] && !!dateRange[1]
  // });

  // Fetch user booking reports
  const {
    data: userBookingReports,
    isLoading: userReportsLoading,
    refetch: refetchUserReports,
  } = useQuery({
    queryKey: ['user-booking-reports', dateRange, userNameFilter],
    queryFn: () =>
      getUserBookingReports({
        start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
        end_date: dateRange?.[1]?.format('YYYY-MM-DD'),
        user_name: userNameFilter || undefined,
      }),
    enabled: !!(dateRange?.[0] && dateRange?.[1]),
  });

  // Fetch all bookings for the new tab
  const {
    data: allBookingsData,
    isLoading: allBookingsLoading,
    refetch: refetchAllBookings,
  } = useQuery({
    queryKey: ['all-bookings', allBookingsDateRange],
    queryFn: () =>
      getBookingsByDateRange(
        allBookingsDateRange[0]?.format('YYYY-MM-DD'),
        allBookingsDateRange[1]?.format('YYYY-MM-DD')
      ),
    enabled: !!allBookingsDateRange[0] && !!allBookingsDateRange[1],
  });

  const stats = dashboardStats?.data || {};
  const bookings =
    bookingFinancials?.data?.data || bookingFinancials?.data || [];
  const revenue = revenueData?.data || {};
  const staff = staffPerformance?.data?.data || staffPerformance?.data || [];
  // const payments = paymentBreakdown?.data || [];
  const userReports =
    userBookingReports?.data?.data || userBookingReports?.data || [];
  const allBookings =
    allBookingsData?.data?.data || allBookingsData?.data || [];

  // Get permission info from responses
  const userPermissions = userBookingReports?.data?.user_permissions ||
    bookingFinancials?.data?.user_permissions ||
    dashboardStats?.data?.user_permissions || {
      can_view_all: canViewAll,
      user_id: user?.id,
      user_name: user?.name,
    };

  const handleExportData = async (format) => {
    try {
      const data = await exportBookingData(
        dateRange[0]?.format('YYYY-MM-DD'),
        dateRange[1]?.format('YYYY-MM-DD'),
        format
      );

      const blob = new Blob([data], {
        type:
          format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hotel-financial-report-${moment().format(
        'YYYY-MM-DD'
      )}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success(
        `تم تصدير التقرير بصيغة ${format === 'excel' ? 'Excel' : 'PDF'} بنجاح`
      );
    } catch (error) {
      message.error('حدث خطأ أثناء تصدير التقرير');
    }
  };

  const handleRefreshData = () => {
    refetchStats();
    refetchBookings();
    refetchUserReports();
    refetchAllBookings();
    message.success('تم تحديث البيانات بنجاح');
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setIsBookingDetailVisible(true);
  };

  // Fetch attachments when modal opens or selectedBooking changes
  useEffect(() => {
    if (isBookingDetailVisible && selectedBooking?.id) {
      setAttachmentsLoading(true);
      getBookingAttachments(selectedBooking.id)
        .then((data) => {
          setAttachments(data.data || data || []);
          setAttachmentsLoading(false);
        })
        .catch(() => {
          setAttachments([]);
          setAttachmentsLoading(false);
        });
    } else {
      setAttachments([]);
    }
  }, [isBookingDetailVisible, selectedBooking]);

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedBooking?.id) return;
    setUploading(true);
    setUploadError(null);
    try {
      await uploadBookingAttachment(selectedBooking.id, file);
      // Refresh attachments
      const data = await getBookingAttachments(selectedBooking.id);
      setAttachments(data.data || data || []);
      message.success('تم رفع المرفق بنجاح');
    } catch (err) {
      setUploadError('حدث خطأ أثناء رفع المرفق');
    } finally {
      setUploading(false);
    }
  };

  // Enhanced booking columns for the all bookings tab
  const allBookingsColumns = [
    {
      title: 'النزيل',
      dataIndex: ['visitor', 'name'],
      key: 'visitor_name',
      render: (name, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <Text strong>{name || 'غير محدد'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.visitor?.phone || 'لا يوجد هاتف'}
            </Text>
          </div>
        </Space>
      ),
      filterable: true,
      onFilter: (value, record) =>
        record.visitor?.name?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'الغرفة',
      dataIndex: ['apartment', 'apartment_number'],
      key: 'apartment',
      render: (number, record) => (
        <Space>
          <HomeOutlined />
          <Text>{number}</Text>
          <Text type="secondary">({record.apartment?.building?.name})</Text>
        </Space>
      ),
    },
    {
      title: 'تاريخ الوصول',
      dataIndex: 'arrival_datetime',
      key: 'arrival_datetime',
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text>{moment(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {moment(date).format('HH:mm')}
          </Text>
        </Space>
      ),
      sorter: (a, b) =>
        moment(a.arrival_datetime).unix() - moment(b.arrival_datetime).unix(),
    },
    {
      title: 'تاريخ المغادرة',
      dataIndex: 'checkout_datetime',
      key: 'checkout_datetime',
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text>{moment(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {moment(date).format('HH:mm')}
          </Text>
        </Space>
      ),
      sorter: (a, b) =>
        moment(a.checkout_datetime).unix() - moment(b.checkout_datetime).unix(),
    },
    {
      title: 'المدة',
      key: 'duration',
      render: (_, record) => {
        const nights = moment(record.checkout_datetime).diff(
          moment(record.arrival_datetime),
          'days'
        );
        return (
          <Space>
            <CalendarOutlined />
            <Text>{nights} ليلة</Text>
          </Space>
        );
      },
    },
    {
      title: 'الإجمالي',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
          {amount?.toLocaleString()} ج.م
        </Text>
      ),
      sorter: (a, b) => (a.total_amount || 0) - (b.total_amount || 0),
    },
    {
      title: 'طريقة الدفع',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => (
        <Tag
          color={
            method === 'cash' ? 'green' : method === 'card' ? 'blue' : 'orange'
          }
        >
          {method === 'cash'
            ? 'نقدي'
            : method === 'card'
            ? 'بطاقة ائتمان'
            : method || 'غير محدد'}
        </Tag>
      ),
      filters: [
        { text: 'نقدي', value: 'cash' },
        { text: 'بطاقة ائتمان', value: 'card' },
      ],
      onFilter: (value, record) => record.payment_method === value,
    },
    {
      title: 'المنشئ',
      dataIndex: 'created_by_name',
      key: 'created_by',
      render: (name, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            size="small"
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <Text>{name || 'غير محدد'}</Text>
            {record.created_by_id === user?.id && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                (أنت)
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          confirmed: { color: 'green', text: 'مؤكد' },
          checked_in: { color: 'blue', text: 'وصل' },
          checked_out: { color: 'orange', text: 'غادر' },
          cancelled: { color: 'red', text: 'ملغي' },
        };
        const config = statusConfig[status] || {
          color: 'default',
          text: status,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      filters: [
        { text: 'مؤكد', value: 'confirmed' },
        { text: 'وصل', value: 'checked_in' },
        { text: 'غادر', value: 'checked_out' },
        { text: 'ملغي', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewBooking(record)}
        >
          عرض
        </Button>
      ),
    },
  ];

  // Booking columns for table
  const bookingColumns = [
    {
      title: 'رقم الحجز',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: 'النزيل',
      dataIndex: ['visitor', 'name'],
      key: 'visitor_name',
      render: (name, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <Text strong>{name || 'غير محدد'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.visitor?.phone || 'لا يوجد هاتف'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'الغرفة',
      dataIndex: ['apartment', 'apartment_number'],
      key: 'apartment',
      render: (number, record) => (
        <Space>
          <HomeOutlined />
          <Text>{number}</Text>
          <Text type="secondary">({record.apartment?.building?.name})</Text>
        </Space>
      ),
    },
    {
      title: 'تاريخ الحجز',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text>{moment(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {moment(date).format('HH:mm')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'المدة',
      key: 'duration',
      render: (_, record) => {
        const nights = moment(record.checkout_datetime).diff(
          moment(record.arrival_datetime),
          'days'
        );
        return (
          <Space>
            <CalendarOutlined />
            <Text>{nights} ليلة</Text>
          </Space>
        );
      },
    },
    {
      title: 'الإجمالي',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
          {amount?.toLocaleString()} ج.م
        </Text>
      ),
    },
    {
      title: 'طريقة الدفع',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => (
        <Tag
          color={
            method === 'cash' ? 'green' : method === 'card' ? 'blue' : 'orange'
          }
        >
          {method === 'cash'
            ? 'نقدي'
            : method === 'card'
            ? 'بطاقة ائتمان'
            : method || 'غير محدد'}
        </Tag>
      ),
    },
    {
      title: 'المنشئ',
      dataIndex: 'created_by_name',
      key: 'created_by',
      render: (name, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            size="small"
            style={{ backgroundColor: '#1890ff' }}
          />
          <div>
            <Text>{name || 'غير محدد'}</Text>
            {record.created_by_id === user?.id && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                (أنت)
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          confirmed: { color: 'green', text: 'مؤكد' },
          checked_in: { color: 'blue', text: 'وصل' },
          checked_out: { color: 'orange', text: 'غادر' },
          cancelled: { color: 'red', text: 'ملغي' },
        };
        const config = statusConfig[status] || {
          color: 'default',
          text: status,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  // Staff performance columns
  const staffColumns = [
    {
      title: 'الموظف',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: '#52c41a' }}
          />
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.role || 'موظف'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'عدد الحجوزات',
      dataIndex: 'bookings_count',
      key: 'bookings_count',
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
      ),
      sorter: (a, b) => a.bookings_count - b.bookings_count,
    },
    {
      title: 'إجمالي الإيرادات',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (revenue) => (
        <Text strong style={{ color: '#52c41a' }}>
          {revenue?.toLocaleString()} ج.م
        </Text>
      ),
      sorter: (a, b) => a.total_revenue - b.total_revenue,
    },
    {
      title: 'متوسط قيمة الحجز',
      key: 'average_booking',
      render: (_, record) => {
        const avg = record.total_revenue / (record.bookings_count || 1);
        return (
          <Text style={{ color: '#722ed1' }}>{avg.toLocaleString()} ج.م</Text>
        );
      },
    },
    // {
    //     title: 'الأداء',
    //     key: 'performance',
    //     render: (_, record) => {
    //         const maxRevenue = Math.max(...staff.map(s => s.total_revenue || 0));
    //         const percentage = maxRevenue > 0 ? (record.total_revenue / maxRevenue) * 100 : 0;
    //         return (
    //             <Progress
    //                 percent={Math.round(percentage)}
    //                 size="small"
    //                 status={percentage > 80 ? 'success' : percentage > 50 ? 'active' : 'normal'}
    //             />
    //         );
    //     }
    // }
  ];

  const renderDashboard = () => (
    <div className="accounting-dashboard">
      {/* Main Statistics */}
      <Row gutter={[24, 24]} className="stats-section">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card revenue-card">
            <Statistic
              title="إجمالي الإيرادات"
              value={stats.total_revenue || 0}
              prefix={<DollarOutlined />}
              suffix="ج.م"
              valueStyle={{ color: '#52c41a' }}
            />
            <div className="stat-subtitle">
              <Text type="secondary">هذا الشهر</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card bookings-card">
            <Statistic
              title="عدد الحجوزات"
              value={stats.total_bookings || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="stat-subtitle">
              <Text type="secondary">حجز مكتمل</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card average-card">
            <Statistic
              title="متوسط قيمة الحجز"
              value={stats.average_booking_value || 0}
              prefix={<BarChartOutlined />}
              suffix="ج.م"
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="stat-subtitle">
              <Text type="secondary">لكل حجز</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card growth-card">
            <Statistic
              title="النمو الشهري"
              value={stats.monthly_growth || 0}
              prefix={
                stats.monthly_growth >= 0 ? <RiseOutlined /> : <FallOutlined />
              }
              suffix="%"
              valueStyle={{
                color: stats.monthly_growth >= 0 ? '#52c41a' : '#ff4d4f',
              }}
            />
            <div className="stat-subtitle">
              <Text type="secondary">مقارنة بالشهر السابق</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts and Analytics */}
      <Row gutter={[24, 24]} className="analytics-section">
        <Col xs={24} lg={16}>
          <Card
            title="إيرادات الـ 30 يوم الماضية"
            className="revenue-chart-card"
          >
            <div className="chart-placeholder">
              <LineChartOutlined
                style={{ fontSize: '48px', color: '#d9d9d9' }}
              />
              <Title level={4} type="secondary">
                مخطط الإيرادات
              </Title>
              <Text type="secondary">سيتم إضافة مخطط بياني تفاعلي هنا</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title=" أداء الموظفين" className="top-staff-card">
            <Table
              dataSource={staff.slice(0, 5)}
              columns={staffColumns}
              pagination={false}
              size="small"
              loading={staffLoading}
            />
          </Card>
        </Col>

        {/* <Col xs={24} lg={8}>
                    <Card title="توزيع طرق الدفع" className="payment-chart-card">
                        <div className="payment-methods">
                            {payments.map((method, index) => (
                                <div key={index} className="payment-method-item">
                                    <div className="payment-info">
                                        <Text strong>{method.name}</Text>
                                        <Text style={{ color: '#52c41a' }}>
                                            {method.amount?.toLocaleString()} ج.م
                                        </Text>
                                    </div>
                                    <Progress 
                                        percent={method.percentage || 0} 
                                        size="small"
                                        strokeColor={
                                            method.name === 'نقدي' ? '#52c41a' :
                                            method.name === 'بطاقة' ? '#1890ff' : '#722ed1'
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col> */}
      </Row>
    </div>
  );

  const renderUserBookingReports = () => {
    // Columns for user booking reports
    const userReportColumns = [
      {
        title: 'اسم الموظف',
        dataIndex: 'name',
        key: 'name',
        render: (name, record) => (
          <Space>
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
            <div>
              <Text strong>{name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.email}
              </Text>
              {record.id === user?.id && (
                <div>
                  <Text type="warning" style={{ fontSize: '12px' }}>
                    (أنت)
                  </Text>
                </div>
              )}
            </div>
          </Space>
        ),
      },
      {
        title: 'عدد الحجوزات',
        dataIndex: 'bookings_count',
        key: 'bookings_count',
        render: (count) => (
          <Badge
            count={count}
            style={{ backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9' }}
            showZero
          />
        ),
        sorter: (a, b) => a.bookings_count - b.bookings_count,
      },
      {
        title: 'إجمالي الإيرادات',
        dataIndex: 'total_revenue',
        key: 'total_revenue',
        render: (revenue) => (
          <Text strong style={{ color: '#52c41a' }}>
            {revenue?.toLocaleString()} ج.م
          </Text>
        ),
        sorter: (a, b) => a.total_revenue - b.total_revenue,
      },
      {
        title: 'متوسط قيمة الحجز',
        dataIndex: 'average_booking_value',
        key: 'average_booking_value',
        render: (avg) => (
          <Text style={{ color: '#722ed1' }}>{avg?.toLocaleString()} ج.م</Text>
        ),
      },
      // {
      //     title: 'الأداء',
      //     key: 'performance',
      //     render: (_, record) => {
      //         const maxRevenue = Math.max(...userReports.map(r => r.total_revenue || 0));
      //         const percentage = maxRevenue > 0 ? (record.total_revenue / maxRevenue) * 100 : 0;
      //         return (
      //             <Progress
      //                 percent={Math.round(percentage)}
      //                 size="small"
      //                 status={percentage > 80 ? 'success' : percentage > 50 ? 'active' : 'normal'}
      //             />
      //         );
      //     }
      // }
    ];

    return (
      <div className="user-booking-reports">
        <Card
          title={canViewAll ? 'تقرير الحجوزات حسب الموظفين' : 'تقرير حجوزاتي'}
          extra={
            <Space>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: 300 }}
              />
              {canViewAll && (
                <Input
                  placeholder="فلترة بالاسم"
                  value={userNameFilter}
                  onChange={(e) => setUserNameFilter(e.target.value)}
                  style={{ width: 200 }}
                  allowClear
                />
              )}
              <Button icon={<ReloadOutlined />} onClick={handleRefreshData}>
                تحديث
              </Button>
            </Space>
          }
          className="user-reports-card"
        >
          <Table
            dataSource={userReports}
            columns={userReportColumns}
            rowKey="id"
            loading={userReportsLoading}
            pagination={{
              total: userReports.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} من ${total} موظف`,
            }}
            summary={(pageData) => {
              const totalBookings = pageData.reduce(
                (sum, user) => sum + (user.bookings_count || 0),
                0
              );
              const totalRevenue = pageData.reduce(
                (sum, user) => sum + (user.total_revenue || 0),
                0
              );
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <Text strong>الإجمالي:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Badge
                        count={totalBookings}
                        style={{ backgroundColor: '#1890ff' }}
                      />
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Text
                        strong
                        style={{ color: '#52c41a', fontSize: '16px' }}
                      >
                        {totalRevenue.toLocaleString()} ج.م
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} colSpan={2} />
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </Card>
      </div>
    );
  };

  const renderStaffPerformance = () => (
    <div className="staff-performance">
      <Card title="أداء الموظفين" className="staff-performance-card">
        <Table
          dataSource={staff}
          columns={staffColumns}
          rowKey="id"
          loading={staffLoading}
          pagination={{
            total: staff.length,
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} من ${total} موظف`,
          }}
        />
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="financial-reports">
      <Card
        title="تقارير قسم الإسكان"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={() => handleExportData('excel')}
            >
              تصدير Excel
            </Button>
            <Button
              icon={<FilePdfOutlined />}
              onClick={() => handleExportData('pdf')}
            >
              تصدير PDF
            </Button>
          </Space>
        }
        className="reports-card"
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card type="inner" title="تقرير يومي">
              <Text>تقرير شامل للإيرادات والحجوزات اليومية</Text>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card type="inner" title="تقرير شهري">
              <Text>تحليل شامل للأداء المالي الشهري</Text>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card type="inner" title="تقرير أداء الموظفين">
              <Text>تقييم أداء الموظفين وإنتاجيتهم</Text>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card type="inner" title="تحليل طرق الدفع">
              <Text>توزيع طرق الدفع والمعاملات المالية</Text>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );

  const renderAllBookings = () => {
    // Filter bookings based on search text
    const filteredBookings = allBookings.filter((booking) => {
      if (!bookingSearchText) return true;
      const searchLower = bookingSearchText.toLowerCase();
      return (
        booking.id?.toString().includes(searchLower) ||
        booking.visitor?.name?.toLowerCase().includes(searchLower) ||
        booking.visitor?.phone?.includes(searchLower) ||
        booking.apartment?.apartment_number
          ?.toLowerCase()
          .includes(searchLower) ||
        booking.created_by_name?.toLowerCase().includes(searchLower)
      );
    });

    return (
      <div className="all-bookings-section">
        <Card
          title="جميع الحجوزات"
          extra={
            <Space>
              <Input
                placeholder="البحث في الحجوزات..."
                prefix={<SearchOutlined />}
                value={bookingSearchText}
                onChange={(e) => setBookingSearchText(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
              <RangePicker
                value={allBookingsDateRange}
                onChange={setAllBookingsDateRange}
                style={{ width: 300 }}
                placeholder={['تاريخ البداية', 'تاريخ النهاية']}
              />
              <Button icon={<ReloadOutlined />} onClick={handleRefreshData}>
                تحديث
              </Button>
            </Space>
          }
          className="all-bookings-card"
        >
          <Table
            dataSource={filteredBookings}
            columns={allBookingsColumns}
            rowKey="id"
            loading={allBookingsLoading}
            scroll={{ x: 1500 }}
            pagination={{
              total: filteredBookings.length,
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} من ${total} حجز`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            summary={(pageData) => {
              const totalAmount = pageData.reduce(
                (sum, booking) => sum + (booking.total_amount || 0),
                0
              );
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <Text strong>الإجمالي:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} colSpan={4} />
                    <Table.Summary.Cell index={6}>
                      <Text
                        strong
                        style={{ color: '#52c41a', fontSize: '16px' }}
                      >
                        {totalAmount.toLocaleString()} ج.م
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7} colSpan={3} />
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </Card>

        {/* Booking Detail Modal */}
        <Modal
          title={null}
          open={isBookingDetailVisible}
          onCancel={() => setIsBookingDetailVisible(false)}
          footer={null}
          width={900}
          className="booking-detail-modal"
        >
          {selectedBooking && (
            <div className="booking-details-sectioned">
              {/* Visitor Section */}
              <Card
                title="معلومات الزائر"
                bordered={false}
                className="section-card"
              >
                <Space direction="horizontal" size={24} align="start">
                  <Avatar
                    size={64}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      {selectedBooking.visitor?.name || 'غير محدد'}
                    </Title>
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">رقم الجوال: </Text>
                      <Text>
                        {selectedBooking.visitor?.phone || 'غير محدد'}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary">رقم الهوية: </Text>
                      <Text>
                        {selectedBooking.visitor?.national_id ||
                          selectedBooking.visitor?.id_number ||
                          'غير محدد'}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary">الجنسية: </Text>
                      <Text>
                        {selectedBooking.visitor?.nationality || 'غير محدد'}
                      </Text>
                    </div>
                  </div>
                </Space>
              </Card>

              <Divider />

              {/* Booking Section */}
              <Card
                title="معلومات الحجز"
                bordered={false}
                className="section-card"
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Text type="secondary">الحالة:</Text>{' '}
                    <Tag
                      color={
                        selectedBooking.status === 'active'
                          ? 'green'
                          : selectedBooking.status === 'confirmed'
                          ? 'blue'
                          : selectedBooking.status === 'completed'
                          ? 'orange'
                          : 'red'
                      }
                    >
                      {selectedBooking.status === 'confirmed'
                        ? 'مؤكد'
                        : selectedBooking.status === 'active'
                        ? 'نشط'
                        : selectedBooking.status === 'completed'
                        ? 'منتهي'
                        : 'ملغي'}
                    </Tag>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">تاريخ الإنشاء:</Text>{' '}
                    <Text>
                      {moment(selectedBooking.created_at).format(
                        'DD/MM/YYYY HH:mm'
                      )}
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">منشئ الحجز:</Text>{' '}
                    <Text>{selectedBooking.created_by_name || 'غير محدد'}</Text>
                  </Col>
                  {selectedBooking.notes && (
                    <Col span={24}>
                      <Text type="secondary">ملاحظات:</Text>{' '}
                      <Text>{selectedBooking.notes}</Text>
                    </Col>
                  )}
                </Row>
              </Card>

              {/* Apartment Section */}
              <Card
                title="معلومات الشقة"
                bordered={false}
                className="section-card"
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Text type="secondary">رقم الغرفة:</Text>{' '}
                    <Text>
                      {selectedBooking.apartment?.apartment_number ||
                        'غير محدد'}
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">المبنى:</Text>{' '}
                    <Text>
                      {selectedBooking.apartment?.building?.name || 'غير محدد'}
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">نوع الغرفة:</Text>{' '}
                    <Text>
                      {selectedBooking.apartment?.room_type || 'غير محدد'}
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">الدور:</Text>{' '}
                    <Text>
                      {selectedBooking.apartment?.floor_number || 'غير محدد'}
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">الحد الأقصى للنزلاء:</Text>{' '}
                    <Text>
                      {selectedBooking.apartment?.max_occupancy || 'غير محدد'}
                    </Text>
                  </Col>
                </Row>
              </Card>

              {/* Products Section */}
              <Card
                title="المنتجات / الخدمات"
                bordered={false}
                className="section-card"
              >
                {selectedBooking.booking_products &&
                selectedBooking.booking_products.length > 0 ? (
                  <Table
                    dataSource={selectedBooking.booking_products}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    columns={[
                      {
                        title: 'المنتج',
                        dataIndex: 'product_name',
                        key: 'product_name',
                      },
                      {
                        title: 'الكمية',
                        dataIndex: 'quantity',
                        key: 'quantity',
                      },
                      {
                        title: 'سعر الوحدة',
                        dataIndex: 'formatted_unit_price',
                        key: 'unit_price',
                      },
                      {
                        title: 'الإجمالي',
                        dataIndex: 'formatted_total_price',
                        key: 'total_price',
                      },
                      { title: 'ملاحظات', dataIndex: 'notes', key: 'notes' },
                    ]}
                  />
                ) : (
                  <Empty description="لا يوجد منتجات أو خدمات مضافة" />
                )}
              </Card>

              {/* Attachments Section */}
              <Card title="المرفقات" bordered={false} className="section-card">
                {attachmentsLoading ? (
                  <Spin />
                ) : attachments && attachments.length > 0 ? (
                  <Table
                    dataSource={attachments}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    columns={[
                      {
                        title: 'اسم الملف',
                        dataIndex: 'original_name',
                        key: 'original_name',
                      },
                      {
                        title: 'النوع',
                        dataIndex: 'mime_type',
                        key: 'mime_type',
                      },
                      {
                        title: 'الحجم',
                        dataIndex: 'file_size_human',
                        key: 'file_size_human',
                      },
                      {
                        title: 'تاريخ الرفع',
                        dataIndex: 'created_at',
                        key: 'created_at',
                        render: (date) =>
                          moment(date).format('DD/MM/YYYY HH:mm'),
                      },
                      {
                        title: 'تحميل',
                        key: 'download',
                        render: (_, record) => (
                          <a
                            href={record.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            تنزيل
                          </a>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <Empty description="لا يوجد مرفقات" />
                )}
              </Card>

              <Divider />

              {/* Financial Summary Section */}
              <Card
                title="الملخص المالي"
                bordered={false}
                className="section-card"
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Text type="secondary">الإجمالي:</Text>{' '}
                    <Text strong style={{ color: '#52c41a' }}>
                      {selectedBooking.total_amount?.toLocaleString()} ج.م
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">العربون:</Text>{' '}
                    <Text>
                      {selectedBooking.deposit_amount?.toLocaleString() || 0}{' '}
                      ج.م
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">الخصم:</Text>{' '}
                    <Text style={{ color: '#ff4d4f' }}>
                      {selectedBooking.discount_amount?.toLocaleString() || 0}{' '}
                      ج.م
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">طريقة الدفع:</Text>{' '}
                    <Tag
                      color={
                        selectedBooking.payment_method === 'cash'
                          ? 'green'
                          : selectedBooking.payment_method === 'card'
                          ? 'blue'
                          : 'orange'
                      }
                    >
                      {selectedBooking.payment_method === 'cash'
                        ? 'نقدي'
                        : selectedBooking.payment_method === 'card'
                        ? 'بطاقة ائتمان'
                        : selectedBooking.payment_method || 'غير محدد'}
                    </Tag>
                  </Col>
                </Row>
              </Card>
            </div>
          )}
        </Modal>
      </div>
    );
  };

  return (
    <Layout className="accounting-page">
      <Content className="accounting-content">
        <div className="page-header">
          <div className="page-title">
            <Title level={2} style={{ color: '#e6e6e6' }}>
              <DollarOutlined style={{ marginLeft: 12 }} />
              تقارير قسم الإسكان
            </Title>
          </div>
          {!canViewAll && (
            <div style={{ marginTop: 16 }}>
              <Card
                size="small"
                style={{
                  backgroundColor: '#fff7e6',
                  border: '1px solid #ffd666',
                }}
              >
                <Text type="warning">
                  <UserOutlined style={{ marginLeft: 8 }} />
                  أنت تشاهد بياناتك الشخصية فقط. للاطلاع على جميع البيانات، يرجى
                  التواصل مع المدير للحصول على الصلاحيات المطلوبة.
                </Text>
              </Card>
            </div>
          )}
        </div>

        <div className="page-content">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="accounting-tabs"
            items={[
              {
                key: 'dashboard',
                label: (
                  <Space>
                    <BarChartOutlined />
                    <span>لوحة التحكم</span>
                  </Space>
                ),
                children: renderDashboard(),
              },
              {
                key: 'bookings',
                label: (
                  <Space>
                    <CalendarOutlined />
                    <span>
                      {canViewAll
                        ? 'تقرير الحجوزات حسب الموظفين'
                        : 'تقرير حجوزاتي'}
                    </span>
                  </Space>
                ),
                children: renderUserBookingReports(),
              },
              {
                key: 'all-bookings',
                label: (
                  <Space>
                    <EyeOutlined />
                    <span>جميع الحجوزات</span>
                  </Space>
                ),
                children: renderAllBookings(),
              },
              ...(canViewAll
                ? [
                    {
                      key: 'staff',
                      label: (
                        <Space>
                          <TeamOutlined />
                          <span>أداء الموظفين</span>
                        </Space>
                      ),
                      children: renderStaffPerformance(),
                    },
                  ]
                : []),
              {
                key: 'reports',
                label: (
                  <Space>
                    <FileExcelOutlined />
                    <span>التقارير</span>
                  </Space>
                ),
                children: renderReports(),
              },
            ]}
          />
        </div>
      </Content>
    </Layout>
  );
}

export default AccountingPage;
