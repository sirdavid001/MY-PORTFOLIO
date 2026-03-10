import productsHandler from "../products.js";

export default async function handler(req, res) {
  return productsHandler(req, res);
}
