import axios from "axios";
import { authService } from "./authService";
import type { CreditTransaction } from "@/types";

const API_URL = "http://localhost:8080/api/credits";

const getHeaders = () => {
    const token = authService.getToken();
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

export const creditService = {
    getBalance: async (): Promise<number> => {
        const response = await axios.get(`${API_URL}/balance`, { headers: getHeaders() });
        return response.data.credits;
    },

    getHistory: async (): Promise<CreditTransaction[]> => {
        const response = await axios.get(`${API_URL}/history`, { headers: getHeaders() });
        return response.data;
    },

    addCredits: async (amount: number): Promise<{ message: string }> => {
        const response = await axios.post(
            `${API_URL}/add`,
            { amount },
            { headers: getHeaders() }
        );
        return response.data;
    },

    useCredits: async (amount: number): Promise<{ message: string }> => {
        const response = await axios.post(
            `${API_URL}/use`,
            { amount },
            { headers: getHeaders() }
        );
        return response.data;
    },
};
