import {
    useQuery
} from '@tanstack/react-query'
import axios from 'axios';
import { API_ENDPOINT } from "../../../../config";




const fetchCashiers = async () => {
    const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await axios.get(`${API_ENDPOINT}/api/v1/shifts/cashiers`, {
        headers: {
            Authorization: `Bearer ${Token}`,
        },
    });
    return response.data.data;
};

const useCashiers = () => {
    return useQuery({
        queryKey: ['cashier'],
        queryFn: fetchCashiers,
    });
};

export default useCashiers;