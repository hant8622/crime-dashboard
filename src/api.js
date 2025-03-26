import axios from "axios";

const API_BASE_URL = "http://localhost:5050"; // Change this when deploying

export const login = async (username, password) => {
    const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
    localStorage.setItem("token", response.data.access_token);
};

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Session expired. Please log in again.");
        window.location.reload(); 
        return {};
    }
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchCrimeHeatmap = async (queryParams = "") => {
    try {
        const response = await axios.get(`${API_BASE_URL}/crime-heatmap?${queryParams}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching crime heatmap:", error);
        return null;
    }
};

export const fetchCrimeTrends = async (queryParams = "") => {
    try {
        const response = await axios.get(`${API_BASE_URL}/crime-trends?${queryParams}`); 
        return response.data;
    } catch (error) {
        console.error("Error fetching crime trends:", error);
        return null;
    }
};

export const fetchMostAffectedDistricts = async (queryParams = "") => {
    try {
        const response = await axios.get(`${API_BASE_URL}/most-districts?${queryParams}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching most affected districts:", error);
        return null;
    }
};

export const fetchCrimeType = async (queryParams = "") => {
    try {
        const response = await axios.get(`${API_BASE_URL}/crime-distribution?${queryParams}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching crime distribution:", error);
        return null;
    }
};

export const fetchCrimeRateChange = async () => {
    const response = await axios.get(`${API_BASE_URL}/crime-rate-change`);
    return response.data;
};

export async function fetchFilters() {
    const res = await fetch("http://127.0.0.1:5050/api/filters");
    return res.json();
}
