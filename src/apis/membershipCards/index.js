import axios from "axios";
import { API_ENDPOINT } from "../../../config";

const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// =====================
// Officers API
// =====================

export async function getOfficers(search = '') {
  try {
    const params = search ? { search } : {};
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/officers`, {
      params,
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getOfficer(id) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/officers/${id}`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function createOfficer(officerData) {
  try {
    const formData = new FormData();
    Object.keys(officerData).forEach(key => {
      if (key === 'photo' && officerData[key] instanceof File) {
        formData.append('photo', officerData[key]);
      } else if (officerData[key] !== null && officerData[key] !== undefined) {
        // Convert boolean to "1" or "0" for Laravel validation
        if (typeof officerData[key] === 'boolean') {
          formData.append(key, officerData[key] ? '1' : '0');
        } else {
          formData.append(key, officerData[key]);
        }
      }
    });
    
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/officers`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateOfficer(id, officerData) {
  try {
    const formData = new FormData();
    // Use POST with _method spoofing for Laravel to properly handle FormData
    formData.append('_method', 'PUT');

    Object.keys(officerData).forEach(key => {
      if (key === 'photo' && officerData[key] instanceof File) {
        formData.append('photo', officerData[key]);
      } else if (officerData[key] !== null && officerData[key] !== undefined) {
        // Convert boolean to "1" or "0" for Laravel validation
        if (typeof officerData[key] === 'boolean') {
          formData.append(key, officerData[key] ? '1' : '0');
        } else {
          formData.append(key, officerData[key]);
        }
      }
    });

    // Use POST instead of PUT for FormData to work properly with Laravel
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/officers/${id}`, formData, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteOfficer(id) {
  try {
    const res = await axios.delete(`${API_ENDPOINT}/api/v1/membership-cards/officers/${id}`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function findOfficerByIdentifier(identifier) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/officers/find`, {
      params: { identifier },
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

// =====================
// Beneficiaries API
// =====================

export async function getBeneficiaries(officerId) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/officers/${officerId}/beneficiaries`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getBeneficiary(officerId, id) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/officers/${officerId}/beneficiaries/${id}`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function createBeneficiary(officerId, beneficiaryData) {
  try {
    const formData = new FormData();
    Object.keys(beneficiaryData).forEach(key => {
      if (key === 'photo' && beneficiaryData[key] instanceof File) {
        formData.append('photo', beneficiaryData[key]);
      } else if (beneficiaryData[key] !== null && beneficiaryData[key] !== undefined) {
        formData.append(key, beneficiaryData[key]);
      }
    });

    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/membership-cards/officers/${officerId}/beneficiaries`,
      formData,
      {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateBeneficiary(officerId, id, beneficiaryData) {
  try {
    const formData = new FormData();
    // Use POST with _method spoofing for Laravel to properly handle FormData
    formData.append('_method', 'PUT');

    Object.keys(beneficiaryData).forEach(key => {
      if (key === 'photo') {
        // Only append photo if it's a File object (new upload)
        if (beneficiaryData[key] instanceof File) {
          formData.append('photo', beneficiaryData[key]);
        }
        // If photo is null or undefined, don't append it (keep existing photo)
      } else if (beneficiaryData[key] !== null && beneficiaryData[key] !== undefined) {
        formData.append(key, beneficiaryData[key]);
      }
    });

    // Use POST instead of PUT for FormData to work properly with Laravel
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/membership-cards/officers/${officerId}/beneficiaries/${id}`,
      formData,
      {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteBeneficiary(officerId, id) {
  try {
    const res = await axios.delete(
      `${API_ENDPOINT}/api/v1/membership-cards/officers/${officerId}/beneficiaries/${id}`,
      { headers: getHeaders() }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

// =====================
// Fee Plans API
// =====================

export async function getFeePlans(activeOnly = false) {
  try {
    const params = activeOnly ? { active_only: true } : {};
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/fee-plans`, {
      params,
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getFeePlan(id) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/fee-plans/${id}`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getFeePlanByType(beneficiaryType) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/fee-plans/type/${beneficiaryType}`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getFeePlansByWeaponType(weaponType, activeOnly = true) {
  try {
    const params = activeOnly ? { active_only: true } : {};
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/fee-plans/weapon-type/${weaponType}`, {
      params,
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function createFeePlan(feePlanData) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/fee-plans`, feePlanData, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateFeePlan(id, feePlanData) {
  try {
    const res = await axios.put(`${API_ENDPOINT}/api/v1/membership-cards/fee-plans/${id}`, feePlanData, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteFeePlan(id) {
  try {
    const res = await axios.delete(`${API_ENDPOINT}/api/v1/membership-cards/fee-plans/${id}`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

// =====================
// Subscriptions API
// =====================

export async function getSubscriptions(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.perPage) params.append('per_page', filters.perPage);

    const queryString = params.toString();
    const url = `${API_ENDPOINT}/api/v1/membership-cards/subscriptions${queryString ? `?${queryString}` : ''}`;

    const res = await axios.get(url, { headers: getHeaders() });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getSubscriptionsReport(fromDate, toDate) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/subscriptions/report`, {
      params: {
        from_date: fromDate,
        to_date: toDate,
      },
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getSubscription(id) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/subscriptions/${id}`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getOfficerSubscriptions(officerId) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/officers/${officerId}/subscriptions`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getOfficerCards(officerId) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/officers/${officerId}/cards`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getExpiringSubscriptions(days = 30) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/subscriptions/expiring`, {
      params: { days },
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function createSubscription(subscriptionData) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/subscriptions`, subscriptionData, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function suspendSubscription(id) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/subscriptions/${id}/suspend`, {}, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function activateSubscription(id) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/subscriptions/${id}/activate`, {}, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteSubscription(id) {
  try {
    const res = await axios.delete(`${API_ENDPOINT}/api/v1/membership-cards/subscriptions/${id}`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function calculateFees(beneficiaryType, isRenewal = false, isOldOfficer = false) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/subscriptions/calculate-fees`, {
      beneficiary_type: beneficiaryType,
      is_renewal: isRenewal,
      is_old_officer: isOldOfficer,
    }, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function renewSubscription(id, renewalData) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/subscriptions/${id}/renew`, renewalData, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

// =====================
// Membership Cards API
// =====================

export async function getCards(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = `${API_ENDPOINT}/api/v1/membership-cards/cards${queryString ? `?${queryString}` : ''}`;

    const res = await axios.get(url, { headers: getHeaders() });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getCard(id) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/cards/${id}`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getCardBySubscription(subscriptionId) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/cards/subscription/${subscriptionId}`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function issueCard(cardData) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/cards`, cardData, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function validateCard(cardUid) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/cards/validate`, {
      card_uid: cardUid,
    }, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function markCardPrinted(id) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/cards/${id}/print`, {}, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function markCardEncoded(id, encodedData = []) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/cards/${id}/encode`, {
      encoded_data: encodedData || [],
    }, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function revokeCard(id) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/cards/${id}/revoke`, {}, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getReplacementCardFee() {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/cards/replacement-fee`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateReplacementCardFee(fee) {
  try {
    const res = await axios.put(`${API_ENDPOINT}/api/v1/membership-cards/cards/replacement-fee`, {
      fee: fee,
    }, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function issueReplacementCard(cardData) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/cards/replacement`, cardData, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getExpiringCards(days = 30) {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/cards/expiring`, {
      params: { days },
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getCardsNotPrinted() {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/cards/not-printed`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getCardsNotEncoded() {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/v1/membership-cards/cards/not-encoded`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

// =====================
// Lookups (Static data from config)
// =====================

export const RELATIONSHIP_TYPES = [
  { value: 'spouse', label: 'الزوجة' },
  { value: 'child', label: 'الأبناء' },
  { value: 'parent', label: 'الآباء' },
  { value: 'grandchild', label: 'الأحفاد' },
  { value: 'child_spouse', label: 'أزواج الأبناء' },
];

export const SERVICE_STATUSES = [
  { value: 'active', label: 'بالخدمة' },
  { value: 'retired', label: 'بالمعاش' },
  { value: 'transferred', label: 'منقول' },
  { value: 'deceased', label: 'متوفي' },
  { value: 'martyr', label: 'شهيد' },
  { value: 'recalled', label: 'مستدعي' },
];

export const WEAPON_TYPES = [
  { value: 'infantry', label: 'مشاة' },
  { value: 'other', label: 'سلاح آخر' },
];

export const RANKS = [
  { value: 'ملازم', label: 'ملازم' },
  { value: 'ملازم أول', label: 'ملازم أول' },
  { value: 'نقيب', label: 'نقيب' },
  { value: 'رائد', label: 'رائد' },
  { value: 'مقدم', label: 'مقدم' },
  { value: 'عقيد', label: 'عقيد' },
  { value: 'عميد', label: 'عميد' },
  { value: 'لواء', label: 'لواء' },
  { value: 'فريق', label: 'فريق' },
  { value: 'فريق أول', label: 'فريق أول' },
  { value: 'مشير', label: 'مشير' },
  { value: 'وكيل وزارة', label: 'وكيل وزارة' },
  { value: 'وكيل أول وزارة', label: 'وكيل أول وزارة' }
];

export const SUBSCRIPTION_STATUSES = [
  { value: 'active', label: 'نشط', color: '#28a745' },
  { value: 'expired', label: 'منتهي', color: '#dc3545' },
  { value: 'suspended', label: 'موقوف', color: '#ffc107' },
];

export const CARD_STATUSES = [
  { value: 'active', label: 'نشط', color: '#28a745' },
  { value: 'revoked', label: 'ملغي', color: '#dc3545' },
  { value: 'expired', label: 'منتهي', color: '#6c757d' },
];

// =====================
// Card Writer Device API (via Laravel)
// =====================

/**
 * Get card serial ID (UID) from NFC reader via Laravel
 * @param {string} serialId - Optional serial ID to query
 * @returns {Promise} Response with card information
 */
export async function getCardSerialId(serialId = null) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/cards/serial-id`, {
      serial_id: serialId || '',
    }, {
      headers: getHeaders(),
      timeout: 30000, // 30 seconds timeout
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Read card from NFC reader and get membership ID
 * @returns {Promise} Response with membership ID and officer data
 */
export async function readCardAndGetMembershipId() {
  try {
    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/membership-cards/cards/read-membership-id`,
      {},
      {
        headers: getHeaders(),
        timeout: 30000, // 30 seconds timeout
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Write data to NFC card via Laravel
 * @param {string} cardToken - Card UID/token
 * @param {string} dataHex - Data in hex format (32 chars = 16 bytes)
 * @param {number} block - Block number (default: 4)
 * @returns {Promise} Response from write operation
 */
export async function writeCardData(cardToken, dataHex, block = 4) {
  try {
    const res = await axios.post(`${API_ENDPOINT}/api/v1/membership-cards/cards/write`, {
      card_token: cardToken,
      data: dataHex,
      block: block,
    }, {
      headers: getHeaders(),
      timeout: 60000, // 60 seconds timeout for write operation
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export const BENEFICIARY_TYPES = [
  { value: 'officer', label: 'ضابط' },
  { value: 'spouse', label: 'زوجة' },
  { value: 'child_under_21', label: 'ابن تحت 21 سنة' },
  { value: 'child_graduate', label: 'ابن خريج' },
  { value: 'parent', label: 'أب / أم' },
  { value: 'grandchild_6_10', label: 'حفيد (6-10 سنوات)' },
  { value: 'grandchild_11_19', label: 'حفيد (11-19 سنة)' },
  { value: 'grandchild_20_plus', label: 'حفيد (20+ سنة)' },
  { value: 'child_spouse', label: 'زوج / زوجة الابن' },
];

// =====================
// Attachments API
// =====================

/**
 * Get all attachments for an officer
 */
export async function getOfficerAttachments(officerId) {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/membership-cards/officers/${officerId}/attachments`,
      { headers: getHeaders() }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Upload attachment for an officer
 */
export async function uploadOfficerAttachment(officerId, file, description = null) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/membership-cards/officers/${officerId}/attachments`,
      formData,
      {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all attachments for a beneficiary
 */
export async function getBeneficiaryAttachments(officerId, beneficiaryId) {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/membership-cards/officers/${officerId}/beneficiaries/${beneficiaryId}/attachments`,
      { headers: getHeaders() }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Upload attachment for a beneficiary
 */
export async function uploadBeneficiaryAttachment(officerId, beneficiaryId, file, description = null) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const res = await axios.post(
      `${API_ENDPOINT}/api/v1/membership-cards/officers/${officerId}/beneficiaries/${beneficiaryId}/attachments`,
      formData,
      {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get a single attachment by ID
 */
export async function getAttachment(id) {
  try {
    const res = await axios.get(
      `${API_ENDPOINT}/api/v1/membership-cards/attachments/${id}`,
      { headers: getHeaders() }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Update attachment description
 */
export async function updateAttachment(id, description) {
  try {
    const res = await axios.put(
      `${API_ENDPOINT}/api/v1/membership-cards/attachments/${id}`,
      { description },
      { headers: getHeaders() }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(id) {
  try {
    const res = await axios.delete(
      `${API_ENDPOINT}/api/v1/membership-cards/attachments/${id}`,
      { headers: getHeaders() }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}




