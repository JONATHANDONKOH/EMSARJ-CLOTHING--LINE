import { CategoriesView } from "./categories/CategoriesView";
import { ProductsView } from "./products/ProductsView";
import { AllProductsView } from "./products/ProductCard";
import OrdersView from "./orders/OrdersView";
import { UsersView } from "./users/UsersView";
import { PaymentsView } from "./payments/PaymentsView";

export function MainContent({ 
  activePage, 
  activeCategory, 
  categories, 
  setCategories, 
  onManage, 
  onBack,
  user 
}) {
  // Sync activeCategory with categories array
  const syncedCategory = activeCategory
    ? categories.find(c => c.id === activeCategory.id) || activeCategory
    : null;

  const renderPage = () => {
    switch (activePage) {
      case "categories":
        return (
          <CategoriesView
            categories={categories}
            setCategories={setCategories}
            onManage={onManage}
          />
        );

      case "category-products":
        return syncedCategory ? (
          <ProductsView
            category={syncedCategory}
            onBack={onBack}
            categories={categories}
            setCategories={setCategories}
          />
        ) : null;

      case "products":
        return <AllProductsView categories={categories} />;

      case "orders":
        return <OrdersView user={user} />;

      case "users":
        return <UsersView />;

      case "payments":
        return <PaymentsView />;

      default:
        return null;
    }
  };

  return (
    <main style={{ flex: 1, padding: "2rem", overflowY: "auto", minWidth: 0 }}>
      {renderPage()}
    </main>
  );
}
