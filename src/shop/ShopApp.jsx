import { useRoutes } from "react-router-dom";
import { shopRoutes } from "./shopRoutes";

export default function ShopApp() {
  return useRoutes(shopRoutes);
}
