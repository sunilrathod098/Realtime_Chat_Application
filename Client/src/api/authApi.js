import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (userData) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    localStorage.setItem("token", response.data.token);
    return response.data;
};
