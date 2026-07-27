import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../cartContext/cartprovider";
import { useAuth } from "../context/authContext";
import TopNav from "../components/common/TopNav";

const DELIVERY_FEE = 45;
const API_URL = import.meta.env.VITE_UPLOAD_API_URL || "https://emsarj-clothing-line.onrender.com";

// ── Express/Neon helpers ─────────────────────────────────────────────────

// Creates the order AND its items in one call — the backend runs both
// inserts in a single transaction (see OrdersController.createOrder).
async function createOrder({ first_name, last_name, phone_number, email, subtotal, items, token }) {
  if (!token) throw new Error("You must be signed in to place an order.");

  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ first_name, last_name, email, phone_number, subtotal, items }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Order insert failed");
  return data; // { id, ..., total, items }
}

// ── Ask the backend to open a Paystack transaction. The backend recomputes
// the amount from the order it just created — the frontend never sends or
// trusts a total here, and the secret key never touches the browser.
// Returns { authorization_url, reference }.
async function initializePayment(orderId, token) {
  if (!token) throw new Error("Unauthorized.");

  const res = await fetch(`${API_URL}/payments/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.authorization_url) {
    throw new Error(data.error || "Could not start payment.");
  }
  return data; // { authorization_url, reference }
}

// ── Utilities ───────────────────────────────────────────────────────────────

function parseSizes(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

// ── PaymentModal ─────────────────────────────────────────────────────────────

function PaymentModal({ cartItems, selectedSizes, sizeQtys, subtotal, total, onClose }) {
  const { session } = useAuth();
  const [form, setForm]       = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!form.phone.trim())     e.phone     = "Required";
    if (!form.email.trim())     e.email     = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    return e;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // ── Layer 2: safety net session check ──
    if (!session) {
      setErrors({ submit: "Session expired. Please sign in again." });
      return;
    }

    setLoading(true);
    try {
      // Build order items (product_id required for the products(id) FK)
      const items = [];
      cartItems.forEach((item) => {
        const activeSizes = selectedSizes[item.id] || [];
        if (activeSizes.length > 0) {
          activeSizes.forEach((size) => {
            const qty = sizeQtys[item.id]?.[size] ?? 1;
            items.push({
              product_id:   item.id,
              product_name: item.name,
              size,
              qty,
              price:        item.price * qty,
            });
          });
        } else {
          items.push({
            product_id:   item.id,
            product_name: item.name,
            size:         null,
            qty:          1,
            price:        item.price,
          });
        }
      });

      // 1. Create order + items (pending) — server computes the real total
      const order = await createOrder({
        first_name:   form.firstName.trim(),
        last_name:    form.lastName.trim(),
        email:        form.email.trim(),
        phone_number: form.phone.trim(),
        subtotal,
        items,
        token: session.access_token,
      });

      // 2. Ask backend to open a Paystack transaction for that order.
      //    The backend fetches the order server-side and calculates the
      //    amount itself — nothing payment-related is sent from here.
      //    The backend's callback_url already embeds this order's id
      //    (?orderId=...), so /payment-success can pick it back up —
      //    nothing needs to be stashed client-side for that handoff.
      const { authorization_url } = await initializePayment(order.id, session.access_token);

      // 3. Hand off to Paystack's hosted checkout page.
      setRedirecting(true);
      window.location.href = authorization_url;

    } catch (err) {
      console.error(err);
      setErrors({ submit: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="pm-overlay"
      onClick={(e) => { if (e.target.classList.contains("pm-overlay")) onClose(); }}
    >
      <div className="pm-modal">

        <div className="pm-header">
          <div>
            <span className="pm-header-label">CHECKOUT</span>
            <h2 className="pm-header-title">Complete your order</h2>
          </div>
          <button className="pm-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {redirecting ? (
          <div className="pm-success">
            <div className="pm-spinner" />
            <p className="pm-success-title">Taking you to Paystack…</p>
            <p className="pm-success-sub">Hang tight, don't close this tab.</p>
          </div>
        ) : (
          <div className="pm-body">

            <div className="pm-form-col">
              <p className="pm-section-label">Customer details</p>

              <div className="pm-row2">
                <div className="pm-field">
                  <label className="pm-label">First name</label>
                  <input
                    className={`pm-input${errors.firstName ? " pm-input--err" : ""}`}
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Kwame"
                  />
                  {errors.firstName && <span className="pm-err">{errors.firstName}</span>}
                </div>
                <div className="pm-field">
                  <label className="pm-label">Last name</label>
                  <input
                    className={`pm-input${errors.lastName ? " pm-input--err" : ""}`}
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Mensah"
                  />
                  {errors.lastName && <span className="pm-err">{errors.lastName}</span>}
                </div>
              </div>

              <div className="pm-field">
                <label className="pm-label">Email</label>
                <input
                  className={`pm-input${errors.email ? " pm-input--err" : ""}`}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="kwame@example.com"
                />
                {errors.email && <span className="pm-err">{errors.email}</span>}
              </div>

              <div className="pm-field">
                <label className="pm-label">Phone number</label>
                <input
                  className={`pm-input${errors.phone ? " pm-input--err" : ""}`}
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+233 XX XXX XXXX"
                />
                {errors.phone && <span className="pm-err">{errors.phone}</span>}
              </div>

              {errors.submit && (
                <div className="pm-submit-err">{errors.submit}</div>
              )}
            </div>

            <div className="pm-summary-col">
              <p className="pm-section-label">Order summary</p>

              <div className="pm-items">
                {cartItems.map((item) => {
                  const activeSizes = selectedSizes[item.id] || [];
                  return activeSizes.map((size) => {
                    const qty = sizeQtys[item.id]?.[size] ?? 1;
                    return (
                      <div className="pm-item-row" key={`${item.id}-${size}`}>
                        <img className="pm-item-img" src={item.image} alt={item.name} />
                        <div className="pm-item-info">
                          <p className="pm-item-name">{item.name}</p>
                          <p className="pm-item-meta">
                            Size: <strong>{size}</strong> · Qty: {qty}
                          </p>
                        </div>
                        <p className="pm-item-price">Ghc {item.price * qty}</p>
                      </div>
                    );
                  });
                })}
              </div>

              <div className="pm-totals">
                <div className="pm-total-row">
                  <span>Subtotal</span><span>Ghc {subtotal}</span>
                </div>
                <div className="pm-total-row">
                  <span>Delivery</span><span>Ghc {DELIVERY_FEE}</span>
                </div>
                <div className="pm-total-row pm-grand-total">
                  <span>Total</span><span>Ghc {total}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!redirecting && (
          <div className="pm-footer">
            <button
              className={`pm-pay-btn${loading ? " pm-pay-btn--loading" : ""}`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <span className="pm-spinner" /> : <>🔒 Pay Ghc {total}</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Cart ─────────────────────────────────────────────────────────────────────

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { session } = useAuth();

  React.useEffect(() => {
    if (cartItems.length === 0) navigate("/");
  }, [cartItems, navigate]);

  const [selectedSizes, setSelectedSizes]       = useState({});
  const [sizeQtys, setSizeQtys]                 = useState({});
  const [focusedSize, setFocusedSize]           = useState({});
  const [sizeError, setSizeError]               = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [authError, setAuthError]               = useState("");
  const [payoutLoading, setPayoutLoading]       = useState(false);

  function getItemTotalQty(itemId) {
    const qtys  = sizeQtys[itemId] || {};
    const total = Object.values(qtys).reduce((s, q) => s + q, 0);
    return total || 1;
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * getItemTotalQty(item.id), 0
  );
  const total = subtotal + (cartItems.length > 0 ? DELIVERY_FEE : 0);

  function handleSizeToggle(itemId, size) {
    const currentSizes    = selectedSizes[itemId] || [];
    const alreadySelected = currentSizes.includes(size);

    if (alreadySelected) {
      const updated = currentSizes.filter((s) => s !== size);
      setSelectedSizes((prev) => ({ ...prev, [itemId]: updated }));
      setSizeQtys((prev) => {
        const copy = { ...(prev[itemId] || {}) };
        delete copy[size];
        return { ...prev, [itemId]: copy };
      });
      setFocusedSize((prev) => ({ ...prev, [itemId]: updated[updated.length - 1] || null }));
    } else {
      const updated = [...currentSizes, size];
      setSelectedSizes((prev) => ({ ...prev, [itemId]: updated }));
      setSizeQtys((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), [size]: 1 } }));
      setFocusedSize((prev) => ({ ...prev, [itemId]: size }));
    }
    setSizeError((prev) => ({ ...prev, [itemId]: false }));
  }

  function handleQtyChange(itemId, delta) {
    const focused = focusedSize[itemId];
    if (!focused) return;
    setSizeQtys((prev) => {
      const current = prev[itemId]?.[focused] ?? 1;
      const next    = Math.max(1, current + delta);
      return { ...prev, [itemId]: { ...(prev[itemId] || {}), [focused]: next } };
    });
  }

  async function handlePayout() {
    setAuthError("");

    // 1. Check sizes
    const errors = {};
    cartItems.forEach((item) => {
      if ((selectedSizes[item.id] || []).length === 0) errors[item.id] = true;
    });
    if (Object.keys(errors).length > 0) { setSizeError(errors); return; }

    // 2. Check live session
    setPayoutLoading(true);
    setPayoutLoading(false);

    if (!session) {
      setAuthError("You must be signed in to place an order.");
      return;
    }

    // 3. Open modal
    setShowPaymentModal(true);
  }

  const mainImage = cartItems.length > 0 ? cartItems[0].image : null;

  return (
    <div className="cart-page">
      <TopNav />

      {showPaymentModal && (
        <PaymentModal
          cartItems={cartItems}
          selectedSizes={selectedSizes}
          sizeQtys={sizeQtys}
          subtotal={subtotal}
          total={total}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      <div className="cart-split-layout">
        <div className="cart-image-side">
          {mainImage && <img src={mainImage} alt="Product" className="cart-main-image" />}
        </div>

        <div className="cart-content-side">
          <header className="cart-header-split">
            <div className="cart-header-top">
              <span className="cart-continue-link-split" onClick={() => navigate("/")}>
                Continue shopping →
              </span>
            </div>
          </header>

          <main className="cart-body-split">
            {cartItems.length === 0 ? (
              <div className="cart-empty-split">
                <p>Your wardrobe is empty.</p>
                <button className="cart-shop-btn-split" onClick={() => navigate("/")}>Start shopping</button>
              </div>
            ) : (
              <>
                <div className="cart-items-list-split">
                  {cartItems.map((item) => {
                    const sizes       = parseSizes(item?.sizes);
                    const activeSizes = selectedSizes[item.id] || [];
                    const focused     = focusedSize[item.id];
                    const currentQty  = focused ? (sizeQtys[item.id]?.[focused] ?? 1) : 1;

                    return (
                      <div className="cart-item-card-split" key={item.id}>
                        <div className="cart-item-img-wrap-split">
                          <img className="cart-item-img-split" src={item.image} alt={item.name} />
                        </div>

                        <div className="cart-item-info-split">
                          <span className="cart-item-tag-split">New trend</span>
                          <p className="cart-item-brand-split">Emsarj</p>
                          <p className="cart-item-name-split">{item.name}</p>

                          <div className="cart-size-section-split">
                            <p className="cart-size-heading-split">
                              Size
                              {focused && <span className="cart-size-chosen-split">&nbsp;—&nbsp;editing {focused}</span>}
                            </p>
                            <div className="cart-size-chips-split">
                              {sizes.length > 0 ? (
                                sizes.map((s) => (
                                  <button
                                    key={s}
                                    className={`cart-size-chip-split${activeSizes.includes(s) ? " cart-size-chip--active-split" : ""}${focused === s ? " cart-size-chip--focused-split" : ""}`}
                                    onClick={() => handleSizeToggle(item.id, s)}
                                  >
                                    {s}
                                    {activeSizes.includes(s) && (sizeQtys[item.id]?.[s] ?? 1) > 1 && (
                                      <span className="cart-chip-qty-split">&nbsp;{sizeQtys[item.id][s]}</span>
                                    )}
                                  </button>
                                ))
                              ) : (
                                <span className="cart-size-na-split">One size</span>
                              )}
                            </div>
                            {sizeError[item.id] && (
                              <p className="cart-size-error-split">⚠ Please select a size</p>
                            )}
                          </div>

                          <div className="cart-qty-row-split">
                            <span className="cart-qty-label-split">Qty{focused ? ` (${focused})` : ""}</span>
                            <button className="cart-qty-btn-split" onClick={() => handleQtyChange(item.id, -1)}>−</button>
                            <span className="cart-qty-num-split">{currentQty}</span>
                            <button className="cart-qty-btn-split" onClick={() => handleQtyChange(item.id, +1)}>+</button>
                          </div>
                        </div>

                        <div className="cart-item-meta-split">
                          <p className="cart-item-price-split">Ghc {item.price * getItemTotalQty(item.id)}</p>
                          <button className="cart-remove-btn-split" onClick={() => removeFromCart(item.id, item.selectedSize)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {cartItems.length > 1 && (
                    <button className="cart-clear-btn-split" onClick={clearCart}>Clear wardrobe</button>
                  )}
                </div>

                <aside className="cart-right-split">
                  <h3 className="cart-payment-title-split">Payment</h3>

                  <div className="cart-summary-rows-split">
                    <div className="cart-summary-row-split"><span>Subtotal</span><span>Ghc {subtotal}</span></div>
                    <div className="cart-summary-row-split"><span>Delivery</span><span>Ghc {cartItems.length > 0 ? DELIVERY_FEE : 0}</span></div>
                    <div className="cart-summary-divider-split" />
                    <div className="cart-summary-row-split cart-summary-total-split"><span>Total</span><span>Ghc {total}</span></div>
                  </div>

                  {cartItems.length > 0 && (
                    <div className="cart-order-summary-split">
                      <p className="cart-order-summary-title-split">Your order</p>
                      {cartItems.map((item) => {
                        const activeSizes = selectedSizes[item.id] || [];
                        return (
                          <div key={item.id}>
                            {activeSizes.length > 0 ? (
                              activeSizes.map((size) => {
                                const qty = sizeQtys[item.id]?.[size] ?? 1;
                                return (
                                  <div className="cart-order-row-split" key={`${item.id}-${size}`}>
                                    <span className="cart-order-name-split">{item.name}</span>
                                    <span className="cart-order-size-split">
                                      <strong>{size}</strong>
                                      {qty > 1 && <strong className="cart-order-qty-split">&nbsp;×{qty}</strong>}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="cart-order-row-split">
                                <span className="cart-order-name-split">{item.name}</span>
                                <span className="cart-order-no-size-split">No size selected</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Auth error message ── */}
                  {authError && (
                    <div style={{
                      margin: "12px 0",
                      padding: "12px 14px",
                      background: "#fff0f0",
                      border: "1px solid #fca5a5",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "#b91c1c",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}>
                      <span>⚠ {authError}</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => navigate("/signin", { state: { from: "/cart" } })}
                          style={{
                            flex: 1, padding: "8px",
                            background: "#111", color: "#fff",
                            border: "none", borderRadius: "6px",
                            fontSize: "13px", fontWeight: 600, cursor: "pointer",
                          }}
                        >Sign In</button>
                        <button
                          onClick={() => navigate("/signup", { state: { from: "/cart" } })}
                          style={{
                            flex: 1, padding: "8px",
                            background: "transparent", color: "#111",
                            border: "1px solid #111", borderRadius: "6px",
                            fontSize: "13px", fontWeight: 600, cursor: "pointer",
                          }}
                        >Register</button>
                      </div>
                    </div>
                  )}

                  <button
                    className="cart-payout-btn-split"
                    onClick={handlePayout}
                    disabled={cartItems.length === 0 || payoutLoading}
                  >
                    {payoutLoading ? "Checking…" : "Pay out"}
                  </button>

                  {Object.values(sizeError).some(Boolean) && (
                    <p className="cart-payout-error-split">Please select a size for every item before paying.</p>
                  )}
                </aside>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}