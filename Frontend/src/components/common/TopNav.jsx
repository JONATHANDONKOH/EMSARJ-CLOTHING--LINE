import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../cartContext/cartprovider";
import supabase from "../../supabasefol/supabaseClient";
import emmy from "../../assets/emmy.png";
import ghanaFlag from "../../assets/ghana flag.jpg";
import SearchBar from "../../ui/searchbar";
import { useAuth } from "../../context/authContext";
import { useWishlist } from "../../wishlistContext/wishlistprovider";

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, signOut } = useAuth();

  const [categories, setCategories] = useState([]);

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]     = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);


  const handleLogoClick = (e) => {
    // Always go back to the main page from any route.
    e?.preventDefault?.();
    e?.stopPropagation?.();
    navigate("/");
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

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <header className="site-header">

      {/* Row 1 */}
      <div className="top-bar">

        <button className="hamburger-btn" aria-label="Open menu" onClick={() => setMobileMenuOpen(true)}>
          <span className={`hamburger-icon${mobileMenuOpen ? " open" : ""}`}>
            <span /><span /><span />
          </span>
        </button>

        <div className="top-bar-spacer" />

        {/* Mobile search - show directly on small devices */}
        <div className="mobile-search-container">
          <SearchBar />
        </div>

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

        {/* Wishlist */}
        <button
          className="wishlist-icon-btn"
          aria-label={`View wishlist — ${wishlistCount} item${wishlistCount !== 1 ? "s" : ""}`}
          onClick={() => navigate("/wishlist")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className={`wishlist-badge${wishlistCount === 0 ? " wishlist-badge--empty" : ""}`}>
            {wishlistCount > 99 ? "99+" : wishlistCount}
          </span>
        </button>

        {/* Profile - hidden on mobile, shown on desktop */}
        <div className="profile-menu-wrap desktop-only" ref={profileMenuRef}>
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
              {user && user.role !== "admin" ? (
                <>
                  <div
                    className="profile-menu-item"
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate("/account");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setProfileMenuOpen(false);
                        navigate("/account");
                      }
                    }}
                  >
                    Account
                  </div>
                  <div
                    className="profile-menu-item"
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate("/orders");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setProfileMenuOpen(false);
                        navigate("/orders");
                      }
                    }}
                  >
                    Orders
                  </div>
                  <div
                    className="profile-menu-item"
                    role="menuitem"
                    tabIndex={0}
                    onClick={handleLogout}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleLogout();
                      }
                    }}
                  >
                    Logout
                  </div>
                </>
              ) : (
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
              )}
            </div>
          )}
        </div>

        {/* Mobile menu drawer */}
        <div className={`mobile-menu-drawer${mobileMenuOpen ? " mobile-menu-drawer--open" : ""}`} aria-hidden={!mobileMenuOpen}>
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-menu-content">

            <button className="mobile-menu-close-btn" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}>✕</button>

            <div className="mobile-menu-auth-section">
              {user && user.role !== "admin" ? (
                <>
                  <div
                    className="mobile-menu-auth-item"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/account");
                    }}
                  >
                    Account
                  </div>
                  <div
                    className="mobile-menu-auth-item"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/orders");
                    }}
                  >
                    Orders
                  </div>
                  <div
                    className="mobile-menu-auth-item mobile-menu-auth-item--logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="mobile-menu-auth-item"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/signin");
                    }}
                  >
                    Sign In
                  </div>
                  <div
                    className="mobile-menu-auth-item"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/signup");
                    }}
                  >
                    Sign Up
                  </div>
                </>
              )}
            </div>

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
      </div>

      {/* Row 2: Empty - kept for spacing */}
      <div className="desc-bar">
        {/* Intentionally empty */}
      </div>

      {/* Row 3: Logo on top, Search below */}
      <div className="cat-nav">
        <div className="nav-logo" onClick={handleLogoClick} style={{ cursor: location.pathname === "/cart" ? "pointer" : "default" }}>
          <img className="emmy-img" src={emmy} alt="Emsarj logo" />
        </div>
        <div className="nav-search">
          <SearchBar />
        </div>
      </div>

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