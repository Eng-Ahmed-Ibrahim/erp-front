import axios from "axios";
import { API_ENDPOINT } from "../../config";
const Token = localStorage.getItem("token") || sessionStorage.getItem("token");

const AUDIT_API = `${API_ENDPOINT}/api/v1/audit-logs`;

export const getAuditLogs = async (filters = {}) => {
  try {
    const response = await axios.get(AUDIT_API, {
      params: filters,
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
};

export const getAuditLogDetails = async (id) => {
  try {
    const response = await axios.get(`${AUDIT_API}/${id}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching audit log details:", error);
    throw error;
  }
};

export const getModelAudit = async (modelType, modelId) => {
  try {
    const response = await axios.get(
      `${AUDIT_API}/model/${modelType}/${modelId}`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching model audit:", error);
    throw error;
  }
};

export const getModelTypes = async () => {
  try {
    const response = await axios.get(`${AUDIT_API}/types`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching model types:", error);
    throw error;
  }
};

export const getActions = async () => {
  try {
    const response = await axios.get(`${AUDIT_API}/actions`, {
      headers: {
        Authorization: `Bearer ${Token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching actions:", error);
    throw error;
  }
};



export const getAuditStatistics = async () => {
  try {

    return [];
  } catch (error) {
    console.error("Error fetching actions:", error);
    throw error;
  }
};
