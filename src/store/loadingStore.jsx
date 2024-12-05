import { create } from 'zustand'

const useGeneralLoading = create((set) => ({
    generalLoading: false,
    setGeneralLoading: (loading) => set({ isLoading: loading }),
}));

export default useGeneralLoading;
