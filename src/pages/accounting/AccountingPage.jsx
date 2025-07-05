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
    Input
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
    CheckCircleOutlined
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
    getUserBookingReports
} from '../../apis/accounting/accountingApi';
import { useAuth } from '../../context/AuthContext';
import './AccountingPage.scss';

const { Title, Text } = Typography;
const { Content } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;

moment.locale('ar');

const AccountingPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dateRange, setDateRange] = useState([
        moment().startOf('month'),
        moment().endOf('month')
    ]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [period, setPeriod] = useState('monthly');
    const [userNameFilter, setUserNameFilter] = useState('');

    // Check if user has admin permissions
    const canViewAll = user?.permissions?.some(p => p.name === 'view all accounting data') || 
                      user?.roleName === 'admin' || 
                      user?.roleName === 'مدير';

    // Fetch dashboard statistics
    const { 
        data: dashboardStats, 
        isLoading: statsLoading,
        refetch: refetchStats 
    } = useQuery({
        queryKey: ['accounting-dashboard-stats'],
        queryFn: getAccountingDashboardStats,
        refetchInterval: 60000
    });

    // Fetch booking financials
    const { 
        data: bookingFinancials, 
        isLoading: bookingsLoading,
        refetch: refetchBookings
    } = useQuery({
        queryKey: ['booking-financials', dateRange, selectedStaff, selectedPaymentMethod],
        queryFn: () => getBookingFinancials({
            start_date: dateRange[0]?.format('YYYY-MM-DD'),
            end_date: dateRange[1]?.format('YYYY-MM-DD'),
            staff_id: selectedStaff,
            payment_method_id: selectedPaymentMethod
        }),
        enabled: !!dateRange[0] && !!dateRange[1]
    });

    // Fetch revenue analytics
    const { 
        data: revenueData, 
        isLoading: revenueLoading 
    } = useQuery({
        queryKey: ['revenue-analytics', period, dateRange],
        queryFn: () => getRevenueAnalytics(period, {
            start_date: dateRange[0]?.format('YYYY-MM-DD'),
            end_date: dateRange[1]?.format('YYYY-MM-DD')
        }),
        enabled: !!dateRange[0] && !!dateRange[1]
    });

    // Fetch staff performance
    const { 
        data: staffPerformance, 
        isLoading: staffLoading 
    } = useQuery({
        queryKey: ['staff-performance', dateRange],
        queryFn: () => getStaffPerformance({
            start_date: dateRange[0]?.format('YYYY-MM-DD'),
            end_date: dateRange[1]?.format('YYYY-MM-DD')
        }),
        enabled: !!dateRange[0] && !!dateRange[1]
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
        refetch: refetchUserReports
    } = useQuery({
        queryKey: ['user-booking-reports', dateRange, userNameFilter],
        queryFn: () => getUserBookingReports({
            start_date: dateRange[0]?.format('YYYY-MM-DD'),
            end_date: dateRange[1]?.format('YYYY-MM-DD'),
            user_name: userNameFilter || undefined
        }),
        enabled: !!dateRange[0] && !!dateRange[1]
    });

    const stats = dashboardStats?.data || {};
    const bookings = bookingFinancials?.data?.data || bookingFinancials?.data || [];
    const revenue = revenueData?.data || {};
    const staff = staffPerformance?.data?.data || staffPerformance?.data || [];
    // const payments = paymentBreakdown?.data || [];
    const userReports = userBookingReports?.data?.data || userBookingReports?.data || [];
    
    // Get permission info from responses
    const userPermissions = userBookingReports?.data?.user_permissions ||
                          bookingFinancials?.data?.user_permissions || 
                          dashboardStats?.data?.user_permissions || 
                          { can_view_all: canViewAll, user_id: user?.id, user_name: user?.name };

    const handleExportData = async (format) => {
        try {
            const data = await exportBookingData(
                dateRange[0]?.format('YYYY-MM-DD'),
                dateRange[1]?.format('YYYY-MM-DD'),
                format
            );
            
            const blob = new Blob([data], { 
                type: format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `hotel-financial-report-${moment().format('YYYY-MM-DD')}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            message.success(`تم تصدير التقرير بصيغة ${format === 'excel' ? 'Excel' : 'PDF'} بنجاح`);
        } catch (error) {
            message.error('حدث خطأ أثناء تصدير التقرير');
        }
    };

    const handleRefreshData = () => {
        refetchStats();
        refetchBookings();
        refetchUserReports();
        message.success('تم تحديث البيانات بنجاح');
    };

    // Booking columns for table
    const bookingColumns = [
        {
            title: 'رقم الحجز',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <Text strong>#{id}</Text>
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
            )
        },
        {
            title: 'الغرفة',
            dataIndex: ['apartment', 'apartment_number'],
            key: 'apartment',
            render: (number, record) => (
                <Space>
                    <HomeOutlined />
                    <Text>{number}</Text>
                    <Text type="secondary">
                        ({record.apartment?.building?.name})
                    </Text>
                </Space>
            )
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
            )
        },
        {
            title: 'المدة',
            key: 'duration',
            render: (_, record) => {
                const nights = moment(record.checkout_datetime).diff(moment(record.arrival_datetime), 'days');
                return (
                    <Space>
                        <CalendarOutlined />
                        <Text>{nights} ليلة</Text>
                    </Space>
                );
            }
        },
        {
            title: 'الإجمالي',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount) => (
                <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                    {amount?.toLocaleString()} ج.م
                </Text>
            )
        },
        {
            title: 'طريقة الدفع',
            dataIndex: 'payment_method',
            key: 'payment_method',
            render: (method) => (
                <Tag color={method === 'cash' ? 'green' : method === 'card' ? 'blue' : 'orange'}>
                    {method === 'cash' ? 'نقدي' : method === 'card' ? 'بطاقة ائتمان' : method || 'غير محدد'}
                </Tag>
            )
        },
        {
            title: 'المنشئ',
            dataIndex: 'created_by_name',
            key: 'created_by',
            render: (name, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} size="small" style={{ backgroundColor: '#1890ff' }} />
                    <div>
                        <Text>{name || 'غير محدد'}</Text>
                        {record.created_by_id === user?.id && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                (أنت)
                            </Text>
                        )}
                    </div>
                </Space>
            )
        },
        {
            title: 'الحالة',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusConfig = {
                    'confirmed': { color: 'green', text: 'مؤكد' },
                    'checked_in': { color: 'blue', text: 'وصل' },
                    'checked_out': { color: 'orange', text: 'غادر' },
                    'cancelled': { color: 'red', text: 'ملغي' }
                };
                const config = statusConfig[status] || { color: 'default', text: status };
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        }
    ];

    // Staff performance columns
    const staffColumns = [
        {
            title: 'الموظف',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
                    <div>
                        <Text strong>{name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.role || 'موظف'}
                        </Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'عدد الحجوزات',
            dataIndex: 'bookings_count',
            key: 'bookings_count',
            render: (count) => (
                <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
            ),
            sorter: (a, b) => a.bookings_count - b.bookings_count
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
            sorter: (a, b) => a.total_revenue - b.total_revenue
        },
        {
            title: 'متوسط قيمة الحجز',
            key: 'average_booking',
            render: (_, record) => {
                const avg = record.total_revenue / (record.bookings_count || 1);
                return (
                    <Text style={{ color: '#722ed1' }}>
                        {avg.toLocaleString()} ج.م
                    </Text>
                );
            }
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
                            prefix={stats.monthly_growth >= 0 ? <RiseOutlined /> : <FallOutlined />}
                            suffix="%"
                            valueStyle={{ 
                                color: stats.monthly_growth >= 0 ? '#52c41a' : '#ff4d4f' 
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
                    <Card title="إيرادات الـ 30 يوم الماضية" className="revenue-chart-card">
                        <div className="chart-placeholder">
                            <LineChartOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                            <Title level={4} type="secondary">مخطط الإيرادات</Title>
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
                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
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
                )
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
                sorter: (a, b) => a.bookings_count - b.bookings_count
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
                sorter: (a, b) => a.total_revenue - b.total_revenue
            },
            {
                title: 'متوسط قيمة الحجز',
                dataIndex: 'average_booking_value',
                key: 'average_booking_value',
                render: (avg) => (
                    <Text style={{ color: '#722ed1' }}>
                        {avg?.toLocaleString()} ج.م
                    </Text>
                )
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
                    title={canViewAll ? "تقرير الحجوزات حسب الموظفين" : "تقرير حجوزاتي"}
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
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={handleRefreshData}
                            >
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
                            const totalBookings = pageData.reduce((sum, user) => sum + (user.bookings_count || 0), 0);
                            const totalRevenue = pageData.reduce((sum, user) => sum + (user.total_revenue || 0), 0);
                            return (
                                <Table.Summary fixed>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0}>
                                            <Text strong>الإجمالي:</Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}>
                                            <Badge count={totalBookings} style={{ backgroundColor: '#1890ff' }} />
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={2}>
                                            <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
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
            <Card 
                title="أداء الموظفين"
                className="staff-performance-card"
            >
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

    return (
        <Layout className="accounting-page">
            <Content className="accounting-content">
                <div className="page-header">
                    <div className="page-title">
                        <Title level={2}>
                            <DollarOutlined style={{ marginLeft: 12 }} />
                            تقارير قسم الإسكان
                        </Title>
                        <Space>
                            <Button 
                                icon={<ReloadOutlined />}
                                onClick={handleRefreshData}
                            >
                                تحديث البيانات
                            </Button>
                            <Button 
                                icon={<FileExcelOutlined />}
                                type="primary"
                                onClick={() => handleExportData('excel')}
                            >
                                تصدير تقرير
                            </Button>
                        </Space>
                    </div>
                    {!canViewAll && (
                        <div style={{ marginTop: 16 }}>
                            <Card size="small" style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd666' }}>
                                <Text type="warning">
                                    <UserOutlined style={{ marginLeft: 8 }} />
                                    أنت تشاهد بياناتك الشخصية فقط. للاطلاع على جميع البيانات، يرجى التواصل مع المدير للحصول على الصلاحيات المطلوبة.
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
                                children: renderDashboard()
                            },
                            {
                                key: 'bookings',
                                label: (
                                    <Space>
                                        <CalendarOutlined />
                                        <span>{canViewAll ? 'تقرير الحجوزات حسب الموظفين' : 'تقرير حجوزاتي'}</span>
                                    </Space>
                                ),
                                children: renderUserBookingReports()
                            },
                            ...(canViewAll ? [
                                {
                                    key: 'staff',
                                    label: (
                                        <Space>
                                            <TeamOutlined />
                                            <span>أداء الموظفين</span>
                                        </Space>
                                    ),
                                    children: renderStaffPerformance()
                                }
                            ] : []),
                            {
                                key: 'reports',
                                label: (
                                    <Space>
                                        <FileExcelOutlined />
                                        <span>التقارير</span>
                                    </Space>
                                ),
                                children: renderReports()
                            }
                        ]}
                    />
                </div>
            </Content>
        </Layout>
    );
};

export default AccountingPage; 