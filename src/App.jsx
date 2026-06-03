import "./App.css";
import { Routes, Route } from "react-router-dom";

import SignIn from "./pages/SignIn";
import Signup from "./pages/register";
import CategoryFront from "./pages/CategoryFront";
import CategoryPage from "./pages/categoryPage"; // ✅ ADD THIS
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/cart";

import TopNav from "./components/common/TopNav";
import AutoPlayAudio from "./components/common/AutoPlayAudio";
import { CartProvider } from "./cartContext/cartprovider";

function App() {
  return (
    <CartProvider>
      <AutoPlayAudio src="/Lil Baby x Gunna - Drip Too Hard (Official Audio).mp3" />
      <TopNav />

      <Routes>
        <Route path="/" element={<CategoryFront />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cart" element={<Cart />} />

        {/* ✅ FIX: THIS WAS MISSING */}
        <Route path="/category/:id" element={<CategoryPage />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
