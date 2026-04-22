import { useState } from "react";
import "../App.css";
import { initialCategories } from "../constants";
import { Sidebar } from "../components/common/Sidebar";
import { MainContent } from "../components/MainContent";

export default function Dashboard() {
  const [categories, setCategories] = useState(initialCategories);
  const [activePage, setActivePage] = useState("categories");
  const [activeCategory, setActiveCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleManage(category) {
    setActiveCategory(category);
    setActivePage("category-products");
  }

  function handleBack() {
    setActiveCategory(null);
    setActivePage("categories");
  }

  function handleNavigate(page) {
    setActivePage(page);
    setActiveCategory(null);
  }

  const pageForNav = activePage === "category-products" ? "categories" : activePage;

  return (
    <div style={layoutStyle}>
      <Sidebar
        active={pageForNav}
        onChange={handleNavigate}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <MainContent
        activePage={activePage}
        activeCategory={activeCategory}
        categories={categories}
        setCategories={setCategories}
        onManage={handleManage}
        onBack={handleBack}
      />
    </div>
  );
}

const layoutStyle = {
  display: "flex",
  minHeight: "100vh",
  background: "#0f172a",
  fontFamily: "'Inter', system-ui, sans-serif",
};