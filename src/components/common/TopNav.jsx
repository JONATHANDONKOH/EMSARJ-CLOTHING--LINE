import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../cartContext/cartprovider";
import supabase from "../../supabasefol/supabaseClient";
import emmy from "../../assets/emmy.png";
import ghanaFlag from "../../assets/ghana flag.jpg";
import SearchBar from "../../ui/searchbar";
import { useAuth } from "../../context/authContext";

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);


  const handleLogoClick = () => {
    if (location.pathname === "/cart" || location.pathname === "/cart/") {
      navigate("/");
    }
  };

  const marqueeRef  = useRef(null);
  const resumeTimer = useRef(null);
  const isDragging  = useRef(false);
  const dragStartX  = useRef(0);
  const scrollStart = useRef(0);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });
    if (error) { console.error("Failed to fetch categories:", error.message); return; }
    setCategories(data || []);
  }

  useEffect(() => {
    const id = setTimeout(() => {
      fetchCategories();
    }, 0);

    return () => {
      clearTimeout(id);
      clearTimeout(resumeTimer.current);
    };
  }, []);


  useEffect(() => {
    function onDocClick(e) {
      if (!profileMenuOpen) return;
      const wrap = profileMenuRef.current;
      if (!wrap) return;
      if (!wrap.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [profileMenuOpen]);



  const pauseMarquee = useCallback((delay = 3000) => {

    const el = marqueeRef.current;
    if (!el) return;
    el.style.animationPlayState = "paused";
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      if (!isDragging.current && el) el.style.animationPlayState = "running";
    }, delay);
  }, []);

  const handleMouseDown = useCallback((e) => {
    const nav = e.currentTarget;
    isDragging.current  = true;
    dragStartX.current  = e.pageX;
    scrollStart.current = nav.scrollLeft;
    pauseMarquee(4000);
    nav.style.cursor = "grabbing";
    function onMove(ev) {
      if (!isDragging.current) return;
      nav.scrollLeft = scrollStart.current - (ev.pageX - dragStartX.current);
    }
    function onUp() {
      isDragging.current = false;
      nav.style.cursor   = "grab";
      pauseMarquee(4000);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, [pauseMarquee]);

  const handleTouchStart = useCallback((e) => {
    isDragging.current  = true;
    dragStartX.current  = e.touches[0].pageX;
    scrollStart.current = e.currentTarget.scrollLeft;
    pauseMarquee(4000);
  }, [pauseMarquee]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current) return;
    e.currentTarget.scrollLeft =
      scrollStart.current - (e.touches[0].pageX - dragStartX.current);
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    pauseMarquee(4000);
  }, [pauseMarquee]);

  return (
    <header className="site-header">

      {/* Row 1 */}
      <div className="top-bar">

        <button className="hamburger-btn" aria-label="Open menu" onClick={() => setMobileMenuOpen(true)}>
          <span className={`hamburger-icon${mobileMenuOpen ? " open" : ""}`}>
            <span /><span /><span />
          </span>
        </button>

        {/* Mobile menu drawer */}
        <div className={`mobile-menu-drawer${mobileMenuOpen ? " mobile-menu-drawer--open" : ""}`} aria-hidden={!mobileMenuOpen}>
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-menu-content">

            <button className="mobile-menu-close-btn" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}>✕</button>

            {/* Auth items moved to profile dropdown */}
            <div className="mobile-menu-divider" />


            <div className="mobile-menu-categories">
              <div className="mobile-menu-section-title">Categories</div>
              {categories.length === 0 && (
                <div className="mobile-menu-cat-item" style={{ color: "#999", cursor: "default" }}>Loading...</div>
              )}
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="mobile-menu-cat-item"
                  onClick={() => { setMobileMenuOpen(false); navigate(`/category/${cat.id}`); }}
                >
                  {cat.name}
                </div>
              ))}
            </div>

          </div>
        </div>

        <div className="top-bar-spacer" />

        {/* Mobile search toggle */}
        <button className="mobile-search-toggle" aria-label="Toggle search" onClick={() => setMobileSearchOpen((o) => !o)}>
          {mobileSearchOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6"  x2="6"  y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
        </button>

        {/* Cart */}
        <button className="cart-icon-btn" aria-label={`View cart — ${cartCount} item${cartCount !== 1 ? "s" : ""}`} onClick={() => navigate("/cart")}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className={`cart-badge${cartCount === 0 ? " cart-badge--empty" : ""}`}>
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        </button>

        {/* Ghana flag */}
        <button className="country-flag-btn" aria-label="Ghana" onClick={() => { /* no-op */ }}>
          <img className="country-flag-img" src={ghanaFlag} alt="Ghana flag" />
        </button>

        {/* Profile */}
        <div className="profile-menu-wrap" ref={profileMenuRef}>
          <button
            className="profile-icon-btn"
            aria-label="Profile"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            onClick={() => setProfileMenuOpen((v) => !v)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          {profileMenuOpen && (
            <div className="profile-menu" role="menu">
              <>
                <div
                  className="profile-menu-item"
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate("/signin");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setProfileMenuOpen(false);
                      navigate("/signin");
                    }
                  }}
                >
                  Sign In
                </div>
                <div
                  className="profile-menu-item"
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate("/signup");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setProfileMenuOpen(false);
                      navigate("/signup");
                    }
                  }}
                >
                  Sign Up
                </div>
              </>

            </div>
          )}
        </div>


      </div>

      {/* Row 2: description / mobile search */}
      <div className="desc-bar">
        <p className="discription">
          <span className="mobile-only">
            <div style={{ width: "100%", padding: "0 10px" }}>
              <SearchBar />
            </div>
          </span>
        </p>
      </div>

      {/* Row 3: Logo + Search */}
      <div className="cat-nav">
        <div className="nav-spacer" />
        <div className="nav-logo" onClick={handleLogoClick} style={{ cursor: location.pathname === "/cart" ? "pointer" : "default" }}>
          <img className="emmy-img" src={emmy} alt="Emsarj logo" />
        </div>
        <div className="nav-search">
          <SearchBar />
        </div>
      </div>

      {/* Mobile search (inline under logo) */}
      {mobileSearchOpen && (
        <div className="mobile-search-inline">
          <SearchBar onSelect={() => setMobileSearchOpen(false)} />
        </div>
      )}


      {/* Row 4: Categories marquee */}
      <nav
        className="cat-nav-scroll"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <ul className="gendergories-scroll gendergories-scroll--animate" ref={marqueeRef}>
          {categories.length === 0 && (
            <li className="cat-flip-item" style={{ opacity: 1, transform: "none", padding: "10px 18px", color: "#888" }}>
              Loading...
            </li>
          )}
          {categories.length > 0 &&
            [...categories, ...categories].map((cat, idx) => (
              <li
                key={`${cat.id}-${idx}`}
                className="cat-flip-item cat-flip-item--visible"
                style={{ animationDelay: `${(idx % categories.length) * 0.06}s` }}
                onClick={() => navigate(`/category/${cat.id}`)}
              >
                {cat.name}
              </li>
            ))
          }
        </ul>
      </nav>

    </header>
  );
}