-- V2: Seed 6 initial challenges

INSERT INTO challenges (seed_id, topic_id, title, theme, difficulty, story, legacy_code, requirements_md, test_suite_code)
VALUES (
    NULL,
    1,
    'The ATM Logger Meltdown',
    'ATM Transaction System',
    'medium',
    $$Production nightly report takes 45 minutes due to String concatenation in a loop with 500k transactions. The bad code uses String + in a loop (Item 63), an indexed for-loop where a for-each would work (Item 58), and local variables declared far from their first use (Item 57). The fix uses StringBuilder.append() to reduce O(n²) allocations to O(n).$$,
    $$package com.challenge;

import java.util.ArrayList;

/**
 * LEGACY CODE — ATM Transaction Logger
 *
 * Production incident report:
 * "The nightly report generation takes 45 minutes because the log builder
 *  concatenates strings in a loop. The code also uses an indexed for-loop
 *  where a for-each would do, and local variables are declared at the top
 *  of methods rather than near their use."
 *
 * Effective Java violations:
 *  - Item 57: Minimize the scope of local variables (declared too early)
 *  - Item 58: Prefer for-each loops to traditional for loops
 *  - Item 63: Beware the performance of string concatenation
 */
public class BadCode {

    // Item 57 violation: all variables declared at top, far from first use
    static String generateReport(ArrayList<String> transactions) {
        String report = "";        // Item 63: String accumulation in loop — O(n²)
        int i = 0;
        String line = "";
        String header = "=== ATM TRANSACTION REPORT ===\n";

        // Item 58 violation: indexed for-loop where for-each would suffice
        for (i = 0; i < transactions.size(); i++) {
            line = transactions.get(i);
            report = report + line + "\n";  // Item 63: creates new String each iteration
        }

        report = header + report;
        return report;
    }

    // Item 57 violation: 'total' declared before the loop that uses it
    static double sumWithdrawals(ArrayList<Double> amounts) {
        double total = 0.0;
        String currency = "USD";  // declared but only used at end
        int count = 0;            // declared but only used at end
        boolean hasLarge = false; // declared but only used at end

        for (int i = 0; i < amounts.size(); i++) {
            total += amounts.get(i);
            count++;
            if (amounts.get(i) > 1000) hasLarge = true;
        }

        System.out.println("Total in " + currency + ": " + total + " (" + count + " transactions)");
        if (hasLarge) System.out.println("WARNING: Large withdrawal detected");
        return total;
    }

    public static void main(String[] args) {
        ArrayList<String> txns = new ArrayList<>();
        txns.add("WITHDRAW $200 at 09:15");
        txns.add("DEPOSIT $500 at 10:30");
        txns.add("WITHDRAW $1500 at 14:00");

        System.out.println(generateReport(txns));

        ArrayList<Double> amounts = new ArrayList<>();
        amounts.add(200.0);
        amounts.add(500.0);
        amounts.add(1500.0);
        sumWithdrawals(amounts);
    }
}
$$,
    $$# ATM Logger — Refactoring Requirements

## 📋 The Story

> **Performance Incident #1142** — *Nightly Report Takes 45 Minutes*
>
> The ATM fleet generates 500,000 transactions per day. The nightly aggregation
> report was taking 45 minutes to build — profiling revealed the culprit:
> `generateReport()` concatenates strings with `+` inside a loop, creating
> half a million intermediate String objects. Effective Java Item 63 is being
> actively violated in production.

---

## ✅ Refactoring Checklist

### Item 57 — Minimize the Scope of Local Variables
- [ ] Move each local variable declaration to the point of first use
- [ ] Remove pre-declared loop index variables (`i`, `count`) from the top of methods
- [ ] Ensure `header`, `currency`, `hasLarge` are declared at their first meaningful use

### Item 58 — Prefer For-Each Loops
- [ ] Replace `for (int i = 0; i < list.size(); i++)` with `for (T item : list)` everywhere
- [ ] Confirm: no `.get(i)` calls remain in the refactored code

### Item 63 — Beware String Concatenation Performance
- [ ] Replace `report = report + line + "\n"` with a `StringBuilder`
- [ ] Use `StringBuilder.append()` for all accumulation
- [ ] Call `.toString()` once at the end to produce the final string

---

## 🏁 Definition of Done

All JUnit 5 tests pass AND `mvn checkstyle:check` reports zero violations.
$$,
    $$package com.challenge;

import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import static org.junit.jupiter.api.Assertions.*;

public class ChallengeTest {

    @Test
    void testGenerateReportContainsAllTransactions() {
        ArrayList<String> txns = new ArrayList<>();
        txns.add("WITHDRAW $200 at 09:15");
        txns.add("DEPOSIT $500 at 10:30");
        txns.add("WITHDRAW $100 at 11:00");
        String report = BadCode.generateReport(txns);
        assertTrue(report.contains("WITHDRAW $200 at 09:15"));
        assertTrue(report.contains("DEPOSIT $500 at 10:30"));
        assertTrue(report.contains("WITHDRAW $100 at 11:00"));
    }

    @Test
    void testGenerateReportHasHeader() {
        ArrayList<String> txns = new ArrayList<>();
        txns.add("DEPOSIT $100");
        String report = BadCode.generateReport(txns);
        assertTrue(report.contains("ATM TRANSACTION REPORT"));
    }

    @Test
    void testGenerateReportPerformance() {
        ArrayList<String> txns = new ArrayList<>();
        for (int i = 0; i < 10000; i++) {
            txns.add("WITHDRAW $" + i + " at 09:00");
        }
        long start = System.currentTimeMillis();
        BadCode.generateReport(txns);
        long elapsed = System.currentTimeMillis() - start;
        assertTrue(elapsed < 500, "generateReport took " + elapsed + "ms — expected < 500ms. Use StringBuilder (Item 63).");
    }

    @Test
    void testSumWithdrawalsReturnsCorrectValue() {
        ArrayList<Double> amounts = new ArrayList<>();
        amounts.add(200.0);
        amounts.add(300.0);
        amounts.add(500.0);
        assertEquals(1000.0, BadCode.sumWithdrawals(amounts), 0.001);
    }

    @Test
    void testSumWithdrawalsHandlesEmpty() {
        ArrayList<Double> amounts = new ArrayList<>();
        assertEquals(0.0, BadCode.sumWithdrawals(amounts), 0.001);
    }
}
$$
);

