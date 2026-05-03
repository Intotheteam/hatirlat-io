import axios from "axios";
import type { CreditTransaction } from "@/types";

// Use relative URL so the Next.js proxy handles the request (same-origin = cookie sent automatically)
const API_URL = "/api/credits";

export const creditService = {
    getBalance: async (): Promise<number> => {
        const response = await axios.get(`${API_URL}/balance`, { withCredentials: true });
        return response.data.credits;
    },

    getHistory: async (): Promise<CreditTransaction[]> => {
        const response = await axios.get(`${API_URL}/history`, { withCredentials: true });
        return response.data;
    },

    addCredits: async (amount: number): Promise<{ message: string }> => {
        const response = await axios.post(
            `${API_URL}/add`,
            { amount },
            { withCredentials: true }
        );
        return response.data;
    },

    useCredits: async (amount: number): Promise<{ message: string }> => {
        const response = await axios.post(
            `${API_URL}/use`,
            { amount },
            { withCredentials: true }
        );
        return response.data;
    },
};
