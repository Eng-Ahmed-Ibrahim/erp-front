import {
    useQuery
} from '@tanstack/react-query'
import axios from 'axios';
import { API_ENDPOINT } from "../../../../config";




export const fetchRelatedProducts = async ({ recipeId }) => {
    const Token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await axios.get(`${API_ENDPOINT}/api/v1/store/recipe/products/${recipeId}`, {
        headers: {
            Authorization: `Bearer ${Token}`,
        },
    });
    return response.data.data;
};

const useRelatedProducts = ({ recipeId }) => {
    return useQuery({
        queryKey: ['related-products'],
        queryFn: async () => await fetchRelatedProducts({ recipeId }),
    });
};

export default useRelatedProducts;