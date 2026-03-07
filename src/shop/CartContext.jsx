import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import usePricingContext from "../hooks/usePricingContext";
import {
  buildStorePricingContext,
  CART_STORAGE_KEY,
  loadFromStorage,
  normalizeStoredCartItems,
  toPrice,
} from "./shop-helpers";

const CartContext = createContext();

export function CartProvider({ children }) {
    const pricingContext = usePricingContext();
    const activePricing = useMemo(() => buildStorePricingContext(pricingContext), [pricingContext]);

    const [cartItems, setCartItems] = useState(() => {
        return normalizeStoredCartItems(loadFromStorage(CART_STORAGE_KEY, []));
    });

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        const productId = String(product?.id || "").trim();
        const productName = String(product?.name || "").trim();
        const stock = Math.max(0, Number(product?.stock || 0));
        const basePriceUsd = Math.max(0, Number(product?.basePriceUsd || 0));

        if (!productId || !productName || stock <= 0 || !Number.isFinite(basePriceUsd)) return;

        setCartItems((prev) => {
            const existing = prev.find((item) => item.id === productId);
            if (existing) {
                return prev.map((item) =>
                    item.id === productId
                        ? { ...item, quantity: Math.min(item.quantity + 1, stock), maxStock: stock }
                        : item
                );
            }
            return [
                ...prev,
                {
                    id: productId,
                    name: productName,
                    brand: String(product?.brand || "").trim(),
                    basePriceUsd,
                    quantity: 1,
                    maxStock: stock,
                },
            ];
        });
    };

    const updateQuantity = (productId, nextQuantity) => {
        setCartItems((prev) => {
            return prev
                .map((item) => {
                    if (item.id === productId) {
                        const maxStock = Math.max(1, Number(item.maxStock || item.quantity || 1));
                        const next = Math.max(0, Math.min(Number(nextQuantity || 0), maxStock));
                        if (next === 0) return null;
                        return { ...item, quantity: next };
                    }
                    return item;
                })
                .filter(Boolean);
        });
    };

    const clearCart = () => setCartItems([]);

    const enrichedCartItems = useMemo(() => {
        return cartItems.map((item) => {
            const unitPrice = toPrice(item.basePriceUsd, activePricing);
            return {
                ...item,
                unitPrice,
                totalPrice: unitPrice * item.quantity,
            };
        });
    }, [activePricing, cartItems]);

    const cartCount = useMemo(() => {
        return enrichedCartItems.reduce((acc, item) => acc + item.quantity, 0);
    }, [enrichedCartItems]);

    const subtotal = useMemo(() => {
        return enrichedCartItems.reduce((acc, item) => acc + item.totalPrice, 0);
    }, [enrichedCartItems]);

    return (
        <CartContext.Provider value={{
            cartItems: enrichedCartItems,
            addToCart,
            updateQuantity,
            clearCart,
            cartCount,
            subtotal,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCartContext() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCartContext must be used within a CartProvider');
    }
    return context;
}
