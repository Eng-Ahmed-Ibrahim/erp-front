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
  message,
  Spin,
  AutoComplete,
  Table,
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
  ExclamationCircleOutlined,
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
  getServerTime,
  getAdditionalServices,
  ID_TYPES,
  ID_TYPE_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  checkApartmentAvailableForDateRange,
  searchVisitorsByIdNumber,
} from '../../apis/reception/receptionApi';
import { NATIONALITIES } from './visitor-modal/constants';
import './VisitorModal.scss';
import { useAuth } from '../../context/AuthContext';
import { generateBookingTicket } from './BookingTicketPDF';
import AdditionalServicesSection from './AdditionalServicesSection';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Step } = Steps;

import 'moment/locale/ar'; // If Arabic
moment.locale('ar');

// Enhanced CSS for booking type cards
const bookingTypeStyles = `
  .booking-type-card {
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .booking-type-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
  
  .booking-type-card.selected {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(24, 144, 255, 0.2);
  }
  
  .booking-type-card.selected:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 24px rgba(24, 144, 255, 0.25);
  }
  
  @media (max-width: 768px) {
    .booking-type-card {
      min-height: 100px !important;
      padding: 12px !important;
    }
    
    .booking-type-card .icon-container {
      width: 36px !important;
      height: 36px !important;
      margin-bottom: 8px !important;
    }
    
    .booking-type-card .icon-container .anticon {
      font-size: 18px !important;
    }
    
    .booking-type-card .title {
      font-size: 14px !important;
      margin-bottom: 4px !important;
    }
    
    .booking-type-card .description {
      font-size: 11px !important;
      line-height: 1.3 !important;
    }
  }
  
  @media (max-width: 480px) {
    .booking-type-card {
      min-height: 85px !important;
      padding: 10px !important;
    }
    
    .booking-type-card .icon-container {
      width: 32px !important;
      height: 32px !important;
      margin-bottom: 6px !important;
    }
    
    .booking-type-card .icon-container .anticon {
      font-size: 16px !important;
    }
    
    .booking-type-card .title {
      font-size: 13px !important;
      margin-bottom: 3px !important;
    }
    
    .booking-type-card .description {
      font-size: 10px !important;
      line-height: 1.2 !important;
    }
  }
  
  .booking-type-selection .ant-row {
    margin-bottom: 0 !important;
  }
  
  .booking-type-selection .ant-col {
    margin-bottom: 0 !important;
  }
`;

// Add this function before the VisitorModal component
const formatNationalityOptions = () => {
  const options = [];
  Object.entries(NATIONALITIES).forEach(
    ([region, { label, options: regionOptions }]) => {
      options.push({
        label,
        options: regionOptions.map((opt) => ({
          value: opt.value,
          label: opt.label,
        })),
      });
    }
  );
  return options;
};

