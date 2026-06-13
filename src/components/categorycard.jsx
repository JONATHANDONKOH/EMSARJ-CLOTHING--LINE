import React, { useEffect, useState, useRef } from "react";
import supabase from "../supabasefol/supabaseClient";
import { useCart } from "../cartContext/cartprovider";
import WishlistHeartButton from "../ui/WishlistHeartButton";

import girlscrop from "../assets/girlscrop.png";
import tshirt    from "../assets/Tshirt-1-removebg-preview.png";
import short     from "../assets/SHORT-1-removebg-preview.png";
import caps      from "../assets/CAPS-1-removebg-preview.png";

import hoodies from "../assets/hoodies_front.png";
import jersey  from "../assets/jersey-em.png";
import capred  from "../assets/capred.png";
import sheedy  from "../assets/sheedy.png";

import boysdark from "../assets/boysdark.jpg";
import twogirl  from "../assets/twogirl.jpg";
import tallni   from "../assets/basketball-pic.png";
import run      from "../assets/run.jpg";

const ROW2_IMAGES = [
  { src: boysdark, alt: "boys dark" },
  { src: twogirl,  alt: "two girls" },
  { src: tallni,   alt: "basketball" },
  { src: run,      alt: "run" },
];

/* =====================================================================
   MOBILE AUTO-PLAY CAROUSEL
   ===================================================================== */
