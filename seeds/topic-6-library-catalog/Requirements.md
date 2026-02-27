# Library Catalog — Refactoring Requirements

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