INSERT INTO challenges (seed_id, topic_id, title, theme, difficulty, story, legacy_code, requirements_md, test_suite_code)
VALUES (
    NULL,
    2,
    'The Fleet Tracker Phantom Duplicates',
    'Vehicle Fleet Manager',
    'medium',
    $$Fleet management HashSet<Vehicle> started reporting duplicate entries and failed lookups after a hotfix. Root cause: equals() was overridden without hashCode(), violating the Java contract — equal objects must have equal hash codes. External code also mutates vehicles directly through public fields and the exposed mutable service history array.$$,
    $$package com.challenge;

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
$$,
    $$# Vehicle Fleet — Refactoring Requirements

## 📋 The Story

> **Bug Report #889** — *Fleet Tracker Shows Phantom Vehicles*
>
> The fleet management system uses a `HashSet<Vehicle>` to deduplicate vehicles.
> After a software update, the set started reporting duplicate entries and missing
> lookups. Root cause: `Vehicle.equals()` was overridden without `hashCode()`,
> violating the Java contract. Additionally, external code is mutating vehicles
> directly through public fields and the exposed service history array.

---

## ✅ Refactoring Checklist

### Item 15 — Minimize the Accessibility of Classes and Members
- [ ] Make `licensePlate`, `mileage`, and `serviceHistory` private
- [ ] Add appropriate getters (read-only access)
- [ ] Only expose a setter for `mileage` if genuinely needed (justify in a comment)

### Item 16 — Obey the General Contract When Overriding equals
- [ ] Implement `hashCode()` consistent with `equals()` (same fields used)
- [ ] Verify: two Vehicles with the same licensePlate have equal hashCodes
- [ ] Test: `HashSet<Vehicle>` correctly deduplicates by license plate

### Item 17 — Design and Document for Inheritance or Else Prohibit It
(Applied here as: protect mutable internal state)
- [ ] Return a defensive copy in `getServiceHistory()`: `return serviceHistory.clone()`
- [ ] Make a defensive copy of the input array in the constructor
- [ ] Confirm: external mutation of the returned array does not affect the Vehicle

---

## 🏁 Definition of Done

All JUnit 5 tests pass AND `mvn checkstyle:check` reports zero violations.
$$,
    $$package com.challenge;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.HashSet;
import static org.junit.jupiter.api.Assertions.*;

public class ChallengeTest {

    @Test
    void testEqualVehiclesHaveEqualHashCodes() {
        BadCode.Vehicle v1 = new BadCode.Vehicle("ABC-123", 45000, new String[]{"Oil change"});
        BadCode.Vehicle v2 = new BadCode.Vehicle("ABC-123", 10000, new String[]{});
        assertEquals(v1, v2, "Vehicles with same licensePlate must be equal");
        assertEquals(v1.hashCode(), v2.hashCode(), "Equal vehicles must have equal hashCodes (Item 16)");
    }

    @Test
    void testHashSetDeduplicates() {
        HashSet<BadCode.Vehicle> fleet = new HashSet<>();
        fleet.add(new BadCode.Vehicle("ABC-123", 45000, new String[]{"Oil change"}));
        fleet.add(new BadCode.Vehicle("ABC-123", 50000, new String[]{}));
        assertEquals(1, fleet.size(), "HashSet must deduplicate by licensePlate (Item 16)");
    }

    @Test
    void testHashSetContains() {
        HashSet<BadCode.Vehicle> fleet = new HashSet<>();
        fleet.add(new BadCode.Vehicle("XYZ-999", 10000, new String[]{}));
        assertTrue(fleet.contains(new BadCode.Vehicle("XYZ-999", 99999, new String[]{})),
            "fleet.contains() must find vehicle by licensePlate (Item 16)");
    }

    @Test
    void testGetServiceHistoryDefensiveCopy() {
        String[] history = {"Oil change", "Brakes"};
        BadCode.Vehicle v = new BadCode.Vehicle("TEST-001", 1000, history);
        String[] returned = v.getServiceHistory();
        returned[0] = "HACKED";
        assertEquals("Oil change", v.getServiceHistory()[0],
            "getServiceHistory() must return a defensive copy (Item 17)");
    }

    @Test
    void testConstructorDefensiveCopy() {
        String[] history = {"Oil change"};
        BadCode.Vehicle v = new BadCode.Vehicle("DEF-456", 5000, history);
        history[0] = "MUTATED";
        assertEquals("Oil change", v.getServiceHistory()[0],
            "Constructor must make a defensive copy of the input array (Item 17)");
    }

    @Test
    void testFieldsArePrivate() {
        for (Field field : BadCode.Vehicle.class.getDeclaredFields()) {
            assertFalse(Modifier.isPublic(field.getModifiers()),
                "Field '" + field.getName() + "' must not be public (Item 15)");
        }
    }
}
$$
);

