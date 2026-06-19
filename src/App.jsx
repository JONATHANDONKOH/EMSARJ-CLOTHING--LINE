import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./scrolltotop";


import SignIn from "./pages/SignIn";
import Signup from "./pages/register";
import CategoryFront from "./pages/CategoryFront";
import CategoryPage from "./pages/categoryPage";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/cart";
import Account from "./pages/accounts";
import Orders from "./pages/ordder";
import ResetPassword from "./pages/resetpassword";
import WishlistPage from "./pages/WishlistPage";
import Shop from "./pages/shop";

import TopNav from "./components/common/TopNav";
import EmsarjFooter from "./components/Emsarjfooter";
import AutoPlayAudio from "./components/common/AutoPlayAudio";
import { CartProvider } from "./cartContext/cartprovider";
import { WishlistProvider } from "./wishlistContext/wishlistprovider";

function AppContent() {
  const location = useLocation();
  const hideNav =
    location.pathname === "/signin" ||
    location.pathname === "/signup" ||
    location.pathname === "/dashboard" ||
    location.pathname === "/resetpassword" ||
    location.pathname === "/cart" ||
    location.pathname === "/shop";


  return (
    <div className="app-container">
      {/* ScrollToTop is placed here to trigger on route changes */}
      <ScrollToTop />

      {!hideNav && <TopNav />}

      <main className="app-content">
        <Routes>
          <Route path="/" element={<CategoryFront />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/shop" element={<Shop />} />
        </Routes>
      </main>

      {!hideNav && <EmsarjFooter />}
    </div>
  );
}

function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <AutoPlayAudio src="/Lil Baby x Gunna - Drip Too Hard (Official Audio).mp3" />
        <AppContent />
      </CartProvider>
    </WishlistProvider>
  );
}

export default App;