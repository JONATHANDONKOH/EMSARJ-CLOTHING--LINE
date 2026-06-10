import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../cartContext/cartprovider";
import supabase from "../supabasefol/supabaseClient";

const DELIVERY_FEE = 50;


// ─── INSERT: orders table ─────────────────────────────────────
// Columns: user_id · status · total_amount · payment_reference
// NOTE: your form collects first_name, last_name, phone
// Add those 3 columns to your orders table in Supabase so they save too.
// SQL:
//   ALTER TABLE orders ADD COLUMN first_name text;
//   ALTER TABLE orders ADD COLUMN last_name  text;
//   ALTER TABLE orders ADD COLUMN phone      text;

async function insertOrder({ first_name, last_name, phone, total_amount }) {
  // Get logged-in user (null if not using Auth yet — guest checkout)
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id:           user?.id ?? null,
      first_name,
      last_name,
      phone,
      total_amount,
      status:            "pending",
      payment_reference: null,       // Paystack fills this later
    })
    .select()
    .single();

  if (error) throw new Error(`Order insert failed: ${error.message}`);
  return data;   // data.id is the order_id we pass to orderItems
}

// ─── INSERT: orderItems table ─────────────────────────────────
// Columns: order_id · product_name · size · quantity · created_at

async function insertOrderItems(orderItems) {
  const { data, error } = await supabase
    .from("orderItems")
    .insert(orderItems)
    .select();

  if (error) throw new Error(`Order items insert failed: ${error.message}`);
  return data;
}

// ─── UTILITIES ────────────────────────────────────────────────

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

// ─── PAYMENT MODAL ────────────────────────────────────────────

