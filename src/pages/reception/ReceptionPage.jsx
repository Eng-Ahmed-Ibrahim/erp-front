import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  ColorPicker,
  Space,
  Typography,
  Breadcrumb,
  Tabs,
  Statistic,
  Badge,
  Tag,
  Popconfirm,
  message,
  Spin,
  Alert,
  Tooltip,
  Drawer,
  Steps,
  Timeline,
  Progress,
  Avatar,
  Divider,
  Switch,
  Radio,
  DatePicker,
  Upload,
} from 'antd';
import {
  HomeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  BarChartOutlined,
  TeamOutlined,
  FileTextOutlined,
  ExportOutlined,
  ImportOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  LogoutOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import 'moment/locale/ar';
import {
  getBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  getApartments,
  createApartment,
  updateApartment,
  deleteApartment,
  getReceptionStats,
  getClientTypes,
  getPendingAndConfirmedBookings,
  confirmReservation,
  cancelReservation,
  getAdditionalServices,
  createAdditionalService,
  updateAdditionalService,
  deleteAdditionalService,
  ROOM_TYPES,
  ROOM_TYPE_LABELS,
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  getPendingBookings,
} from '../../apis/reception/receptionApi';
import ReceptionFilters from '../../components/reception/ReceptionFilters';
import ApartmentCard from '../../components/reception/ApartmentCard';
import { generateBookingTicket } from '../../components/reception/BookingTicketPDF';
import './ReceptionPage.scss';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;
const { Search } = Input;
const { Step } = Steps;

moment.locale('ar');

const ReceptionPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [buildingModalVisible, setBuildingModalVisible] = useState(false);
  const [apartmentModalVisible, setApartmentModalVisible] = useState(false);
  const [buildingDrawerVisible, setBuildingDrawerVisible] = useState(false);
  const [apartmentDrawerVisible, setApartmentDrawerVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit'
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [apartmentPrices, setApartmentPrices] = useState([]);
  const [pendingBookingsFilters, setPendingBookingsFilters] = useState({});
  const [selectedPendingBooking, setSelectedPendingBooking] = useState(null);

  // Payment confirmation modal state
  const [paymentConfirmVisible, setPaymentConfirmVisible] = useState(false);
  const [additionalDeposit, setAdditionalDeposit] = useState(0);
  const [paymentNotes, setPaymentNotes] = useState('');

  const [additionalServiceModalVisible, setAdditionalServiceModalVisible] =
    useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [additionalServiceForm] = Form.useForm();

  const queryClient = useQueryClient();

  // Add back the form instances
  const [buildingForm] = Form.useForm();
  const [apartmentForm] = Form.useForm();

  // Fetch buildings
  const {
    data: buildingsData,
    isLoading: buildingsLoading,
    refetch: refetchBuildings,
  } = useQuery({
    queryKey: ['buildings', searchTerm],
    queryFn: () => getBuildings({ name: searchTerm }),
    refetchInterval: 30000,
  });

  // Fetch apartments
  const {
    data: apartmentsData,
    isLoading: apartmentsLoading,
    refetch: refetchApartments,
  } = useQuery({
    queryKey: ['apartments', filters, searchTerm],
    queryFn: () =>
      getApartments({
        building_id: filters.building_id,
        room_type: filters.room_type,
        client_type_id: filters.client_type_id,
        occupancy_status: filters.occupancy_status,
        search: searchTerm,
        include: 'building,current_booking.visitor,bookings.visitor',
      }),
    refetchInterval: 30000,
  });

  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['reception-stats'],
    queryFn: () => getReceptionStats(),
    refetchInterval: 60000,
  });

  // Fetch client types
  const { data: clientTypesData, isLoading: clientTypesLoading } = useQuery({
    queryKey: ['client-types'],
    queryFn: () => getClientTypes({}),
  });

  // Fetch pending and confirmed bookings for the dashboard
  const {
    data: pendingBookingsData,
    isLoading: pendingBookingsLoading,
    refetch: refetchPendingBookings,
  } = useQuery({
    queryKey: ['pending-confirmed-bookings', pendingBookingsFilters],
    queryFn: () => getPendingBookings(pendingBookingsFilters),
    refetchInterval: 30000,
  });

  // Fetch additional services
  const {
    data: additionalServicesData,
    isLoading: additionalServicesLoading,
    refetch: refetchAdditionalServices,
  } = useQuery({
    queryKey: ['additional-services'],
    queryFn: () => getAdditionalServices({}),
    onSuccess: (data) => {
      console.log('Additional Services API Response:', data);
    },
  });

  const additionalServices = Array.isArray(additionalServicesData?.data?.data)
    ? additionalServicesData.data.data
    : Array.isArray(additionalServicesData?.data)
    ? additionalServicesData.data
    : [];

  // Building mutations
  const createBuildingMutation = useMutation({
    mutationFn: createBuilding,
    onSuccess: () => {
      setBuildingModalVisible(false);
      buildingForm.resetFields();
      refetchBuildings();
      message.success('تم إنشاء المبنى بنجاح');
    },
    onError: (error) => {
      console.error('Error creating building:', error);
      message.error('حدث خطأ أثناء إنشاء المبنى');
    },
  });

  const updateBuildingMutation = useMutation({
    mutationFn: ({ id, data }) => updateBuilding(id, data),
    onSuccess: () => {
      setBuildingModalVisible(false);
      buildingForm.resetFields();
      refetchBuildings();
      message.success('تم تحديث المبنى بنجاح');
    },
    onError: (error) => {
      console.error('Error updating building:', error);
      message.error('حدث خطأ أثناء تحديث المبنى');
    },
  });

  const deleteBuildingMutation = useMutation({
    mutationFn: deleteBuilding,
    onSuccess: () => {
      refetchBuildings();
      message.success('تم حذف المبنى بنجاح');
    },
    onError: (error) => {
      console.error('Error deleting building:', error);
      message.error('حدث خطأ أثناء حذف المبنى');
    },
  });

  // Apartment mutations
  const createApartmentMutation = useMutation({
    mutationFn: createApartment,
    onSuccess: () => {
      setApartmentModalVisible(false);
      apartmentForm.resetFields();
      refetchApartments();
      message.success('تم إنشاء الشقة بنجاح');
    },
    onError: (error) => {
      console.error('Error creating apartment:', error);
      message.error('حدث خطأ أثناء إنشاء الشقة');
    },
  });

  const updateApartmentMutation = useMutation({
    mutationFn: ({ id, data }) => updateApartment(id, data),
    onSuccess: () => {
      setApartmentModalVisible(false);
      apartmentForm.resetFields();
      refetchApartments();
      message.success('تم تحديث الشقة بنجاح');
    },
    onError: (error) => {
      console.error('Error updating apartment:', error);
      message.error('حدث خطأ أثناء تحديث الشقة');
    },
  });

  const deleteApartmentMutation = useMutation({
    mutationFn: deleteApartment,
    onSuccess: () => {
      refetchApartments();
      message.success('تم حذف الشقة بنجاح');
    },
    onError: (error) => {
      console.error('Error deleting apartment:', error);
      message.error('حدث خطأ أثناء حذف الشقة');
    },
  });

  // Pending bookings mutations
  const confirmBookingMutation = useMutation({
    mutationFn: ({ reservationId, paymentData }) =>
      confirmReservation(reservationId, paymentData),
    onSuccess: (result) => {
      refetchPendingBookings();
      refetchApartments();
      setPaymentConfirmVisible(false);

      // Generate and download PDF for the confirmed booking
      if (selectedPendingBooking) {
        const bookingData = selectedPendingBooking;

        try {
          const pdfDoc = generateBookingTicket(bookingData);

          // Generate filename with booking info
          const guestName =
            bookingData.visitor?.name?.replace(/\s+/g, '_') || 'guest';
          const apartmentNumber =
            bookingData.apartment?.apartment_number || 'apartment';
          const dateStr = moment().format('YYYY-MM-DD');
          const filename = `booking_ticket_${apartmentNumber}_${guestName}_${dateStr}.pdf`;

          // Download the PDF
          pdfDoc.save(filename);

          message.success('تم تأكيد الحجز وتحميل التذكرة بنجاح');
        } catch (error) {
          console.error('Error generating PDF:', error);
          message.success('تم تأكيد الحجز بنجاح');
          message.warning('حدث خطأ في تحميل التذكرة');
        }
      } else {
        message.success('تم تأكيد الحجز بنجاح');
      }

      setAdditionalDeposit(0);
      setPaymentNotes('');
    },
    onError: (error) => {
      console.error('Error confirming booking:', error);
      message.error('حدث خطأ أثناء تأكيد الحجز');
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: ({ reservationId, reason }) =>
      cancelReservation(reservationId, reason),
    onSuccess: () => {
      refetchPendingBookings();
      refetchApartments();
      message.success('تم إلغاء الحجز بنجاح');
    },
    onError: (error) => {
      console.error('Error canceling booking:', error);
      message.error('حدث خطأ أثناء إلغاء الحجز');
    },
  });

  // Additional services mutations
  const createAdditionalServiceMutation = useMutation({
    mutationFn: createAdditionalService,
    onSuccess: () => {
      setAdditionalServiceModalVisible(false);
      additionalServiceForm.resetFields();
      refetchAdditionalServices();
      message.success('تم إضافة الخدمة بنجاح');
    },
  });

  const updateAdditionalServiceMutation = useMutation({
    mutationFn: ({ id, data }) => updateAdditionalService(id, data),
    onSuccess: () => {
      setAdditionalServiceModalVisible(false);
      additionalServiceForm.resetFields();
      refetchAdditionalServices();
      message.success('تم تحديث الخدمة بنجاح');
    },
  });

  const deleteAdditionalServiceMutation = useMutation({
    mutationFn: deleteAdditionalService,
    onSuccess: () => {
      refetchAdditionalServices();
      message.success('تم حذف الخدمة بنجاح');
    },
  });

  const buildings = buildingsData?.data?.data || buildingsData?.data || [];
  const apartments = apartmentsData?.data?.data || apartmentsData?.data || [];
  const stats = statsData?.data || {};
  const clientTypes =
    clientTypesData?.data?.data || clientTypesData?.data || [];
  const pendingBookings =
    pendingBookingsData?.data?.data || pendingBookingsData?.data || [];

  // Building form handlers
  const handleCreateBuilding = () => {
    setModalMode('create');
    setSelectedBuilding(null);
    buildingForm.resetFields();
    setBuildingModalVisible(true);
  };

  const handleEditBuilding = (building) => {
    setModalMode('edit');
    setSelectedBuilding(building);
    buildingForm.setFieldsValue({
      name: building.name,
      description: building.description,
      address: building.address,
      floors_count: building.floors_count,
      color: building.color || '#1890ff',
      is_active: building.is_active ?? true,
    });
    setBuildingModalVisible(true);
  };

  const handleDeleteBuilding = (id) => {
    deleteBuildingMutation.mutate(id);
  };
  const handleBuildingSubmit = async (values) => {
    // Convert color to hex format
    let colorHex = '#1890ff'; // default color

    if (typeof values.color === 'string') {
      colorHex = values.color;
    } else if (values.color?.metaColor) {
      // Convert RGB to hex from metaColor object
      const { r, g, b } = values.color.metaColor;
      colorHex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)}`;
    } else if (values.color?.toHexString) {
      colorHex = values.color.toHexString();
    }

    const formattedValues = {
      ...values,
      color: colorHex,
    };

    if (modalMode === 'create') {
      createBuildingMutation.mutate(formattedValues);
    } else {
      updateBuildingMutation.mutate({
        id: selectedBuilding.id,
        data: formattedValues,
      });
    }
  };
  // Apartment form handlers
  const handleCreateApartment = () => {
    setModalMode('create');
    setSelectedApartment(null);
    apartmentForm.resetFields();
    // Initialize with one pricing entry for each client type
    const initialPrices = clientTypes.map((clientType) => ({
      client_type_id: clientType.id,
      daily_rate: '',
      weekly_rate: '',
      monthly_rate: '',
      notes: '',
    }));
    setApartmentPrices(initialPrices);
    setApartmentModalVisible(true);
  };

  const handleEditApartment = (apartment) => {
    setModalMode('edit');
    setSelectedApartment(apartment);
    apartmentForm.setFieldsValue({
      apartment_number: apartment.apartment_number,
      building_id: apartment.building_id,
      room_type: apartment.room_type,
      floor_number: apartment.floor_number,
      max_occupancy: apartment.max_occupancy,
      daily_rate: apartment.daily_rate,
      amenities: apartment.amenities || [],
      description: apartment.description,
      is_active: apartment.is_active ?? true,
    });

    // Set existing prices or initialize empty ones
    if (apartment.prices && apartment.prices.length > 0) {
      setApartmentPrices(apartment.prices);
    } else {
      // If no existing prices, create empty entries for all client types
      const initialPrices = clientTypes.map((clientType) => ({
        client_type_id: clientType.id,
        daily_rate: '',
        weekly_rate: '',
        monthly_rate: '',
        notes: '',
      }));
      setApartmentPrices(initialPrices);
    }

    setApartmentModalVisible(true);
  };

  const handleDeleteApartment = (id) => {
    deleteApartmentMutation.mutate(id);
  };

  const handleApartmentSubmit = async (values) => {
    // Validate that at least one price is provided
    const validPrices = apartmentPrices.filter(
      (price) => price.daily_rate && parseFloat(price.daily_rate) > 0
    );

    if (validPrices.length === 0) {
      message.error('يجب إضافة سعر واحد على الأقل لنوع عميل');
      return;
    }

    const formData = {
      ...values,
      prices: validPrices,
    };

    if (modalMode === 'create') {
      createApartmentMutation.mutate(formData);
    } else {
      updateApartmentMutation.mutate({
        id: selectedApartment.id,
        data: formData,
      });
    }
  };

  const handlePriceChange = (clientTypeId, field, value) => {
    setApartmentPrices((prev) =>
      prev.map((price) =>
        price.client_type_id === clientTypeId
          ? { ...price, [field]: value }
          : price
      )
    );
  };

  const addPriceEntry = () => {
    setApartmentPrices((prev) => [
      ...prev,
      {
        client_type_id: '',
        daily_rate: '',
        weekly_rate: '',
        monthly_rate: '',
        notes: '',
      },
    ]);
  };

  const removePriceEntry = (index) => {
    setApartmentPrices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleViewBuildingDetails = (building) => {
    setSelectedBuilding(building);
    setBuildingDrawerVisible(true);
  };

  const handleViewApartmentDetails = (apartment) => {
    setSelectedApartment(apartment);
    setApartmentDrawerVisible(true);
  };

  // Pending bookings handlers
  const handleConfirmBooking = (booking) => {
    setSelectedPendingBooking(booking);
    setAdditionalDeposit(0);
    setPaymentNotes('');
    setPaymentConfirmVisible(true);
  };

  const handlePaymentConfirmation = () => {
    const paymentData = {
      additional_deposit: additionalDeposit,
      payment_notes: paymentNotes,
    };

    confirmBookingMutation.mutate({
      reservationId: selectedPendingBooking.id,
      paymentData,
    });
  };

  const handleCancelBooking = (booking) => {
    Modal.confirm({
      title: 'تأكيد إلغاء الحجز',
      content: 'هل تريد إلغاء هذا الحجز؟ يرجى إدخال سبب الإلغاء.',
      okText: 'إلغاء الحجز',
      cancelText: 'تراجع',
      onOk: () => {
        const reason = prompt('سبب إلغاء الحجز (اختياري):');
        cancelBookingMutation.mutate({
          reservationId: booking.id,
          reason: reason || 'تم إلغاء الحجز من لوحة التحكم',
        });
      },
    });
  };

  const handlePendingBookingsFilterChange = (newFilters) => {
    setPendingBookingsFilters(newFilters);
  };

  // Additional services handlers
  const handleCreateAdditionalService = () => {
    setModalMode('create');
    setSelectedService(null);
    additionalServiceForm.resetFields();
    setAdditionalServiceModalVisible(true);
  };

  const handleEditAdditionalService = (service) => {
    setModalMode('edit');
    setSelectedService(service);
    additionalServiceForm.setFieldsValue({
      name: service.name,
      code: service.code,
      price: service.price,
      description: service.description,
      is_per_day: service.is_per_day,
      is_active: service.is_active,
    });
    setAdditionalServiceModalVisible(true);
  };

  const handleDeleteAdditionalService = (id) => {
    deleteAdditionalServiceMutation.mutate(id);
  };

  const handleAdditionalServiceSubmit = (values) => {
    if (modalMode === 'create') {
      createAdditionalServiceMutation.mutate(values);
    } else {
      updateAdditionalServiceMutation.mutate({
        id: selectedService.id,
        data: values,
      });
    }
  };

  // Additional services columns
  const additionalServiceColumns = [
    {
      title: 'الخدمة',
      key: 'service',
      render: (_, record) => (
        <Space>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.code}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'السعر',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => (
        <Text strong style={{ color: '#52c41a' }}>
          {price} جنيه {record.is_per_day ? '/ يوم' : ''}
        </Text>
      ),
    },
    {
      title: 'الوصف',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'نوع السعر',
      key: 'price_type',
      render: (_, record) => (
        <Tag color={record.is_per_day ? 'blue' : 'purple'}>
          {record.is_per_day ? 'يومي' : 'ثابت'}
        </Tag>
      ),
    },
    {
      title: 'الحالة',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'نشط' : 'غير نشط'}
        </Tag>
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditAdditionalService(record)}
          />
          <Popconfirm
            title="هل أنت متأكد من حذف هذه الخدمة؟"
            onConfirm={() => handleDeleteAdditionalService(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderAdditionalServicesTab = () => (
    <div className="additional-services-content">
      <Card
        title={
          <Space>
            <span>الخدمات الإضافية ({additionalServices.length})</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateAdditionalService}
          >
            إضافة خدمة
          </Button>
        }
      >
        <Table
          dataSource={additionalServices}
          columns={additionalServiceColumns}
          rowKey="id"
          loading={additionalServicesLoading}
        />
      </Card>
    </div>
  );

  // Building table columns
  const buildingColumns = [
    {
      title: 'المبنى',
      key: 'building',
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: record.color || '#1890ff' }} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.apartments_count || record.total_apartments || 0} شقة
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'العنوان',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'الطوابق',
      dataIndex: 'floors_count',
      key: 'floors_count',
      align: 'center',
      render: (floors) => (
        <Badge count={floors} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'الحالة',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'نشط' : 'غير نشط'}
        </Tag>
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="عرض التفاصيل">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewBuildingDetails(record)}
            />
          </Tooltip>
          <Tooltip title="تعديل">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditBuilding(record)}
            />
          </Tooltip>
          <Popconfirm
            title="هل أنت متأكد من حذف هذا المبنى؟"
            onConfirm={() => handleDeleteBuilding(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Tooltip title="حذف">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Apartment table columns
  const apartmentColumns = [
    {
      title: 'الشقة',
      key: 'apartment',
      render: (_, record) => (
        <Space>
          <Avatar
            style={{ backgroundColor: record.building?.color || '#1890ff' }}
            icon={<HomeOutlined />}
          />
          <div>
            <Text strong>{record.apartment_number}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.building?.name}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'النوع',
      dataIndex: 'room_type',
      key: 'room_type',
      render: (type) => (
        <Tag color="blue">{ROOM_TYPE_LABELS[type] || type}</Tag>
      ),
    },
    {
      title: 'الطابق',
      dataIndex: 'floor_number',
      key: 'floor_number',
      align: 'center',
    },
    {
      title: 'السعة',
      dataIndex: 'max_occupancy',
      key: 'max_occupancy',
      align: 'center',
      render: (capacity) => (
        <Space>
          <TeamOutlined />
          <span>{capacity}</span>
        </Space>
      ),
    },
    {
      title: 'أسعار الغرفة',
      key: 'pricing',
      align: 'center',
      render: (_, record) => {
        if (record.prices && record.prices.length > 0) {
          return (
            <div>
              {record.prices.slice(0, 2).map((price, index) => (
                <div key={index} style={{ marginBottom: 4 }}>
                  <Tag color="blue" size="small">
                    {price.client_type?.name}: {price.daily_rate} ج
                  </Tag>
                </div>
              ))}
              {record.prices.length > 2 && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  +{record.prices.length - 2} أكثر
                </Text>
              )}
            </div>
          );
        } else if (record.daily_rate) {
          return (
            <Text strong style={{ color: '#52c41a' }}>
              {record.daily_rate} جنية (السعر القديم)
            </Text>
          );
        } else {
          return <Text type="secondary">لا توجد أسعار</Text>;
        }
      },
    },
    {
      title: 'الحالة',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        if (record.is_occupied || record.booking) {
          return <Tag color="orange">محجوزة</Tag>;
        } else if (!record.is_active) {
          return <Tag color="red">غير نشطة</Tag>;
        } else {
          return <Tag color="green">متاحة</Tag>;
        }
      },
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="عرض التفاصيل">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewApartmentDetails(record)}
            />
          </Tooltip>
          <Tooltip title="تعديل">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditApartment(record)}
            />
          </Tooltip>
          <Popconfirm
            title="هل أنت متأكد من حذف هذه الشقة؟"
            onConfirm={() => handleDeleteApartment(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Tooltip title="حذف">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderDashboard = () => (
    <div className="dashboard-content">
      {/* Enhanced Statistics Cards */}
      <Row gutter={[24, 24]} className="stats-section">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card buildings-stat">
            <Statistic
              title="إجمالي المباني"
              value={stats.total_buildings}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#0EA5E9' }}
            />
            <div className="stat-subtitle">
              <Text type="secondary">مبنى فندقي</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card apartments-stat">
            <Statistic
              title="إجمالي الغرف"
              value={stats.total_apartments}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#6366F1' }}
            />
            <div className="stat-subtitle">
              <Text type="secondary">غرفة فندقية</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card available-stat">
            <Statistic
              title="الغرف المتاحة"
              value={stats.available_apartments}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#14B8A6' }}
            />
            <div className="stat-subtitle">
              <Text type="secondary">جاهزة للحجز</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card occupancy-stat">
            <Statistic
              title="معدل الإشغال"
              value={stats.occupancy_rate || 0}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#F59E0B' }}
            />
            <div className="stat-subtitle">
              <Text type="secondary">نسبة الإشغال</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Additional Insights Row */}
      <Row gutter={[24, 24]} className="insights-section">
        <Col xs={24} sm={12} lg={6}>
          <Card className="insight-card revenue-card">
            <Statistic
              title="الإيرادات المتوقعة"
              value={apartments
                .filter((apt) => apt.booking || apt.is_occupied)
                .reduce((sum, apt) => {
                  // Get the active booking's client type and duration
                  const booking = apt.booking;
                  if (!booking) return sum;

                  const clientTypeId = booking.visitor?.client_type_id;
                  const duration = booking.duration_days || 1;

                  // Calculate revenue using dynamic pricing
                  if (clientTypeId && apt.prices?.length > 0) {
                    const price = apt.prices.find(
                      (p) => p.client_type_id === clientTypeId
                    );
                    if (price) {
                      let amount = 0;
                      if (duration >= 30 && price.monthly_rate) {
                        const months = Math.ceil(duration / 30);
                        amount = price.monthly_rate * months;
                      } else if (duration >= 7 && price.weekly_rate) {
                        const weeks = Math.floor(duration / 7);
                        const remainingDays = duration % 7;
                        amount =
                          price.weekly_rate * weeks +
                          price.daily_rate * remainingDays;
                      } else {
                        amount = price.daily_rate * duration;
                      }
                      return sum + amount;
                    }
                  }
                  // Fallback to old pricing
                  return sum + (apt.daily_rate || 0) * duration;
                }, 0)}
              prefix={<DollarOutlined />}
              suffix="ج.م"
              valueStyle={{ color: '#8B5A2B' }}
              formatter={(value) => value.toLocaleString('ar-EG')}
            />
            <div className="stat-subtitle">
              <Text type="secondary">إيرادات اليوم</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="insight-card guests-card">
            <Statistic
              title="عدد النزلاء"
              value={
                stats.active_guests ||
                apartments.filter((apt) => apt.booking?.visitor).length
              }
              prefix={<UserOutlined />}
              valueStyle={{ color: '#059669' }}
            />
            <div className="stat-subtitle">
              <Text type="secondary">نزيل حالياً</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="insight-card checkout-card">
            <Statistic
              title="مغادرة اليوم"
              value={
                stats.today_checkouts ||
                apartments.filter((apt) => {
                  if (!apt.booking) return false;
                  const checkout = moment(
                    apt.booking.checkout_datetime || apt.booking.check_out_date
                  );
                  return checkout.isSame(moment(), 'day');
                }).length
              }
              prefix={<LogoutOutlined />}
              valueStyle={{ color: '#EF4444' }}
            />
            <div className="stat-subtitle">
              <Text type="secondary">مغادرة متوقعة</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="insight-card arrival-card">
            <Statistic
              title="وصول اليوم"
              value={
                stats.today_arrivals ||
                apartments.filter((apt) => {
                  if (!apt.booking) return false;
                  const arrival = moment(apt.booking.arrival_datetime);
                  return arrival.isSame(moment(), 'day');
                }).length
              }
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#10B981' }}
            />
            <div className="stat-subtitle">
              <Text type="secondary">وصول متوقع</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Enhanced Charts and Activity */}
      <Row gutter={[24, 24]} className="analytics-section">
        <Col xs={24} lg={12}>
          <Card title="النشاط الأخير" className="activity-card">
            <Timeline
              items={[
                {
                  dot: <CheckCircleOutlined style={{ color: '#14B8A6' }} />,
                  children: (
                    <div>
                      <Text strong>تم إنشاء غرفة جديدة</Text>
                      <br />
                      <Text type="secondary">
                        الغرفة رقم 105 -{' '}
                        {moment().subtract(30, 'minutes').fromNow()}
                      </Text>
                    </div>
                  ),
                },
                {
                  dot: <UserOutlined style={{ color: '#6366F1' }} />,
                  children: (
                    <div>
                      <Text strong>حجز جديد</Text>
                      <br />
                      <Text type="secondary">
                        الغرفة 101 - {moment().subtract(1, 'hour').fromNow()}
                      </Text>
                    </div>
                  ),
                },
                {
                  dot: <LogoutOutlined style={{ color: '#F59E0B' }} />,
                  children: (
                    <div>
                      <Text strong>مغادرة نزيل</Text>
                      <br />
                      <Text type="secondary">
                        الغرفة 203 - {moment().subtract(2, 'hours').fromNow()}
                      </Text>
                    </div>
                  ),
                },
                {
                  dot: <EditOutlined style={{ color: '#0EA5E9' }} />,
                  children: (
                    <div>
                      <Text strong>تحديث بيانات المبنى</Text>
                      <br />
                      <Text type="secondary">
                        المبنى الرئيسي -{' '}
                        {moment().subtract(3, 'hours').fromNow()}
                      </Text>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="الغرف حسب النوع" className="chart-card">
            <div className="room-types-chart">
              {Object.entries(ROOM_TYPE_LABELS).map(([type, label]) => {
                const count = apartments.filter(
                  (apt) => apt.room_type === type
                ).length;
                const percentage =
                  apartments.length > 0 ? (count / apartments.length) * 100 : 0;
                const occupied = apartments.filter(
                  (apt) =>
                    apt.room_type === type && (apt.booking || apt.is_occupied)
                ).length;

                return (
                  <div key={type} className="room-type-stat">
                    <div className="room-type-info">
                      <div className="room-type-header">
                        <Text strong>{label}</Text>
                        <div className="room-type-counts">
                          <Tag color="blue">{count} غرفة</Tag>
                          <Tag color={occupied > 0 ? 'orange' : 'green'}>
                            {occupied} محجوزة
                          </Tag>
                        </div>
                      </div>
                    </div>
                    <Progress
                      percent={Math.round(percentage)}
                      size="small"
                      status="active"
                      strokeColor={
                        type === 'single'
                          ? '#0EA5E9'
                          : type === 'double'
                          ? '#6366F1'
                          : type === 'suite'
                          ? '#8B5A2B'
                          : '#059669'
                      }
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderBuildingsTab = () => (
    <div className="buildings-content">
      <Card
        title={
          <Space>
            <span>إدارة المباني ({buildings.length})</span>
          </Space>
        }
        extra={
          <Space>
            <Search
              placeholder="البحث في المباني..."
              allowClear
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 250 }}
            />
            <Button
              icon={<PlusOutlined />}
              onClick={handleCreateBuilding}
              style={{
                background: '#AF8260',
                borderColor: '#AF8260',
                color: '#fff',
              }}
            >
              إضافة مبنى
            </Button>
          </Space>
        }
        className="buildings-table-card"
      >
        <Table
          dataSource={buildings}
          columns={buildingColumns}
          rowKey="id"
          loading={buildingsLoading}
          pagination={{
            total: buildings.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} من ${total} مبنى`,
          }}
        />
      </Card>
    </div>
  );

  const renderApartmentsTab = () => (
    <div className="apartments-content">
      <Card
        title={
          <Space>
            <HomeOutlined />
            <span>إدارة الغرف ({apartments.length})</span>
          </Space>
        }
        extra={
          <Space>
            <Search
              placeholder="البحث في الغرف..."
              allowClear
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 250 }}
            />
            <Button
              icon={<PlusOutlined />}
              onClick={handleCreateApartment}
              style={{
                color: '#fff',
                backgroundColor: '#AF8260',
                borderColor: '#E4C59E',
              }}
            >
              إضافة غرفة
            </Button>
          </Space>
        }
        className="apartments-table-card"
      >
        <Table
          dataSource={apartments}
          columns={apartmentColumns}
          rowKey="id"
          loading={apartmentsLoading}
          pagination={{
            total: apartments.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} من ${total} غرفة`,
          }}
        />
      </Card>
    </div>
  );

  const renderApartmentGrid = () => (
    <div className="apartment-grid-content">
      <ReceptionFilters
        buildings={buildings}
        filters={filters}
        onFiltersChange={setFilters}
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        onClearFilters={() => {
          setFilters({});
          setSearchTerm('');
        }}
        loading={apartmentsLoading}
        stats={stats}
        showStats={true}
      />

      <Card
        className="apartments-grid-card"
        title={`الغرف الفندقية (${apartments.length})`}
      >
        <Spin spinning={apartmentsLoading}>
          {apartments.length === 0 ? (
            <div className="empty-state">
              <HomeOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
              <Title level={4} type="secondary">
                لا توجد غرف
              </Title>
              <Text type="secondary">
                لا توجد غرف متاحة بناءً على المرشحات المحددة
              </Text>
            </div>
          ) : (
            <div className="apartments-grid-container">
              {apartments.map((apartment) => (
                <div key={apartment.id} className="apartment-card-wrapper-grid">
                  <ApartmentCard
                    apartment={apartment}
                    onClick={() => handleViewApartmentDetails(apartment)}
                    showActions={true}
                    showDetails={true}
                  />
                </div>
              ))}
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );

  const renderPendingBookingsTab = () => {
    const pendingBookingsColumns = [
      {
        title: 'النزيل',
        key: 'visitor',
        render: (_, record) => (
          <Space>
            <Avatar icon={<UserOutlined />} />
            <div>
              <Text strong>{record.visitor?.name}</Text>
              <br />
              <Text type="secondary">{record.visitor?.phone}</Text>
            </div>
          </Space>
        ),
      },
      {
        title: 'الغرفة',
        key: 'apartment',
        render: (_, record) => (
          <Space>
            <Tag color="blue">{record.apartment?.apartment_number}</Tag>
            <Text type="secondary">{record.apartment?.building?.name}</Text>
          </Space>
        ),
      },
      {
        title: 'تاريخ الوصول',
        dataIndex: 'arrival_datetime',
        key: 'arrival_datetime',
        render: (date) => (
          <div>
            <Text>{moment(date).format('DD/MM/YYYY')}</Text>
            <br />
            <Text type="secondary">{moment(date).format('HH:mm')}</Text>
          </div>
        ),
      },
      {
        title: 'تاريخ المغادرة',
        dataIndex: 'checkout_datetime',
        key: 'checkout_datetime',
        render: (date) => (
          <div>
            <Text>{moment(date).format('DD/MM/YYYY')}</Text>
            <br />
            <Text type="secondary">{moment(date).format('HH:mm')}</Text>
          </div>
        ),
      },
      {
        title: 'المبلغ الإجمالي',
        dataIndex: 'total_amount',
        key: 'total_amount',
        render: (amount) => (
          <Text strong style={{ color: '#52c41a' }}>
            {amount?.toLocaleString()} ج.م
          </Text>
        ),
      },
      {
        title: 'تاريخ الحجز',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (date) => (
          <Text type="secondary">{moment(date).fromNow()}</Text>
        ),
      },
      {
        title: 'الحالة',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          const statusConfig = {
            [BOOKING_STATUS.PENDING]: { color: 'orange', text: 'معلق' },
            [BOOKING_STATUS.CONFIRMED]: { color: 'blue', text: 'مؤكد' },
            [BOOKING_STATUS.ACTIVE]: { color: 'green', text: 'نشط' },
            [BOOKING_STATUS.COMPLETED]: { color: 'cyan', text: 'مكتمل' },
            [BOOKING_STATUS.CANCELLED]: { color: 'red', text: 'ملغي' },
          };

          const config = statusConfig[status] || {
            color: 'default',
            text: status,
          };
          return <Tag color={config.color}>{config.text}</Tag>;
        },
      },
      {
        title: 'الإجراءات',
        key: 'actions',
        render: (_, record) => (
          <Space>
            {(record.status === BOOKING_STATUS.PENDING ||
              record.status === BOOKING_STATUS.CONFIRMED) && (
              <Tooltip title="تأكيد الحجز وتحميل التذكرة">
                <Button
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleConfirmBooking(record)}
                  loading={confirmBookingMutation.isPending}
                  style={{
                    backgroundColor: '#AF8260',
                    borderColor: '#AF8260',
                    color: '#ffff',
                  }}
                >
                  تأكيد الحجز
                </Button>
              </Tooltip>
            )}
            <Tooltip title="إلغاء الحجز">
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleCancelBooking(record)}
                loading={cancelBookingMutation.isPending}
              >
                إلغاء
              </Button>
            </Tooltip>
          </Space>
        ),
      },
    ];

    return (
      <div className="pending-bookings-content">
        <Card
          title={
            <Space>
              <ExclamationCircleOutlined />
              <span>الحجوزات المعلقة ({pendingBookings.length})</span>
            </Space>
          }
          extra={
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetchPendingBookings()}
                loading={pendingBookingsLoading}
              >
                تحديث
              </Button>
              <Button icon={<FilterOutlined />} type="default">
                تصفية
              </Button>
            </Space>
          }
        >
          {/* Filters Section */}
          <div className="filters-section" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <Search
                  placeholder="البحث باسم النزيل"
                  onSearch={(value) =>
                    handlePendingBookingsFilterChange({
                      ...pendingBookingsFilters,
                      visitor_name: value,
                    })
                  }
                  allowClear
                />
              </Col>
              <Col xs={24} md={6}>
                <Select
                  placeholder="اختر المبنى"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={(value) =>
                    handlePendingBookingsFilterChange({
                      ...pendingBookingsFilters,
                      building_id: value,
                    })
                  }
                >
                  {buildings.map((building) => (
                    <Select.Option key={building.id} value={building.id}>
                      {building.name}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} md={6}>
                <DatePicker
                  placeholder="من تاريخ"
                  style={{ width: '100%' }}
                  onChange={(date) =>
                    handlePendingBookingsFilterChange({
                      ...pendingBookingsFilters,
                      from_date: date?.format('YYYY-MM-DD'),
                    })
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <DatePicker
                  placeholder="إلى تاريخ"
                  style={{ width: '100%' }}
                  onChange={(date) =>
                    handlePendingBookingsFilterChange({
                      ...pendingBookingsFilters,
                      to_date: date?.format('YYYY-MM-DD'),
                    })
                  }
                />
              </Col>
            </Row>
          </div>

          <Spin spinning={pendingBookingsLoading}>
            {pendingBookings.length === 0 ? (
              <div
                className="empty-state"
                style={{ textAlign: 'center', padding: '40px 0' }}
              >
                <ExclamationCircleOutlined
                  style={{ fontSize: '48px', color: '#d9d9d9' }}
                />
                <Title level={4} type="secondary">
                  لا توجد حجوزات معلقة
                </Title>
                <Text type="secondary">
                  لا توجد حجوزات في انتظار التفعيل حالياً
                </Text>
              </div>
            ) : (
              <Table
                columns={pendingBookingsColumns}
                dataSource={pendingBookings}
                rowKey="id"
                pagination={{
                  total: pendingBookingsData?.meta?.total,
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} من ${total} حجز`,
                }}
                scroll={{ x: 1200 }}
              />
            )}
          </Spin>
        </Card>
      </div>
    );
  };

  const tabItems = [
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
      key: 'buildings',
      label: (
        <Space>
          <span>المباني</span>
          <Badge
            count={buildings.length}
            style={{ backgroundColor: '#0EA5E9' }}
          />
        </Space>
      ),
      children: renderBuildingsTab(),
    },
    {
      key: 'apartments-table',
      label: (
        <Space>
          <HomeOutlined />
          <span>الغرف (جدول)</span>
          <Badge
            count={apartments.length}
            style={{ backgroundColor: '#6366F1' }}
          />
        </Space>
      ),
      children: renderApartmentsTab(),
    },
    {
      key: 'apartments-grid',
      label: (
        <Space>
          <HomeOutlined />
          <span>الغرف (عرض شبكي)</span>
        </Space>
      ),
      children: renderApartmentGrid(),
    },
    {
      key: 'pending-bookings',
      label: (
        <Space>
          <ExclamationCircleOutlined />
          <span>إدارة الحجوزات</span>
          <Badge
            count={pendingBookings.length}
            style={{ backgroundColor: '#fa8c16' }}
          />
        </Space>
      ),
      children: renderPendingBookingsTab(),
    },
    {
      key: 'additional-services',
      label: (
        <Space>
          <PlusOutlined />
          <span>الخدمات الإضافية</span>
          <Badge
            count={additionalServices.length}
            style={{ backgroundColor: '#52c41a' }}
          />
        </Space>
      ),
      children: renderAdditionalServicesTab(),
    },
  ];

  return (
    <Layout className="reception-page">
      <Content className="reception-content">
        <div className="page-header">
          <div className="page-title">
            <Title level={2} style={{ color: '#e6e6e6' }}>
              <HomeOutlined style={{ marginLeft: 12 }} />
              لوحة تحكم الفندق
            </Title>
          </div>
        </div>

        <div className="page-content">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="management-tabs"
            items={tabItems}
          />
        </div>
      </Content>

      {/* Building Modal */}
      <Modal
        title={
          <Space>
            {modalMode === 'create' ? 'إضافة مبنى جديد' : 'تعديل المبنى'}
          </Space>
        }
        open={buildingModalVisible}
        onCancel={() => setBuildingModalVisible(false)}
        footer={null}
        width={600}
        className="building-modal"
      >
        <Form
          form={buildingForm}
          layout="vertical"
          onFinish={handleBuildingSubmit}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="اسم المبنى"
                rules={[{ required: true, message: 'يرجى إدخال اسم المبنى' }]}
              >
                <Input placeholder="أدخل اسم المبنى" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="floors_count"
                label="عدد الطوابق"
                rules={[{ required: true, message: 'يرجى إدخال عدد الطوابق' }]}
              >
                <InputNumber
                  min={1}
                  max={50}
                  style={{ width: '100%' }}
                  placeholder="عدد الطوابق"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="address"
                label="العنوان"
                rules={[{ required: true, message: 'يرجى إدخال العنوان' }]}
              >
                <Input placeholder="أدخل عنوان المبنى" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="description" label="الوصف">
                <Input.TextArea rows={3} placeholder="وصف المبنى (اختياري)" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="color" label="لون المبنى" initialValue="#1890ff">
                <ColorPicker format="hex" showText />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="is_active"
                label="الحالة"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div className="modal-actions">
            <Space>
              <Button onClick={() => setBuildingModalVisible(false)}>
                إلغاء
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={
                  createBuildingMutation.isPending ||
                  updateBuildingMutation.isPending
                }
              >
                {modalMode === 'create' ? 'إضافة المبنى' : 'حفظ التغييرات'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Apartment Modal */}
      <Modal
        title={
          <Space>
            <HomeOutlined />
            {modalMode === 'create' ? 'إضافة غرفة جديدة' : 'تعديل الغرفة'}
          </Space>
        }
        open={apartmentModalVisible}
        onCancel={() => setApartmentModalVisible(false)}
        footer={null}
        width={1200}
        className="apartment-modal"
      >
        <Form
          form={apartmentForm}
          layout="vertical"
          onFinish={handleApartmentSubmit}
          className="enhanced-apartment-form"
        >
          <Row gutter={[24, 24]}>
            {/* First Row */}
            <Col xs={24} md={8}>
              <Form.Item
                name="apartment_number"
                label={<span className="form-label">رقم الغرفة</span>}
                rules={[{ required: true, message: 'يرجى إدخال رقم الغرفة' }]}
              >
                <Input
                  placeholder="أدخل رقم الغرفة"
                  prefix={<HomeOutlined style={{ color: '#AF8260' }} />}
                  className="custom-input"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="building_id"
                label={<span className="form-label">المبنى</span>}
                rules={[{ required: true, message: 'يرجى اختيار المبنى' }]}
              >
                <Select
                  placeholder="اختر المبنى"
                  className="custom-select"
                  suffixIcon={<SettingOutlined style={{ color: '#AF8260' }} />}
                >
                  {buildings.map((building) => (
                    <Select.Option key={building.id} value={building.id}>
                      {building.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="room_type"
                label={<span className="form-label">نوع الغرفة</span>}
                rules={[{ required: true, message: 'يرجى اختيار نوع الغرفة' }]}
              >
                <Select
                  placeholder="نوع الغرفة"
                  className="custom-select"
                  suffixIcon={<HomeOutlined style={{ color: '#AF8260' }} />}
                >
                  {Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => (
                    <Select.Option key={value} value={value}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Second Row */}
            <Col xs={24} md={8}>
              <Form.Item
                name="floor_number"
                label={<span className="form-label">رقم الطابق</span>}
                rules={[{ required: true, message: 'يرجى إدخال رقم الطابق' }]}
              >
                <InputNumber
                  min={0}
                  max={50}
                  style={{ width: '100%' }}
                  placeholder="رقم الطابق"
                  className="custom-input-number"
                  prefix={<HomeOutlined style={{ color: '#AF8260' }} />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="max_occupancy"
                label={<span className="form-label">الحد الأقصى للسكان</span>}
                rules={[{ required: true, message: 'يرجى إدخال الحد الأقصى' }]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: '100%' }}
                  placeholder="عدد الأشخاص"
                  className="custom-input-number"
                  prefix={<TeamOutlined style={{ color: '#AF8260' }} />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="amenities"
                label={<span className="form-label">المرافق</span>}
              >
                <Select
                  mode="multiple"
                  placeholder="اختر المرافق المتاحة"
                  className="custom-select-multiple"
                  options={[
                    { value: 'wifi', label: 'واي فاي', icon: <WifiOutlined /> },
                    { value: 'ac', label: 'تكييف' },
                    { value: 'tv', label: 'تلفزيون' },
                    { value: 'kitchen', label: 'مطبخ' },
                    { value: 'balcony', label: 'شرفة' },
                    { value: 'parking', label: 'موقف سيارة' },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* Description Row */}
            <Col xs={24}>
              <Form.Item
                name="description"
                label={<span className="form-label">وصف الغرفة</span>}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="وصف تفصيلي للغرفة (اختياري)"
                  className="custom-textarea"
                />
              </Form.Item>
            </Col>

            {/* Dynamic Pricing Section */}
            <Col xs={24}>
              <div className="pricing-section-header">
                <Title level={5}>
                  <DollarOutlined style={{ color: '#AF8260', marginLeft: 8 }} />
                  أسعار الغرفة حسب نوع العميل
                </Title>
                <Alert
                  message="يجب إضافة سعر واحد على الأقل لنوع عميل واحد"
                  type="info"
                  showIcon
                  className="custom-alert"
                />
              </div>

              <div className="pricing-section">
                {apartmentPrices.map((price, index) => {
                  const clientType = clientTypes.find(
                    (ct) => ct.id === price.client_type_id
                  );
                  return (
                    <Card
                      key={index}
                      className="price-card"
                      title={
                        <Space>
                          <Select
                            placeholder="اختر نوع العميل"
                            style={{ width: 200 }}
                            value={price.client_type_id}
                            onChange={(value) =>
                              handlePriceChange(
                                price.client_type_id || `temp-${index}`,
                                'client_type_id',
                                value
                              )
                            }
                            disabled={clientTypesLoading}
                            className="custom-select"
                          >
                            {clientTypes.map((clientType) => (
                              <Select.Option
                                key={clientType.id}
                                value={clientType.id}
                                disabled={apartmentPrices.some(
                                  (p) =>
                                    p.client_type_id === clientType.id &&
                                    p !== price
                                )}
                              >
                                {clientType.name}
                              </Select.Option>
                            ))}
                          </Select>
                          {clientType && (
                            <Tag color="#AF8260" className="custom-tag">
                              {clientType.name}
                            </Tag>
                          )}
                        </Space>
                      }
                      extra={
                        apartmentPrices.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removePriceEntry(index)}
                            className="delete-price-btn"
                          >
                            حذف
                          </Button>
                        )
                      }
                    >
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                          <div className="form-item">
                            <label className="price-label">
                              السعر اليومي
                              <span className="required">*</span>
                            </label>
                            <InputNumber
                              min={0}
                              step={0.01}
                              style={{ width: '100%' }}
                              placeholder="السعر اليومي"
                              value={price.daily_rate}
                              onChange={(value) =>
                                handlePriceChange(
                                  price.client_type_id || `temp-${index}`,
                                  'daily_rate',
                                  value
                                )
                              }
                              formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              }
                              parser={(value) =>
                                value.replace(/\$\s?|(,*)/g, '')
                              }
                              className="custom-input-number"
                              prefix={
                                <DollarOutlined style={{ color: '#AF8260' }} />
                              }
                            />
                          </div>
                        </Col>
                        <Col xs={24} md={8}>
                          <div className="form-item">
                            <label className="price-label">
                              السعر الأسبوعي (اختياري)
                            </label>
                            <InputNumber
                              min={0}
                              step={0.01}
                              style={{ width: '100%' }}
                              placeholder="السعر الأسبوعي"
                              value={price.weekly_rate}
                              onChange={(value) =>
                                handlePriceChange(
                                  price.client_type_id || `temp-${index}`,
                                  'weekly_rate',
                                  value
                                )
                              }
                              formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              }
                              parser={(value) =>
                                value.replace(/\$\s?|(,*)/g, '')
                              }
                              className="custom-input-number"
                              prefix={
                                <DollarOutlined style={{ color: '#AF8260' }} />
                              }
                            />
                          </div>
                        </Col>
                        <Col xs={24} md={8}>
                          <div className="form-item">
                            <label className="price-label">
                              السعر الشهري (اختياري)
                            </label>
                            <InputNumber
                              min={0}
                              step={0.01}
                              style={{ width: '100%' }}
                              placeholder="السعر الشهري"
                              value={price.monthly_rate}
                              onChange={(value) =>
                                handlePriceChange(
                                  price.client_type_id || `temp-${index}`,
                                  'monthly_rate',
                                  value
                                )
                              }
                              formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              }
                              parser={(value) =>
                                value.replace(/\$\s?|(,*)/g, '')
                              }
                              className="custom-input-number"
                              prefix={
                                <DollarOutlined style={{ color: '#AF8260' }} />
                              }
                            />
                          </div>
                        </Col>
                        <Col xs={24}>
                          <div className="form-item">
                            <label className="price-label">
                              ملاحظات خاصة بالسعر
                            </label>
                            <Input.TextArea
                              rows={2}
                              placeholder="ملاحظات إضافية حول السعر لهذا النوع من العملاء"
                              value={price.notes}
                              onChange={(e) =>
                                handlePriceChange(
                                  price.client_type_id || `temp-${index}`,
                                  'notes',
                                  e.target.value
                                )
                              }
                              className="custom-textarea"
                            />
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  );
                })}

                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addPriceEntry}
                  className="add-price-btn"
                  disabled={apartmentPrices.length >= clientTypes.length}
                >
                  إضافة سعر لنوع عميل آخر
                </Button>
              </div>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="is_active"
                label={<span className="form-label">الحالة</span>}
                valuePropName="checked"
                initialValue={true}
              >
                <Switch
                  checkedChildren="نشطة"
                  unCheckedChildren="غير نشطة"
                  className="custom-switch"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider className="custom-divider" />

          <div className="modal-actions">
            <Space>
              <Button
                onClick={() => setApartmentModalVisible(false)}
                className="cancel-btn"
                icon={<CloseCircleOutlined />}
              >
                إلغاء
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={
                  createApartmentMutation.isPending ||
                  updateApartmentMutation.isPending
                }
                className="submit-btn"
                icon={<CheckCircleOutlined />}
              >
                {modalMode === 'create' ? 'إضافة الغرفة' : 'حفظ التغييرات'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Building Details Drawer */}
      <Drawer
        title={<Space>تفاصيل المبنى</Space>}
        placement="left"
        onClose={() => setBuildingDrawerVisible(false)}
        open={buildingDrawerVisible}
        width={400}
        className="building-drawer"
      >
        {selectedBuilding && (
          <div className="building-details">
            <Card className="building-info-card">
              <div className="building-header">
                <Avatar
                  size={64}
                  style={{ backgroundColor: selectedBuilding.color }}
                />
                <div className="building-title">
                  <Title level={4}>{selectedBuilding.name}</Title>
                  <Text type="secondary">{selectedBuilding.address}</Text>
                </div>
              </div>

              <Divider />

              <div className="building-stats">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="الطوابق"
                      value={selectedBuilding.floors_count}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="الغرف"
                      value={
                        selectedBuilding.apartments_count ||
                        selectedBuilding.total_apartments ||
                        0
                      }
                      prefix={<HomeOutlined />}
                    />
                  </Col>
                </Row>
              </div>

              {selectedBuilding.description && (
                <>
                  <Divider />
                  <div className="building-description">
                    <Title level={5}>الوصف</Title>
                    <Paragraph>{selectedBuilding.description}</Paragraph>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </Drawer>

      {/* Apartment Details Drawer */}
      <Drawer
        title={
          <Space>
            <HomeOutlined />
            تفاصيل الغرفة
          </Space>
        }
        placement="left"
        onClose={() => setApartmentDrawerVisible(false)}
        open={apartmentDrawerVisible}
        width={400}
        className="apartment-drawer"
      >
        {selectedApartment && (
          <div className="apartment-details">
            <Card className="apartment-info-card">
              <div className="apartment-header">
                <Avatar
                  size={64}
                  style={{
                    backgroundColor: selectedApartment.building?.color,
                  }}
                  icon={<HomeOutlined />}
                />
                <div className="apartment-title">
                  <Title level={4}>{selectedApartment.apartment_number}</Title>
                  <Text type="secondary">
                    {selectedApartment.building?.name}
                  </Text>
                </div>
              </div>

              <Divider />

              <div className="apartment-info">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div className="info-item">
                    <Text strong>نوع الغرفة:</Text>
                    <Tag color="blue">
                      {ROOM_TYPE_LABELS[selectedApartment.room_type]}
                    </Tag>
                  </div>
                  <div className="info-item">
                    <Text strong>الطابق:</Text>
                    <Text>{selectedApartment.floor_number}</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>السعة:</Text>
                    <Text>{selectedApartment.max_occupancy} أشخاص</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>أسعار الغرفة:</Text>
                    {selectedApartment.prices &&
                    selectedApartment.prices.length > 0 ? (
                      <div style={{ marginTop: 8 }}>
                        {selectedApartment.prices.map((price, index) => (
                          <div key={index} style={{ marginBottom: 8 }}>
                            <Tag color="blue">{price.client_type?.name}</Tag>
                            <div style={{ marginTop: 4 }}>
                              <Text strong>يومي: {price.daily_rate} ج</Text>
                              {price.weekly_rate && (
                                <Text style={{ marginLeft: 8 }}>
                                  أسبوعي: {price.weekly_rate} ج
                                </Text>
                              )}
                              {price.monthly_rate && (
                                <Text style={{ marginLeft: 8 }}>
                                  شهري: {price.monthly_rate} ج
                                </Text>
                              )}
                            </div>
                            {price.notes && (
                              <Text
                                type="secondary"
                                style={{ fontSize: '12px' }}
                              >
                                {price.notes}
                              </Text>
                            )}
                            <Divider style={{ margin: '8px 0' }} />
                          </div>
                        ))}
                      </div>
                    ) : selectedApartment.daily_rate ? (
                      <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                        {selectedApartment.daily_rate} جنية (السعر القديم)
                      </Text>
                    ) : (
                      <Text type="secondary">لا توجد أسعار محددة</Text>
                    )}
                  </div>
                </Space>
              </div>

              {selectedApartment.amenities?.length > 0 && (
                <>
                  <Divider />
                  <div className="apartment-amenities">
                    <Title level={5}>المرافق</Title>
                    <div className="amenities-tags">
                      {selectedApartment.amenities.map((amenity) => (
                        <Tag key={amenity} color="green">
                          {amenity}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedApartment.description && (
                <>
                  <Divider />
                  <div className="apartment-description">
                    <Title level={5}>الوصف</Title>
                    <Paragraph>{selectedApartment.description}</Paragraph>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </Drawer>

      {/* Payment Confirmation Modal */}
      <Modal
        title={
          <div className="payment-modal-header">
            <div className="header-icon">
              <DollarOutlined />
            </div>
            <div className="header-content">
              <h3>تأكيد الحجز والدفع</h3>
              <p>تفاصيل الحجز والمدفوعات</p>
            </div>
          </div>
        }
        open={paymentConfirmVisible}
        onCancel={() => setPaymentConfirmVisible(false)}
        footer={null}
        width={800}
        className="payment-confirm-modal"
        centered
      >
        {selectedPendingBooking && (
          <div className="payment-confirmation-content">
            <Row gutter={[16, 16]}>
              {/* Left Column - Booking Details */}
              <Col span={12}>
                <Card className="summary-card booking-details">
                  <div className="card-title">
                    <UserOutlined />
                    <span>تفاصيل الحجز</span>
                  </div>

                  <div className="info-list">
                    <div className="info-item">
                      <UserOutlined />
                      <div>
                        <label>النزيل</label>
                        <span>{selectedPendingBooking.visitor?.name}</span>
                      </div>
                    </div>

                    <div className="info-item">
                      <HomeOutlined />
                      <div>
                        <label>الغرفة</label>
                        <span>
                          {selectedPendingBooking.apartment?.apartment_number} -{' '}
                          {selectedPendingBooking.apartment?.building?.name}
                        </span>
                      </div>
                    </div>

                    <div className="info-item">
                      <CalendarOutlined />
                      <div>
                        <label>موعد الوصول</label>
                        <span>
                          {moment(
                            selectedPendingBooking.arrival_datetime
                          ).format('DD/MM/YYYY HH:mm')}
                        </span>
                      </div>
                    </div>

                    <div className="info-item">
                      <LogoutOutlined />
                      <div>
                        <label>موعد المغادرة</label>
                        <span>
                          {moment(
                            selectedPendingBooking.checkout_datetime
                          ).format('DD/MM/YYYY HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Right Column - Payment Summary */}
              <Col span={12}>
                <Card className="summary-card payment-summary">
                  <div className="card-title">
                    <DollarOutlined />
                    <span>ملخص المدفوعات</span>
                  </div>

                  <div className="amount-summary">
                    <div className="amount-item total">
                      <label>المبلغ الإجمالي</label>
                      <span>
                        {selectedPendingBooking.total_amount?.toLocaleString()}{' '}
                        ج.م
                      </span>
                    </div>

                    <div className="amount-item paid">
                      <label>المبلغ المدفوع</label>
                      <span>
                        {(
                          selectedPendingBooking.deposit_amount || 0
                        ).toLocaleString()}{' '}
                        ج.م
                      </span>
                    </div>

                    <div className="amount-item remaining">
                      <label>المبلغ المتبقي</label>
                      <span>
                        {(
                          selectedPendingBooking.remaining_amount ||
                          selectedPendingBooking.total_amount ||
                          0
                        ).toLocaleString()}{' '}
                        ج.م
                      </span>
                    </div>

                    <Progress
                      percent={
                        selectedPendingBooking.total_amount > 0
                          ? Math.round(
                              ((selectedPendingBooking.deposit_amount || 0) /
                                selectedPendingBooking.total_amount) *
                                100
                            )
                          : 0
                      }
                      strokeColor={{
                        '0%': '#52c41a',
                        '100%': '#389e0d',
                      }}
                      status="active"
                    />
                  </div>
                </Card>
              </Col>

              {/* Additional Payment Section */}
              <Col span={24}>
                <Card className="summary-card additional-payment">
                  <div className="card-title">
                    <PlusOutlined />
                    <span>إضافة دفعة جديدة</span>
                  </div>

                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div className="form-group">
                        <label>
                          <DollarOutlined /> مبلغ الدفعة
                        </label>
                        <InputNumber
                          min={0}
                          max={
                            selectedPendingBooking.remaining_amount ||
                            selectedPendingBooking.total_amount
                          }
                          style={{ width: '100%' }}
                          placeholder="أدخل المبلغ..."
                          value={additionalDeposit}
                          onChange={setAdditionalDeposit}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                          prefix="ج.م"
                        />
                        {additionalDeposit > 0 && (
                          <small className="hint">
                            المتبقي بعد الدفع:{' '}
                            {(
                              (selectedPendingBooking.remaining_amount ||
                                selectedPendingBooking.total_amount ||
                                0) - additionalDeposit
                            ).toLocaleString()}{' '}
                            ج.م
                          </small>
                        )}
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="form-group">
                        <label>
                          <FileTextOutlined /> ملاحظات
                        </label>
                        <Input.TextArea
                          rows={2}
                          placeholder="أي ملاحظات خاصة بالدفع..."
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                        />
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            {/* Action Buttons */}
            <div className="modal-footer">
              <Button
                size="large"
                onClick={() => setPaymentConfirmVisible(false)}
                icon={<CloseCircleOutlined />}
                className="cancel-btn"
              >
                إلغاء
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handlePaymentConfirmation}
                loading={confirmBookingMutation.isPending}
                icon={<CheckCircleOutlined />}
                className="confirm-btn"
              >
                {additionalDeposit > 0 ? 'تأكيد وإضافة الدفعة' : 'تأكيد الحجز'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Additional Service Modal */}
      <Modal
        title={modalMode === 'create' ? 'إضافة خدمة جديدة' : 'تعديل الخدمة'}
        open={additionalServiceModalVisible}
        onCancel={() => setAdditionalServiceModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={additionalServiceForm}
          layout="vertical"
          onFinish={handleAdditionalServiceSubmit}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="اسم الخدمة"
                rules={[{ required: true, message: 'يرجى إدخال اسم الخدمة' }]}
              >
                <Input placeholder="أدخل اسم الخدمة" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="الكود"
                rules={[{ required: true, message: 'يرجى إدخال كود الخدمة' }]}
              >
                <Input placeholder="مثال: EXTRA_BED" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label="السعر"
                rules={[{ required: true, message: 'يرجى إدخال سعر الخدمة' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="أدخل السعر"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="الوصف">
                <Input.TextArea rows={3} placeholder="وصف الخدمة (اختياري)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_per_day"
                label="نوع السعر"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="يومي" unCheckedChildren="ثابت" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_active"
                label="الحالة"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div className="modal-actions">
            <Space>
              <Button onClick={() => setAdditionalServiceModalVisible(false)}>
                إلغاء
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={
                  createAdditionalServiceMutation.isPending ||
                  updateAdditionalServiceMutation.isPending
                }
              >
                {modalMode === 'create' ? 'إضافة الخدمة' : 'حفظ التغييرات'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
};

export default ReceptionPage;
