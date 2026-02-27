package com.challenge;

/**
 * LEGACY CODE — E-Commerce Shopping Cart
 *
 * Effective Java violations:
 *  - Item 28: Arrays instead of Lists (cart uses array, not generic collection)
 *  - Item 50: Defensive copy missing — returned array is the internal array
 *  - Item 61: Primitive wrapper types used unnecessarily (autoboxing in loop)
 */
public class BadCode {

    // Item 28 violation: array instead of List<CartItem>
    static class ShoppingCart {
        private Object[] items = new Object[10];  // raw Object array
        private int size = 0;

        public void add(Object item) {
            if (size >= items.length) {
                // Manual resize — no need with List
                Object[] newItems = new Object[items.length * 2];
                System.arraycopy(items, 0, newItems, 0, size);
                items = newItems;
            }
            items[size++] = item;
        }

        // Item 50 violation: returns internal array directly — no defensive copy
        public Object[] getItems() {
            return items;
        }

        public int getSize() { return size; }
    }

    // Item 61 violation: Double wrapper used instead of primitive double
    static Double calculateTotal(ShoppingCart cart) {
        Double total = 0.0;  // unnecessary boxing
        for (int i = 0; i < cart.getSize(); i++) {
            // Simulated price lookup — creates Integer then unboxes
            Integer price = 10;  // Item 61: unnecessary boxing
            total = total + price;  // unbox + add + rebox — performance waste
        }
        return total;
    }

    public static void main(String[] args) {
        ShoppingCart cart = new ShoppingCart();
        cart.add("Laptop");
        cart.add("Mouse");
        cart.add("Keyboard");

        // Item 50 violation — caller can corrupt the cart
        Object[] exposed = cart.getItems();
        exposed[0] = "HACKED";

        System.out.println("Total: $" + calculateTotal(cart));
    }
}
