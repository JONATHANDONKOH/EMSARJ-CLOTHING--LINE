// src/services/exchangeRateApi.js
import axios from "axios";

const API_KEY = process.env.REACT_APP_EXCHANGE_API_KEY; // store in .env
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest`;

export const getExchangeRate = async (base = "USD") => {
  try {
    const response = await axios.get(`${BASE_URL}/${base}`);
    return response.data.conversion_rates; // object with all rates
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return null;
  }
};
