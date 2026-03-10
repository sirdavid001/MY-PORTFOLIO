import { useLocation } from "react-router-dom";
import NotFound from "./components/NotFound";
import CartPage from "./components/shop/CartPage";
import PolicyPage from "./components/shop/PolicyPage";
import ProductDetailPage from "./components/shop/ProductDetailPage";
import ShopPage from "./components/shop/ShopPage";
import TrackOrderPage from "./components/shop/TrackOrderPage";

const POLICY_PATHS = new Set([
  "/terms-and-conditions",
  "/refund-policy",
  "/privacy-policy",
  "/faqs",
  "/faq",
  "/shipping-policy",
]);

export default function ShopApp() {
  const { pathname } = useLocation();
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPathname === "/" || normalizedPathname === "/shop") {
    return <ShopPage />;
  }

  if (normalizedPathname === "/cart") {
    return <CartPage />;
  }

  if (normalizedPathname === "/track-order") {
    return <TrackOrderPage />;
  }

  if (normalizedPathname.startsWith("/product/")) {
    return <ProductDetailPage />;
  }

  if (POLICY_PATHS.has(normalizedPathname)) {
    return <PolicyPage />;
  }

  return <NotFound />;
}
