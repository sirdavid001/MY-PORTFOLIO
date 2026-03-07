import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { loadFromStorage, toPrice } from './ShopApp'; // Will need to refine these imports
import usePricingContext from '../hooks/usePricingContext';

const CartContext = createContext();

export function CartProvider({ children }) {
    const pricingContext = usePricingContext();

    const [cartItems, setCartItems] = useState(() => {
        return loadFromStorage("sd_store_cart", []);
    });

    useEffect(() => {
        localStorage.setItem("sd_store_cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        if (!product || Number(product.stock) <= 0) return;

        setCartItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: Math.min(item.quantity + 1, Number(product.stock)) }
                        : item
                );
            }
            return [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    basePriceUsd: product.basePriceUsd,
                    quantity: 1,
                    maxStock: Number(product.stock),
                },
            ];
        });
    };

    const updateQuantity = (productId, delta) => {
        setCartItems((prev) => {
            return prev
                .map((item) => {
                    if (item.id === productId) {
                        const next = Math.max(0, Math.min(delta, item.maxStock));
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
            const unitPrice = toPrice(item.basePriceUsd, pricingContext);
            return {
                ...item,
                unitPrice,
                totalPrice: unitPrice * item.quantity,
            };
        });
    }, [cartItems, pricingContext]);

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
