import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';
import { API_ENDPOINT } from "../../../../config";
import useLoadingStore from '../../../store/loadingStore';
import { message } from 'antd';

// Async function to get shifts with optional query parameters
const getShifts = async (params) => {
    useLoadingStore.setState({ isGeneralLoading: true });
    try {
        const Token =
            localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await axios.get(`${API_ENDPOINT}/api/v1/shifts`, {
            headers: {
                Authorization: `Bearer ${Token}`,
            },
            params,
        });
        const result = response.data;
        return result.data;
    } catch (error) {
        useLoadingStore.setState({ isGeneralLoading: false });
        throw error;
    } finally {
        useLoadingStore.setState({ isGeneralLoading: false });
    }
};

// Async function to create a shift
const createShift = async ({
    user_id,
    start,
    end,
    department_id
}) => {
    useLoadingStore.setState({ isGeneralLoading: true });
    try {
        const response = await axios.post(`${API_ENDPOINT}/api/v1/shifts/create`, {
            user_id,
            start,
            end,
            department_id
        });
        return response.data;
    } catch (error) {
        useLoadingStore.setState({ isGeneralLoading: false });
        throw error;
    } finally {
        useLoadingStore.setState({ isGeneralLoading: false });
    }
};

// Async function to delete a shift
const deleteShift = async (shiftId) => {
    useLoadingStore.setState({ isGeneralLoading: true });
    try {
        const response = await axios.delete(`${API_ENDPOINT}/api/v1/shifts/delete/${shiftId}`);
        message.success('تم الحذف بنجاح');
        return response.data;
    } catch (error) {
        useLoadingStore.setState({ isGeneralLoading: false });
        throw error;
    } finally {
        useLoadingStore.setState({ isGeneralLoading: false });
    }
};

// Custom hook to manage shifts
const useShifts = (queryParams) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['shifts', queryParams],
        queryFn: () => getShifts(queryParams),
    });

    const mutation = useMutation({
        mutationFn: createShift,
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteShift,
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
        },
    });

    return {
        shifts: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        createShift: mutation.mutate,
        isCreating: mutation.isLoading,
        createError: mutation.error,
        createSuccess: mutation.isSuccess,
        deleteShift: deleteMutation.mutate,
        isDeleting: deleteMutation.isLoading,
        deleteError: deleteMutation.error,
        deleteSuccess: deleteMutation.isSuccess,
    };
};

export default useShifts;