function PaymentModal({ cartItems, selectedSizes, sizeQtys, subtotal, total, onClose, onSuccess }) {
  const [form, setForm]     = useState({ firstName: "", lastName: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!form.phone.trim())     e.phone     = "Required";
    return e;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // ── Step 1: Insert into orders → get back order.id ──────
      const order = await insertOrder({
        first_name:   form.firstName.trim(),
        last_name:    form.lastName.trim(),
        phone:        form.phone.trim(),
        total_amount: total,
      });

      // ── Step 2: Build orderItems rows using order.id ─────────
      const rows = [];
      cartItems.forEach((item) => {
        const activeSizes = selectedSizes[item.id] || [];

        if (activeSizes.length > 0) {
          activeSizes.forEach((size) => {
            const qty = sizeQtys[item.id]?.[size] ?? 1;
            rows.push({
              order_id:     order.id,       // ← links to the order
              product_name: item.name,
              size,
              quantity:     qty,
            });
          });
        } else {
          // No size selected — still saves the item
          rows.push({
            order_id:     order.id,
            product_name: item.name,
            size:         null,
            quantity:     1,
          });
        }
      });

      // ── Step 3: Insert all orderItems at once ────────────────
      await insertOrderItems(rows);

      console.log("✅ Order saved. ID:", order.id);
      setDone(true);
      setTimeout(() => { onSuccess(); }, 2200);

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

        {done ? (
          <div className="pm-success">
            <div className="pm-success-icon">✓</div>
            <p className="pm-success-title">Order placed!</p>
            <p className="pm-success-sub">Your order has been saved. We'll be in touch shortly.</p>
          </div>
        ) : (
          <div className="pm-body">

            {/* ── Customer details form ── */}
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

            {/* ── Order summary ── */}
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

        {!done && (
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

// ─── CART COMPONENT ───────────────────────────────────────────

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, clearCart } = useCart();

  // Redirect to home if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/");
    }
  }, [cartItems, navigate]);

  // Fetch recommended products
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, image_url, categories(name)")
        .limit(6);
      
      if (!error && data) {
        setRecommendedProducts(data);
      }
      setLoadingProducts(false);
    }
    fetchProducts();
  }, []);

  const [selectedSizes, setSelectedSizes]       = useState({});
  const [sizeQtys, setSizeQtys]                 = useState({});
  const [focusedSize, setFocusedSize]           = useState({});
  const [sizeError, setSizeError]               = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

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

  function handlePayout() {
    const errors = {};
    cartItems.forEach((item) => {
      if ((selectedSizes[item.id] || []).length === 0) errors[item.id] = true;
    });
    if (Object.keys(errors).length > 0) { setSizeError(errors); return; }
    setShowPaymentModal(true);
  }

  function handlePaymentSuccess() {
    setShowPaymentModal(false);
    clearCart();
    navigate("/");
  }

  return (
    <div className="cart-page">

      {showPaymentModal && (
        <PaymentModal
          cartItems={cartItems}
          selectedSizes={selectedSizes}
          sizeQtys={sizeQtys}
          subtotal={subtotal}
          total={total}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <header className="cart-header" />

      <main className="cart-body">
        <section className="cart-left">
          <div className="cart-left-top">
            <h2 className="cart-section-title">Your Cart</h2>
            <span className="cart-continue-link" onClick={() => navigate("/")}>Continue shopping</span>
          </div>

          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <p>Your wardrobe is empty.</p>
              <button className="cart-shop-btn" onClick={() => navigate("/")}>Start shopping</button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const sizes       = parseSizes(item?.sizes);
                const activeSizes = selectedSizes[item.id] || [];
                const focused     = focusedSize[item.id];
                const currentQty  = focused ? (sizeQtys[item.id]?.[focused] ?? 1) : 1;

                return (
                  <div className="cart-item-card" key={item.id}>
                    <div className="cart-item-img-wrap">
                      <img className="cart-item-img" src={item.image} alt={item.name} />
                    </div>

                    <div className="cart-item-info">
                      <span className="cart-item-tag">New trend</span>
                      <p className="cart-item-brand">Emsarj</p>
                      <p className="cart-item-name">{item.name}</p>

                      {activeSizes.length === 0 && (
                        <span className="cart-item-stock">Last 1 left</span>
                      )}

                      <div className="cart-size-section">
                        <p className="cart-size-heading">
                          Size
                          {focused && <span className="cart-size-chosen">&nbsp;—&nbsp;editing {focused}</span>}
                        </p>
                        <div className="cart-size-chips">
                          {sizes.length > 0 ? (
                            sizes.map((s) => (
                              <button
                                key={s}
                                className={`cart-size-chip${activeSizes.includes(s) ? " cart-size-chip--active" : ""}${focused === s ? " cart-size-chip--focused" : ""}`}
                                onClick={() => handleSizeToggle(item.id, s)}
                              >
                                {s}
                                {activeSizes.includes(s) && (sizeQtys[item.id]?.[s] ?? 1) > 1 && (
                                  <span className="cart-chip-qty">&nbsp;{sizeQtys[item.id][s]}</span>
                                )}
                              </button>
                            ))
                          ) : (
                            <span className="cart-size-na">One size</span>
                          )}
                        </div>
                        {sizeError[item.id] && (
                          <p className="cart-size-error">⚠ Please select a size</p>
                        )}
                      </div>

                      <div className="cart-qty-row">
                        <span className="cart-qty-label">Qty{focused ? ` (${focused})` : ""}</span>
                        <button className="cart-qty-btn" onClick={() => handleQtyChange(item.id, -1)}>−</button>
                        <span className="cart-qty-num">{currentQty}</span>
                        <button className="cart-qty-btn" onClick={() => handleQtyChange(item.id, +1)}>+</button>
                      </div>
                    </div>

                    <div className="cart-item-meta">
                      <p className="cart-item-price">Ghc {item.price * getItemTotalQty(item.id)}</p>
                      <button className="cart-remove-btn" onClick={() => removeFromCart(item.id, item.selectedSize)}>
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}

              {cartItems.length > 1 && (
                <button className="cart-clear-btn" onClick={clearCart}>Clear wardrobe</button>
              )}
            </div>
          )}
        </section>

        <aside className="cart-right">
          <h3 className="cart-payment-title">Payment</h3>

          <div className="cart-summary-rows">
            <div className="cart-summary-row"><span>Subtotal</span><span>Ghc {subtotal}</span></div>
            <div className="cart-summary-row"><span>Delivery</span><span>Ghc {cartItems.length > 0 ? DELIVERY_FEE : 0}</span></div>
            <div className="cart-summary-divider" />
            <div className="cart-summary-row cart-summary-total"><span>Total</span><span>Ghc {total}</span></div>
          </div>

          {cartItems.length > 0 && (
            <div className="cart-order-summary">
              <p className="cart-order-summary-title">Your order</p>
              {cartItems.map((item) => {
                const activeSizes = selectedSizes[item.id] || [];
                return (
                  <div key={item.id}>
                    {activeSizes.length > 0 ? (
                      activeSizes.map((size) => {
                        const qty = sizeQtys[item.id]?.[size] ?? 1;
                        return (
                          <div className="cart-order-row" key={`${item.id}-${size}`}>
                            <span className="cart-order-name">{item.name}</span>
                            <span className="cart-order-size">
                              <strong>{size}</strong>
                              {qty > 1 && <strong className="cart-order-qty">&nbsp;×{qty}</strong>}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="cart-order-row">
                        <span className="cart-order-name">{item.name}</span>
                        <span className="cart-order-no-size">No size selected</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button
            className="cart-payout-btn"
            onClick={handlePayout}
            disabled={cartItems.length === 0}
          >
            Pay out
          </button>

          {Object.values(sizeError).some(Boolean) && (
            <p className="cart-payout-error">Please select a size for every item before paying.</p>
          )}
        </aside>
      </main>

      {/* ── Recommended Products Section ── */}
      {cartItems.length > 0 && (
        <section className="cart-recommendations">
          <h2 className="cart-recommendations-title">Shop More Dresses</h2>
          <div className="cart-recommendations-grid">
            {loadingProducts ? (
              <p style={{ textAlign: "center", color: "#666" }}>Loading products...</p>
            ) : recommendedProducts.length === 0 ? (
              <p style={{ textAlign: "center", color: "#666" }}>No products available</p>
            ) : (
              recommendedProducts.map((product) => (
                <div key={product.id} className="cart-product-card">
                  <div className="cart-product-img-wrap">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} />
                    ) : (
                      <div className="cart-product-img-placeholder">No Image</div>
                    )}
                  </div>
                  <p className="cart-product-name">{product.name}</p>
                  <p className="cart-product-price">Ghc {product.price}</p>
                  <button 
                    className="cart-product-btn"
                    onClick={() => navigate("/")}
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}