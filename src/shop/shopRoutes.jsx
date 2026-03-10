import Root from "./components/Root";
import NotFound from "./components/NotFound";
import AdminPortal from "./components/admin/AdminPortal";
import AdminSignup from "./components/admin/AdminSignup";
import CartPage from "./components/shop/CartPage";
import PolicyPage from "./components/shop/PolicyPage";
import ProductDetailPage from "./components/shop/ProductDetailPage";
import ShopPage from "./components/shop/ShopPage";
import TrackOrderPage from "./components/shop/TrackOrderPage";

export const shopRoutes = [
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <ShopPage /> },
      { path: "shop", element: <ShopPage /> },
      { path: "product/:productId", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "track-order", element: <TrackOrderPage /> },
      { path: "terms-and-conditions", element: <PolicyPage /> },
      { path: "refund-policy", element: <PolicyPage /> },
      { path: "privacy-policy", element: <PolicyPage /> },
      { path: "faqs", element: <PolicyPage /> },
      { path: "shipping-policy", element: <PolicyPage /> },
      { path: "secure-admin-portal-xyz", element: <AdminPortal /> },
      { path: "admin-setup-first-time", element: <AdminSignup /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];
