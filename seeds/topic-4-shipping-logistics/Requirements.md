# Shipping Logistics — Refactoring Requirements

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
