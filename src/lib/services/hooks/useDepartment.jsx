import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_ENDPOINT } from "../../../../config";

const fetchDepartments = async (type) => {
  const Token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

    let url = `${API_ENDPOINT}/api/v1/store/department`;

    if (type) {
      url += `?section_id=${type}`;
    }

    
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${Token}`,
    },
  });
  return response.data.data;
};

const useDepartments = (type) => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: () => fetchDepartments(type),
    enabled: true,
  });
};

export default useDepartments;
