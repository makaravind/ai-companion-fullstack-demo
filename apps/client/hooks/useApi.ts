"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useApi = () => {
    const { getToken } = useAuth();

    const get = useCallback(async (url: string) => {
        const token = await getToken();
        const response = await fetch(`${API_URL}${url}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return await response.json();
    }, [getToken]);

    const post = useCallback(async (url: string, body: any) => {
        const token = await getToken();
        const response = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        return await response.json();
    }, [getToken]);

    return { get, post };
}; 