import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../cartContext/cartprovider";
import supabase from "../supabasefol/supabaseClient";
import TopNav from "../components/common/TopNav";


const DELIVERY_FEE = 50;

async function insertOrder({ first_name, last_name, phone, total_amount }) {
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
      payment_reference: null,
    })
    .select()
    .single();

  if (error) throw new Error(`Order insert failed: ${error.message}`);
  return data;
}

async function insertOrderItems(orderItems) {
  const { data, error } = await supabase
    .from("orderItems")
    .insert(orderItems)
    .select();

  if (error) throw new Error(`Order items insert failed: ${error.message}`);
  return data;
}

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
      const order = await insertOrder({
        first_name:   form.firstName.trim(),
        last_name:    form.lastName.trim(),
        phone:        form.phone.trim(),
        total_amount: total,
      });

      const rows = [];
      cartItems.forEach((item) => {
        const activeSizes = selectedSizes[item.id] || [];

        if (activeSizes.length > 0) {
          activeSizes.forEach((size) => {
            const qty = sizeQtys[item.id]?.[size] ?? 1;
            rows.push({
              order_id:     order.id,
              product_name: item.name,
              size,
              quantity:     qty,
            });
          });
        } else {
          rows.push({
            order_id:     order.id,
            product_name: item.name,
            size:         null,
            quantity:     1,
          });
        }
      });

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

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, clearCart } = useCart();

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/");
    }
  }, [cartItems, navigate]);

  const [selectedSizes, setSelectedSizes]       = useState({});
  const [sizeQtys, setSizeQtys]                 = useState({});
  const [focusedSize, setFocusedSize]           = useState({});
  const [sizeError, setSizeError]               = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  // Get the first cart item's image for the left side
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
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div className="cart-split-layout">
        {/* Left side - Product Image */}
        <div className="cart-image-side">
          {mainImage && (
            <img src={mainImage} alt="Product" className="cart-main-image" />
          )}
        </div>

        {/* Right side - Cart Content */}
        <div className="cart-content-side">
          <header className="cart-header-split">
            <div className="cart-header-top">
              <span className="cart-continue-link-split" onClick={() => navigate("/")}>Continue shopping →</span>
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

                          {activeSizes.length === 0 && (
                            <span className="cart-item-stock-split">Last 1 left</span>
                          )}

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

                {/* Payment Summary */}
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

                  <button
                    className="cart-payout-btn-split"
                    onClick={handlePayout}
                    disabled={cartItems.length === 0}
                  >
                    Pay out
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