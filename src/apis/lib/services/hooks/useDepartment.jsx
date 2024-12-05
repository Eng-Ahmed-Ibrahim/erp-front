import {
    useQuery
} from '@tanstack/react-query'
import axios from 'axios';
import { API_ENDPOINT } from "../../../../config";




const fetchDepartments = async () => {
    const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await axios.get(`${API_ENDPOINT}/api/v1/store/department`, {
        headers: {
            Authorization: `Bearer ${Token}`,
        },
    });
    return response.data.data;
};

const useDepartments = () => {
    return useQuery({
        queryKey: ['departments'],
        queryFn: fetchDepartments,
    });
};

export default useDepartments;