const VisitorModal = ({
  visible,
  onClose,
  apartment,
  mode = 'create',
  onSuccess,
  paymentMethods = [],
  paymentMethodsLoading = false,
  clientTypes = [],
  clientTypesLoading = false,
  dateRange = null,
  availabilityMode = false,
  booking = null,
}) => {
  const { user } = useAuth();

  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Additional services state
  const [selectedServices, setSelectedServices] = useState([]);

  // Individual state variables for visitor data - FIXED APPROACH
  const [visitorName, setVisitorName] = useState('');
  const [clientTypeId, setClientTypeId] = useState('');
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Individual state variables for booking data - FIXED APPROACH
  const [bookingType, setBookingType] = useState('immediate'); // 'immediate' or 'reservation'
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [duration, setDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  // Deposit-related state variables
  const [depositAmount, setDepositAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);

  // Add new state for checkout discount
  const [checkoutDiscountAmount, setCheckoutDiscountAmount] = useState(0);
  const [fullAmount, setFullAmount] = useState(0);

  const [availabilityWarning, setAvailabilityWarning] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const queryClient = useQueryClient();

  // Memoize the department ID to prevent unnecessary API calls
  const departmentId = React.useMemo(
    () => user?.department?.id,
    [user?.department?.id]
  );

  // Fetch products for selection - with stable query key
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', departmentId],
    queryFn: () => getProducts({}, null, departmentId),
    enabled: visible && !!departmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const products = productsData?.data || [];

  // Add server time state
  const [serverTime, setServerTime] = useState(null);
  const [serverTimeLoading, setServerTimeLoading] = useState(true);

  // Add function to fetch server time
  const fetchServerTime = async () => {
    try {
      console.log('Starting server time fetch...');
      const response = await getServerTime();
      console.log('Got server time response:', response);

      if (response.success && response.data && response.data.server_time) {
        console.log('Setting server time:', response.data.server_time);
        const serverMoment = moment(response.data.server_time);
        if (serverMoment.isValid()) {
          setServerTime(serverMoment);
          // if (bookingType === 'immediate' && !checkInDate) {
          // setCheckInDate(serverMoment.clone().startOf('day'));
          // Set checkout date to next day by default
          // setCheckOutDate(serverMoment.clone().add(1, 'days').startOf('day'));
          // setDuration(1);
          // }
          setServerTimeLoading(false);
          console.log('Server time set successfully');
        } else {
          throw new Error('Invalid date format from server');
        }
      } else {
        throw new Error('Invalid server time response structure');
      }
    } catch (error) {
      console.error('Server time fetch error:', error);
      message.error(
        `خطأ في الحصول على وقت الخادم: ${
          error.message || 'خطأ غير معروف'
        }. سيتم استخدام وقت الجهاز.`
      );
      const localTime = moment();
      setServerTime(localTime);
      // if (bookingType === 'immediate' && !checkInDate) {
      //   setCheckInDate(localTime.clone().startOf('day'));
      //   setCheckOutDate(localTime.clone().add(1, 'days').startOf('day'));
      //   setDuration(1);
      // }
      setServerTimeLoading(false);
    }
  };

  // Fetch server time when modal opens
  useEffect(() => {
    if (visible) {
      fetchServerTime();
    }
  }, [visible]);

  // // Add effect to update dates when booking type changes
  // useEffect(() => {
  //   if (!serverTime || serverTimeLoading) return;

  //   if (bookingType === 'immediate') {
  //     setCheckInDate(serverTime.clone().startOf('day'));
  //     if (!checkOutDate) {
  //       setCheckOutDate(serverTime.clone().add(1, 'days').startOf('day'));
  //       setDuration(1);
  //     }
  //   }
  // }, [bookingType, serverTime, serverTimeLoading]);

  // Initialize form data only once when modal opens
  useEffect(() => {
    if (visible && !isInitialized) {
      if (mode === 'edit') {
        if (booking) {
          populateFormWithBookingData(booking);
        } else if (apartment?.current_booking) {
          populateFormWithBookingData(apartment.current_booking);
        } else if (apartment?.booking) {
          populateFormWithBookingData(apartment.booking);
        } else {
          console.warn('No booking data found for edit mode');
        }
      } else {
        console.log('Entering create mode initialization');
        resetForm();
        // Set default booking type based on availability mode
        if (availabilityMode && dateRange && dateRange.length === 2) {
          setBookingType('reservation');
          setCheckInDate(dateRange[0]);
          setCheckOutDate(dateRange[1]);
          setDuration(dateRange[1].diff(dateRange[0], 'days'));
        } else {
          setBookingType('immediate');
        }
      }
      setIsInitialized(true);
    } else if (!visible) {
      // Reset initialization flag when modal closes
      setIsInitialized(false);
    }
  }, [visible, mode, booking?.id, apartment?.id]);

  // Separate useEffect for calculating total to avoid form resets
  useEffect(() => {
    if (isInitialized) {
      calculateTotal();
    }
  }, [
    selectedProducts,
    selectedServices,
    duration,
    clientTypeId,
    apartment?.id,
    depositAmount,
    isInitialized,
  ]);

  useEffect(() => {
    if (currentStep !== 1) return;
    setAvailabilityWarning(null);
    if (!apartment?.id || !checkInDate || !checkOutDate) return;
    if (checkOutDate.diff(checkInDate, 'days') < 1) return;
    setCheckingAvailability(true);

    // Format dates as ISO strings for backend
    const fromDate = new Date(checkInDate.format('YYYY-MM-DD')).toISOString();
    const toDate = new Date(checkOutDate.format('YYYY-MM-DD')).toISOString();

    // Get the current booking ID if in edit mode
    const currentBookingId =
      mode === 'edit' ? booking?.id || apartment?.current_booking?.id : null;

    console.log('currentBookingId', currentBookingId);
    checkApartmentAvailableForDateRange(
      apartment.id,
      fromDate,
      toDate,
      currentBookingId // Pass the booking ID to exclude from availability check
    ).then((result) => {
      setCheckingAvailability(false);
      if (!result.available) {
        setAvailabilityWarning(
          result.error?.message ||
            'هذه الشقة محجوزة بالفعل في الفترة المحددة. يرجى اختيار فترة أخرى.'
        );
      } else {
        setAvailabilityWarning(null);
      }
    });
  }, [
    currentStep,
    apartment?.id,
    checkInDate,
    checkOutDate,
    mode,
    booking?.id,
  ]);

  // Add state to track original dates
  const [originalCheckInDate, setOriginalCheckInDate] = useState(null);
  const [originalCheckOutDate, setOriginalCheckOutDate] = useState(null);

  // Modify populateFormWithBookingData to store original dates
  const populateFormWithBookingData = (booking) => {
    if (!booking) {
      return;
    }

    const visitor = booking.visitor;

    // Set visitor data - ensure client_type_id is properly extracted
    setVisitorName(visitor?.name || '');
    // Try different possible paths for client_type_id
    const clientTypeIdValue =
      visitor?.client_type_id ||
      visitor?.client_type?.id ||
      visitor?.clientType?.id;
    setClientTypeId(clientTypeIdValue || '');

    setIdType(visitor?.id_type || '');
    setIdNumber(visitor?.id_number || '');
    setNationality(visitor?.nationality || '');
    setPhone(visitor?.phone || '');
    setEmergencyContact(visitor?.emergency_contact || '');

    // Try different date fields in order of preference
    const checkInDateValue =
      booking?.arrival_datetime ||
      booking?.check_in_date ||
      booking?.arrival_date;
    const checkOutDateValue =
      booking?.checkout_datetime ||
      booking?.check_out_date ||
      booking?.departure_date ||
      booking?.departure_datetime;

    const checkInMoment = checkInDateValue ? moment(checkInDateValue) : null;
    const checkOutMoment = checkOutDateValue ? moment(checkOutDateValue) : null;

    // Store original dates for comparison
    if (checkInMoment?.isValid()) {
      setOriginalCheckInDate(checkInMoment.clone());
    }
    if (checkOutMoment?.isValid()) {
      setOriginalCheckOutDate(checkOutMoment.clone());
    }

    if (checkInMoment?.isValid()) {
      setCheckInDate(checkInMoment);
    }

    if (checkOutMoment?.isValid()) {
      setCheckOutDate(checkOutMoment);
    }

    // Calculate duration if both dates are valid
    if (
      checkInMoment &&
      checkOutMoment &&
      checkInMoment.isValid() &&
      checkOutMoment.isValid()
    ) {
      const calculatedDuration = checkOutMoment.diff(checkInMoment, 'days');
      setDuration(calculatedDuration || booking?.duration || 1);
    } else {
      setDuration(booking?.duration || 1);
    }

    // Set booking type based on booking data
    const bookingType = booking?.booking_type || 'immediate';
    setBookingType(bookingType);

    setPaymentMethod(booking?.payment_method || '');
    setNotes(booking?.notes || '');

    // Set products from booking data
    if (booking?.products) {
      setSelectedProducts(booking.products);
    }
  };

  const resetForm = () => {
    console.log('=== RESETTING FORM ===');
    // Reset all individual state variables
    setCurrentStep(0);
    setVisitorName('');
    setClientTypeId('');
    setIdType('');
    setIdNumber('');
    setNationality('');
    setPhone('');
    setEmergencyContact('');
    setBookingType('immediate');
    setCheckInDate(null);
    setCheckOutDate(null);
    setDuration(1);
    setPaymentMethod('');
    setNotes('');
    setSelectedProducts([]);
    setAttachments([]);
    setTotalAmount(0);
    setDepositAmount(0);
    setRemainingAmount(0);
    setCheckoutDiscountAmount(0);
    setFullAmount(0);
  };

  const calculateTotal = () => {
    let bookingAmount = 0;
    let productsTotal = 0;
    let servicesTotal = 0;

    // Calculate apartment base rate using dynamic pricing
    if (apartment && clientTypeId && duration) {
      // Find price for selected client type
      const apartmentPrice = apartment.prices?.find(
        (price) => price.client_type_id === clientTypeId
      );

      if (apartmentPrice) {
        // Use dynamic pricing calculation
        if (duration >= 30 && apartmentPrice.monthly_rate) {
          // Monthly rate calculation
          const months = Math.ceil(duration / 30);
          bookingAmount += apartmentPrice.monthly_rate * months;
        } else if (duration >= 7 && apartmentPrice.weekly_rate) {
          // Weekly rate calculation
          const weeks = Math.floor(duration / 7);
          const remainingDays = duration % 7;
          bookingAmount +=
            apartmentPrice.weekly_rate * weeks +
            apartmentPrice.daily_rate * remainingDays;
        } else {
          // Daily rate calculation
          bookingAmount += apartmentPrice.daily_rate * duration;
        }
      } else if (apartment.daily_rate) {
        // Fallback to old pricing structure
        bookingAmount += apartment.daily_rate * duration;
      }
    }

    // Calculate products total
    selectedProducts.forEach((product) => {
      productsTotal += (product.price || 0) * (product.quantity || 1);
    });

    // Calculate additional services total with per-day handling
    selectedServices.forEach((service) => {
      const serviceQuantity = service.quantity || 1;
      const servicePrice = service.price || 0;

      if (service.is_per_day) {
        // For per-day services, multiply by duration
        servicesTotal += servicePrice * serviceQuantity * duration;
      } else {
        // For one-time services, just multiply by quantity
        servicesTotal += servicePrice * serviceQuantity;
      }
    });

    // Set the total amount (booking + products + services)
    const total = bookingAmount + productsTotal + servicesTotal;
    setTotalAmount(total);

    // Calculate full amount including checkout discount
    const full = total;
    setFullAmount(full);

    // Calculate remaining amount based on deposit
    const remaining = Math.max(0, full - depositAmount);
    setRemainingAmount(remaining);
  };

  const handleProductAdd = (product) => {
    const existingIndex = selectedProducts.findIndex(
      (p) => p.id === product.id
    );

    if (existingIndex >= 0) {
      // Increase quantity if product already exists
      const updated = [...selectedProducts];
      updated[existingIndex].quantity =
        (updated[existingIndex].quantity || 1) + 1;
      setSelectedProducts(updated);
    } else {
      // Add new product
      setSelectedProducts((prev) => [
        ...prev,
        {
          ...product,
          quantity: 1,
          price: product.price || 10,
        },
      ]);
    }
  };

  const handleProductQuantityChange = (productId, quantity) => {
    setSelectedProducts((prev) =>
      prev
        .map((p) =>
          p.id === productId ? { ...p, quantity: Math.max(0, quantity) } : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const handleProductRemove = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleFileUpload = ({ fileList }) => {
    // Only store files that are either successfully uploaded or are new
    const validFiles = fileList.filter(
      (file) =>
        file.status === 'done' || file.status === 'uploading' || !file.status
    );
    setAttachments(validFiles);
  };

  // Add validation function for each step
  const validateStep = (step) => {
    switch (step) {
      case 0: // Visitor Information
        // Skip validation in edit mode since fields are disabled
        if (mode === 'edit') {
          return true;
        }

        // Only validate in create mode
        if (
          !visitorName?.trim() ||
          !clientTypeId ||
          !idType ||
          !idNumber?.trim() ||
          !nationality?.trim()
        ) {
          message.error('يرجى إكمال جميع بيانات الزائر المطلوبة');
          return false;
        }
        break;

      case 1: // Booking Details
        if (availabilityWarning) {
          if (mode === 'edit') {
            const datesChanged =
              !checkInDate?.isSame(originalCheckInDate, 'day') ||
              !checkOutDate?.isSame(originalCheckOutDate, 'day');

            if (!datesChanged) {
              return true;
            }
          }
          message.error('لا يمكن المتابعة: الشقة محجوزة في الفترة المحددة');
          return false;
        }
        // Then check other booking details
        if (!checkInDate || !checkOutDate || !duration || duration < 1) {
          message.error(
            'يرجى إكمال تفاصيل الحجز: تاريخ الوصول، تاريخ المغادرة، والمدة'
          );
          return false;
        }
        if (!paymentMethod) {
          message.error('يرجى اختيار طريقة الدفع');
          return false;
        }
        break;

      case 2: // Payment Details
        if (depositAmount > fullAmount) {
          message.error('لا يمكن أن يكون العربون أكبر من المبلغ الإجمالي');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNextStep = () => {
    // Special validation for moving from step 1 to step 2
    if (currentStep === 1) {
      // Check if we're still checking availability
      if (checkingAvailability) {
        message.warning('يرجى الانتظار حتى يتم التحقق من توفر الشقة');
        return;
      }
      // Check if apartment is available
      if (availabilityWarning) {
        message.error('لا يمكن المتابعة: الشقة محجوزة في الفترة المحددة');
        return;
      }
    }

    if (!validateStep(currentStep)) {
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSaveClick = async () => {
    if (!serverTime) {
      message.error('لا يمكن إنشاء الحجز: خطأ في توقيت الخادم');
      return;
    }

    if (availabilityWarning) {
      message.error('لا يمكن الحجز: الشقة محجوزة في الفترة المحددة.');
      return;
    }

    try {
      setLoading(true);

      // Validation for required fields using state variables
      const requiredFields = {
        visitor_name: visitorName,
        client_type_id: clientTypeId,
        id_type: idType,
        id_number: idNumber,
        nationality: nationality,
        arrival_datetime: checkInDate,
        checkout_datetime: checkOutDate,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        duration: duration,
        payment_method: paymentMethod,
      };

      const emptyFields = Object.entries(requiredFields)
        .filter(
          ([key, value]) =>
            !value || (typeof value === 'string' && value.trim() === '')
        )
        .map(([key]) => key);

      if (emptyFields.length > 0) {
        message.error(`حقول مطلوبة فارغة: ${emptyFields.join(', ')}`);
        setLoading(false);
        return;
      }

      // Validate deposit amount
      if (depositAmount > fullAmount) {
        message.error('لا يمكن أن يكون العربون أكبر من المبلغ الإجمالي');
        setLoading(false);
        return;
      }

      // Calculate services breakdown for the booking data
      const servicesBreakdown = selectedServices.map((service) => ({
        id: service.id,
        quantity: service.quantity || 1,
        price: service.price || 0,
        is_per_day: service.is_per_day || false,
        notes: service.is_per_day ? 'سعر يومي' : 'سعر ثابت',
      }));

      // Prepare the form data using state variables
      const formData = new FormData();

      // Update the booking data to use server time for immediate bookings
      const bookingData = {
        apartment_id: apartment?.id,
        visitor_name: visitorName.trim(),
        client_type_id: clientTypeId,
        id_type: idType,
        id_number: idNumber.trim(),
        nationality: nationality.trim(),
        phone: phone?.trim() || null,
        emergency_contact: emergencyContact?.trim() || null,
        arrival_datetime: checkInDate.format('YYYY-MM-DD HH:mm:ss'),
        checkout_datetime: checkOutDate.format('YYYY-MM-DD HH:mm:ss'),
        check_in_date: checkInDate.format('YYYY-MM-DD HH:mm:ss'),
        check_out_date: checkOutDate.format('YYYY-MM-DD HH:mm:ss'),
        duration_days: duration,
        duration: duration,
        products: selectedProducts.map((product) => ({
          product_id: product.id,
          quantity: product.quantity || 1,
          unit_price: product.price || 0,
          total_price: (product.price || 0) * (product.quantity || 1),
          notes: product.notes || null,
        })),
        additional_services: servicesBreakdown,
        total_amount: totalAmount,
        deposit_amount: depositAmount || 0,
        remaining_amount: remainingAmount || totalAmount - (depositAmount || 0),
        checkout_discount_amount: checkoutDiscountAmount || 0,
        full_amount: fullAmount,
        payment_method: paymentMethod,
        notes: notes?.trim() || null,
        booking_type: bookingType,
        // Add price breakdown
        price_breakdown: {
          apartment_price: (() => {
            if (apartment && clientTypeId) {
              const apartmentPrice = apartment.prices?.find(
                (price) => price.client_type_id === clientTypeId
              );
              if (apartmentPrice) {
                if (duration >= 30 && apartmentPrice.monthly_rate) {
                  return apartmentPrice.monthly_rate * Math.ceil(duration / 30);
                } else if (duration >= 7 && apartmentPrice.weekly_rate) {
                  const weeks = Math.floor(duration / 7);
                  const remainingDays = duration % 7;
                  return (
                    apartmentPrice.weekly_rate * weeks +
                    apartmentPrice.daily_rate * remainingDays
                  );
                } else {
                  return apartmentPrice.daily_rate * duration;
                }
              } else if (apartment.daily_rate) {
                return apartment.daily_rate * duration;
              }
            }
            return 0;
          })(),
          products_total: selectedProducts.reduce(
            (total, product) =>
              total + (product.price || 0) * (product.quantity || 1),
            0
          ),
          services_total: servicesBreakdown.reduce(
            (total, service) =>
              total +
              (service.is_per_day
                ? service.price * service.quantity * duration
                : service.price * service.quantity),
            0
          ),
        },
      };

      // Append booking data as JSON
      formData.append('booking_data', JSON.stringify(bookingData));

      // Append each attachment file
      if (attachments && attachments.length > 0) {
        attachments.forEach((attachment) => {
          // If it's an antd Upload component file object, use the originFileObj
          const file = attachment.originFileObj || attachment;
          formData.append('attachments[]', file);
        });
      }

      // Set proper headers for multipart/form-data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Call the parent component's success handler with FormData
      if (onSuccess) {
        console.log('=== CALLING PARENT SUCCESS HANDLER ===');
        await onSuccess(formData);
      }

      // Generate PDF ticket for immediate bookings
      if (bookingType === 'immediate') {
        try {
          console.log('=== GENERATING PDF TICKET FOR IMMEDIATE BOOKING ===');

          // Prepare enhanced booking data for PDF
          const pdfBookingData = {
            ...bookingData,
            apartment: apartment,
          };

          await generateBookingTicket(pdfBookingData);
          message.success('تم إنشاء الحجز بنجاح وتم تحميل تذكرة الحجز!');
        } catch (pdfError) {
          console.error('=== ERROR GENERATING PDF ===', pdfError);
          message.warning('تم إنشاء الحجز بنجاح ولكن حدث خطأ في تحميل التذكرة');
        }
      } else {
        message.success('تم إنشاء الحجز المسبق بنجاح!');
      }

      onClose();
    } catch (error) {
      console.error('Error saving booking:', error);
      message.error('حدث خطأ أثناء حفظ الحجز');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if form has data
  const hasFormData = () => {
    return (
      visitorName ||
      clientTypeId ||
      idType ||
      idNumber ||
      nationality ||
      phone ||
      checkInDate ||
      checkOutDate ||
      selectedProducts.length > 0 ||
      currentStep > 0
    );
  };

  // Helper function to safely reset only if no data exists
  const safeResetForm = () => {
    const hasData = hasFormData();

    if (!hasData || !isInitialized) {
      resetForm();
    } else {
    }
  };

  // Add new state for visitor search
  const [searchingVisitors, setSearchingVisitors] = useState(false);
  const [visitorOptions, setVisitorOptions] = useState([]);

  // Add debounced search function
  const searchVisitors = async (value) => {
    if (!value || value.length < 3) {
      setVisitorOptions([]);
      return;
    }

    try {
      setSearchingVisitors(true);
      const response = await searchVisitorsByIdNumber(value);
      if (response.success && response.data) {
        const options = response.data.map((visitor) => ({
          value: visitor.id_number,
          label: `${visitor.name} (${visitor.id_number})`,
          visitor: visitor,
        }));
        setVisitorOptions(options);
      }
    } catch (error) {
      console.error('Error searching visitors:', error);
      message.error('حدث خطأ أثناء البحث عن الزائر');
    } finally {
      setSearchingVisitors(false);
    }
  };

  const fillVisitorData = (visitor) => {
    console.log('Filling visitor data:', visitor);
    setVisitorName(visitor?.name || '');
    setClientTypeId(visitor?.client_type_id || '');
    setIdType(visitor?.id_type || '');
    setIdNumber(visitor?.id_number || '');
    setNationality(visitor?.nationality || '');
    setPhone(visitor?.phone || '');
    setEmergencyContact(visitor?.emergency_contact || '');

    // Show success message
    message.success('تم تعبئة بيانات الزائر بنجاح');
  };

  const steps = [
    {
      title: 'بيانات الزائر',
      icon: <UserOutlined />,
      description: 'المعلومات الشخصية والهوية',
    },
    {
      title: 'تفاصيل الحجز',
      icon: <CalendarOutlined />,
      description: 'التواريخ والمدة وطريقة الدفع',
    },
    {
      title: 'الوجبات والمنتجات',
      icon: <DollarOutlined />,
      description: 'الخدمات الإضافية والحساب النهائي وتفاصيل الدفع',
    },
    {
      title: 'المرفقات والملاحظات',
      icon: <FileTextOutlined />,
      description: 'الملفات والتعليقات الإضافية',
    },
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
      ),
    },
    {
      title: 'الكمية',
      key: 'quantity',
      render: (_, record) => (
        <InputNumber
          min={1}
          value={
            selectedProducts.find((p) => p.id === record.id)?.quantity || 0
          }
          onChange={(quantity) => {
            if (quantity > 0) {
              handleProductAdd(record);
              handleProductQuantityChange(record.id, quantity);
            }
          }}
          size="small"
        />
      ),
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
      ),
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <Title level={4}>بيانات الزائر</Title>
            <Row gutter={[24, 20]}>
              {/* Visitor Search - Only show in create mode */}
              {mode === 'create' && (
                <Col xs={24}>
                  <div className="form-item">
                    <label>البحث عن زائر سابق</label>
                    <AutoComplete
                      style={{ width: '100%' }}
                      options={visitorOptions}
                      onSearch={searchVisitors}
                      onChange={(value, option) => {
                        if (option && option.visitor) {
                          fillVisitorData(option.visitor);
                        }
                      }}
                      placeholder="ابحث برقم الهوية..."
                      size="large"
                      loading={searchingVisitors}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      اكتب رقم الهوية للبحث عن زائر سابق وتعبئة بياناته تلقائياً
                    </Text>
                  </div>
                </Col>
              )}

              {/* Visitor Name */}
              <Col xs={24} md={12}>
                <div className="form-item">
                  <label>
                    اسم الزائر <span style={{ color: 'red' }}>*</span>
                  </label>
                  <Input
                    size="large"
                    placeholder="اسم الزائر"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    prefix={<UserOutlined />}
                    disabled={mode === 'edit'}
                  />
                </div>
              </Col>

              {/* Client Type */}
              <Col xs={24} md={12}>
                <div className="form-item">
                  <label>
                    نوع العميل <span style={{ color: 'red' }}>*</span>
                  </label>
                  <Select
                    size="large"
                    style={{ width: '100%' }}
                    placeholder="اختر نوع العميل"
                    value={clientTypeId}
                    onChange={(value) => setClientTypeId(value)}
                    loading={clientTypesLoading}
                    disabled={mode === 'edit'}
                  >
                    {clientTypes.map((type) => (
                      <Select.Option key={type.id} value={type.id}>
                        {type.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Col>

              {/* ID Type */}
              <Col xs={24} md={12}>
                <div className="form-item">
                  <label>
                    نوع الهوية <span style={{ color: 'red' }}>*</span>
                  </label>
                  <Select
                    size="large"
                    style={{ width: '100%' }}
                    placeholder="اختر نوع الهوية"
                    value={idType}
                    onChange={(value) => setIdType(value)}
                    disabled={mode === 'edit'}
                  >
                    {Object.entries(ID_TYPES).map(([key, value]) => (
                      <Select.Option key={key} value={key}>
                        {value}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Col>

              {/* ID Number */}
              <Col xs={24} md={12}>
                <div className="form-item">
                  <label>
                    رقم الهوية <span style={{ color: 'red' }}>*</span>
                  </label>
                  <Input
                    size="large"
                    placeholder="رقم الهوية"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    prefix={<IdcardOutlined />}
                    disabled={mode === 'edit'}
                  />
                </div>
              </Col>

              {/* Nationality */}
              <Col xs={24} md={12}>
                <div className="form-item">
                  <label>
                    الجنسية <span style={{ color: 'red' }}>*</span>
                  </label>
                  <Select
                    size="large"
                    style={{ width: '100%' }}
                    placeholder="اختر الجنسية"
                    value={nationality}
                    onChange={(value) => setNationality(value)}
                    options={formatNationalityOptions()}
                    disabled={mode === 'edit'}
                  />
                </div>
              </Col>

              {/* Phone */}
              <Col xs={24} md={12}>
                <div className="form-item">
                  <label>رقم الهاتف</label>
                  <Input
                    size="large"
                    placeholder="رقم الهاتف"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    prefix={<PhoneOutlined />}
                    disabled={mode === 'edit'}
                  />
                </div>
              </Col>

              {/* Emergency Contact */}
              <Col xs={24} md={12}>
                <div className="form-item">
                  <label>رقم للطوارئ</label>
                  <Input
                    size="large"
                    placeholder="رقم للطوارئ"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    prefix={<PhoneOutlined />}
                    disabled={mode === 'edit'}
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
                {clientTypeId &&
                  apartment.prices &&
                  apartment.prices.length > 0 && (
                    <Card size="small" style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '14px' }}>
                        <Text strong>أسعار الغرفة للعميل المحدد:</Text>
                        {(() => {
                          const clientType = clientTypes.find(
                            (ct) => ct.id === clientTypeId
                          );
                          const apartmentPrice = apartment.prices.find(
                            (price) => price.client_type_id === clientTypeId
                          );

                          if (apartmentPrice && clientType) {
                            return (
                              <div style={{ marginTop: 8 }}>
                                <Tag color="blue">{clientType.name}</Tag>
                                <div style={{ marginTop: 4 }}>
                                  <Text>
                                    يومي: {apartmentPrice.daily_rate} ج
                                  </Text>
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
                                  <div
                                    style={{
                                      marginTop: 8,
                                      padding: '8px',
                                      backgroundColor: '#f0f2f5',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    <Text strong>
                                      سعر الإقامة ({duration} أيام):{' '}
                                      {(() => {
                                        if (
                                          duration >= 30 &&
                                          apartmentPrice.monthly_rate
                                        ) {
                                          const months = Math.ceil(
                                            duration / 30
                                          );
                                          return (
                                            apartmentPrice.monthly_rate * months
                                          );
                                        } else if (
                                          duration >= 7 &&
                                          apartmentPrice.weekly_rate
                                        ) {
                                          const weeks = Math.floor(
                                            duration / 7
                                          );
                                          const remainingDays = duration % 7;
                                          return (
                                            apartmentPrice.weekly_rate * weeks +
                                            apartmentPrice.daily_rate *
                                              remainingDays
                                          );
                                        } else {
                                          return (
                                            apartmentPrice.daily_rate * duration
                                          );
                                        }
                                      })()}{' '}
                                      ج
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
                                  <Text
                                    type="secondary"
                                    style={{ marginTop: 8, display: 'block' }}
                                  >
                                    سيتم استخدام السعر القديم:{' '}
                                    {apartment.daily_rate} ج/يوم
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
              {/* Booking Type Selection */}
              <Col xs={24}>
                <div className="form-item">
                  <label>
                    نوع الحجز <span style={{ color: 'red' }}>*</span>
                  </label>
                  <div
                    className="booking-type-selection"
                    style={{ marginTop: '12px' }}
                  >
                    <Row gutter={[12, 0]}>
                      <Col xs={12} sm={12} md={12}>
                        <div
                          className={`booking-type-card ${
                            bookingType === 'immediate' ? 'selected' : ''
                          }`}
                          onClick={() => setBookingType('immediate')}
                          style={{
                            border:
                              bookingType === 'immediate'
                                ? '2px solid #1890ff'
                                : '2px solid #d9d9d9',
                            borderRadius: '12px',
                            padding: '20px',
                            cursor: 'pointer',
                            backgroundColor:
                              bookingType === 'immediate' ? '#f0f7ff' : '#fff',
                            transition: 'all 0.3s ease',
                            textAlign: 'center',
                            position: 'relative',
                            minHeight: '120px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          {bookingType === 'immediate' && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: '#1890ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CheckCircleOutlined
                                style={{ color: '#fff', fontSize: '12px' }}
                              />
                            </div>
                          )}
                          <div
                            className="icon-container"
                            style={{
                              backgroundColor:
                                bookingType === 'immediate'
                                  ? '#1890ff'
                                  : '#52c41a',
                              borderRadius: '50%',
                              width: '48px',
                              height: '48px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '12px',
                            }}
                          >
                            <CheckCircleOutlined
                              style={{
                                color: '#fff',
                                fontSize: '24px',
                              }}
                            />
                          </div>
                          <div
                            className="title"
                            style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color:
                                bookingType === 'immediate'
                                  ? '#1890ff'
                                  : '#262626',
                              marginBottom: '6px',
                              lineHeight: '1.2',
                            }}
                          >
                            حجز فوري
                          </div>
                          <div
                            className="description"
                            style={{
                              fontSize: '13px',
                              color: '#8c8c8c',
                              lineHeight: '1.4',
                              wordWrap: 'break-word',
                              maxWidth: '100%',
                              textAlign: 'center',
                            }}
                          >
                            دخول مباشر اليوم
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} sm={12} md={12}>
                        <div
                          className={`booking-type-card ${
                            bookingType === 'reservation' ? 'selected' : ''
                          }`}
                          onClick={() => setBookingType('reservation')}
                          style={{
                            border:
                              bookingType === 'reservation'
                                ? '2px solid #722ed1'
                                : '2px solid #d9d9d9',
                            borderRadius: '12px',
                            padding: '20px',
                            cursor: 'pointer',
                            backgroundColor:
                              bookingType === 'reservation'
                                ? '#f9f0ff'
                                : '#fff',
                            transition: 'all 0.3s ease',
                            textAlign: 'center',
                            position: 'relative',
                            minHeight: '120px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          {bookingType === 'reservation' && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: '#722ed1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CheckCircleOutlined
                                style={{ color: '#fff', fontSize: '12px' }}
                              />
                            </div>
                          )}
                          <div
                            className="icon-container"
                            style={{
                              backgroundColor:
                                bookingType === 'reservation'
                                  ? '#722ed1'
                                  : '#fa8c16',
                              borderRadius: '50%',
                              width: '48px',
                              height: '48px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '12px',
                            }}
                          >
                            <CalendarOutlined
                              style={{
                                color: '#fff',
                                fontSize: '24px',
                              }}
                            />
                          </div>
                          <div
                            className="title"
                            style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color:
                                bookingType === 'reservation'
                                  ? '#722ed1'
                                  : '#262626',
                              marginBottom: '6px',
                              lineHeight: '1.2',
                            }}
                          >
                            حجز مسبق
                          </div>
                          <div
                            className="description"
                            style={{
                              fontSize: '13px',
                              color: '#8c8c8c',
                              lineHeight: '1.4',
                              wordWrap: 'break-word',
                              maxWidth: '100%',
                              textAlign: 'center',
                            }}
                          >
                            حجز لتاريخ مستقبلي
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* Hidden Radio Group for form validation */}
                    <Radio.Group
                      value={bookingType}
                      onChange={(e) => setBookingType(e.target.value)}
                      style={{ display: 'none' }}
                    >
                      <Radio value="immediate" />
                      <Radio value="reservation" />
                    </Radio.Group>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={8}>
                <div className="form-item">
                  <label>
                    تاريخ الوصول <span style={{ color: 'red' }}>*</span>
                  </label>
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
                    disabledDate={(current) => {
                      if (bookingType === 'immediate') {
                        // For immediate bookings, only allow today or future dates
                        return current && current < moment().startOf('day');
                      } else {
                        // For reservations, allow future dates only
                        return current && current <= moment().startOf('day');
                      }
                    }}
                  />
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="form-item">
                  <label>
                    تاريخ المغادرة <span style={{ color: 'red' }}>*</span>
                  </label>
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
                  <label>
                    مدة الإقامة (أيام) <span style={{ color: 'red' }}>*</span>
                  </label>
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
                        const newCheckOut = checkInDate
                          .clone()
                          .add(value, 'days');
                        setCheckOutDate(newCheckOut);
                      }
                    }}
                  />
                </div>
              </Col>
              <Col xs={24}>
                <div className="form-item">
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 0,
                    }}
                  >
                    طريقة الدفع <span style={{ color: 'red' }}>* </span> :
                    <Radio.Group
                      size="large"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginTop: '8px',
                        marginRight: '15px',
                      }}
                    >
                      {Object.entries(PAYMENT_METHOD_LABELS).map(
                        ([value, label]) => (
                          <Radio.Button key={value} value={value}>
                            {label}
                          </Radio.Button>
                        )
                      )}
                    </Radio.Group>
                  </label>
                </div>
              </Col>
            </Row>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <Title level={4}>الخدمات الإضافية والمنتجات</Title>

            {/* Additional Services Section */}
            <Card
              title="الخدمات الإضافية"
              className="additional-services-card"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 16]}>
                {additionalServicesLoading ? (
                  <Col span={24}>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Spin />
                      <div style={{ marginTop: 8 }}>
                        جاري تحميل الخدمات الإضافية...
                      </div>
                    </div>
                  </Col>
                ) : additionalServices.length === 0 ? (
                  <Col span={24}>
                    <Alert
                      type="info"
                      message="لا توجد خدمات إضافية متاحة"
                      description="لم يتم العثور على خدمات إضافية متاحة حالياً."
                      showIcon
                    />
                  </Col>
                ) : (
                  <AdditionalServicesSection
                    additionalServices={additionalServices}
                    selectedServices={selectedServices}
                    onServiceSelect={handleServiceSelect}
                    onServiceQuantityChange={handleServiceQuantityChange}
                    onServiceRemove={handleServiceRemove}
                    duration={duration}
                    loading={additionalServicesLoading}
                  />
                )}
              </Row>
            </Card>

            {/* Products Section */}
            <Card title="المنتجات الإضافية" className="products-card">
              <ProductsTableWrapper>
                <Spin spinning={productsLoading}>
                  {productsLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Text>جاري تحميل المنتجات...</Text>
                    </div>
                  ) : products && products.length > 0 ? (
                    <Table
                      dataSource={products}
                      columns={productColumns}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      scroll={{ y: 300 }}
                    />
                  ) : (
                    <Alert
                      message="لا توجد منتجات متاحة"
                      description="لا توجد منتجات في القسم الحالي. يمكنك المتابعة بدون إضافة منتجات."
                      type="info"
                      showIcon
                    />
                  )}
                </Spin>
              </ProductsTableWrapper>

              {selectedProducts.length > 0 && (
                <div className="selected-products">
                  <Divider>المنتجات المحددة</Divider>
                  {selectedProducts.map((product) => (
                    <Tag
                      key={product.id}
                      closable
                      onClose={() => handleProductRemove(product.id)}
                      style={{ marginBottom: 8, padding: '4px 8px' }}
                    >
                      {product.name} × {product.quantity} ={' '}
                      {product.price * product.quantity} جنيه
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
                          const apartmentPrice = apartment.prices?.find(
                            (price) => price.client_type_id === clientTypeId
                          );
                          if (apartmentPrice) {
                            const clientType = clientTypes.find(
                              (ct) => ct.id === clientTypeId
                            );
                            return ` - ${clientType?.name}`;
                          }
                          return '';
                        })()}
                      </span>
                      <span>
                        {(() => {
                          const apartmentPrice = apartment.prices?.find(
                            (price) => price.client_type_id === clientTypeId
                          );
                          if (apartmentPrice) {
                            if (duration >= 30 && apartmentPrice.monthly_rate) {
                              const months = Math.ceil(duration / 30);
                              return apartmentPrice.monthly_rate * months;
                            } else if (
                              duration >= 7 &&
                              apartmentPrice.weekly_rate
                            ) {
                              const weeks = Math.floor(duration / 7);
                              const remainingDays = duration % 7;
                              return (
                                apartmentPrice.weekly_rate * weeks +
                                apartmentPrice.daily_rate * remainingDays
                              );
                            } else {
                              return apartmentPrice.daily_rate * duration;
                            }
                          } else if (apartment.daily_rate) {
                            return apartment.daily_rate * duration;
                          }
                          return 0;
                        })()}{' '}
                        جنيه
                      </span>
                    </div>
                  )}

                  {/* Additional Services breakdown */}
                  {selectedServices.length > 0 && (
                    <>
                      <Divider style={{ margin: '8px 0' }}>
                        الخدمات الإضافية
                      </Divider>
                      {selectedServices.map((service) => (
                        <div key={service.id} className="total-item">
                          <span>
                            {service.name} × {service.quantity}
                            {service.is_per_day ? ` (${duration} أيام)` : ''}
                          </span>
                          <span>
                            {service.is_per_day
                              ? service.price * service.quantity * duration
                              : service.price * service.quantity}{' '}
                            جنيه
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Products breakdown */}
                  {selectedProducts.length > 0 && (
                    <>
                      <Divider style={{ margin: '8px 0' }}>المنتجات</Divider>
                      {selectedProducts.map((product) => (
                        <div key={product.id} className="total-item">
                          <span>
                            {product.name} × {product.quantity}
                          </span>
                          <span>{product.price * product.quantity} جنيه</span>
                        </div>
                      ))}
                    </>
                  )}
                  <Divider />
                  <div className="total-final">
                    <Text strong style={{ fontSize: 18 }}>
                      المجموع الكلي: {totalAmount} جنيه
                    </Text>
                  </div>
                  {/* Deposit and Remaining Amount Breakdown */}
                  {depositAmount > 0 && (
                    <div
                      style={{
                        marginTop: 16,
                        padding: 16,
                        backgroundColor: '#f9f9f9',
                        borderRadius: 8,
                      }}
                    >
                      <div className="total-item" style={{ marginBottom: 8 }}>
                        <span style={{ color: '#52c41a', fontWeight: '600' }}>
                          العربون المدفوع
                        </span>
                        <span style={{ color: '#52c41a', fontWeight: '600' }}>
                          {depositAmount.toLocaleString()} جنيه
                        </span>
                      </div>
                      <div className="total-item">
                        <span style={{ color: '#fa8c16', fontWeight: '600' }}>
                          المبلغ المتبقي (عند الخروج)
                        </span>
                        <span style={{ color: '#fa8c16', fontWeight: '600' }}>
                          {remainingAmount.toLocaleString()} جنيه
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Deposit Section */}
            <Card
              title="تفاصيل الدفع"
              size="small"
              style={{ marginTop: 16 }}
              className="deposit-card"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <div className="form-item">
                    <label>العربون المدفوع (جنيه)</label>
                    <InputNumber
                      style={{ width: '100%' }}
                      size="large"
                      placeholder="0"
                      min={0}
                      max={fullAmount}
                      value={depositAmount}
                      onChange={(value) => {
                        const deposit = Math.min(value || 0, fullAmount);
                        setDepositAmount(deposit);
                        // Recalculate remaining after deposit change
                        const remaining = Math.max(0, fullAmount - deposit);
                        setRemainingAmount(remaining);
                      }}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      الحد الأقصى: {fullAmount.toLocaleString()} جنيه
                    </Text>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="form-item">
                    <label>المبلغ المتبقي</label>
                    <div
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        backgroundColor: '#f5f5f5',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: remainingAmount > 0 ? '#fa8c16' : '#52c41a',
                      }}
                    >
                      {remainingAmount.toLocaleString()} جنيه
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {remainingAmount > 0
                        ? 'يُدفع عند الخروج'
                        : 'مُدفع بالكامل'}
                    </Text>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="form-item">
                    <label>نسبة العربون</label>
                    <div
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px',
                        backgroundColor: '#f0f7ff',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1890ff',
                      }}
                    >
                      {fullAmount > 0
                        ? Math.round((depositAmount / fullAmount) * 100)
                        : 0}
                      %
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      من إجمالي المبلغ
                    </Text>
                  </div>
                </Col>
              </Row>
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
                  <label>
                    المرفقات (عقد زواج، الهوية الوطنية، كارت الشراكة)
                  </label>
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

  // Error boundary for the products table
  const ProductsTableWrapper = ({ children }) => {
    try {
      return children;
    } catch (error) {
      console.error('Products table error:', error);
      return (
        <Alert
          message="خطأ في تحميل المنتجات"
          description="حدث خطأ أثناء تحميل قائمة المنتجات. يمكنك المتابعة بدون إضافة منتجات."
          type="warning"
          showIcon
        />
      );
    }
  };

  // Add handlers for additional services
  const handleServiceSelect = (service) => {
    const existingService = selectedServices.find((s) => s.id === service.id);
    if (existingService) {
      // Update quantity if service already exists
      handleServiceQuantityChange(
        service.id,
        (existingService.quantity || 1) + 1
      );
    } else {
      // Add new service with quantity 1
      setSelectedServices((prev) => [...prev, { ...service, quantity: 1 }]);
    }
  };

  const handleServiceQuantityChange = (serviceId, quantity) => {
    setSelectedServices((prev) =>
      prev
        .map((service) =>
          service.id === serviceId
            ? { ...service, quantity: Math.max(0, quantity) }
            : service
        )
        .filter((service) => service.quantity > 0)
    );
  };

  const handleServiceRemove = (serviceId) => {
    setSelectedServices((prev) =>
      prev.filter((service) => service.id !== serviceId)
    );
  };

  // Add query for additional services
  const { data: additionalServicesData, isLoading: additionalServicesLoading } =
    useQuery({
      queryKey: ['additionalServices', departmentId],
      queryFn: () => getAdditionalServices({ active_only: true }),
      enabled: visible && !!departmentId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onSuccess: (data) => {
        if (!data?.success || !Array.isArray(data?.data)) {
          console.error('Invalid additional services data:', data);
          message.error('حدث خطأ في تحميل الخدمات الإضافية');
        }
      },
      onError: (error) => {
        console.error('Error fetching additional services:', error);
        message.error('حدث خطأ في تحميل الخدمات الإضافية');
      },
    });

  // Extract services from response and ensure it's an array
  const additionalServices = React.useMemo(() => {
    const services = additionalServicesData?.data || [];

    return Array.isArray(services) ? services : [];
  }, [additionalServicesData]);

  // Modify the availability check function to handle edit mode
  const checkApartmentAvailability = async (dates) => {
    if (!apartment?.id || !dates || dates.length !== 2) return;

    // In edit mode, check if dates have changed
    if (mode === 'edit' && originalCheckInDate && originalCheckOutDate) {
      const datesUnchanged =
        dates[0].isSame(originalCheckInDate, 'day') &&
        dates[1].isSame(originalCheckOutDate, 'day');

      if (datesUnchanged) {
        setAvailabilityWarning(null);
        return;
      }
    }

    try {
      setCheckingAvailability(true);
      const response = await checkApartmentAvailableForDateRange({
        apartment_id: apartment.id,
        from_date: dates[0].format('YYYY-MM-DD'),
        to_date: dates[1].format('YYYY-MM-DD'),
        ...(mode === 'edit' &&
          booking?.id && { exclude_booking_id: booking.id }),
      });

      if (!response.success) {
        setAvailabilityWarning(
          'الشقة محجوزة في الفترة المحددة. يرجى اختيار فترة أخرى.'
        );
      } else {
        setAvailabilityWarning(null);
      }
    } catch (error) {
      setCheckingAvailability(false);
      setAvailabilityWarning(
        'حدث خطأ أثناء التحقق من توفر الشقة. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setCheckingAvailability(false);
    }
  };

  return (
    <Modal
      title={
        <div className="modal-title">
          <UserOutlined style={{ marginLeft: 8 }} />
          {mode === 'create'
            ? 'حجز جديد'
            : mode === 'edit'
            ? 'تعديل الحجز'
            : 'تفاصيل الحجز'}
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
      className="visitor-modal"
      destroyOnClose
    >
      {/* Inject enhanced styles */}
      <style>{bookingTypeStyles}</style>

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

          {availabilityWarning && (
            <Alert
              type="warning"
              message={availabilityWarning}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <div className="modal-actions">
            <Space>
              <Button onClick={onClose} size="large">
                <CloseOutlined /> إلغاء
              </Button>

              {currentStep > 0 && (
                <Button onClick={handlePreviousStep} size="large">
                  السابق
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button type="primary" onClick={handleNextStep} size="large">
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
                  {bookingType === 'reservation'
                    ? 'إنشاء الحجز المسبق'
                    : 'إنشاء الحجز'}
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