INSERT INTO challenges (seed_id, topic_id, title, theme, difficulty, story, legacy_code, requirements_md, test_suite_code)
VALUES (
    NULL,
    3,
    'The Cart Data Corruption Vulnerability',
    'E-Commerce Shopping Cart',
    'medium',
    $$A security audit found that ShoppingCart.getItems() returns its internal backing array — an attacker can modify cart contents after checkout validation by holding a reference to the returned array. Additionally, the checkout price calculator uses Double and Integer wrapper types in a tight loop, causing 40% overhead from unnecessary autoboxing and unboxing.$$,
    $$package com.challenge;

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
$$,
    $$# E-Commerce Cart — Refactoring Requirements

## 📋 The Story

> **Security Report #3312** — *Cart Manipulation Vulnerability*
>
> The e-commerce platform has a critical vulnerability: `ShoppingCart.getItems()`
> returns the internal backing array. An attacker discovered they can modify cart
> contents after checkout validation by holding a reference to the array. Additionally,
> the checkout price calculator uses `Double` and `Integer` wrapper types in a tight
> loop — profiling shows 40% of checkout time is autoboxing overhead.

---

## ✅ Refactoring Checklist

### Item 28 — Prefer Lists to Arrays
- [ ] Replace `Object[] items` with `List<CartItem>` (create a `CartItem` record/class)
- [ ] Remove the manual resize logic — List handles capacity automatically
- [ ] Use generics: `List<CartItem>` instead of raw `List`

### Item 50 — Make Defensive Copies When Needed
- [ ] Change `getItems()` to return `List.copyOf(items)` (unmodifiable defensive copy)
- [ ] Alternatively, return `Collections.unmodifiableList(items)`
- [ ] Confirm: mutating the returned list/array does NOT affect the internal cart state

### Item 61 — Prefer Primitive Types to Boxed Primitives
- [ ] Replace `Double total` with `double total`
- [ ] Replace `Integer price` with `int price` (or `double price`)
- [ ] Remove all unnecessary boxing in the calculation loop

---

## 🏁 Definition of Done

All JUnit 5 tests pass AND `mvn checkstyle:check` reports zero violations.
$$,
    $$package com.challenge;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

public class ChallengeTest {

    @Test
    void testAddIncreasesSize() {
        BadCode.ShoppingCart cart = new BadCode.ShoppingCart();
        cart.add("Item1");
        cart.add("Item2");
        cart.add("Item3");
        assertEquals(3, cart.getSize());
    }

    @Test
    @SuppressWarnings("unchecked")
    void testGetItemsReturnsCopy() {
        BadCode.ShoppingCart cart = new BadCode.ShoppingCart();
        cart.add("Laptop");
        cart.add("Mouse");
        int originalSize = cart.getSize();
        Object result = cart.getItems();
        if (result instanceof Object[]) {
            Object[] arr = (Object[]) result;
            if (arr.length > 0) arr[0] = "HACKED";
        } else if (result instanceof List) {
            try {
                ((List) result).clear();
            } catch (UnsupportedOperationException e) {
                // immutable list — defensive copy confirmed
                return;
            }
        }
        assertEquals(originalSize, cart.getSize(),
            "Mutating the result of getItems() must not affect the cart (Item 50)");
    }

    @Test
    void testCalculateTotalIsCorrect() {
        BadCode.ShoppingCart cart = new BadCode.ShoppingCart();
        cart.add("Item1");
        cart.add("Item2");
        cart.add("Item3");
        assertEquals(30.0, BadCode.calculateTotal(cart), 0.001);
    }

    @Test
    void testCartHandlesMoreThan10Items() {
        BadCode.ShoppingCart cart = new BadCode.ShoppingCart();
        assertDoesNotThrow(() -> {
            for (int i = 0; i < 11; i++) {
                cart.add("Item" + i);
            }
        });
        assertEquals(11, cart.getSize(), "Cart must support more than 10 items (dynamic resize — Item 28)");
    }
}
$$
);

