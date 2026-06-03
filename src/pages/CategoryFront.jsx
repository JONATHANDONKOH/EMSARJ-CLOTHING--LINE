import React from "react";
import emmy from "../assets/emmy.png";
import CategoryCard from "../components/categorycard";

export default function CategoryFront() {
  return (
    <div className="category-front">

      <div className="category-card-wrapper">
        <CategoryCard />
      </div>
    </div>
  );
}