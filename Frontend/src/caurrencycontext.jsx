import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// ✅ ExchangeRate-API endpoint
const API_URL = `https://v6.exchangerate-api.com/v6/YOUR-API-KEY/latest/USD`;

const getExchangeRate = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.conversion_rates; // contains { GHS: <rate>, EUR: <rate>, ... }
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
};

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD'); // 'USD' or 'GHS'
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setLoading(true);
        const rates = await getExchangeRate();
        if (rates && rates.GHS) {
          setRate(rates.GHS);
          setError(null);
        } else {
          setError('Failed to fetch exchange rate');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
    // Refresh rate every hour
    const interval = setInterval(fetchRate, 3600000);
    return () => clearInterval(interval);
  }, []);

  const convertPrice = (usdPrice) => {
    if (currency === 'USD') return usdPrice;
    if (!rate) return usdPrice;
    return usdPrice * rate;
  };

  const formatPrice = (usdPrice) => {
    const converted = convertPrice(usdPrice);
    if (currency === 'USD') {
      return `$${converted.toFixed(2)}`;
    } else {
      return `₵${converted.toFixed(2)}`;
    }
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'GHS' : 'USD');
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      rate,
      loading,
      error,
      convertPrice,
      formatPrice,
      toggleCurrency
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
