import axios from "axios";
import { API_ENDPOINT } from "../../../config";

const Token = localStorage.getItem("token") || sessionStorage.getItem("token");

// Academies API
export async function getAcademies() {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/activities-subscriptions/academies`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function createAcademy(academyData) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/activities-subscriptions/academies`, academyData, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateAcademy(id, academyData) {
  try {
    const res = await axios.put(`${API_ENDPOINT}/api/v1/activities-subscriptions/academies/${id}`, academyData, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteAcademy(id) {
  try {
    const res = await axios.delete(`${API_ENDPOINT}/api/v1/activities-subscriptions/academies/${id}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

// Coaches API
export async function getCoaches(academyId = null) {
  try {
    const params = academyId ? { academy_id: academyId } : {};
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/coaches`,
      {
        params,
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function createCoach(coachData) {
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/coaches`,
      coachData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateCoach(id, coachData) {
  try {
    const res = await axios.put(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/coaches/${id}`,
      coachData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteCoach(id) {
  try {
    const res = await axios.delete(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/coaches/${id}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

// Offers API
export async function getOffers() {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/offers`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function createOffer(offerData) {
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/offers`,
      offerData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateOffer(id, offerData) {
  try {
    const res = await axios.put(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/offers/${id}`,
      offerData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteOffer(id) {
  try {
    const res = await axios.delete(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/offers/${id}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getOffersByAcademy(academyId) {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/offers/academy/${academyId}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

// Subscribers API
export async function getSubscribers() {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/subscribers`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function createSubscriber(subscriberData) {
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/subscribers`,
      subscriberData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateSubscriber(id, subscriberData) {
  try {
    const res = await axios.put(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/subscribers/${id}`,
      subscriberData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteSubscriber(id) {
  try {
    const res = await axios.delete(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/subscribers/${id}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function searchSubscriberByIdentifier(identifier) {
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/subscribers/search-by-identifier`,
      {
        identifier,
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

// Subscriptions API
export async function getSubscriptions(filters = {}) {
  try {
    const params = new URLSearchParams();

    // Add filter parameters
    if (filters.dateFrom) {
      params.append('date_from', filters.dateFrom);
    }
    if (filters.dateTo) {
      params.append('date_to', filters.dateTo);
    }
    if (filters.createdBy) {
      params.append('created_by', filters.createdBy);
    }
    if (filters.academyId) {
      params.append('academy_id', filters.academyId);
    }
    if (filters.page) {
      params.append('page', filters.page);
    }
    if (filters.perPage) {
      params.append('per_page', filters.perPage);
    }

    const queryString = params.toString();
    const url = `${API_ENDPOINT}/api/v1/activities-subscriptions/subscriptions${
      queryString ? `?${queryString}` : ''
    }`;

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getCashiers() {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/shifts/cashiers`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function createSubscription(subscriptionData) {
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/subscriptions`,
      subscriptionData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateSubscription(id, subscriptionData) {
  try {
    const res = await axios.put(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/subscriptions/${id}`,
      subscriptionData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteSubscription(id) {
  try {
    const res = await axios.delete(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/subscriptions/${id}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getSubscriptionsBySubscriber(subscriberId) {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/subscriptions/subscriber/${subscriberId}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getSubscriptionsByAcademy(academyId) {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/subscriptions/academy/${academyId}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function generateQRCode(subscriptionId) {
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/subscriptions/${subscriptionId}/qr`,
      {},
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getQRCodeSVG(subscriptionId) {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/subscriptions/${subscriptionId}/qr-svg`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
        responseType: 'text', // Important for SVG content
      }
    );
    return res.data; // This will be the SVG string
  } catch (error) {
    throw error;
  }
}

export async function getBarcodeSVG(subscriptionId) {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/subscriptions/${subscriptionId}/barcode-svg`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
        responseType: 'text', // Important for SVG content
      }
    );
    return res.data; // This will be the SVG string
  } catch (error) {
    throw error;
  }
}

export async function generateAllQRCodes() {
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/subscriptions/generate-all-qr-codes`,
      {},
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

// Check-in API
export async function checkIn(qrCode) {
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/check-in`,
      {
        qr_code: qrCode,
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getAttendanceHistory(subscriptionId) {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/check-in/attendance/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getAttendanceByDateRange(startDate, endDate) {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/check-in/attendance-by-date-range`,
      {
        params,
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getAttendanceStats(startDate, endDate) {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/check-in/stats`,
      {
        params,
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

// Financial Reports API
export async function getFinancialDashboardStats(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/financial-reports/dashboard-stats?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getFinancialRevenueAnalytics(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.group_by) queryParams.append('group_by', params.group_by);

    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/financial-reports/revenue-analytics?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getSubscriptionsFinancials(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.academy_id) queryParams.append('academy_id', params.academy_id);
    if (params.subscriber_type) queryParams.append('subscriber_type', params.subscriber_type);

    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/financial-reports/subscriptions-financials?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getRevenueByAcademy(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/financial-reports/revenue-by-academy?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getRevenueBySubscriberType(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/financial-reports/revenue-by-subscriber-type?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function generateFinancialReport(reportType, params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/activities-subscriptions/financial-reports/reports/${reportType}?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}