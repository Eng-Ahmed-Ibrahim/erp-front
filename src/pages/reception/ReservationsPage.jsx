import React, { useState } from 'react';
import {
  Layout,
  Typography,
  Button,
  Space,
  Spin,
  Empty,
  Table,
  Tag,
  Card,
  Modal,
  Row,
  Col,
  Statistic,
  Avatar,
  Tooltip,
  DatePicker,
  Select,
  Input,
  Alert
} from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  ReloadOutlined,
  FilterOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getReservations,
  activateReservation,
  cancelReservation,
  getBuildings,
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS
} from '../../apis/reception/receptionApi';
import moment from 'moment';

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const ReservationsPage = () => {
  const queryClient = useQueryClient();

  // State management
  const [filters, setFilters] = useState({
    status: BOOKING_STATUS.PENDING,
    from_date: '',
    to_date: '',
    building_id: '',
    visitor_name: ''
  });
  const [dateRange, setDateRange] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Fetch reservations
  const { data: reservationsData, isLoading: reservationsLoading, error: reservationsError, refetch } = useQuery({
    queryKey: ['reservations', filters],
    queryFn: () => getReservations(filters),
    refetchInterval: 30000
  });

  // Fetch buildings for filter
  const { data: buildingsData } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => getBuildings()
  });

  // Mutations
  const activateMutation = useMutation({
    mutationFn: (reservationId) => activateReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations']);
    }
  });

  const cancelMutation = useMutation({
    mutationFn: ({ reservationId, reason }) => cancelReservation(reservationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations']);
    }
  });

  // Event handlers
  const handleDateRangeChange = (dates) => {
    setDateRange(dates || []);
    setFilters(prev => ({
      ...prev,
      from_date: dates?.[0]?.format('YYYY-MM-DD') || '',
      to_date: dates?.[1]?.format('YYYY-MM-DD') || ''
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleActivateReservation = (reservation) => {
    Modal.confirm({
      title: 'تأكيد تفعيل الحجز',
      content: `هل أنت متأكد من تفعيل حجز ${reservation.visitor?.name}؟`,
      okText: 'تفعيل',
      cancelText: 'إلغاء',
      onOk: () => activateMutation.mutate(reservation.id)
    });
  };

  const handleCancelReservation = (reservation) => {
    Modal.confirm({
      title: 'تأكيد إلغاء الحجز',
      content: `هل أنت متأكد من إلغاء حجز ${reservation.visitor?.name}؟`,
      okText: 'إلغاء الحجز',
      okType: 'danger',
      cancelText: 'تراجع',
      onOk: () => {
        cancelMutation.mutate({ reservationId: reservation.id, reason: '' });
      }
    });
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setDetailsModalVisible(true);
  };

  // Prepare data
  const reservations = reservationsData?.data || [];
  const buildings = buildingsData?.data || [];

  // Table columns
  const columns = [
    {
      title: 'الزائر',
      key: 'visitor',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#1890ff', marginLeft: 12 }}
          />
          <div>
            <div style={{ fontWeight: '600' }}>{record.visitor?.name || 'غير محدد'}</div>
            <Text type="secondary">{record.visitor?.client_type?.name || 'عميل'}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'الشقة',
      key: 'apartment',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: '600' }}>
            {record.apartment?.building?.name} - شقة {record.apartment?.apartment_number}
          </div>
          <Text type="secondary">{record.apartment?.room_type}</Text>
        </div>
      )
    },
    {
      title: 'تاريخ الوصول',
      dataIndex: 'arrival_datetime',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'تاريخ المغادرة',
      dataIndex: 'checkout_datetime',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === BOOKING_STATUS.PENDING ? 'orange' : 'green'}>
          {BOOKING_STATUS_LABELS[status]}
        </Tag>
      )
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="عرض التفاصيل">
            <Button
              type="text"
              icon={<ExclamationCircleOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {record.status === BOOKING_STATUS.PENDING && (
            <>
              <Tooltip title="تفعيل الحجز">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  style={{ color: '#52c41a' }}
                  onClick={() => handleActivateReservation(record)}
                />
              </Tooltip>
              <Tooltip title="إلغاء الحجز">
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  danger
                  onClick={() => handleCancelReservation(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <CalendarOutlined style={{ marginLeft: 12 }} />
            إدارة الحجوزات المسبقة
          </Title>
        </div>

        {/* Filters */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={4}>
              <Select
                placeholder="حالة الحجز"
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                style={{ width: '100%' }}
              >
                <Option value="">جميع الحالات</Option>
                <Option value={BOOKING_STATUS.PENDING}>في الانتظار</Option>
                <Option value={BOOKING_STATUS.CONFIRMED}>مؤكد</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="المبنى"
                value={filters.building_id}
                onChange={(value) => handleFilterChange('building_id', value)}
                style={{ width: '100%' }}
              >
                <Option value="">جميع المباني</Option>
                {buildings.map(building => (
                  <Option key={building.id} value={building.id}>
                    {building.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder={['من تاريخ', 'إلى تاريخ']}
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={6}>
              <Search
                placeholder="البحث بالاسم"
                value={filters.visitor_name}
                onChange={(e) => handleFilterChange('visitor_name', e.target.value)}
              />
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card>
          <Spin spinning={reservationsLoading}>
            {reservationsError ? (
              <Alert message="خطأ في تحميل البيانات" type="error" />
            ) : reservations.length === 0 ? (
              <Empty description="لا توجد حجوزات مسبقة" />
            ) : (
              <Table
                columns={columns}
                dataSource={reservations}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            )}
          </Spin>
        </Card>

        {/* Details Modal */}
        <Modal
          title="تفاصيل الحجز المسبق"
          open={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedReservation && (
            <div>
              <Card size="small" title="بيانات الزائر" style={{ marginBottom: 16 }}>
                <p><strong>الاسم:</strong> {selectedReservation.visitor?.name}</p>
                <p><strong>الهاتف:</strong> {selectedReservation.visitor?.phone}</p>
                <p><strong>الجنسية:</strong> {selectedReservation.visitor?.nationality}</p>
              </Card>
              <Card size="small" title="تفاصيل الحجز">
                <p><strong>الشقة:</strong> {selectedReservation.apartment?.apartment_number}</p>
                <p><strong>تاريخ الوصول:</strong> {moment(selectedReservation.arrival_datetime).format('DD/MM/YYYY HH:mm')}</p>
                <p><strong>تاريخ المغادرة:</strong> {moment(selectedReservation.checkout_datetime).format('DD/MM/YYYY HH:mm')}</p>
                <p><strong>المبلغ:</strong> {selectedReservation.total_amount} جنيه</p>
              </Card>
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default ReservationsPage; 