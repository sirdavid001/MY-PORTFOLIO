import { useEffect, useMemo, useState } from "react";
import { formatMoney } from "../lib/pricing";
import { defaultShippingConfig, normalizeProduct, normalizeShippingConfig } from "./products";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-300/60 focus:border-cyan-500 focus:ring";

const statusOptions = ["new", "processing", "paid", "shipped", "completed", "cancelled"];
const initialCategoryOptions = ["Phones", "Laptops", "Accessories", "Gaming", "Wearables"];
const initialConditionOptions = ["New", "Used", "Used - Excellent", "Used - Very Good", "Used - Good"];

const emptyProductForm = {
  id: "",
  name: "",
  brand: "",
  condition: "New",
  category: "Phones",
  basePriceUsd: "",
  stock: "",
  image: "",
  details: "",
  sortOrder: "",
  isActive: true,
};

function normalizeProductForForm(product) {
  const normalized = normalizeProduct(product);
  return {
    id: normalized.id,
    name: normalized.name,
    brand: normalized.brand,
    condition: normalized.condition,
    category: normalized.category,
    basePriceUsd: String(normalized.basePriceUsd),
    stock: String(normalized.stock),
    image: normalized.image,
    details: normalized.details,
    sortOrder: String(normalized.sortOrder),
    isActive: Boolean(normalized.isActive),
  };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read selected image."));
    reader.readAsDataURL(file);
  });
}

