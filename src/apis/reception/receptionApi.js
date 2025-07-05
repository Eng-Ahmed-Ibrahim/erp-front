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

export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
};

export const MEAL_LABELS = {
  [MEAL_TYPES.BREAKFAST]: 'إفطار',
  [MEAL_TYPES.LUNCH]: 'غداء',
  [MEAL_TYPES.DINNER]: 'عشاء',
};

export const MEAL_PRICES = {
  [MEAL_TYPES.BREAKFAST]: 25,
  [MEAL_TYPES.LUNCH]: 45,
  [MEAL_TYPES.DINNER]: 50,
};

export const ID_TYPES = {
  NATIONAL_ID: 'national_id',
  PASSPORT: 'passport',
  MILITARY_ID: 'military_id',
};

export const ID_TYPE_LABELS = {
  [ID_TYPES.NATIONAL_ID]: 'هوية وطنية',
  [ID_TYPES.PASSPORT]: 'جواز سفر',
  [ID_TYPES.MILITARY_ID]: 'هوية عسكرية',
};

export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
};

export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.CONFIRMED]: 'مؤكد',
  [BOOKING_STATUS.CHECKED_IN]: 'وصل',
  [BOOKING_STATUS.CHECKED_OUT]: 'غادر',
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
export const getProducts = async (filteredValues = {}, setIsLoading, department_id = null ) => {
  try {
    if (setIsLoading) setIsLoading(true);
    const { name, page, category_id } = filteredValues;

    const res = await api.get(`${domain}/api/v1/store/products/department/${department_id}`, {
      params: {
        name,
        page,
        recipe_category_id: category_id,
      },
    });

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

export default api;
