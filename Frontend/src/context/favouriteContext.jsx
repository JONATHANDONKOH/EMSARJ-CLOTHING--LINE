import React, { createContext, useState, useContext } from 'react';

// Create a Context to share favorites across the app
const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // SENDER ACTION: receives product data from ProductCard
  const addToFavorites = (product) => {
    setFavorites((prev) => {
      // prevent duplicates
      if (prev.find((item) => item.name === product.name)) return prev;
      return [...prev, product]; // store product object (including image)
    });
  };

  const removeFromFavorites = (id) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  // Custom hook to use the FavoritesContext
  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook to use favorites anywhere
export const useFavorites = () => useContext(FavoritesContext);
