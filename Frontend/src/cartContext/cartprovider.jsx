import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // ADD TO CART
  function addToCart(product) {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.id === product.id &&
          item.selectedSize === product.selectedSize
      );

      // IF ITEM ALREADY EXISTS
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id &&
          item.selectedSize === product.selectedSize
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      // ADD NEW ITEM
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  // REMOVE FROM CART
  function removeFromCart(id, selectedSize) {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === id &&
            item.selectedSize === selectedSize
          )
      )
    );
  }

  // CLEAR CART
  function clearCart() {
    setCartItems([]);
  }

  // INCREMENT QUANTITY
  function increaseQuantity(id, selectedSize) {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id &&
        item.selectedSize === selectedSize
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  // DECREMENT QUANTITY
  function decreaseQuantity(id, selectedSize) {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id &&
        item.selectedSize === selectedSize
          ? {
              ...item,
              quantity:
                item.quantity > 1
                  ? item.quantity - 1
                  : 1,
            }
          : item
      )
    );
  }

  // UPDATE QUANTITY DIRECTLY
  function updateQuantity(id, selectedSize, newQuantity) {
    if (newQuantity < 1) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id &&
        item.selectedSize === selectedSize
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item
      )
    );
  }

  // TOTAL CART COUNT
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // TOTAL PRICE
  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}