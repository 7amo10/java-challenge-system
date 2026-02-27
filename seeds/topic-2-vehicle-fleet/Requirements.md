# Vehicle Fleet — Refactoring Requirements

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
