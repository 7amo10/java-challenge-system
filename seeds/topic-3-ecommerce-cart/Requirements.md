# E-Commerce Cart — Refactoring Requirements

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