export default function AdminApp() {
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState({});

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [imageUploadMessage, setImageUploadMessage] = useState("");

  const [shipping, setShipping] = useState(() => normalizeShippingConfig(defaultShippingConfig));
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingError, setShippingError] = useState("");

  const [authError, setAuthError] = useState("");

  const isOrdersTableMissing = ordersError.includes("public.orders is missing");
  const isProductsTableMissing = productsError.includes("public.shop_products");
  const isShippingTableMissing = shippingError.includes("public.shop_settings");
  const categorySuggestions = useMemo(() => {
    return Array.from(
      new Set([
        ...initialCategoryOptions,
        ...products.map((product) => String(product.category || "").trim()),
        String(productForm.category || "").trim(),
      ])
    ).filter(Boolean);
  }, [productForm.category, products]);
  const conditionSuggestions = useMemo(() => {
    return Array.from(
      new Set([
        ...initialConditionOptions,
        ...products.map((product) => String(product.condition || "").trim()),
        String(productForm.condition || "").trim(),
      ])
    ).filter(Boolean);
  }, [productForm.condition, products]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      setCheckingSession(true);
      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          credentials: "same-origin",
        });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;

        if (!response.ok || !data?.ok) {
          setCheckingSession(false);
          return;
        }

        setIsAuthed(true);
        setAdminEmail(data?.user?.email || "");
        await loadAllAdminData();
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadAllAdminData() {
    await Promise.all([loadOrders(), loadProducts(), loadShipping()]);
  }

  async function loadOrders() {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const response = await fetch("/api/admin/orders", {
        method: "GET",
        credentials: "same-origin",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
        } else {
          setOrdersError(data?.error || "Failed to load orders.");
        }
        setOrdersLoading(false);
        return false;
      }

      setOrders(data.orders || []);
      return true;
    } catch {
      setOrdersError("Failed to load orders.");
      return false;
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError("");
    try {
      const response = await fetch("/api/admin/products", {
        method: "GET",
        credentials: "same-origin",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
        } else {
          setProductsError(data?.error || "Failed to load products.");
        }
        setProductsLoading(false);
        return false;
      }

      setProducts(Array.isArray(data.products) ? data.products.map((product) => normalizeProduct(product)) : []);
      return true;
    } catch {
      setProductsError("Failed to load products.");
      return false;
    } finally {
      setProductsLoading(false);
    }
  }

  async function loadShipping() {
    setShippingLoading(true);
    setShippingError("");
    try {
      const response = await fetch("/api/admin/shipping", {
        method: "GET",
        credentials: "same-origin",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
        } else {
          setShippingError(data?.error || "Failed to load shipping settings.");
        }
        setShippingLoading(false);
        return false;
      }

      setShipping(normalizeShippingConfig(data.shipping || defaultShippingConfig));
      return true;
    } catch {
      setShippingError("Failed to load shipping settings.");
      return false;
    } finally {
      setShippingLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          email: adminEmail.trim().toLowerCase(),
          password,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        setAuthError(data?.error || "Unable to sign in.");
        return;
      }

      setIsAuthed(true);
      setPassword("");
      await loadAllAdminData();
    } catch {
      setAuthError("Unable to sign in.");
    }
  }

  async function updateStatus(orderId, nextStatus) {
    setUpdatingOrderStatus((prev) => ({ ...prev, [orderId]: true }));
    setOrdersError("");
    try {
      const response = await fetch(`/api/admin/orders?id=${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
          return;
        }
        setOrdersError(data?.error || "Status update failed.");
        return;
      }

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order))
      );
    } catch {
      setOrdersError("Status update failed.");
    } finally {
      setUpdatingOrderStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  async function handleSaveProduct(event) {
    event.preventDefault();
    setProductsError("");
    setImageUploadError("");
    setSavingProduct(true);

    const payload = {
      id: productForm.id.trim(),
      name: productForm.name,
      brand: productForm.brand,
      condition: productForm.condition,
      category: productForm.category,
      basePriceUsd: Number(productForm.basePriceUsd || 0),
      stock: Number(productForm.stock || 0),
      image: productForm.image,
      details: productForm.details,
      sortOrder: Number(productForm.sortOrder || 0),
      isActive: Boolean(productForm.isActive),
    };

    const isEditing = Boolean(editingProductId);

    try {
      const endpoint = isEditing
        ? `/api/admin/products?id=${encodeURIComponent(editingProductId)}`
        : "/api/admin/products";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
          return;
        }
        setProductsError(data?.error || "Failed to save product.");
        return;
      }

      const nextProduct = normalizeProduct(data.product || payload);
      if (isEditing) {
        setProducts((prev) => prev.map((item) => (item.id === editingProductId ? nextProduct : item)));
      } else {
        setProducts((prev) => [nextProduct, ...prev]);
      }

      setProductForm(emptyProductForm);
      setEditingProductId("");
      setImageUploadMessage("");
      await loadProducts();
    } catch {
      setProductsError("Failed to save product.");
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleDeleteProduct(id) {
    setProductsError("");
    setDeletingProductId(id);

    try {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
          return;
        }
        setProductsError(data?.error || "Failed to delete product.");
        return;
      }

      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch {
      setProductsError("Failed to delete product.");
    } finally {
      setDeletingProductId("");
    }
  }

  async function handleProductImageUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImageUploadError("");
    setImageUploadMessage("");

    if (!String(file.type || "").startsWith("image/")) {
      setImageUploadError("Please choose a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError("Image is too large. Max size is 5MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          base64Data: dataUrl,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
          return;
        }
        setImageUploadError(data?.error || "Image upload failed.");
        return;
      }

      setProductForm((prev) => ({ ...prev, image: data.url || prev.image }));
      setImageUploadMessage("Image uploaded successfully.");
    } catch {
      setImageUploadError("Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function saveShippingSettings(event) {
    event.preventDefault();
    setShippingError("");
    setShippingSaving(true);

    try {
      const response = await fetch("/api/admin/shipping", {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shipping }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
          return;
        }
        setShippingError(data?.error || "Failed to save shipping settings.");
        return;
      }

      setShipping(normalizeShippingConfig(data.shipping || shipping));
    } catch {
      setShippingError("Failed to save shipping settings.");
    } finally {
      setShippingSaving(false);
    }
  }

  function logout() {
    fetch("/api/admin/logout", {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => {
      // Best-effort logout.
    });

    setIsAuthed(false);
    setOrders([]);
    setProducts([]);
    setPassword("");
    setEditingProductId("");
    setProductForm(emptyProductForm);
    setImageUploadError("");
    setImageUploadMessage("");
    setAuthError("");
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Checking admin session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-3xl font-bold text-slate-900">Store Admin</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in with your admin account email and password.</p>
          <form onSubmit={handleLogin} className="mt-5 space-y-3">
            <input
              type="email"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              placeholder="Admin email"
              className={inputClass}
              required
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
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
          {authError && <p className="mt-3 text-sm text-rose-600">{authError}</p>}
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
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">Store Admin Dashboard</h1>
            <p className="text-sm text-slate-600">
              {orders.length} orders, {products.length} products {adminEmail ? `• ${adminEmail}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadAllAdminData()}
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

        {authError && <p className="text-sm text-rose-600">{authError}</p>}

        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="font-display text-xl font-semibold text-slate-900">Orders</h2>
            {ordersLoading ? <span className="text-xs text-slate-500">Loading...</span> : null}
          </div>
          {ordersError && <p className="px-4 pt-3 text-sm text-rose-600">{ordersError}</p>}
          {isOrdersTableMissing && (
            <p className="px-4 pt-2 text-xs text-slate-600">
              Run <code>supabase/orders.sql</code> in Supabase SQL Editor, then refresh.
            </p>
          )}

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
                      disabled={Boolean(updatingOrderStatus[order.id])}
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
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!ordersLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    No orders found yet. Only paid orders synced to Supabase appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-slate-900">
                {editingProductId ? "Edit Gadget" : "Add Gadget"}
              </h2>
              {productsLoading ? <span className="text-xs text-slate-500">Loading products...</span> : null}
            </div>

            <form onSubmit={handleSaveProduct} className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className={inputClass}
                  placeholder="Product name"
                  value={productForm.name}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
                <input
                  className={inputClass}
                  placeholder="Brand"
                  value={productForm.brand}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, brand: event.target.value }))}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  className={inputClass}
                  placeholder="Category"
                  list="gadget-category-options"
                  value={productForm.category}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))}
                  required
                />
                <datalist id="gadget-category-options">
                  {categorySuggestions.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                <select
                  className={inputClass}
                  value={productForm.condition}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, condition: event.target.value }))}
                >
                  {conditionSuggestions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  placeholder="Price (USD)"
                  value={productForm.basePriceUsd}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, basePriceUsd: event.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="Stock"
                  value={productForm.stock}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, stock: event.target.value }))}
                  required
                />
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="Sort order"
                  value={productForm.sortOrder}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, sortOrder: event.target.value }))}
                />
                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(productForm.isActive)}
                    onChange={(event) => setProductForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                  Active on storefront
                </label>
              </div>

              <div className="space-y-2">
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input
                    className={inputClass}
                    placeholder="Image URL (auto-filled after upload)"
                    value={productForm.image}
                    onChange={(event) => setProductForm((prev) => ({ ...prev, image: event.target.value }))}
                  />
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProductImageUpload}
                      disabled={uploadingImage}
                    />
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                  </label>
                </div>
                {imageUploadError ? <p className="text-xs text-rose-600">{imageUploadError}</p> : null}
                {imageUploadMessage ? <p className="text-xs text-emerald-700">{imageUploadMessage}</p> : null}
                {productForm.image ? (
                  <img
                    src={productForm.image}
                    alt="Product preview"
                    className="h-28 w-28 rounded-lg border border-slate-200 object-cover"
                  />
                ) : null}
              </div>

              <textarea
                className={inputClass}
                rows={3}
                placeholder="Details"
                value={productForm.details}
                onChange={(event) => setProductForm((prev) => ({ ...prev, details: event.target.value }))}
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {savingProduct ? "Saving..." : editingProductId ? "Update Gadget" : "Add Gadget"}
                </button>

                {editingProductId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProductId("");
                      setProductForm(emptyProductForm);
                      setImageUploadError("");
                      setImageUploadMessage("");
                    }}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            {productsError && <p className="mt-3 text-sm text-rose-600">{productsError}</p>}
            {isProductsTableMissing && (
              <p className="mt-2 text-xs text-slate-600">
                Run <code>supabase/catalog.sql</code> in Supabase SQL Editor to create product + shipping tables.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-slate-900">Shipping Settings</h2>
            <p className="mt-1 text-xs text-slate-500">These values affect checkout totals site-wide.</p>

            <form onSubmit={saveShippingSettings} className="mt-4 space-y-3">
              <select
                value={shipping.mode}
                onChange={(event) => setShipping((prev) => ({ ...prev, mode: event.target.value }))}
                className={inputClass}
                disabled={shippingLoading || shippingSaving}
              >
                <option value="hybrid">Hybrid (max(min, percent))</option>
                <option value="flat">Flat fee</option>
                <option value="percent">Percent only</option>
              </select>

              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={shipping.flatUsd}
                onChange={(event) => setShipping((prev) => ({ ...prev, flatUsd: Number(event.target.value || 0) }))}
                placeholder="Flat shipping (USD)"
                disabled={shippingLoading || shippingSaving}
              />

              <input
                type="number"
                min="0"
                step="0.001"
                className={inputClass}
                value={shipping.percentRate}
                onChange={(event) =>
                  setShipping((prev) => ({
                    ...prev,
                    percentRate: Number(event.target.value || 0),
                  }))
                }
                placeholder="Percent rate (e.g. 0.03)"
                disabled={shippingLoading || shippingSaving}
              />

              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={shipping.minUsd}
                onChange={(event) => setShipping((prev) => ({ ...prev, minUsd: Number(event.target.value || 0) }))}
                placeholder="Minimum shipping (USD)"
                disabled={shippingLoading || shippingSaving}
              />

              <button
                type="submit"
                disabled={shippingSaving || shippingLoading}
                className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400 disabled:opacity-60"
              >
                {shippingSaving ? "Saving..." : "Save Shipping"}
              </button>
            </form>

            {shippingError && <p className="mt-3 text-sm text-rose-600">{shippingError}</p>}
            {isShippingTableMissing && (
              <p className="mt-2 text-xs text-slate-600">
                Run <code>supabase/catalog.sql</code> in Supabase SQL Editor to create product + shipping tables.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-slate-900">Gadget List</h2>
            <span className="text-xs text-slate-500">{products.length} items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Price (USD)</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Active</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.id}</p>
                    </td>
                    <td className="px-3 py-2 text-slate-700">{product.category}</td>
                    <td className="px-3 py-2 font-semibold text-slate-900">{formatMoney(product.basePriceUsd, "USD")}</td>
                    <td className="px-3 py-2 text-slate-700">{product.stock}</td>
                    <td className="px-3 py-2 text-slate-700">{product.isActive ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductId(product.id);
                            setProductForm(normalizeProductForForm(product));
                            setImageUploadError("");
                            setImageUploadMessage("");
                          }}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deletingProductId === product.id}
                          className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          {deletingProductId === product.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!productsLoading && products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-5 text-center text-slate-500">
                      No gadgets created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
