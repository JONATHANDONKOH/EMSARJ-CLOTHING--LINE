import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../cartContext/cartprovider";
import supabase from "../../supabasefol/supabaseClient";
import emmy from "../../assets/emmy.png";
import ghanaFlag from "../../assets/ghana flag.jpg";
import SearchBar from "../../ui/searchbar";

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const [categories, setCategories] = useState([]);

  /* ── mobile search drawer ── */
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  /* ── mobile menu drawer (auth links) ── */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* ── Logo click handler ── */
  const handleLogoClick = () => {
    if (location.pathname === "/cart" || location.pathname === "/cart/") {
      navigate("/");
    }
    // Do nothing if already on home page
  };


  /* ── marquee pause / resume refs ── */
  const marqueeRef  = useRef(null);
  const resumeTimer = useRef(null);
  const isDragging  = useRef(false);
  const dragStartX  = useRef(0);
  const scrollStart = useRef(0);

  useEffect(() => {
    fetchCategories();
    return () => clearTimeout(resumeTimer.current);
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to fetch categories:", error.message);
      return;
    }

    setCategories(data || []);
  }

  /* pause marquee; after `delay` ms of no interaction it resumes */
  const pauseMarquee = useCallback((delay = 3000) => {
    const el = marqueeRef.current;
    if (!el) return;
    el.style.animationPlayState = "paused";
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      if (!isDragging.current && el) {
        el.style.animationPlayState = "running";
      }
    }, delay);
  }, []);

  /* mouse drag-to-scroll */
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

  /* touch drag-to-scroll */
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

  /* duplicate cats for seamless loop */
  const loopedCats = [...categories, ...categories];

  return (
    <header className="site-header">

      {/* ── Row 1: Menu · [spacer] · mobile-toggle · Cart ── */}
      <div className="top-bar">

        {/* Left side: mobile menu */}
        <button
          className="hamburger-btn"
          aria-label="Open menu"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className={`hamburger-icon${mobileMenuOpen ? " open" : ""}`}>
            <span />
            <span />
            <span />
          </span>
        </button>

        {/* Mobile auth menu drawer */}
        <div
          className={`mobile-menu-drawer${mobileMenuOpen ? " mobile-menu-drawer--open" : ""}`}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-menu-content">
            {/* Close button */}
            <button
              className="mobile-menu-close"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "28px",
                cursor: "pointer",
                color: "#111",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
            <div className="mobile-menu-auth">
              <div
                className="mobile-menu-item"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/signin");
                }}
              >
                Sign In
              </div>
              <div
                className="mobile-menu-item"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/signup");
                }}
              >
                Sign Up
              </div>
            </div>
          </div>
        </div>

        {/* Desktop auth links (hidden on mobile) */}
        <div className="desktop-auth">
          <span className="nav-item" onClick={() => navigate("/signin")}>
            Sign In
          </span>
          <span className="nav-item" onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </div>

        {/* Push everything after this to the right */}
        <div className="top-bar-spacer" />

        {/* Mobile-only: search icon toggle */}
        <button
          className="mobile-search-toggle"
          aria-label="Toggle search"
          onClick={() => setMobileSearchOpen(o => !o)}
        >
          {mobileSearchOpen
            ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6"  x2="6"  y2="18" />
                <line x1="6"  y1="6"  x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )
          }
        </button>

        {/* Country flag (Ghana) beside Cart */}
        <button
          className="country-flag-btn"
          aria-label="Ghana"
          onClick={() => {}}
        >
          <img
            className="country-flag-img"
            src={ghanaFlag}
            alt="Ghana flag"
          />
        </button>

        {/* Cart — far right */}
        <button
          className="cart-icon-btn"
          aria-label={`View cart — ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
          onClick={() => navigate("/cart")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9"  cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>

          <span className={`cart-badge${cartCount === 0 ? " cart-badge--empty" : ""}`}>
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        </button>


      </div>

      {/* ── Row 2: Description ── */}
      <div className="desc-bar">
        <p className="discription">
          <span className="mobile-only">
            <div style={{ width: "100%", padding: "0 10px" }}>
              <SearchBar />
            </div>
          </span>
        </p>

      </div>


      {/* ── Row 3: [spacer] · Logo center · Search right ── */}
      <div className="cat-nav">

        {/* Left spacer to balance logo centering */}
        <div className="nav-spacer" />

        {/* Logo — absolutely centered */}
        <div className="nav-logo" onClick={handleLogoClick} style={{ cursor: location.pathname === "/cart" ? "pointer" : "default" }}>
          <img className="emmy-img" src={emmy} alt="Emsarj logo" />
        </div>

        {/* Search — right side */}
        <div className="nav-search">
          <SearchBar />
        </div>

      </div>

      {/* ── Mobile search drawer (slides open under Row 3) ── */}
      <div className={`mobile-search-drawer${mobileSearchOpen ? " mobile-search-drawer--open" : ""}`}>
        <div className="mobile-search-inner">
          <SearchBar onSelect={() => setMobileSearchOpen(false)} />
        </div>
      </div>

      {/* ── Row 4: Scrollable / marquee categories ── */}
      <nav
        className="cat-nav-scroll"
        onMouseEnter={() => pauseMarquee(3000)}
        onMouseLeave={() => pauseMarquee(1500)}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <ul
          ref={marqueeRef}
          className={`gendergories-scroll${categories.length > 0 ? " gendergories-scroll--animate" : ""}`}
        >
          {loopedCats.map((cat, i) => (
            <li
              key={`${cat.id}-${i}`}
              className={`cart-di cat-flip-item${categories.length > 0 ? " cat-flip-item--visible" : ""}`}
              style={{ animationDelay: `${(i % (categories.length || 1)) * 0.06}s` }}
              onClick={() => navigate(`/category/${cat.id}`)}
            >
              {cat.name}
            </li>
          ))}
        </ul>
      </nav>


    </header>
  );
}