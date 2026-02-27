package com.challenge;

import java.util.ArrayList;

/**
 * LEGACY CODE — Vehicle Fleet Manager
 *
 * Effective Java violations:
 *  - Item 15: Public mutable fields expose internal state
 *  - Item 16: equals() overridden without hashCode() — breaks HashMap/HashSet contracts
 *  - Item 17: Mutable internal array returned directly — caller can mutate internals
 */
public class BadCode {

    static class Vehicle {
        // Item 15 violation: public mutable fields — anyone can change them
        public String licensePlate;
        public int mileage;
        public String[] serviceHistory;  // Item 17: mutable array exposed

        public Vehicle(String licensePlate, int mileage, String[] serviceHistory) {
            this.licensePlate = licensePlate;
            this.mileage = mileage;
            this.serviceHistory = serviceHistory;  // No defensive copy
        }

        // Item 17 violation: returns internal mutable array directly
        public String[] getServiceHistory() {
            return serviceHistory;
        }

        // Item 16 violation: equals without hashCode — Vehicle breaks in HashMap
        @Override
        public boolean equals(Object obj) {
            if (!(obj instanceof Vehicle)) return false;
            Vehicle other = (Vehicle) obj;
            return this.licensePlate.equals(other.licensePlate);
        }
        // No hashCode — violates the contract: equal objects must have equal hash codes!
    }

    public static void main(String[] args) {
        String[] history = {"Oil change 2024-01", "Brake service 2024-06"};
        Vehicle v = new Vehicle("ABC-123", 45000, history);

        // Item 15 violation: external mutation of internal state
        v.mileage = 999999;

        // Item 17 violation: external mutation of internal array
        v.getServiceHistory()[0] = "HACKED";

        // Item 16 violation: breaks HashSet
        java.util.HashSet<Vehicle> fleet = new java.util.HashSet<>();
        fleet.add(v);
        Vehicle same = new Vehicle("ABC-123", 45000, new String[]{});
        System.out.println("Contains: " + fleet.contains(same)); // prints false — bug!
    }
}
