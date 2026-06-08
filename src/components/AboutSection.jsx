import React from "react";

const ABOUT_TEXT = `Em Sarj is a Ghanaian streetwear fashion brand, founded by two young brothers. The brand began gaining popularity among students in high schools and university colleges, particularly at the University of Mines and Technology (UMaT). From its humble beginnings, Em Sarj quickly built a loyal following within its local community and gradually expanded its reach across the region.

The brand's unique identity and standout designs soon caught the attention of several celebrities and musicians in Ghana. Notable figures such as Kweku Smoke, Black Sherif (BLACKO), Beeztrap, Bigg Paradise and Joey B have endorsed Em Sarj, further elevating its reputation. One of its iconic moments was when its hoodie and jogger pieces were featured on stage at Kweku Smoke's REVIVAL CONCERT in Accra at Ghud Park on the 18th of December 2024, worn by Bigg Paradise for the stage opening of Kweku Smoke’s entry.

Em Sarj is also recognized for its bold OG Trucker caps, A-Town Struggle T-shirt, ladies' crop tops with daring slogans like "I ONLY ACCEPT APOLOGIES IN CASH," and other distinct apparel that resonates with youth culture.

Rooted in inspiration from art, fashion, music, nature, and diverse cultures, Em Sarj aims to create pieces that reflect the energy and spirit of the youth. The brand's mission is to showcase the beauty and diversity of the world through fashion, making it a promising force in Ghana's streetwear industry.`;

export default function AboutSection() {
  return (
    <section className="emsarj-about">
      <div className="emsarj-about-inner">
        <h2 className="emsarj-about-title">About Em Sarj</h2>
        <p className="emsarj-about-text">{ABOUT_TEXT}</p>
      </div>
    </section>
  );
}

