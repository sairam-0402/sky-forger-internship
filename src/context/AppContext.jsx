import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AppContext = createContext();

const API_BASE_URL = 'http://localhost:3001/api';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/me`);
          setUser(response.data);
          
          const notifs = await axios.get(`${API_BASE_URL}/students/notifications`);
          setNotifications(notifs.data);
        } catch (error) {
          console.error("Failed to load user session:", error);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token: userToken, user: userData } = response.data;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setNotifications([]);
  };

  const registerStudent = async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register-student`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed.');
    }
  };

  const registerRecruiter = async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register-recruiter`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed.');
    }
  };

  const triggerPasswordReset = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to send reset link.');
    }
  };

  const completePasswordReset = async (tokenParam, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { token: tokenParam, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to reset password.');
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/students/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markNotificationsRead = async () => {
    if (!token) return;
    try {
      await axios.put(`${API_BASE_URL}/students/notifications/read`);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark notifications read:", error);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      token,
      theme,
      notifications,
      loading,
      login,
      logout,
      registerStudent,
      registerRecruiter,
      triggerPasswordReset,
      completePasswordReset,
      toggleTheme,
      fetchNotifications,
      markNotificationsRead,
      API_BASE_URL
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
