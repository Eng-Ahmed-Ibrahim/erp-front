import axios from 'axios';
import { API_ENDPOINT } from '../../../config';

const api = axios.create({
  baseURL: `${API_ENDPOINT}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Booking Financial Functions
export const getBookingFinancials = async (params = {}) => {
  try {
    const response = await api.get('/bookings/financial', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching booking financials:', error);
    throw error;
  }
};

export const getBookingsByDateRange = async (
  startDate,
  endDate,
  params = {}
) => {
  try {
    const response = await api.get('/bookings/by-date-range', {
      params: {
        start_date: startDate,
        end_date: endDate,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings by date range:', error);
    throw error;
  }
};

export const getBookingsByStaff = async (staffId, params = {}) => {
  try {
    const response = await api.get(`/bookings/by-staff/${staffId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings by staff:', error);
    throw error;
  }
};

// Revenue Analytics Functions
export const getRevenueAnalytics = async (period = 'monthly', params = {}) => {
  try {
    const response = await api.get('/analytics/revenue', {
      params: {
        period,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    throw error;
  }
};

export const getDailyRevenue = async (date) => {
  try {
    const response = await api.get('/analytics/revenue/daily', {
      params: { date },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching daily revenue:', error);
    throw error;
  }
};

export const getMonthlyRevenue = async (year, month) => {
  try {
    const response = await api.get('/analytics/revenue/monthly', {
      params: { year, month },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    throw error;
  }
};

// Staff Performance Functions
export const getStaffPerformance = async (params = {}) => {
  try {
    const response = await api.get('/analytics/staff-performance', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching staff performance:', error);
    throw error;
  }
};

export const getUserBookingReports = async (params = {}) => {
  try {
    const response = await api.get('/analytics/user-booking-reports', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user booking reports:', error);
    throw error;
  }
};

export const getStaffRevenueGenerated = async (staffId, startDate, endDate) => {
  try {
    const response = await api.get(`/analytics/staff/${staffId}/revenue`, {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching staff revenue:', error);
    throw error;
  }
};

// Payment Method Analytics
export const getPaymentMethodBreakdown = async (startDate, endDate) => {
  try {
    const response = await api.get('/analytics/payment-methods', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment method breakdown:', error);
    throw error;
  }
};

// Financial Reports
export const generateFinancialReport = async (reportType, params = {}) => {
  try {
    const response = await api.get(`/reports/financial/${reportType}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error generating financial report:', error);
    throw error;
  }
};

export const exportBookingData = async (
  startDate,
  endDate,
  format = 'excel'
) => {
  try {
    const response = await api.get('/exports/bookings', {
      params: {
        start_date: startDate,
        end_date: endDate,
        format,
      },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting booking data:', error);
    throw error;
  }
};

// Dashboard Statistics
export const getAccountingDashboardStats = async () => {
  try {
    const response = await api.get('/analytics/dashboard-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching accounting dashboard stats:', error);
    throw error;
  }
};

export const getTopPerformingStaff = async (limit = 10, period = 'month') => {
  try {
    const response = await api.get('/analytics/top-staff', {
      params: { limit, period },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top performing staff:', error);
    throw error;
  }
};

// Booking Status Analytics
export const getBookingStatusBreakdown = async (startDate, endDate) => {
  try {
    const response = await api.get('/analytics/booking-status', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching booking status breakdown:', error);
    throw error;
  }
};

// Average Booking Value
export const getAverageBookingValue = async (period = 'month') => {
  try {
    const response = await api.get('/analytics/average-booking-value', {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching average booking value:', error);
    throw error;
  }
};

export default {
  getBookingFinancials,
  getBookingsByDateRange,
  getBookingsByStaff,
  getRevenueAnalytics,
  getDailyRevenue,
  getMonthlyRevenue,
  getStaffPerformance,
  getUserBookingReports,
  getStaffRevenueGenerated,
  getPaymentMethodBreakdown,
  generateFinancialReport,
  exportBookingData,
  getAccountingDashboardStats,
  getTopPerformingStaff,
  getBookingStatusBreakdown,
  getAverageBookingValue,
};