INSERT INTO challenges (seed_id, topic_id, title, theme, difficulty, story, legacy_code, requirements_md, test_suite_code)
VALUES (
    NULL,
    4,
    'The Raw Types ClassCastException Disaster',
    'Shipping Logistics System',
    'hard',
    $$We are getting ClassCastExceptions in production every time the logistics team adds a new cargo type. Engineers traced it to raw type usage: the shipments List has no type parameter, which allows any object to be added. The cast at retrieval fails at runtime. Additionally, the API is too rigid — calculateTotalWeight and collectTrackingIds do not use bounded wildcards, so they reject valid subclasses of ShippingContainer.$$,
    $$package com.challenge;

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
$$,
    $$# Shipping Logistics — Refactoring Requirements

## 📋 The Story

> **Production Incident #2847** — *ClassCastException in ShippingRegistry*
>
> The logistics platform is crashing in production every time a new cargo type is
> introduced. The root cause: `ShippingContainer` uses raw types throughout,
> causing the JVM to defer type checking to runtime. A `FragileContainer` was
> accidentally added to a `List<RefrigeratedContainer>` — the compiler never
> complained, but the runtime did.

---

## ✅ Refactoring Checklist

### Item 26 — Don't Use Raw Types
- [ ] Replace `static List shipments` with a properly parameterized `List<ShippingContainer<?>>`
- [ ] Remove all raw-type usages in method signatures and variable declarations
- [ ] Confirm: no `@SuppressWarnings("unchecked")` needed in your solution

### Item 29 — Favor Generic Types
- [ ] Convert `ShippingContainer` to a generic class `ShippingContainer<T>`
- [ ] Replace `Object cargo` field with `T cargo`
- [ ] Replace `Object getCargo()` return type with `T`
- [ ] Create at least two typed instances: `ShippingContainer<String>` and `ShippingContainer<Integer>`

### Item 31 — Use Bounded Wildcards to Increase API Flexibility
- [ ] Refactor `calculateTotalWeight` to accept `List<? extends ShippingContainer<?>>` (PECS: producer — we READ from it)
- [ ] Refactor `collectTrackingIds` to accept `List<? super String>` as destination (PECS: consumer — we WRITE to it)
- [ ] Confirm: the API now accepts subclasses of ShippingContainer without changes

### Bonus
- [ ] Extract a `Shippable` interface with `getTrackingId()` and use it as a bound
- [ ] Add a `ShipmentRegistry<T extends Shippable>` generic class

---

## 🏁 Definition of Done

All JUnit 5 tests in `ChallengeTest.java` pass AND `mvn checkstyle:check` reports zero violations.
$$,
    $$package com.challenge;

import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

public class ChallengeTest {

    @Test
    void testRegisterShipmentNoClassCastException() {
        BadCode.ShippingContainer container = new BadCode.ShippingContainer("Electronics", "TRK-001");
        assertDoesNotThrow(() -> BadCode.registerShipment(container),
            "registerShipment must not throw a ClassCastException (Item 26)");
    }

    @Test
    void testGetCargoTypeCorrect() {
        BadCode.ShippingContainer container = new BadCode.ShippingContainer("Electronics", "TRK-001");
        assertDoesNotThrow(() -> {
            Object cargo = container.getCargo();
            assertNotNull(cargo);
        }, "getCargo() must return the cargo without ClassCastException (Item 29)");
    }

    @Test
    @SuppressWarnings({"unchecked", "rawtypes"})
    void testCalculateTotalWeightPositive() {
        List containers = new ArrayList();
        containers.add(new BadCode.ShippingContainer("Box1", "TRK-001"));
        containers.add(new BadCode.ShippingContainer("Box2", "TRK-002"));
        containers.add(new BadCode.ShippingContainer("Box3", "TRK-003"));
        double total = BadCode.calculateTotalWeight(containers);
        assertTrue(total > 0, "calculateTotalWeight must return a positive value");
    }

    @Test
    @SuppressWarnings({"unchecked", "rawtypes"})
    void testCollectTrackingIdsWorks() {
        List source = new ArrayList();
        source.add(new BadCode.ShippingContainer("Cargo1", "TRK-A"));
        source.add(new BadCode.ShippingContainer("Cargo2", "TRK-B"));
        List<String> dest = new ArrayList<>();
        BadCode.collectTrackingIds(source, dest);
        assertEquals(2, dest.size(), "collectTrackingIds must populate the destination list");
        assertTrue(dest.contains("TRK-A"));
        assertTrue(dest.contains("TRK-B"));
    }

    @Test
    void testShipmentListIsNotNull() {
        assertNotNull(BadCode.shipments, "shipments list must not be null");
        BadCode.ShippingContainer container = new BadCode.ShippingContainer("item", "TRK-X");
        BadCode.registerShipment(container);
        assertFalse(BadCode.shipments.isEmpty(),
            "shipments must contain registered containers (Item 26)");
    }
}
$$
);