function Row2MobileCarousel() {
  const [cur, setCur]   = useState(0);
  const [prev, setPrev] = useState(null);
  const [anim, setAnim] = useState("idle");
  const autoRef         = useRef(null);
  const total           = ROW2_IMAGES.length;

  function goTo(next) {
    if (next === cur) return;
    setPrev(cur);
    setAnim("exiting");
    setTimeout(() => {
      setCur(next);
      setAnim("entering");
      setTimeout(() => setAnim("idle"), 500);
    }, 350);
  }

  function startAuto() {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setCur(c => {
        const next = (c + 1) % total;
        setPrev(c);
        setAnim("entering");
        setTimeout(() => setAnim("idle"), 500);
        return next;
      });
    }, 3000);
  }

  useEffect(() => {
    startAuto();
    return () => clearInterval(autoRef.current);
  }, []);

  function slideClass(i) {
    const base = "row2-carousel-slide";
    if (i === cur  && anim === "entering") return `${base} ${base}--entering`;
    if (i === cur  && anim === "idle")     return `${base} ${base}--active`;
    if (i === prev && anim === "exiting")  return `${base} ${base}--exiting`;
    if (i === cur  && anim === "exiting")  return `${base} ${base}--active`;
    return base;
  }

  return (
    <div className="row2-carousel">
      <div className="row2-carousel-stage">
        {ROW2_IMAGES.map((img, i) => (
          <div key={i} className={slideClass(i)}>
            <img src={img.src} alt={img.alt} className="row2-carousel-img" />
          </div>
        ))}
      </div>
      <div className="row2-carousel-dots">
        {ROW2_IMAGES.map((_, i) => (
          <button
            key={i}
            className={`row2-carousel-dot${i === cur ? " row2-carousel-dot--active" : ""}`}
            onClick={() => {
              clearInterval(autoRef.current);
              goTo(i);
              startAuto();
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* =====================================================================
   HELPERS
   ===================================================================== */
function mergeWithFallback(backendItems, fallbackItems) {
  return Array.from({ length: 4 }, (_, i) => ({
    isBackend: !!backendItems[i],
    ...(backendItems[i] || fallbackItems[i]),
  }));
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return supabase.storage
    .from("product-images")
    .getPublicUrl(imageUrl).data.publicUrl;
}

/* =====================================================================
   MAIN COMPONENT
   ===================================================================== */
export default function CategoryCard() {
  const { addToCart, cartItems } = useCart();
  const [products, setProducts]  = useState([]);
  const [isMobile, setIsMobile]  = useState(window.innerWidth <= 600);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("❌ Fetch error:", error.message); return; }
    setProducts(data || []);
  }

  useEffect(() => { fetchProducts(); }, []);

  // Handle window resize to toggle between desktop and mobile views
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fallbackRow1 = [
    { name: "Ladies crop",     price: 200, image: girlscrop },
    { name: "Classic T-Shirt", price: 150, image: tshirt    },
    { name: "Shorts",          price: 120, image: short     },
    { name: "Caps",            price: 80,  image: caps      },
  ];
  const fallbackRow3 = [
    { name: "Hoodies",  price: 250, image: hoodies },
    { name: "Jersey",   price: 180, image: jersey  },
    { name: "Cap Red",  price: 90,  image: capred  },
    { name: "Sheedy",   price: 130, image: sheedy  },
  ];
  const fallbackRow4 = [
    { name: "Classic T-Shirt", price: 150, image: tshirt  },
    { name: "Shorts",          price: 120, image: short   },
    { name: "Hoodies",         price: 250, image: hoodies },
    { name: "Jersey",          price: 180, image: jersey  },
  ];
  const fallbackRow5 = [
    { name: "Ladies crop", price: 200, image: girlscrop },
    { name: "Cap Red",     price: 90,  image: capred    },
    { name: "Caps",        price: 80,  image: caps      },
    { name: "Sheedy",      price: 130, image: sheedy    },
  ];
  const fallbackRow6 = [
    { name: "Hoodies",         price: 250, image: hoodies   },
    { name: "Classic T-Shirt", price: 150, image: tshirt    },
    { name: "Ladies crop",     price: 200, image: girlscrop },
    { name: "Shorts",          price: 120, image: short     },
  ];
  const fallbackRow7 = [
    { name: "Jersey",  price: 180, image: jersey  },
    { name: "Caps",    price: 80,  image: caps    },
    { name: "Cap Red", price: 90,  image: capred  },
    { name: "Sheedy",  price: 130, image: sheedy  },
  ];

  const row1 = products.slice(0,  4);
  const row3 = products.slice(4,  8);
  const row4 = products.slice(8,  12);
  const row5 = products.slice(12, 16);
  const row6 = products.slice(16, 20);
  const row7 = products.slice(20, 24);

  function isInCart(id) {
    return cartItems.some(item => item.id === id);
  }

  function renderCard(product, index, fallbackRow) {
    const id           = product.id ?? `${product.name}-${index}`;
    const alreadyAdded = isInCart(id);

    const wishlistProduct = {
      id,
      name: product.name,
      price: product.price,
      image_url: product.isBackend
        ? resolveImageUrl(product.image_url)
        : fallbackRow[index].image,
    };

    return (
      <div className="card" key={id}>
        <div className="card-img-wrap">
          <WishlistHeartButton product={wishlistProduct} />
          <img
            className="girlscrop"
            src={
              product.isBackend && product.image_url
                ? resolveImageUrl(product.image_url)
                : fallbackRow[index].image
            }
            onError={e => { e.target.src = fallbackRow[index].image; }}
            alt={product.name}
          />

          <button
            className={`card-hover-btn${alreadyAdded ? " card-hover-btn--added" : ""}`}
            onClick={() => {
              if (alreadyAdded) return;
              addToCart({
                id,
                name:  product.name,
                price: product.price,
                image: product.isBackend
                  ? resolveImageUrl(product.image_url)
                  : fallbackRow[index].image,
                sizes: product.sizes,
              });
            }}
          >
            {alreadyAdded ? "✓ In wardrobe" : "Add to wardrobe"}
          </button>
        </div>
        <div className="card-info">
          <span className="card-season-tag">New Trend</span>
          <p className="card-name">{product.name}</p>
          <p className="card-price">Ghc {product.price}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── ROW 1 ── */}
      <div className="card-container">
        {mergeWithFallback(row1, fallbackRow1).map((p, i) => renderCard(p, i, fallbackRow1))}
      </div>

      {/* ── ROW 2 — Conditionally render based on screen size ── */}
      {!isMobile ? (
        /* Desktop/Tablet: 4 side-by-side lifestyle images */
        <div className="card-container card-container--row2 row2-desktop-only row2-images-only">
          <div className="card card--img-only">
            <img className="card-fullimg" alt="boys dark" src={boysdark} />
          </div>
          <div className="card card--img-only">
            <img className="card-fullimg" alt="two girls" src={twogirl} />
          </div>
          <div className="card card--img-only">
            <img className="card-fullimg" alt="basketball" src={tallni} />
          </div>
          <div className="card card--img-only">
            <img className="card-fullimg" alt="run" src={run} />
          </div>
        </div>
      ) : (
        /* Mobile ONLY: auto-play carousel */
        <div className="row2-mobile-only">
          <Row2MobileCarousel />
        </div>
      )}

      {/* ── ROW 3 ── */}
      <div className="card-container card-container--row3">
        {mergeWithFallback(row3, fallbackRow3).map((p, i) => renderCard(p, i, fallbackRow3))}
      </div>

      {/* ── ROW 4 ── */}
      <div className="card-container card-container--row4">
        {mergeWithFallback(row4, fallbackRow4).map((p, i) => renderCard(p, i, fallbackRow4))}
      </div>

      {/* ── ROW 5 ── */}
      <div className="card-container card-container--row5">
        {mergeWithFallback(row5, fallbackRow5).map((p, i) => renderCard(p, i, fallbackRow5))}
      </div>

      {/* ── ROW 6 ── */}
      <div className="card-container card-container--row6">
        {mergeWithFallback(row6, fallbackRow6).map((p, i) => renderCard(p, i, fallbackRow6))}
      </div>

      {/* ── ROW 7 ── */}
      <div className="card-container card-container--row7">
        {mergeWithFallback(row7, fallbackRow7).map((p, i) => renderCard(p, i, fallbackRow7))}
      </div>
    </>
  );
}