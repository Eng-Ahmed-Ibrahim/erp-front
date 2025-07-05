import axios from 'axios';
import { API_ENDPOINT } from '../../../config';
import { message } from 'antd';

const Token = localStorage.getItem('token') || sessionStorage.getItem('token');
const domain = API_ENDPOINT;

// Base URL for reception API
const RECEPTION_API_BASE = '/api/v1/reception';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: domain,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${Token}`,
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error interceptor for Arabic messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error?.message) {
      message.error(error.response.data.error.message);
    } else if (error.response?.data?.error?.errors) {
      const errors = error.response.data.error.errors;
      Object.keys(errors).map((err) => {
        message.error(errors[err][0] || 'حدث خطأ الرجاء المحاولة مرة أخرى');
      });
    } else {
      message.error('حدث خطأ الرجاء المحاولة مرة أخرى');
    }
    throw error;
  }
);

// Constants
export const VISITOR_TYPES = {
  INFANTRY: 'infantry',
  WEAPONS: 'weapons',
  CIVILIAN: 'civilian',
};

export const VISITOR_TYPE_LABELS = {
  [VISITOR_TYPES.INFANTRY]: 'مشاة بحرية',
  [VISITOR_TYPES.WEAPONS]: 'أسلحة',
  [VISITOR_TYPES.CIVILIAN]: 'مدني',
};

export const VISITOR_TYPE_COLORS = {
  [VISITOR_TYPES.INFANTRY]: '#001529',
  [VISITOR_TYPES.WEAPONS]: '#8b4513',
  [VISITOR_TYPES.CIVILIAN]: '#ff8c00',
};

export const ROOM_TYPES = {
  SINGLE: 'single',
  DOUBLE: 'double',
  SUITE: 'suite',
};

export const ROOM_TYPE_LABELS = {
  [ROOM_TYPES.SINGLE]: 'فردي',
  [ROOM_TYPES.DOUBLE]: 'مزدوج',
  [ROOM_TYPES.SUITE]: 'جناح',
};

export const ID_TYPES = {
  NATIONAL_ID: 'national_id',
  PASSPORT: 'passport',
  MILITARY_ID: 'military_id',
};

export const ID_TYPE_LABELS = {
  [ID_TYPES.NATIONAL_ID]: 'بطاقة شخصية',
  [ID_TYPES.PASSPORT]: 'جواز سفر',
  [ID_TYPES.MILITARY_ID]: 'هوية عسكرية',
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.PENDING]: 'محجوز (في الانتظار)',
  [BOOKING_STATUS.CONFIRMED]: 'مؤكد',
  [BOOKING_STATUS.ACTIVE]: 'نشط',
  [BOOKING_STATUS.COMPLETED]: 'مكتمل',
  [BOOKING_STATUS.CANCELLED]: 'ملغي',
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'نقدي',
  [PAYMENT_METHODS.CARD]: 'بطاقة',
  [PAYMENT_METHODS.TRANSFER]: 'تحويل',
};

// Add new additional services constants
export const ADDITIONAL_SERVICES = {
  extra_mattress: 'extra_mattress',
  extra_person: 'extra_person',
};

export const ADDITIONAL_SERVICE_LABELS = {
  extra_mattress: 'إضافة مرتبة',
  extra_person: 'إضافة مرافق',
};

export const ADDITIONAL_SERVICE_PRICES = {
  extra_mattress: 200,
  extra_person: 250,
};

// Client Type API functions
export const getClientTypes = async (filteredValues = {}, setIsLoading) => {
  try {
    if (setIsLoading) setIsLoading(true);
    const { page } = filteredValues;
    const res = await api.get('/api/v1/store/client_type', {
      params: {
        page,
      },
    });
    if (setIsLoading) setIsLoading(false);
    return res.data;
  } catch (error) {
    if (setIsLoading) setIsLoading(false);
    throw error;
  }
};

export const getClientTypeById = async (id) => {
  try {
    const res = await api.get(`/api/v1/store/client_type/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Visitor API functions
