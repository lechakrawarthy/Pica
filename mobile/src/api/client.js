import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

const getApiBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    const hostUri = Constants.expoConfig?.hostUri || "";
    const lanHost = hostUri.split(":")[0];
    if (lanHost && lanHost !== "localhost" && lanHost !== "127.0.0.1") {
        return `http://${lanHost}:5000/api`;
    }

    if (Platform.OS === "android") {
        return "http://10.0.2.2:5000/api";
    }

    return "http://localhost:5000/api";
};

export const API_BASE_URL = getApiBaseUrl();

export const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});
