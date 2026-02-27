package com.challenge;

import java.util.ArrayList;
import java.util.List;

/**
 * LEGACY CODE — ShippingRegistry
 *
 * Production incident report:
 * "We are receiving ClassCastExceptions in production every time the logistics
 *  team adds a new cargo type. The Fleet Manager blamed 'raw types' but nobody
 *  fixed it. We also cannot easily add temperature-sensitive cargo to cold-chain
 *  routes because the API signature is too rigid."
 *
 * Effective Java violations present:
 *  - Item 26: Raw types in use (ShippingContainer, route registry)
 *  - Item 29: ShippingContainer class is not generic
 *  - Item 31: processRoute() does not use bounded wildcards (PECS violated)
 */
public class BadCode {

    // Item 26 violation: raw type List — unsafe, compiler cannot check element type
    static List shipments = new ArrayList();

    // Item 29 violation: ShippingContainer is not generic — forces Object usage
    static class ShippingContainer {
        private Object cargo;
        private String trackingId;

        public ShippingContainer(Object cargo, String trackingId) {
            this.cargo = cargo;
            this.trackingId = trackingId;
        }

        // Unsafe: caller must cast, risks ClassCastException at runtime
        public Object getCargo() {
            return cargo;
        }

        public String getTrackingId() {
            return trackingId;
        }
    }

    // Item 26 violation: raw type parameter — erases type safety
    static void registerShipment(ShippingContainer container) {
        shipments.add(container);
    }

    // Item 31 violation: takes List<ShippingContainer> — too rigid, won't accept
    // List<FragileContainer> or List<RefrigeratedContainer> (subclasses)
    static double calculateTotalWeight(List<ShippingContainer> containers) {
        double total = 0;
        for (ShippingContainer c : containers) {
            // Simulated weight lookup
            total += 10.0;
        }
        return total;
    }

    // Item 31 violation: destination takes exact List<String> — won't accept
    // List<Object> even though we only write to it
    static void collectTrackingIds(List<ShippingContainer> source, List<String> destination) {
        for (ShippingContainer c : source) {
            destination.add(c.getTrackingId());
        }
    }

    public static void main(String[] args) {
        ShippingContainer box = new ShippingContainer("Electronics", "TRK-001");
        ShippingContainer fragile = new ShippingContainer("Glassware", "TRK-002");

        registerShipment(box);
        registerShipment(fragile);

        // Item 26 violation: unchecked cast — boom in production!
        for (Object obj : shipments) {
            ShippingContainer c = (ShippingContainer) obj;  // ClassCastException risk
            System.out.println("Tracking: " + c.getTrackingId());
        }
    }
}