export const getVisitors = async (filteredValues = {}, setIsLoading) => {
  try {
    if (setIsLoading) setIsLoading(true);
    const { name, visitor_type, page, building_id, apartment_number } =
      filteredValues;

    const res = await api.get(`${RECEPTION_API_BASE}/visitors`, {
      params: {
        name,
        visitor_type,
        page,
        building_id,
        apartment_number,
      },
    });

    if (setIsLoading) setIsLoading(false);
    return res.data;
  } catch (error) {
    if (setIsLoading) setIsLoading(false);
    throw error;
  }
};

export const getVisitorById = async (id) => {
  try {
    const res = await api.get(`${RECEPTION_API_BASE}/visitors/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const createVisitor = async (visitorData) => {
  try {
    const res = await api.post(`${RECEPTION_API_BASE}/visitors`, visitorData);
    message.success('تم إنشاء الزائر بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateVisitor = async (id, visitorData) => {
  try {
    const res = await api.put(
      `${RECEPTION_API_BASE}/visitors/${id}`,
      visitorData
    );
    message.success('تم تحديث الزائر بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteVisitor = async (id) => {
  try {
    const res = await api.delete(`${RECEPTION_API_BASE}/visitors/${id}`);
    message.success('تم حذف الزائر بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Building API functions
export const getBuildings = async (filteredValues = {}, setIsLoading) => {
  try {
    if (setIsLoading) setIsLoading(true);
    const { name, page } = filteredValues;

    const res = await api.get(`${RECEPTION_API_BASE}/buildings`, {
      params: { name, page },
    });

    if (setIsLoading) setIsLoading(false);
    return res.data;
  } catch (error) {
    if (setIsLoading) setIsLoading(false);
    throw error;
  }
};

export const getBuildingById = async (id) => {
  try {
    const res = await api.get(`${RECEPTION_API_BASE}/buildings/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const createBuilding = async (buildingData) => {
  try {
    const res = await api.post(`${RECEPTION_API_BASE}/buildings`, buildingData);
    message.success('تم إنشاء المبنى بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateBuilding = async (id, buildingData) => {
  try {
    const res = await api.put(
      `${RECEPTION_API_BASE}/buildings/${id}`,
      buildingData
    );
    message.success('تم تحديث المبنى بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBuilding = async (id) => {
  try {
    const res = await api.delete(`${RECEPTION_API_BASE}/buildings/${id}`);
    message.success('تم حذف المبنى بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Apartment API functions
export const getApartments = async (filteredValues = {}, setIsLoading) => {
  try {
    if (setIsLoading) setIsLoading(true);
    const {
      building_id,
      room_type,
      occupancy_status,
      visitor_type,
      page,
      search,
    } = filteredValues;

    const res = await api.get(`${RECEPTION_API_BASE}/apartments`, {
      params: {
        building_id,
        room_type,
        occupancy_status,
        visitor_type,
        page,
        search,
      },
    });

    if (setIsLoading) setIsLoading(false);
    return res.data;
  } catch (error) {
    if (setIsLoading) setIsLoading(false);
    throw error;
  }
};

export const getApartmentById = async (id) => {
  try {
    const res = await api.get(`${RECEPTION_API_BASE}/apartments/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const createApartment = async (apartmentData) => {
  try {
    const res = await api.post(
      `${RECEPTION_API_BASE}/apartments`,
      apartmentData
    );
    message.success('تم إنشاء الشقة بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateApartment = async (id, apartmentData) => {
  try {
    const res = await api.put(
      `${RECEPTION_API_BASE}/apartments/${id}`,
      apartmentData
    );
    message.success('تم تحديث الشقة بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteApartment = async (id) => {
  try {
    const res = await api.delete(`${RECEPTION_API_BASE}/apartments/${id}`);
    message.success('تم حذف الشقة بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Booking API functions
export const getBookings = async (filteredValues = {}, setIsLoading) => {
  try {
    if (setIsLoading) setIsLoading(true);
    const { visitor_id, apartment_id, status, from_date, to_date, page } =
      filteredValues;

    const res = await api.get(`${RECEPTION_API_BASE}/bookings`, {
      params: {
        visitor_id,
        apartment_id,
        status,
        from_date,
        to_date,
        page,
      },
    });

    if (setIsLoading) setIsLoading(false);
    return res.data;
  } catch (error) {
    if (setIsLoading) setIsLoading(false);
    throw error;
  }
};

export const getBookingById = async (id) => {
  try {
    const res = await api.get(`${RECEPTION_API_BASE}/bookings/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    const res = await api.post(`${RECEPTION_API_BASE}/bookings`, bookingData);
    message.success('تم إنشاء الحجز بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateBooking = async (id, bookingData) => {
  try {
    const res = await api.put(
      `${RECEPTION_API_BASE}/bookings/${id}`,
      bookingData
    );
    message.success('تم تحديث الحجز بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteBooking = async (id) => {
  try {
    const res = await api.delete(`${RECEPTION_API_BASE}/bookings/${id}`);
    message.success('تم حذف الحجز بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const checkInBooking = async (id) => {
  try {
    const res = await api.post(`${RECEPTION_API_BASE}/bookings/${id}/check-in`);
    message.success('تم تسجيل الوصول بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const checkOutBooking = async (id, checkoutData = {}) => {
  try {
    const res = await api.patch(
      `${RECEPTION_API_BASE}/bookings/${id}/checkout`,
      {
        actual_checkout_datetime:
          checkoutData.actual_checkout_datetime || new Date().toISOString(),
        notes: checkoutData.notes || null,
        early_checkout_reason: checkoutData.early_checkout_reason || null,
        ...checkoutData,
      }
    );

    // Check if it's early checkout and show appropriate message
    const isEarlyCheckout = res.data?.data?.isEarlyCheckout;
    if (isEarlyCheckout) {
      message.success('تم تسجيل المغادرة المبكرة بنجاح');
    } else {
      message.success('تم تسجيل المغادرة بنجاح');
    }

    return res.data;
  } catch (error) {
    throw error;
  }
};

// Attachment API functions
export const getAttachments = async (visitor_id) => {
  try {
    const res = await api.get(`${RECEPTION_API_BASE}/attachments`, {
      params: { visitor_id },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const uploadAttachment = async (formData) => {
  try {
    const res = await api.post(`${RECEPTION_API_BASE}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    message.success('تم رفع المرفق بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAttachment = async (id) => {
  try {
    const res = await api.delete(`${RECEPTION_API_BASE}/attachments/${id}`);
    message.success('تم حذف المرفق بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Product API functions
export const getProducts = async (
  filteredValues = {},
  setIsLoading,
  department_id = null
) => {
  try {
    if (setIsLoading) setIsLoading(true);
    const { name, page, category_id } = filteredValues;

    const res = await api.get(
      `${domain}/api/v1/store/products/department/${department_id}`,
      {
        params: {
          name,
          page,
          recipe_category_id: category_id,
        },
      }
    );

    if (setIsLoading) setIsLoading(false);
    return res.data;
  } catch (error) {
    if (setIsLoading) setIsLoading(false);
    throw error;
  }
};

// Statistics API
export const getReceptionStats = async () => {
  try {
    const res = await api.get(`${RECEPTION_API_BASE}/stats`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Payment Methods API functions
export const getPaymentMethods = async (filteredValues = {}, setIsLoading) => {
  try {
    if (setIsLoading) setIsLoading(true);
    const res = await api.get(`/api/v1/store/payment_method`);
    if (setIsLoading) setIsLoading(false);
    return res.data;
  } catch (error) {
    if (setIsLoading) setIsLoading(false);
    throw error;
  }
};

// Reservation API functions
export const getAvailableApartments = async (
  filteredValues = {},
  setIsLoading
) => {
  try {
    if (setIsLoading) setIsLoading(true);
    const {
      building_id,
      room_type,
      from_date,
      to_date,
      exclude_booking_id,
      search,
      include,
    } = filteredValues;

    const res = await api.get(`${RECEPTION_API_BASE}/apartments/available`, {
      params: {
        building_id,
        room_type,
        from_date,
        to_date,
        exclude_booking_id,
        search,
        include,
      },
    });

    if (setIsLoading) setIsLoading(false);
    return res.data;
  } catch (error) {
    if (setIsLoading) setIsLoading(false);
    throw error;
  }
};

export const createReservation = async (reservationData) => {
  try {
    const res = await api.post(`${RECEPTION_API_BASE}/reservations`, {
      ...reservationData,
      status: BOOKING_STATUS.PENDING,
    });
    message.success('تم إنشاء الحجز المسبق بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getReservations = async (filteredValues = {}, setIsLoading) => {
  try {
    if (setIsLoading) setIsLoading(true);
    const {
      status = BOOKING_STATUS.PENDING,
      from_date,
      to_date,
      building_id,
      apartment_id,
      visitor_name,
      page,
    } = filteredValues;

    const res = await api.get(`${RECEPTION_API_BASE}/reservations`, {
      params: {
        status,
        from_date,
        to_date,
        building_id,
        apartment_id,
        visitor_name,
        page,
        include: 'apartment.building,visitor',
      },
    });

    if (setIsLoading) setIsLoading(false);
    return res.data;
  } catch (error) {
    if (setIsLoading) setIsLoading(false);
    throw error;
  }
};

export const confirmReservation = async (reservationId, paymentData = null) => {
  try {
    const requestData = paymentData || {};
    const res = await api.patch(
      `${RECEPTION_API_BASE}/reservations/${reservationId}/confirm`,
      requestData
    );
    message.success('تم تأكيد الحجز بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const activateReservation = async (reservationId) => {
  try {
    const res = await api.patch(
      `${RECEPTION_API_BASE}/reservations/${reservationId}/activate`
    );
    message.success('تم تفعيل الحجز بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

// New function to activate reservation and generate PDF
export const activateReservationWithPDF = async (
  reservationId,
  reservationData = null
) => {
  try {
    const res = await api.patch(
      `${RECEPTION_API_BASE}/reservations/${reservationId}/activate`
    );

    message.success('تم تفعيل الحجز بنجاح');

    // Return both the result and the reservation data for PDF generation
    return {
      success: true,
      data: res.data,
      reservationData: reservationData || res.data?.data,
    };
  } catch (error) {
    throw error;
  }
};

// Function to get pending bookings specifically for the dashboard
export const getPendingBookings = async (filteredValues = {}, setIsLoading) => {
  try {
    if (setIsLoading) setIsLoading(true);

    const filters = {
      ...filteredValues,
      status: BOOKING_STATUS.PENDING,
      include: 'apartment.building,visitor,paymentMethod,creator',
    };

    const res = await getReservations(filters, false);

    if (setIsLoading) setIsLoading(false);
    return res;
  } catch (error) {
    if (setIsLoading) setIsLoading(false);
    throw error;
  }
};

// Function to get confirmed bookings specifically for the dashboard
export const getConfirmedBookings = async (
  filteredValues = {},
  setIsLoading
) => {
  try {
    if (setIsLoading) setIsLoading(true);

    const filters = {
      ...filteredValues,
      status: BOOKING_STATUS.CONFIRMED,
      include: 'apartment.building,visitor,paymentMethod,creator',
    };

    const res = await getReservations(filters, false);

    if (setIsLoading) setIsLoading(false);
    return res;
  } catch (error) {
    if (setIsLoading) setIsLoading(false);
    throw error;
  }
};

// Function to get both pending and confirmed bookings for management
export const getPendingAndConfirmedBookings = async (
  filteredValues = {},
  setIsLoading
) => {
  try {
    if (setIsLoading) setIsLoading(true);

    // Get both pending and confirmed bookings
    const [pendingRes, confirmedRes] = await Promise.all([
      getPendingBookings(filteredValues, false),
      getConfirmedBookings(filteredValues, false),
    ]);

    // Combine results
    const pendingBookings = pendingRes.data?.data || pendingRes.data || [];
    const confirmedBookings =
      confirmedRes.data?.data || confirmedRes.data || [];

    const allBookings = [...pendingBookings, ...confirmedBookings].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    if (setIsLoading) setIsLoading(false);
    return { data: allBookings };
  } catch (error) {
    if (setIsLoading) setIsLoading(false);
    throw error;
  }
};

export const cancelReservation = async (reservationId, reason = '') => {
  try {
    const res = await api.patch(
      `${RECEPTION_API_BASE}/reservations/${reservationId}/cancel`,
      {
        cancellation_reason: reason,
      }
    );
    message.success('تم إلغاء الحجز بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateReservation = async (reservationId, reservationData) => {
  try {
    const res = await api.put(
      `${RECEPTION_API_BASE}/reservations/${reservationId}`,
      reservationData
    );
    message.success('تم تحديث الحجز بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Upload an attachment for a booking
export const uploadBookingAttachment = async (bookingId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await api.post(
      `/api/v1/reception/attachments/booking/${bookingId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    message.success('تم رفع المرفق بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Get all attachments for a booking
export const getBookingAttachments = async (bookingId) => {
  try {
    const res = await api.get(
      `/api/v1/reception/attachments/booking/${bookingId}`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Check if a specific apartment is available for a date range
 * @param {string} apartmentId
 * @param {string} fromDate (ISO string)
 * @param {string} toDate (ISO string)
 * @returns {Promise<{available: boolean, conflicts?: any[]}>}
 */
export const checkApartmentAvailableForDateRange = async (
  apartmentId,
  fromDate,
  toDate,
  currentBookingId = null
) => {
  try {
    const res = await api.get(
      `/api/v1/reception/apartments/${apartmentId}/is-available-for-date-range`,
      {
        params: {
          from_date: fromDate,
          to_date: toDate,
          current_booking_id: currentBookingId,
        },
      }
    );
    return res.data;
  } catch (error) {
    // If the backend returns a 409 or error, treat as not available
    return {
      available: false,
      error: error?.response?.data?.error || error.message,
    };
  }
};

/**
 * Get current server time
 */
export const getServerTime = async () => {
  try {
    console.log('Fetching server time...');
    const response = await api.get(`${RECEPTION_API_BASE}/server-time`, {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    console.log('Server time response:', response);

    if (response.data && response.data.success) {
      console.log('Server time data:', response.data.data);
      return response.data;
    } else {
      console.error('Invalid server time response format:', response.data);
      throw new Error('Invalid server time response format');
    }
  } catch (error) {
    console.error('Error fetching server time:', error.response || error);
    throw error;
  }
};

/**
 * Search visitors by ID number
 * @param {string} idNumber - The ID number to search for
 */
export const searchVisitorsByIdNumber = async (idNumber) => {
  try {
    const response = await api.get(`${RECEPTION_API_BASE}/visitors/search`, {
      params: {
        id_number: idNumber,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching visitors:', error);
    throw error;
  }
};

// Additional Services API
export const getAdditionalServices = async (
  filteredValues = {},
  setIsLoading
) => {
  try {
    if (setIsLoading) setIsLoading(true);
    const { page, search, active_only } = filteredValues;

    console.log('=== FETCHING ADDITIONAL SERVICES ===');
    console.log('Params:', { page, search, active_only });

    const res = await api.get(`${RECEPTION_API_BASE}/additional-services`, {
      params: {
        page,
        search,
        active_only: active_only ? 1 : undefined,
      },
    });

    console.log('=== ADDITIONAL SERVICES RESPONSE ===');
    console.log('Raw response:', res);
    console.log('Data:', res.data);

    if (!res.data.success) {
      throw new Error('Failed to fetch additional services');
    }

    if (!Array.isArray(res.data.data)) {
      console.error('Invalid response format:', res.data);
      throw new Error('Invalid response format from server');
    }

    if (setIsLoading) setIsLoading(false);
    return res.data;
  } catch (error) {
    console.error('=== ADDITIONAL SERVICES ERROR ===');
    console.error('Error:', error);
    if (setIsLoading) setIsLoading(false);
    throw error;
  }
};

export const createAdditionalService = async (serviceData) => {
  try {
    const res = await api.post(
      `${RECEPTION_API_BASE}/additional-services`,
      serviceData
    );
    message.success('تم إضافة الخدمة بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateAdditionalService = async (id, serviceData) => {
  try {
    const res = await api.put(
      `${RECEPTION_API_BASE}/additional-services/${id}`,
      serviceData
    );
    message.success('تم تحديث الخدمة بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAdditionalService = async (id) => {
  try {
    const res = await api.delete(
      `${RECEPTION_API_BASE}/additional-services/${id}`
    );
    message.success('تم حذف الخدمة بنجاح');
    return res.data;
  } catch (error) {
    throw error;
  }
};

export default api;
