import React, { useEffect, useState } from "react";
import "../App.css";
import supabase from "../supabasefol/supabaseClient";

// fallback images — Row 1
import girlscrop from "../assets/girlscrop.png";
import tshirt from "../assets/Tshirt-1-removebg-preview.png";
import short from "../assets/SHORT-1-removebg-preview.png";
import caps from "../assets/CAPS-1-removebg-preview.png";

// fallback images — Row 3
import hoodies from "../assets/hoodies_front.png";
import jersey from "../assets/jersey-em.png";
import capred from "../assets/capred.png";
import sheedy from "../assets/sheedy.png";

import emmy from "../assets/emmy.png";
import boysdark from "../assets/boysdark.jpg";
import twogirl from "../assets/twogirl.jpg";
import tallni from "../assets/basketball-pic.png";
import run from "../assets/run.jpg";

// Always fills 4 slots — backend first, mock for the rest
function mergeWithFallback(backendItems, fallbackItems) {
  return Array.from({ length: 4 }, (_, i) => ({
    isBackend: !!backendItems[i],
    ...(backendItems[i] || fallbackItems[i]),
  }));
}

// ✅ Safely resolves image URL — handles full URLs and storage paths
function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl; // already a full URL
  return supabase.storage
    .from("product-images")
    .getPublicUrl(imageUrl).data.publicUrl;
}

export default function CategoryCard() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Fetch error:", error.message);
      return;
    }

    console.log("✅ Products from DB:", data);
    setProducts(data || []);
  }

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

  const row1 = products.slice(0, 4);
  const row3 = products.slice(4, 8);

  return (
    <>
      {/* ── HEADER ── */}
      <div className="category-front">
        <p className="discription">
          Buy from Emsarj and refresh your style effortlessly
        </p>

        <div className="header-row">
          <ul className="gendergories">
            <li className="cart-di">Shirt</li>
            <li className="cart-di">Pants</li>
            <li className="cart-di">Sweater</li>
            <li className="cart-di">caps</li>
            <li className="cart-di">Trousers</li>
          </ul>

          <img className="emmy-img" src={emmy} alt="emmy" />

          <input
            className="cartsearch"
            type="text"
            placeholder="search your style..."
          />
        </div>
      </div>

      {/* ── ROW 1 (BACKEND + FALLBACK, always 4 slots) ── */}
      <div className="card-container">
        {mergeWithFallback(row1, fallbackRow1).map((product, index) => (
          <div className="card" key={product.id || index}>
            <img
              className="girlscrop"
              src={
                product.isBackend && product.image_url
                  ? resolveImageUrl(product.image_url)  // ✅ fixed
                  : fallbackRow1[index].image
              }
              onError={(e) => {
                e.target.src = fallbackRow1[index].image;
              }}
              alt={product.name}
            />
            <div className="brand">Emsarj</div>
            <div className="nametype">{product.name}</div>
            <div className="emmyprice">ghc {product.price}</div>
            <button className="addtocart">Add to wardrobe</button>
          </div>
        ))}
      </div>

      {/* ── SECTION HEADER ── */}
      <div className="section-divider">
        <h2 className="section-heading">Shop from Em Sarj</h2>
      </div>

      {/* ── ROW 2 (FULL-BLEED IMAGES, unchanged) ── */}
      <div className="card-container card-container--row2">
        <div className="card card--img-only">
          <img className="card-fullimg" alt="boys dark" src={boysdark} />
        </div>
        <div className="card card--img-only">
          <img className="card-fullimg" alt="two girl" src={twogirl} />
        </div>
        <div className="card card--img-only">
          <img className="card-fullimg" alt="tallni" src={tallni} />
        </div>
        <div className="card card--img-only">
          <img className="card-fullimg" alt="run" src={run} />
        </div>
      </div>

      {/* ── ROW 3 (BACKEND + FALLBACK, always 4 slots) ── */}
      <div className="card-container card-container--row3">
        {mergeWithFallback(row3, fallbackRow3).map((product, index) => (
          <div className="card" key={product.id || index}>
            <img
              className="girlscrop"
              src={
                product.isBackend && product.image_url
                  ? resolveImageUrl(product.image_url)  // ✅ fixed
                  : fallbackRow3[index].image
              }
              onError={(e) => {
                e.target.src = fallbackRow3[index].image;
              }}
              alt={product.name}
            />
            <div className="brand">Emsarj</div>
            <div className="nametype">{product.name}</div>
            <div className="emmyprice">ghc {product.price}</div>
            <button className="addtocart">Add to wardrobe</button>
          </div>
        ))}
      </div>
    </>
  );
}