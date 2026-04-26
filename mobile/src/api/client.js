import axios from "axios";

export const API_BASE_URL = "http://10.0.2.2:5000/api";

export const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});