INSERT INTO challenges (seed_id, topic_id, title, theme, difficulty, story, legacy_code, requirements_md, test_suite_code)
VALUES (
    NULL,
    5,
    'The Monthly Report Data Corruption',
    'Financial Report Aggregator',
    'hard',
    $$The finance team found the monthly debit report shows wrong totals. A code review found filterDebits() returns a mutable ArrayList — the reporting code accidentally mutates it before serialization. Additionally, extractDebitCategories uses a forEach with a side-effect accumulator, which prevents parallelization and is explicitly called out as an anti-pattern in Effective Java Item 45.$$,
    $$package com.challenge;

import java.util.*;
import java.util.stream.*;

/**
 * LEGACY CODE — Financial Report Aggregator
 *
 * Effective Java violations:
 *  - Item 42: Anonymous inner class instead of lambda
 *  - Item 45: Streams used with side effects (forEach mutating external list)
 *  - Item 46: Collectors.toList() instead of toUnmodifiableList()
 */
public class BadCode {

    record Transaction(String category, double amount, boolean isDebit) {}

    // Item 42 violation: anonymous Comparator instead of lambda/method reference
    static List<Transaction> sortByAmount(List<Transaction> transactions) {
        List<Transaction> sorted = new ArrayList<>(transactions);
        Collections.sort(sorted, new Comparator<Transaction>() {
            @Override
            public int compare(Transaction a, Transaction b) {
                return Double.compare(a.amount(), b.amount());
            }
        });
        return sorted;
    }

    // Item 45 violation: forEach with external side-effect accumulator
    static List<String> extractDebitCategories(List<Transaction> transactions) {
        List<String> result = new ArrayList<>();
        transactions.stream()
            .filter(t -> t.isDebit())
            .forEach(t -> result.add(t.category()));  // side effect! — not thread-safe
        return result;
    }

    // Item 46 violation: Collectors.toList() returns mutable list
    // Caller accidentally modifies the "report" — data corruption bug
    static List<Transaction> filterDebits(List<Transaction> transactions) {
        return transactions.stream()
            .filter(Transaction::isDebit)
            .collect(Collectors.toList());  // should be toUnmodifiableList()
    }

    public static void main(String[] args) {
        List<Transaction> txns = List.of(
            new Transaction("Food", 45.0, true),
            new Transaction("Salary", 3000.0, false),
            new Transaction("Rent", 1200.0, true)
        );
        System.out.println(sortByAmount(txns));
        System.out.println(extractDebitCategories(txns));
        System.out.println(filterDebits(txns));
    }
}
$$,
    $$# Financial Report — Refactoring Requirements

## 📋 The Story

> **Data Integrity Incident #5501** — *Monthly Report Shows Wrong Totals*
>
> The finance team discovered that the monthly debit report is occasionally showing
> incorrect totals. A code review revealed that `filterDebits()` returns a mutable
> `ArrayList` — and the reporting code accidentally mutates it before serializing.
> Additionally, the Streams team lead flagged that `extractDebitCategories` uses
> forEach with an external side-effect accumulator, which prevents parallelization
> and is explicitly warned against in Effective Java Item 45.

---

## ✅ Refactoring Checklist

### Item 42 — Prefer Lambdas to Anonymous Classes
- [ ] Replace the anonymous `Comparator` in `sortByAmount` with a lambda
- [ ] Alternatively use `Comparator.comparingDouble(Transaction::amount)`
- [ ] Confirm: no anonymous class declarations remain in the solution

### Item 45 — Use Streams Without Side Effects
- [ ] Replace the `forEach` + external list mutation in `extractDebitCategories`
- [ ] Use `.filter().map().collect()` pipeline instead
- [ ] The stream must have no side effects on external mutable state

### Item 46 — Prefer Side-Effect-Free Functions in Streams (+ correct Collector)
- [ ] Replace `Collectors.toList()` with `Collectors.toUnmodifiableList()`
- [ ] Alternatively collect to `List.copyOf(...)` then return
- [ ] Confirm: the returned list from `filterDebits` throws `UnsupportedOperationException` on `.add()`

---

## 🏁 Definition of Done

All JUnit 5 tests pass AND `mvn checkstyle:check` reports zero violations.
$$,
    $$package com.challenge;

import org.junit.jupiter.api.Test;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

public class ChallengeTest {

    @Test
    void testSortByAmountIsOrdered() {
        List<BadCode.Transaction> txns = List.of(
            new BadCode.Transaction("Food", 45.0, true),
            new BadCode.Transaction("Salary", 3000.0, false),
            new BadCode.Transaction("Rent", 1200.0, true)
        );
        List<BadCode.Transaction> sorted = BadCode.sortByAmount(txns);
        assertEquals(45.0, sorted.get(0).amount(), 0.001,
            "sortByAmount must sort ascending — smallest amount first");
    }

    @Test
    void testExtractDebitCategoriesCorrect() {
        List<BadCode.Transaction> txns = List.of(
            new BadCode.Transaction("Food", 45.0, true),
            new BadCode.Transaction("Salary", 3000.0, false),
            new BadCode.Transaction("Rent", 1200.0, true)
        );
        List<String> categories = BadCode.extractDebitCategories(txns);
        assertEquals(2, categories.size());
        assertTrue(categories.contains("Food"));
        assertTrue(categories.contains("Rent"));
    }

    @Test
    void testFilterDebitsReturnsCorrectCount() {
        List<BadCode.Transaction> txns = List.of(
            new BadCode.Transaction("Food", 45.0, true),
            new BadCode.Transaction("Salary", 3000.0, false),
            new BadCode.Transaction("Rent", 1200.0, true)
        );
        List<BadCode.Transaction> debits = BadCode.filterDebits(txns);
        assertEquals(2, debits.size(), "filterDebits must return only debit transactions");
    }

    @Test
    void testFilterDebitsIsUnmodifiable() {
        List<BadCode.Transaction> txns = List.of(
            new BadCode.Transaction("Food", 45.0, true),
            new BadCode.Transaction("Salary", 3000.0, false)
        );
        List<BadCode.Transaction> debits = BadCode.filterDebits(txns);
        assertThrows(UnsupportedOperationException.class,
            () -> debits.add(new BadCode.Transaction("Hacked", 0.0, true)),
            "filterDebits must return an unmodifiable list (Item 46)");
    }

    @Test
    void testSortByAmountDoesNotMutateInput() {
        List<BadCode.Transaction> original = new ArrayList<>();
        original.add(new BadCode.Transaction("Food", 45.0, true));
        original.add(new BadCode.Transaction("Salary", 3000.0, false));
        original.add(new BadCode.Transaction("Rent", 1200.0, true));
        BadCode.Transaction firstBefore = original.get(0);
        BadCode.sortByAmount(original);
        assertEquals(firstBefore, original.get(0),
            "sortByAmount must not mutate the input list");
    }
}
$$
);

