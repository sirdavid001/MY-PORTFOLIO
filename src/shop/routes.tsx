import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import ShopPage from "./components/shop/ShopPage";
import ProductDetailPage from "./components/shop/ProductDetailPage";
import CartPage from "./components/shop/CartPage";
import TrackOrderPage from "./components/shop/TrackOrderPage";
import PolicyPage from "./components/shop/PolicyPage";
import AdminPortal from "./components/admin/AdminPortal";
import AdminSignup from "./components/admin/AdminSignup";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: ShopPage },
      { path: "shop", Component: ShopPage },
      { path: "product/:productId", Component: ProductDetailPage },
      { path: "cart", Component: CartPage },
      { path: "track-order", Component: TrackOrderPage },
      { path: "terms-and-conditions", Component: PolicyPage },
      { path: "refund-policy", Component: PolicyPage },
      { path: "privacy-policy", Component: PolicyPage },
      { path: "faqs", Component: PolicyPage },
      { path: "shipping-policy", Component: PolicyPage },
      { path: "secure-admin-portal-xyz", Component: AdminPortal },
      { path: "admin-setup-first-time", Component: AdminSignup },
      { path: "*", Component: NotFound },
    ],
  },
]);