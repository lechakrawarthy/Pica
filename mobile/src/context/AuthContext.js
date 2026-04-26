import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { client } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        const loadSession = async () => {
            try {
                const rawSession = await AsyncStorage.getItem("session");
                if (rawSession) {
                    const parsed = JSON.parse(rawSession);
                    setUser(parsed.user);
                    setToken(parsed.token);
                }
            } catch (error) {
                setAuthError("Failed to restore session");
            } finally {
                setLoading(false);
            }
        };

        loadSession();
    }, []);

    useEffect(() => {
        if (token) {
            client.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            delete client.defaults.headers.common.Authorization;
        }
    }, [token]);

    const persistSession = async (session) => {
        await AsyncStorage.setItem("session", JSON.stringify(session));
    };

    const clearSession = async () => {
        await AsyncStorage.removeItem("session");
    };

    const register = async ({ name, email, password }) => {
        setAuthError(null);
        const response = await client.post("/auth/register", { name, email, password });
        const nextSession = {
            user: {
                _id: response.data._id,
                name: response.data.name,
                email: response.data.email,
            },
            token: response.data.token,
        };

        setUser(nextSession.user);
        setToken(nextSession.token);
        await persistSession(nextSession);
    };

    const login = async ({ email, password }) => {
        setAuthError(null);
        const response = await client.post("/auth/login", { email, password });
        const nextSession = {
            user: {
                _id: response.data._id,
                name: response.data.name,
                email: response.data.email,
            },
            token: response.data.token,
        };

        setUser(nextSession.user);
        setToken(nextSession.token);
        await persistSession(nextSession);
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        await clearSession();
    };

    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            authError,
            register,
            login,
            logout,
        }),
        [user, token, loading, authError]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
