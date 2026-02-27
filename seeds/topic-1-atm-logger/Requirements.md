# ATM Logger — Refactoring Requirements

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
