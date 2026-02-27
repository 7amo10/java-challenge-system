# Financial Report — Refactoring Requirements

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
