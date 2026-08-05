import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../cartContext/cartprovider";
import { useAuth } from "../context/authContext";
import TopNav from "../components/common/TopNav";

const API_URL = import.meta.env.VITE_UPLOAD_API_URL || "https://emsarj-clothing-line.onrender.com";

async function verifyPayment(orderId, reference) {
  const res = await fetch(`${API_URL}/payments/verify/${orderId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ reference }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || data.message || "Payment verification failed.");
  }
  return data;
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const { clearCart } = useCart();

  const [status, setStatus]     = useState("verifying"); // verifying | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    if (session === undefined) return; // auth context still resolving

    const orderId   = searchParams.get("orderId");
    const reference = searchParams.get("reference") || searchParams.get("trxref");

    if (!orderId || !reference) {
      ranRef.current = true;
      setStatus("error");
      setErrorMsg("We couldn't find your order details. If you were charged, contact support with your payment reference.");
      return;
    }

    if (!session) {
      ranRef.current = true;
      setStatus("error");
      setErrorMsg("Your session expired before we could confirm payment. Please sign in and check your orders.");
      return;
    }

    ranRef.current = true;
    verifyPayment(orderId, reference)
      .then(() => {
        clearCart();
        setStatus("success");
        setTimeout(() => {
          navigate("/order-success", { state: { orderId } });
        }, 1800);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err.message || "Something went wrong while confirming your payment.");
      });
  }, [session, searchParams, navigate, clearCart]);

  return (
    <div className="cart-page">
      <TopNav />
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 20px",
          gap: "16px",
        }}
      >
        {status === "verifying" && (
          <>
            <div className="pm-spinner" />
            <p>Confirming your payment…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="pm-success-icon">✓</div>
            <p className="pm-success-title">Payment confirmed!</p>
            <p className="pm-success-sub">Redirecting you to your order…</p>
          </>
        )}
        {status === "error" && (
          <>
            <p style={{ color: "#b91c1c", fontWeight: 600 }}>⚠ {errorMsg}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => navigate("/orders")}
                style={{ padding: "10px 16px", background: "#111", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
              >
                View my orders
              </button>
              <button
                onClick={() => navigate("/")}
                style={{ padding: "10px 16px", background: "transparent", color: "#111", border: "1px solid #111", borderRadius: "6px", cursor: "pointer" }}
              >
                Back to shop
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}