INSERT INTO challenges (seed_id, topic_id, title, theme, difficulty, story, legacy_code, requirements_md, test_suite_code)
VALUES (
    NULL,
    6,
    'The NullPointerException Storm',
    'Library Catalog System',
    'medium',
    $$The library catalog search endpoint crashes with NullPointerException on 30% of requests. searchByPrefix() returns null instead of an empty list when no results are found, and half the callers forgot the null check. The ISBN map iteration also uses the slow keySet()+get() anti-pattern instead of entrySet(), causing two hash lookups per entry.$$,
    $$package com.challenge;

import java.util.*;

/**
 * LEGACY CODE — Library Catalog System
 *
 * Effective Java violations:
 *  - Item 54: Return empty collections, not null
 *  - Item 58: for-loop on entrySet without Map.Entry (uses keySet + get)
 *  - Item 47: Wrong collection type (LinkedList for random access)
 */
public class BadCode {

    // Item 47 violation: LinkedList used for random-access index lookup
    static LinkedList<String> catalog = new LinkedList<>();

    // Item 54 violation: returns null instead of empty collection
    static List<String> searchByPrefix(String prefix) {
        List<String> results = new ArrayList<>();
        for (String title : catalog) {
            if (title.startsWith(prefix)) results.add(title);
        }
        // Returns null when nothing found — forces every caller to null-check
        return results.isEmpty() ? null : results;
    }

    // Item 58 violation: iterates via keySet() + get() — two lookups per entry
    static void printIsbnMap(Map<String, String> isbnToTitle) {
        for (String isbn : isbnToTitle.keySet()) {
            String title = isbnToTitle.get(isbn);  // second lookup — O(1) but wasteful
            System.out.println(isbn + " -> " + title);
        }
    }

    // Item 47 violation: uses LinkedList.get(index) — O(n) per call
    static String getByIndex(int index) {
        return catalog.get(index);  // O(n) traversal on LinkedList
    }

    public static void main(String[] args) {
        catalog.add("Clean Code");
        catalog.add("Effective Java");
        catalog.add("Clean Architecture");

        // Null check required everywhere because of Item 54 violation
        List<String> found = searchByPrefix("Clean");
        if (found != null) {
            found.forEach(System.out::println);
        }

        Map<String, String> isbns = new LinkedHashMap<>();
        isbns.put("978-0132350884", "Clean Code");
        isbns.put("978-0134685991", "Effective Java");
        printIsbnMap(isbns);
    }
}
$$,
    $$# Library Catalog — Refactoring Requirements

## 📋 The Story

> **NullPointerException Storm #7721** — *Search Feature Crashes 30% of Requests*
>
> The library catalog's search endpoint crashes with `NullPointerException` on 30%
> of requests. Root cause: `searchByPrefix()` returns `null` instead of an empty
> list when no results are found — and half the callers forgot the null check.
> Additionally, the ISBN map iteration uses the slow `keySet() + get()` anti-pattern
> instead of `entrySet()`, and `catalog` is a `LinkedList` being used for random
> index access — O(n) per lookup.

---

## ✅ Refactoring Checklist

### Item 54 — Return Empty Collections or Arrays, Not Null
- [ ] Change `searchByPrefix` to return `Collections.emptyList()` (or `List.of()`) instead of `null`
- [ ] Remove the `results.isEmpty() ? null : results` ternary
- [ ] Confirm: callers no longer need null checks

### Item 58 — Prefer For-Each Loops / Use entrySet() for Map Iteration
- [ ] Replace `for (String isbn : isbnToTitle.keySet())` + `isbnToTitle.get(isbn)`
- [ ] Use `for (Map.Entry<String, String> entry : isbnToTitle.entrySet())`
- [ ] Access key with `entry.getKey()` and value with `entry.getValue()`

### Item 47 — Know and Use the Libraries (Right Collection Type)
- [ ] Replace `LinkedList<String> catalog` with `ArrayList<String>`
- [ ] Justify in a comment: ArrayList provides O(1) random access vs O(n) for LinkedList
- [ ] Confirm: `getByIndex(i)` is now O(1)

---

## 🏁 Definition of Done

All JUnit 5 tests pass AND `mvn checkstyle:check` reports zero violations.
$$,
    $$package com.challenge;

import org.junit.jupiter.api.Test;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

public class ChallengeTest {

    @Test
    void testSearchByPrefixReturnsEmptyListNotNull() {
        BadCode.catalog.clear();
        List<String> result = BadCode.searchByPrefix("X");
        assertNotNull(result, "searchByPrefix must return an empty list, never null (Item 54)");
        assertTrue(result.isEmpty());
    }

    @Test
    void testSearchByPrefixFindsResults() {
        BadCode.catalog.clear();
        BadCode.catalog.add("Clean Code");
        BadCode.catalog.add("Effective Java");
        List<String> result = BadCode.searchByPrefix("Clean");
        assertEquals(1, result.size(), "searchByPrefix(\"Clean\") must return exactly 1 result");
        assertEquals("Clean Code", result.get(0));
    }

    @Test
    void testSearchByPrefixNullSafe() {
        BadCode.catalog.clear();
        assertDoesNotThrow(() -> {
            List<String> result = BadCode.searchByPrefix("NonExistent");
            int size = result.size();  // must not throw NPE
        }, "Calling .size() on searchByPrefix result must not throw NullPointerException (Item 54)");
    }

    @Test
    void testPrintIsbnMapDoesNotThrow() {
        Map<String, String> isbns = new LinkedHashMap<>();
        isbns.put("978-0132350884", "Clean Code");
        isbns.put("978-0134685991", "Effective Java");
        assertDoesNotThrow(() -> BadCode.printIsbnMap(isbns),
            "printIsbnMap must not throw any exception");
    }

    @Test
    void testGetByIndexWorks() {
        BadCode.catalog.clear();
        BadCode.catalog.add("Effective Java");
        String result = BadCode.getByIndex(0);
        assertEquals("Effective Java", result, "getByIndex(0) must return the first catalog entry");
    }
}
$$
);
