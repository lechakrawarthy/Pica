import { createContext, useContext, useMemo, useState } from "react";
import { client } from "../api/client";

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await client.get("/expenses");
            setExpenses(response.data || []);
        } catch (requestError) {
            setError(requestError?.response?.data?.message || "Failed to fetch expenses");
        } finally {
            setLoading(false);
        }
    };

    const addExpense = async (payload) => {
        const response = await client.post("/expenses", payload);
        setExpenses((prev) => [response.data, ...prev]);
        return response.data;
    };

    const updateExpense = async (id, payload) => {
        const response = await client.put(`/expenses/${id}`, payload);
        setExpenses((prev) => prev.map((item) => (item._id === id ? response.data : item)));
        return response.data;
    };

    const deleteExpense = async (id) => {
        await client.delete(`/expenses/${id}`);
        setExpenses((prev) => prev.filter((item) => item._id !== id));
    };

    const value = useMemo(
        () => ({
            expenses,
            loading,
            error,
            fetchExpenses,
            addExpense,
            updateExpense,
            deleteExpense,
        }),
        [expenses, loading, error]
    );

    return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};

export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (!context) {
        throw new Error("useExpenses must be used within ExpenseProvider");
    }
    return context;
};
