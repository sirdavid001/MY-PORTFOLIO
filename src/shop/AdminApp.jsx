import { useEffect, useState } from "react";
import { formatMoney } from "../lib/pricing";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-300/60 focus:border-cyan-500 focus:ring";

const statusOptions = ["new", "processing", "paid", "shipped", "completed", "cancelled"];

export default function AdminApp() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState({});
  const isOrdersTableMissing = error.includes("public.orders is missing");

  useEffect(() => {
    const saved = window.sessionStorage.getItem("sirdavidshop:admin-key");
    if (!saved) return;

    const trimmedSaved = saved.trim();
    if (!trimmedSaved) {
      window.sessionStorage.removeItem("sirdavidshop:admin-key");
      return;
    }

    setAdminKey(trimmedSaved);
    loadOrders(trimmedSaved).then((ok) => {
      if (ok) {
        setIsAuthed(true);
        return;
      }

      window.sessionStorage.removeItem("sirdavidshop:admin-key");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOrders(keyOverride) {
    const key = String(keyOverride || adminKey || "").trim();
    if (!key) {
      setError("Admin key is required.");
      return false;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/orders", {
        headers: {
          "x-admin-key": key,
        },
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        if (response.status === 401) {
          setError("Invalid admin key.");
        } else {
          setError(data?.error || "Failed to load orders.");
        }
        setLoading(false);
        return false;
      }
      setOrders(data.orders || []);
      return true;
    } catch {
      setError("Failed to load orders.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const trimmedKey = adminKey.trim();
    setAdminKey(trimmedKey);
    const ok = await loadOrders(trimmedKey);
    if (ok) {
      setIsAuthed(true);
      window.sessionStorage.setItem("sirdavidshop:admin-key", trimmedKey);
    }
  }

  async function updateStatus(orderId, nextStatus) {
    const key = adminKey.trim();
    if (!key) return;

    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    setError("");
    try {
      const response = await fetch(`/api/admin/orders?id=${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        setError(data?.error || "Status update failed.");
        return;
      }
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order))
      );
    } catch {
      setError("Status update failed.");
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  function logout() {
    setIsAuthed(false);
    setOrders([]);
    setAdminKey("");
    window.sessionStorage.removeItem("sirdavidshop:admin-key");
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-3xl font-bold text-slate-900">Store Admin</h1>
          <p className="mt-2 text-sm text-slate-600">Enter your admin key to manage orders.</p>
          <form onSubmit={handleLogin} className="mt-5 space-y-3">
            <input
              type="password"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              placeholder="Admin key"
              className={inputClass}
              required
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign in
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          {isOrdersTableMissing && (
            <p className="mt-2 text-xs text-slate-600">
              Create the table in Supabase SQL Editor using <code>supabase/orders.sql</code>, then try sign in again.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">Order Dashboard</h1>
            <p className="text-sm text-slate-600">{orders.length} orders</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadOrders()}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
            >
              Logout
            </button>
          </div>
        </div>

        {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}
        {isOrdersTableMissing && (
          <p className="mb-3 text-xs text-slate-600">
            Run <code>supabase/orders.sql</code> in Supabase SQL Editor, then refresh.
          </p>
        )}
        {loading ? <p className="text-sm text-slate-600">Loading orders...</p> : null}

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3 font-semibold text-slate-900">{order.reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{order.customer_name || "N/A"}</p>
                    <p className="text-xs text-slate-500">{order.customer_email || ""}</p>
                    <p className="text-xs text-slate-500">{order.country || ""}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {formatMoney(order.total || 0, order.currency || "USD")}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status || "new"}
                      disabled={Boolean(updating[order.id])}
                      onChange={(event) => updateStatus(order.id, event.target.value)}
                      className={inputClass}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
