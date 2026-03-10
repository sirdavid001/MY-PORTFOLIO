import ordersHandler from "../orders.js";

export default async function handler(req, res) {
  return ordersHandler(req, res);
}
