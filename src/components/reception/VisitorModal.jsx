import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    InputNumber,
    Upload,
    Button,
    Row,
    Col,
    Card,
    Divider,
    Space,
    Alert,
    Checkbox,
    Radio,
    Typography,
    Tag,
    Tooltip,
    Steps,
    Badge,
    Table,
    message,
    Spin
} from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    IdcardOutlined,
    HomeOutlined,
    CalendarOutlined,
    DollarOutlined,
    FileTextOutlined,
    UploadOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import 'moment/locale/ar';
import {
    createBooking,
    updateBooking,
    createVisitor,
    updateVisitor,
    uploadAttachment,
    getProducts,
    getClientTypes,
    MEAL_TYPES,
    MEAL_LABELS,
    MEAL_PRICES,
    ID_TYPES,
    ID_TYPE_LABELS,
    PAYMENT_METHODS,
    PAYMENT_METHOD_LABELS
} from '../../apis/reception/receptionApi';
import './VisitorModal.scss';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Step } = Steps;

moment.locale('ar');

const VisitorModal = ({ 
    visible, 
    onClose, 
    apartment, 
    mode = 'create',
    onSuccess,
    paymentMethods = [],
    paymentMethodsLoading = false,
    clientTypes = [],
    clientTypesLoading = false
}) => {
    const { user } = useAuth();

    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedMeals, setSelectedMeals] = useState({});
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Individual state variables for visitor data - FIXED APPROACH
    const [visitorName, setVisitorName] = useState('');
    const [clientTypeId, setClientTypeId] = useState('');
    const [idType, setIdType] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [nationality, setNationality] = useState('');
    const [phone, setPhone] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    
    // Individual state variables for booking data - FIXED APPROACH
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const [duration, setDuration] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [notes, setNotes] = useState('');

    const queryClient = useQueryClient();

    // Fetch products for selection
    const { data: productsData, isLoading: productsLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => getProducts({}, null, user?.department?.id),
        enabled: visible
    });

    const products = productsData?.data || [];

    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && apartment?.booking) {
                populateFormWithBookingData();
            } else {
                resetForm();
            }
        }
    }, [visible, mode, apartment]);

    useEffect(() => {
        calculateTotal();
    }, [selectedMeals, selectedProducts, duration, clientTypeId, apartment]);

    const populateFormWithBookingData = () => {
        const booking = apartment.booking;
        const visitor = booking.visitor;
        
        // Set individual state variables instead of form values
        setVisitorName(visitor?.name || '');
        setClientTypeId(visitor?.client_type_id || '');
        setIdType(visitor?.id_type || '');
        setIdNumber(visitor?.id_number || '');
        setNationality(visitor?.nationality || '');
        setPhone(visitor?.phone || '');
        setEmergencyContact(visitor?.emergency_contact || '');
        
        setCheckInDate(booking?.check_in_date ? moment(booking.check_in_date) : null);
        setCheckOutDate(booking?.check_out_date ? moment(booking.check_out_date) : null);
        setDuration(booking?.duration || 1);
        setPaymentMethod(booking?.payment_method || '');
        setNotes(booking?.notes || '');

        // Set meals and products from booking data
        if (booking?.meals) {
            setSelectedMeals(booking.meals);
        }
        if (booking?.products) {
            setSelectedProducts(booking.products);
        }
    };

    const resetForm = () => {
        // Reset all individual state variables
        setCurrentStep(0);
        setVisitorName('');
        setClientTypeId('');
        setIdType('');
        setIdNumber('');
        setNationality('');
        setPhone('');
        setEmergencyContact('');
        setCheckInDate(null);
        setCheckOutDate(null);
        setDuration(1);
        setPaymentMethod('');
        setNotes('');
        setSelectedMeals({});
        setSelectedProducts([]);
        setAttachments([]);
        setTotalAmount(0);
    };

    const calculateTotal = () => {
        let total = 0;

        // Calculate apartment base rate using dynamic pricing
        if (apartment && clientTypeId && duration) {
            // Find price for selected client type
            const apartmentPrice = apartment.prices?.find(price => price.client_type_id === clientTypeId);
            
            if (apartmentPrice) {
                // Use dynamic pricing calculation
                if (duration >= 30 && apartmentPrice.monthly_rate) {
                    // Monthly rate calculation
                    const months = Math.ceil(duration / 30);
                    total += apartmentPrice.monthly_rate * months;
                } else if (duration >= 7 && apartmentPrice.weekly_rate) {
                    // Weekly rate calculation
                    const weeks = Math.floor(duration / 7);
                    const remainingDays = duration % 7;
                    total += (apartmentPrice.weekly_rate * weeks) + (apartmentPrice.daily_rate * remainingDays);
                } else {
                    // Daily rate calculation
                    total += apartmentPrice.daily_rate * duration;
                }
            } else if (apartment.daily_rate) {
                // Fallback to old pricing structure
                total += apartment.daily_rate * duration;
            }
        }

        // Calculate meals total
        Object.entries(selectedMeals).forEach(([mealType, isSelected]) => {
            if (isSelected) {
                total += MEAL_PRICES[mealType] * duration;
            }
        });

        // Calculate products total
        selectedProducts.forEach(product => {
            total += (product.price || 10) * (product.quantity || 1);
        });

        setTotalAmount(total);
    };

    const handleMealChange = (mealType, checked) => {
        setSelectedMeals(prev => ({
            ...prev,
            [mealType]: checked
        }));
    };

    const handleProductAdd = (product) => {
        const existingIndex = selectedProducts.findIndex(p => p.id === product.id);
        
        if (existingIndex >= 0) {
            // Increase quantity if product already exists
            const updated = [...selectedProducts];
            updated[existingIndex].quantity = (updated[existingIndex].quantity || 1) + 1;
            setSelectedProducts(updated);
        } else {
            // Add new product
            setSelectedProducts(prev => [...prev, {
                ...product,
                quantity: 1,
                price: product.price || 10
            }]);
        }
    };

    const handleProductQuantityChange = (productId, quantity) => {
        setSelectedProducts(prev => 
            prev.map(p => 
                p.id === productId 
                    ? { ...p, quantity: Math.max(0, quantity) }
                    : p
            ).filter(p => p.quantity > 0)
        );
    };

    const handleProductRemove = (productId) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    };

    const handleFileUpload = ({ fileList }) => {
        setAttachments(fileList);
    };

    const handleSaveClick = async () => {
        try {
            setLoading(true);

            // Debug: Log all state values
            console.log('=== VISITOR MODAL STATE VALUES ===');
            console.log('Visitor name:', visitorName);
            console.log('Client type ID:', clientTypeId);
            console.log('ID type:', idType);
            console.log('ID number:', idNumber);
            console.log('Nationality:', nationality);
            console.log('Phone:', phone);
            console.log('Emergency contact:', emergencyContact);
            console.log('Check-in date:', checkInDate);
            console.log('Check-out date:', checkOutDate);
            console.log('Duration:', duration);
            console.log('Payment method:', paymentMethod);
            console.log('Notes:', notes);
            console.log('Selected meals:', selectedMeals);
            console.log('Selected products:', selectedProducts);

            // Validation for required fields using state variables
            const requiredFields = {
                visitor_name: visitorName,
                client_type_id: clientTypeId,
                id_type: idType,
                id_number: idNumber,
                nationality: nationality,
                check_in_date: checkInDate,
                check_out_date: checkOutDate,
                duration: duration,
                payment_method: paymentMethod
            };

            const emptyFields = Object.entries(requiredFields)
                .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
                .map(([key]) => key);

            if (emptyFields.length > 0) {
                console.error('ERROR: Empty required fields:', emptyFields);
                message.error(`Required fields are empty: ${emptyFields.join(', ')}`);
                setLoading(false);
                return;
            }

            // Check dates
            if (!checkInDate || !checkOutDate) {
                console.error('ERROR: Dates are not properly set');
                message.error('تواريخ الوصول والمغادرة مطلوبة');
                setLoading(false);
                return;
            }

            // Convert meals object to array format for backend
            const selectedMealsArray = Object.entries(selectedMeals)
                .filter(([mealType, isSelected]) => isSelected)
                .map(([mealType]) => mealType);

            // Prepare the form data using state variables
            const formData = {
                apartment_id: apartment?.id,
                visitor_name: visitorName.trim(),
                client_type_id: clientTypeId,
                id_type: idType,
                id_number: idNumber.trim(),
                nationality: nationality.trim(),
                phone: phone?.trim() || null,
                emergency_contact: emergencyContact?.trim() || null,
                check_in_date: checkInDate.format('YYYY-MM-DD HH:mm:ss'),
                check_out_date: checkOutDate.format('YYYY-MM-DD HH:mm:ss'),
                arrival_datetime: checkInDate.format('YYYY-MM-DD HH:mm:ss'),
                checkout_datetime: checkOutDate.format('YYYY-MM-DD HH:mm:ss'),
                duration_days: duration,
                duration: duration,
                meals: selectedMealsArray,
                products: selectedProducts,
                total_amount: totalAmount,
                payment_method: paymentMethod,
                notes: notes?.trim() || null
            };

            // Debug: Log prepared data in detail
            console.log('=== PREPARED FORM DATA FROM STATE ===');
            console.log('Complete formData object:', formData);
            console.log('Apartment ID:', formData.apartment_id);
            console.log('Visitor fields check:');
            console.log('  - visitor_name:', formData.visitor_name);
            console.log('  - client_type_id:', formData.client_type_id);
            console.log('  - id_type:', formData.id_type);
            console.log('  - id_number:', formData.id_number);
            console.log('  - nationality:', formData.nationality);
            console.log('  - phone:', formData.phone);
            console.log('  - emergency_contact:', formData.emergency_contact);

            // Call the parent component's success handler
            if (onSuccess) {
                console.log('=== CALLING PARENT SUCCESS HANDLER ===');
                await onSuccess(formData);
            }

            onClose();
        } catch (error) {
            console.error('=== ERROR IN handleSaveClick ===');
            console.error('Error type:', error.constructor.name);
            console.error('Error message:', error.message);
            console.error('Full error:', error);
            message.error('حدث خطأ أثناء حفظ الحجز');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: 'بيانات الزائر',
            icon: <UserOutlined />,
            description: 'المعلومات الشخصية والهوية'
        },
        {
            title: 'تفاصيل الحجز',
            icon: <CalendarOutlined />,
            description: 'التواريخ والمدة وطريقة الدفع'
        },
        {
            title: 'الوجبات والمنتجات',
            icon: <DollarOutlined />,
            description: 'الخدمات الإضافية والحساب النهائي'
        },
        {
            title: 'المرفقات والملاحظات',
            icon: <FileTextOutlined />,
            description: 'الملفات والتعليقات الإضافية'
        }
    ];

    const productColumns = [
        {
            title: 'المنتج',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <Space>
                    <Text strong>{name}</Text>
                    <Text type="secondary">({record.price || 10} جنيه)</Text>
                </Space>
            )
        },
        {
            title: 'الكمية',
            key: 'quantity',
            render: (_, record) => (
                <InputNumber
                    min={1}
                    value={selectedProducts.find(p => p.id === record.id)?.quantity || 0}
                    onChange={(quantity) => {
                        if (quantity > 0) {
                            handleProductAdd(record);
                            handleProductQuantityChange(record.id, quantity);
                        }
                    }}
                    size="small"
                />
            )
        },
        {
            title: 'الإجراء',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleProductAdd(record)}
                >
                    إضافة
                </Button>
            )
        }
    ];

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="step-content">
                        <Title level={4}>بيانات الزائر</Title>
                        <Row gutter={[24, 20]}>
                            <Col xs={24} md={12}>
                                <div className="form-item">
                                    <label>اسم الزائر <span style={{color: 'red'}}>*</span></label>
                                    <Input
                                        prefix={<UserOutlined />}
                                        placeholder="أدخل اسم الزائر الكامل"
                                        size="large"
                                        value={visitorName}
                                        onChange={(e) => setVisitorName(e.target.value)}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div className="form-item">
                                    <label>نوع العميل <span style={{color: 'red'}}>*</span></label>
                                    <Select
                                        placeholder="اختر نوع العميل"
                                        size="large"
                                        loading={clientTypesLoading}
                                        value={clientTypeId}
                                        onChange={setClientTypeId}
                                        options={clientTypes.map(clientType => ({
                                            value: clientType.id,
                                            label: clientType.name
                                        }))}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div className="form-item">
                                    <label>نوع الهوية <span style={{color: 'red'}}>*</span></label>
                                    <Select
                                        placeholder="نوع الهوية"
                                        size="large"
                                        value={idType}
                                        onChange={setIdType}
                                        options={Object.entries(ID_TYPE_LABELS).map(([value, label]) => ({
                                            value,
                                            label
                                        }))}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div className="form-item">
                                    <label>رقم الهوية <span style={{color: 'red'}}>*</span></label>
                                    <Input
                                        prefix={<IdcardOutlined />}
                                        placeholder="رقم الهوية"
                                        size="large"
                                        value={idNumber}
                                        onChange={(e) => setIdNumber(e.target.value)}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div className="form-item">
                                    <label>الجنسية <span style={{color: 'red'}}>*</span></label>
                                    <Input
                                        placeholder="الجنسية"
                                        size="large"
                                        value={nationality}
                                        onChange={(e) => setNationality(e.target.value)}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div className="form-item">
                                    <label>رقم الهاتف <span style={{color: 'red'}}>*</span></label>
                                    <Input
                                        prefix={<PhoneOutlined />}
                                        placeholder="رقم الهاتف"
                                        size="large"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div className="form-item">
                                    <label>جهة الاتصال في حالات الطوارئ</label>
                                    <Input
                                        prefix={<PhoneOutlined />}
                                        placeholder="رقم الطوارئ"
                                        size="large"
                                        value={emergencyContact}
                                        onChange={(e) => setEmergencyContact(e.target.value)}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>
                );

            case 1:
                return (
                    <div className="step-content">
                        <Title level={4}>تفاصيل الحجز</Title>
                        {apartment && (
                            <div>
                                <Alert
                                    message={`الشقة المحددة: ${apartment.apartment_number} - ${apartment.building?.name}`}
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />
                                
                                {/* Show dynamic pricing information */}
                                {clientTypeId && apartment.prices && apartment.prices.length > 0 && (
                                    <Card size="small" style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: '14px' }}>
                                            <Text strong>أسعار الغرفة للعميل المحدد:</Text>
                                            {(() => {
                                                const clientType = clientTypes.find(ct => ct.id === clientTypeId);
                                                const apartmentPrice = apartment.prices.find(price => price.client_type_id === clientTypeId);
                                                
                                                if (apartmentPrice && clientType) {
                                                    return (
                                                        <div style={{ marginTop: 8 }}>
                                                            <Tag color="blue">{clientType.name}</Tag>
                                                            <div style={{ marginTop: 4 }}>
                                                                <Text>يومي: {apartmentPrice.daily_rate} ج</Text>
                                                                {apartmentPrice.weekly_rate && (
                                                                    <Text style={{ marginLeft: 8 }}>
                                                                        أسبوعي: {apartmentPrice.weekly_rate} ج
                                                                    </Text>
                                                                )}
                                                                {apartmentPrice.monthly_rate && (
                                                                    <Text style={{ marginLeft: 8 }}>
                                                                        شهري: {apartmentPrice.monthly_rate} ج
                                                                    </Text>
                                                                )}
                                                            </div>
                                                            {duration && (
                                                                <div style={{ marginTop: 8, padding: '8px', backgroundColor: '#f0f2f5', borderRadius: '4px' }}>
                                                                    <Text strong>
                                                                        سعر الإقامة ({duration} أيام): {
                                                                            (() => {
                                                                                if (duration >= 30 && apartmentPrice.monthly_rate) {
                                                                                    const months = Math.ceil(duration / 30);
                                                                                    return apartmentPrice.monthly_rate * months;
                                                                                } else if (duration >= 7 && apartmentPrice.weekly_rate) {
                                                                                    const weeks = Math.floor(duration / 7);
                                                                                    const remainingDays = duration % 7;
                                                                                    return (apartmentPrice.weekly_rate * weeks) + (apartmentPrice.daily_rate * remainingDays);
                                                                                } else {
                                                                                    return apartmentPrice.daily_rate * duration;
                                                                                }
                                                                            })()
                                                                        } ج
                                                                    </Text>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div style={{ marginTop: 8 }}>
                                                            <Alert
                                                                message="لا يوجد سعر محدد لهذا النوع من العملاء في هذه الغرفة"
                                                                type="warning"
                                                                showIcon
                                                                size="small"
                                                            />
                                                            {apartment.daily_rate && (
                                                                <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                                                                    سيتم استخدام السعر القديم: {apartment.daily_rate} ج/يوم
                                                                </Text>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        )}
                        <Row gutter={[24, 20]}>
                            <Col xs={24} md={8}>
                                <div className="form-item">
                                    <label>تاريخ الوصول <span style={{color: 'red'}}>*</span></label>
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        size="large"
                                        format="DD/MM/YYYY"
                                        placeholder="تاريخ الوصول"
                                        value={checkInDate}
                                        onChange={(date) => {
                                            setCheckInDate(date);
                                            if (checkOutDate && date && date.isAfter(checkOutDate)) {
                                                setCheckOutDate(null);
                                            }
                                        }}
                                        disabledDate={(current) => current && current < moment().startOf('day')}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div className="form-item">
                                    <label>تاريخ المغادرة <span style={{color: 'red'}}>*</span></label>
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        size="large"
                                        format="DD/MM/YYYY"
                                        placeholder="تاريخ المغادرة"
                                        value={checkOutDate}
                                        onChange={(date) => {
                                            setCheckOutDate(date);
                                            if (checkInDate && date) {
                                                const newDuration = date.diff(checkInDate, 'days');
                                                setDuration(newDuration);
                                            }
                                        }}
                                        disabledDate={(current) => {
                                            return current && checkInDate && current <= checkInDate;
                                        }}
                                    />
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div className="form-item">
                                    <label>مدة الإقامة (أيام) <span style={{color: 'red'}}>*</span></label>
                                    <InputNumber
                                        min={1}
                                        max={30}
                                        style={{ width: '100%' }}
                                        size="large"
                                        placeholder="عدد الأيام"
                                        value={duration}
                                        onChange={(value) => {
                                            setDuration(value);
                                            if (checkInDate && value) {
                                                const newCheckOut = checkInDate.clone().add(value, 'days');
                                                setCheckOutDate(newCheckOut);
                                            }
                                        }}
                                    />
                                </div>
                            </Col>
                            <Col xs={24}>
                                <div className="form-item">
                                    <label>طريقة الدفع <span style={{color: 'red'}}>*</span></label>
                                    <Radio.Group 
                                        size="large" 
                                        value={paymentMethod} 
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                                            <Radio.Button key={value} value={value}>
                                                {label}
                                            </Radio.Button>
                                        ))}
                                    </Radio.Group>
                                </div>
                            </Col>
                        </Row>
                    </div>
                );

            case 2:
                return (
                    <div className="step-content">
                        <Title level={4}>الوجبات والمنتجات</Title>
                        
                        {/* Meals Section */}
                        <Card title="الوجبات" className="meals-card">
                            <Row gutter={[16, 16]}>
                                {Object.entries(MEAL_LABELS).map(([mealType, label]) => (
                                    <Col xs={24} md={8} key={mealType}>
                                        <Card 
                                            size="small" 
                                            className={`meal-card ${selectedMeals[mealType] ? 'selected' : ''}`}
                                        >
                                            <Checkbox
                                                checked={selectedMeals[mealType] || false}
                                                onChange={(e) => handleMealChange(mealType, e.target.checked)}
                                            >
                                                <Space direction="vertical" size={0}>
                                                    <Text strong>{label}</Text>
                                                    <Text type="secondary">
                                                        {MEAL_PRICES[mealType]} جنيه / اليوم
                                                    </Text>
                                                </Space>
                                            </Checkbox>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Card>

                        {/* Products Section */}
                        <Card title="المنتجات الإضافية" className="products-card">
                            <Spin spinning={productsLoading}>
                                <Table
                                    dataSource={products}
                                    columns={productColumns}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                    scroll={{ y: 300 }}
                                />
                            </Spin>
                            
                            {selectedProducts.length > 0 && (
                                <div className="selected-products">
                                    <Divider>المنتجات المحددة</Divider>
                                    {selectedProducts.map(product => (
                                        <Tag
                                            key={product.id}
                                            closable
                                            onClose={() => handleProductRemove(product.id)}
                                            style={{ marginBottom: 8, padding: '4px 8px' }}
                                        >
                                            {product.name} × {product.quantity} = {(product.price * product.quantity)} جنيه
                                        </Tag>
                                    ))}
                                </div>
                            )}
                        </Card>

                        {/* Total Amount */}
                        <Card className="total-card">
                            <div className="total-breakdown">
                                <Title level={4}>الإجمالي</Title>
                                <div className="total-details">
                                    {/* Apartment pricing breakdown */}
                                    {apartment && clientTypeId && duration && (
                                        <div className="total-item">
                                            <span>
                                                سعر الغرفة ({duration} أيام)
                                                {(() => {
                                                    const apartmentPrice = apartment.prices?.find(price => price.client_type_id === clientTypeId);
                                                    if (apartmentPrice) {
                                                        const clientType = clientTypes.find(ct => ct.id === clientTypeId);
                                                        return ` - ${clientType?.name}`;
                                                    }
                                                    return '';
                                                })()}
                                            </span>
                                            <span>
                                                {(() => {
                                                    const apartmentPrice = apartment.prices?.find(price => price.client_type_id === clientTypeId);
                                                    if (apartmentPrice) {
                                                        if (duration >= 30 && apartmentPrice.monthly_rate) {
                                                            const months = Math.ceil(duration / 30);
                                                            return apartmentPrice.monthly_rate * months;
                                                        } else if (duration >= 7 && apartmentPrice.weekly_rate) {
                                                            const weeks = Math.floor(duration / 7);
                                                            const remainingDays = duration % 7;
                                                            return (apartmentPrice.weekly_rate * weeks) + (apartmentPrice.daily_rate * remainingDays);
                                                        } else {
                                                            return apartmentPrice.daily_rate * duration;
                                                        }
                                                    } else if (apartment.daily_rate) {
                                                        return apartment.daily_rate * duration;
                                                    }
                                                    return 0;
                                                })()} جنيه
                                            </span>
                                        </div>
                                    )}
                                    
                                    {Object.entries(selectedMeals).filter(([_, selected]) => selected).map(([mealType]) => (
                                        <div key={mealType} className="total-item">
                                            <span>{MEAL_LABELS[mealType]}</span>
                                            <span>{MEAL_PRICES[mealType] * duration} جنيه</span>
                                        </div>
                                    ))}
                                    {selectedProducts.map(product => (
                                        <div key={product.id} className="total-item">
                                            <span>{product.name} × {product.quantity}</span>
                                            <span>{product.price * product.quantity} جنيه</span>
                                        </div>
                                    ))}
                                    <Divider />
                                    <div className="total-final">
                                        <Text strong style={{ fontSize: 18 }}>
                                            المجموع الكلي: {totalAmount} جنيه
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                );

            case 3:
                return (
                    <div className="step-content">
                        <Title level={4}>المرفقات والملاحظات</Title>
                        <Row gutter={[16, 16]}>
                            <Col xs={24}>
                                <div className="form-item">
                                    <label>المرفقات (عقد زواج، الهوية الوطنية، كارت الشراكة)</label>
                                    <Upload
                                        listType="picture-card"
                                        multiple
                                        beforeUpload={() => false}
                                        onChange={handleFileUpload}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    >
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>رفع ملف</div>
                                        </div>
                                    </Upload>
                                </div>
                            </Col>
                            <Col xs={24}>
                                <div className="form-item">
                                    <label>ملاحظات</label>
                                    <TextArea
                                        rows={4}
                                        placeholder="أدخل أي ملاحظات إضافية..."
                                        style={{ resize: 'none' }}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Modal
            title={
                <div className="modal-title">
                    <UserOutlined style={{ marginLeft: 8 }} />
                    {mode === 'create' ? 'حجز جديد' : mode === 'edit' ? 'تعديل الحجز' : 'تفاصيل الحجز'}
                </div>
            }
            open={visible}
            onCancel={onClose}
            width={1200}
            footer={null}
            className="visitor-modal"
            destroyOnClose
        >
            <div className="modal-content">
                <Steps current={currentStep} className="booking-steps">
                    {steps.map((step, index) => (
                        <Step
                            key={index}
                            title={step.title}
                            description={step.description}
                            icon={step.icon}
                        />
                    ))}
                </Steps>

                <div className="form-content">
                    {renderStepContent()}

                    <Divider />

                    <div className="modal-actions">
                        <Space>
                            <Button onClick={onClose} size="large">
                                <CloseOutlined /> إلغاء
                            </Button>
                            
                            {currentStep > 0 && (
                                <Button 
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    size="large"
                                >
                                    السابق
                                </Button>
                            )}
                            
                            {currentStep < steps.length - 1 ? (
                                <Button 
                                    type="primary" 
                                    onClick={() => {
                                        // Validation before moving to next step
                                        if (currentStep === 0) {
                                            if (!visitorName || !clientTypeId || !idType || !idNumber || !nationality) {
                                                message.error('يرجى إكمال جميع الحقول المطلوبة في بيانات الزائر');
                                                return;
                                            }
                                        }
                                        if (currentStep === 1) {
                                            if (!checkInDate || !checkOutDate || !duration || !paymentMethod) {
                                                message.error('يرجى إكمال جميع الحقول المطلوبة في تفاصيل الحجز');
                                                return;
                                            }
                                        }
                                        setCurrentStep(currentStep + 1);
                                    }}
                                    size="large"
                                >
                                    التالي
                                </Button>
                            ) : (
                                <Button 
                                    type="primary" 
                                    onClick={handleSaveClick}
                                    loading={loading}
                                    size="large"
                                    icon={<SaveOutlined />}
                                >
                                    {mode === 'create' ? 'إنشاء الحجز' : 'حفظ التغييرات'}
                                </Button>
                            )}
                        </Space>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default VisitorModal; 