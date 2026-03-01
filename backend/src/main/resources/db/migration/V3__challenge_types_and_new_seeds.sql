-- Add challenge_type column
ALTER TABLE challenges ADD COLUMN challenge_type VARCHAR(20) NOT NULL DEFAULT 'refactor'
    CHECK (challenge_type IN ('refactor', 'implement', 'debug'));
ALTER TABLE challenge_seeds ADD COLUMN challenge_type VARCHAR(20) NOT NULL DEFAULT 'refactor'
    CHECK (challenge_type IN ('refactor', 'implement', 'debug'));

-- Update existing 6 challenges to be explicitly 'refactor'
UPDATE challenges SET challenge_type = 'refactor' WHERE challenge_type = 'refactor';

-- Implement Challenge 1 — Topic 2 (OO Design)
INSERT INTO challenges (seed_id, topic_id, title, theme, difficulty, challenge_type, story, legacy_code, requirements_md, test_suite_code)
VALUES (NULL, 2,
  'Design a Thread-Safe Config Manager',
  'Configuration Manager',
  'hard',
  'implement',
  $$Your platform team needs a centralized configuration manager. The current system has no config abstraction — environment variables are read directly via System.getenv() scattered across 40+ classes. The architect has defined a ConfigManager interface. Your job: implement it as a thread-safe singleton (Effective Java Item 3) with an immutable snapshot view (Item 17). The implementation must handle concurrent reads/writes from multiple HTTP request threads without data races.$$,
  -- legacy_code (starter skeleton):
  $$package com.challenge;

import java.util.Map;

/**
 * IMPLEMENT THIS CLASS.
 *
 * Requirements:
 * - Singleton: only one instance must exist (Item 3: enforce with private constructor)
 * - Thread-safe: concurrent get/set must not cause data races
 * - getAll() must return an UNMODIFIABLE snapshot (Item 17)
 * - Null keys or values must throw IllegalArgumentException
 */
public class ConfigManager {

    // TODO: Implement singleton instance

    // TODO: Private constructor

    /**
     * Returns the singleton instance.
     */
    public static ConfigManager getInstance() {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /**
     * Sets a configuration value. Thread-safe.
     * @throws IllegalArgumentException if key or value is null
     */
    public void set(String key, String value) {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /**
     * Gets a configuration value, or null if not set. Thread-safe.
     */
    public String get(String key) {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /**
     * Returns an unmodifiable snapshot of all configuration entries.
     */
    public Map<String, String> getAll() {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /**
     * Removes a configuration entry. Returns the previous value, or null.
     */
    public String remove(String key) {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /** For testing only — resets the singleton state. */
    public void clear() {
        // TODO: implement
        throw new UnsupportedOperationException("Not yet implemented");
    }
}$$,
  -- requirements_md:
  $$# Configuration Manager — Implementation Challenge

## Objective
Implement a **thread-safe singleton** configuration manager from the provided skeleton.

## Requirements

### Singleton Pattern (Item 3)
- [ ] Only one `ConfigManager` instance may exist
- [ ] `getInstance()` returns the same reference every time
- [ ] Constructor is private

### Thread Safety
- [ ] `set()` and `get()` are safe for concurrent access
- [ ] Use `ConcurrentHashMap` or synchronized blocks — your choice
- [ ] No data races under parallel writes

### Immutability (Item 17)
- [ ] `getAll()` returns an **unmodifiable** map snapshot
- [ ] Modifying the returned map must throw `UnsupportedOperationException`

### Validation
- [ ] `set(null, ...)` and `set(..., null)` throw `IllegalArgumentException`

### Code Quality
- [ ] No use of `public` fields
- [ ] No raw types
- [ ] Clean, readable implementation$$,
  -- test_suite_code:
  $$package com.challenge;

import org.junit.jupiter.api.*;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;

class ChallengeTest {

    @BeforeEach
    void reset() {
        ConfigManager.getInstance().clear();
    }

    @Test
    void testSingletonReturnsSameInstance() {
        ConfigManager a = ConfigManager.getInstance();
        ConfigManager b = ConfigManager.getInstance();
        assertSame(a, b, "getInstance() must return the same reference");
    }

    @Test
    void testSetAndGet() {
        ConfigManager cfg = ConfigManager.getInstance();
        cfg.set("db.url", "jdbc:postgres://localhost/test");
        assertEquals("jdbc:postgres://localhost/test", cfg.get("db.url"));
    }

    @Test
    void testGetReturnsNullForMissing() {
        assertNull(ConfigManager.getInstance().get("nonexistent"));
    }

    @Test
    void testSetNullKeyThrows() {
        assertThrows(IllegalArgumentException.class,
            () -> ConfigManager.getInstance().set(null, "value"));
    }

    @Test
    void testSetNullValueThrows() {
        assertThrows(IllegalArgumentException.class,
            () -> ConfigManager.getInstance().set("key", null));
    }

    @Test
    void testGetAllReturnsUnmodifiableMap() {
        ConfigManager cfg = ConfigManager.getInstance();
        cfg.set("a", "1");
        Map<String, String> snapshot = cfg.getAll();
        assertThrows(UnsupportedOperationException.class,
            () -> snapshot.put("b", "2"));
    }

    @Test
    void testGetAllIsSnapshot() {
        ConfigManager cfg = ConfigManager.getInstance();
        cfg.set("x", "1");
        Map<String, String> before = cfg.getAll();
        cfg.set("y", "2");
        assertFalse(before.containsKey("y"), "Snapshot must not reflect later writes");
    }

    @Test
    void testRemove() {
        ConfigManager cfg = ConfigManager.getInstance();
        cfg.set("temp", "val");
        assertEquals("val", cfg.remove("temp"));
        assertNull(cfg.get("temp"));
    }

    @Test
    void testConcurrentAccess() throws Exception {
        ConfigManager cfg = ConfigManager.getInstance();
        int threads = 8;
        int opsPerThread = 500;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        AtomicBoolean failed = new AtomicBoolean(false);
        CountDownLatch latch = new CountDownLatch(threads);

        for (int t = 0; t < threads; t++) {
            final int tid = t;
            pool.submit(() -> {
                try {
                    for (int i = 0; i < opsPerThread; i++) {
                        cfg.set("key-" + tid + "-" + i, "val-" + i);
                        cfg.get("key-" + tid + "-" + i);
                        cfg.getAll();
                    }
                } catch (Exception e) {
                    failed.set(true);
                } finally {
                    latch.countDown();
                }
            });
        }
        latch.await(10, TimeUnit.SECONDS);
        pool.shutdown();
        assertFalse(failed.get(), "Concurrent access must not throw exceptions");
    }
}$$
);

-- Implement Challenge 2 — Topic 5 (Functional Patterns)
INSERT INTO challenges (seed_id, topic_id, title, theme, difficulty, challenge_type, story, legacy_code, requirements_md, test_suite_code)
VALUES (NULL, 5,
  'Build a Transaction Analytics Pipeline',
  'Transaction Pipeline',
  'hard',
  'implement',
  $$The finance team processes 2M transactions daily using nested for-loops with mutable accumulators. The code is unmaintainable and impossible to parallelize. The architect wants a clean Stream-based pipeline. Given a Transaction record and a TransactionAnalyzer interface, implement all methods using Java Streams (Item 45: use streams judiciously, Item 46: prefer side-effect-free functions). No for-loops allowed.$$,
  -- legacy_code (skeleton):
  $$package com.challenge;

import java.util.*;
import java.util.stream.*;

/**
 * IMPLEMENT ALL METHODS using Java Streams.
 *
 * Rules:
 * - No for/while/do-while loops
 * - No mutable accumulators (no external variables mutated inside lambdas)
 * - All methods must be implemented with stream pipelines
 */
public class TransactionAnalyzer {

    public record Transaction(String id, String category, double amount, boolean credit) {}

    /**
     * Filters transactions to only debits (credit == false).
     * Returns an UNMODIFIABLE list.
     */
    public List<Transaction> filterDebits(List<Transaction> transactions) {
        // TODO: implement with streams
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /**
     * Calculates the total amount of all transactions.
     */
    public double totalAmount(List<Transaction> transactions) {
        // TODO: implement with streams
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /**
     * Groups transactions by category.
     * Returns an unmodifiable map of category -> list of transactions.
     */
    public Map<String, List<Transaction>> groupByCategory(List<Transaction> transactions) {
        // TODO: implement with streams
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /**
     * Returns the top N transactions by amount (descending).
     * Returns an unmodifiable list.
     */
    public List<Transaction> topByAmount(List<Transaction> transactions, int n) {
        // TODO: implement with streams
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /**
     * Extracts all unique categories sorted alphabetically.
     * Returns an unmodifiable list.
     */
    public List<String> uniqueCategories(List<Transaction> transactions) {
        // TODO: implement with streams
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /**
     * Builds a summary string: "Category: $total" for each category, one per line,
     * sorted by category name. Example:
     *   Food: $450.00
     *   Rent: $1200.00
     */
    public String summaryByCategory(List<Transaction> transactions) {
        // TODO: implement with streams
        throw new UnsupportedOperationException("Not yet implemented");
    }
}$$,
  -- requirements_md:
  $$# Transaction Analytics Pipeline — Implementation Challenge

## Objective
Implement a complete **stream-based analytics pipeline** from the provided skeleton.

## Constraints
- [ ] **No loops** — all logic must use `Stream` pipelines
- [ ] **No side-effect accumulators** — no `forEach` that mutates external state
- [ ] Returned collections must be **unmodifiable** (Item 46)

## Methods to Implement

### `filterDebits()`
- [ ] Return only transactions where `credit == false`
- [ ] Result must be unmodifiable

### `totalAmount()`
- [ ] Sum all transaction amounts using `mapToDouble` + `sum()`

### `groupByCategory()`
- [ ] Group by `category` using `Collectors.groupingBy`
- [ ] Returned map must be unmodifiable

### `topByAmount()`
- [ ] Sort descending by amount, take top N
- [ ] Result must be unmodifiable

### `uniqueCategories()`
- [ ] Distinct categories, sorted alphabetically
- [ ] Result must be unmodifiable

### `summaryByCategory()`
- [ ] Format: `Category: $amount` per line, sorted by category
- [ ] Use `Collectors.joining` for the final string$$,
  -- test_suite_code:
  $$package com.challenge;

import org.junit.jupiter.api.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class ChallengeTest {

    private TransactionAnalyzer analyzer;
    private List<TransactionAnalyzer.Transaction> sampleData;

    @BeforeEach
    void setUp() {
        analyzer = new TransactionAnalyzer();
        sampleData = List.of(
            new TransactionAnalyzer.Transaction("t1", "Food", 45.0, false),
            new TransactionAnalyzer.Transaction("t2", "Salary", 3000.0, true),
            new TransactionAnalyzer.Transaction("t3", "Rent", 1200.0, false),
            new TransactionAnalyzer.Transaction("t4", "Food", 32.50, false),
            new TransactionAnalyzer.Transaction("t5", "Transport", 15.0, false)
        );
    }

    @Test
    void testFilterDebitsCount() {
        List<TransactionAnalyzer.Transaction> debits = analyzer.filterDebits(sampleData);
        assertEquals(4, debits.size());
    }

    @Test
    void testFilterDebitsUnmodifiable() {
        List<TransactionAnalyzer.Transaction> debits = analyzer.filterDebits(sampleData);
        assertThrows(UnsupportedOperationException.class,
            () -> debits.add(new TransactionAnalyzer.Transaction("x", "X", 0, false)));
    }

    @Test
    void testTotalAmount() {
        double total = analyzer.totalAmount(sampleData);
        assertEquals(4292.5, total, 0.01);
    }

    @Test
    void testGroupByCategory() {
        Map<String, List<TransactionAnalyzer.Transaction>> grouped = analyzer.groupByCategory(sampleData);
        assertEquals(4, grouped.size());
        assertEquals(2, grouped.get("Food").size());
    }

    @Test
    void testTopByAmount() {
        List<TransactionAnalyzer.Transaction> top2 = analyzer.topByAmount(sampleData, 2);
        assertEquals(2, top2.size());
        assertEquals(3000.0, top2.get(0).amount());
        assertEquals(1200.0, top2.get(1).amount());
    }

    @Test
    void testTopByAmountUnmodifiable() {
        assertThrows(UnsupportedOperationException.class,
            () -> analyzer.topByAmount(sampleData, 1).clear());
    }

    @Test
    void testUniqueCategories() {
        List<String> cats = analyzer.uniqueCategories(sampleData);
        assertEquals(List.of("Food", "Rent", "Salary", "Transport"), cats);
    }

    @Test
    void testUniqueCategoriesUnmodifiable() {
        assertThrows(UnsupportedOperationException.class,
            () -> analyzer.uniqueCategories(sampleData).add("X"));
    }

    @Test
    void testSummaryByCategory() {
        String summary = analyzer.summaryByCategory(sampleData);
        assertTrue(summary.contains("Food: $77.50"), "Should contain Food total");
        assertTrue(summary.contains("Rent: $1200.00"), "Should contain Rent total");
        assertTrue(summary.indexOf("Food") < summary.indexOf("Rent"), "Should be alphabetically sorted");
    }
}$$
);

-- Debug Challenge 1 — Topic 3 (Data Structures)
INSERT INTO challenges (seed_id, topic_id, title, theme, difficulty, challenge_type, story, legacy_code, requirements_md, test_suite_code)
VALUES (NULL, 3,
  'The Inventory Count Mismatch',
  'Inventory Tracker',
  'medium',
  'debug',
  $$QA discovered that the warehouse inventory system is reporting wrong quantities. The getTotalQuantity() method sometimes returns negative numbers, findItem() returns null for items that definitely exist, and the restock operation occasionally doubles the quantity instead of adding to it. There are 3 bugs in the code. All methods compile and run without exceptions — they just produce wrong results. Find and fix all three.$$,
  -- legacy_code (buggy):
  $$package com.challenge;

import java.util.*;

/**
 * DEBUG THIS CLASS — 3 bugs are hiding in the code.
 *
 * The code compiles and runs, but produces WRONG RESULTS.
 * All tests should pass once you find and fix the bugs.
 *
 * Hint: Think about how Java compares objects, how Integer caching
 * works, and off-by-one errors.
 */
public class InventoryTracker {

    private final Map<String, Integer> inventory = new HashMap<>();

    public void addItem(String name, int quantity) {
        inventory.put(name, quantity);
    }

    /**
     * BUG #1 somewhere here — restock should ADD to existing quantity
     */
    public void restock(String name, int additionalQuantity) {
        Integer current = inventory.get(name);
        if (current != null) {
            // Bug: should be current + additionalQuantity
            inventory.put(name, additionalQuantity);
        }
    }

    /**
     * BUG #2 somewhere here — comparison issue
     */
    public boolean hasExactQuantity(String name, Integer expectedQuantity) {
        Integer actual = inventory.get(name);
        if (actual == null) return false;
        // Bug: using == instead of .equals() — fails for values > 127
        return actual == expectedQuantity;
    }

    /**
     * BUG #3 somewhere here — off-by-one
     */
    public int getTotalQuantity() {
        int total = 0;
        List<Integer> quantities = new ArrayList<>(inventory.values());
        // Bug: starts at 1 instead of 0 — skips first element
        for (int i = 1; i < quantities.size(); i++) {
            total += quantities.get(i);
        }
        return total;
    }

    public Integer findItem(String name) {
        return inventory.get(name);
    }

    public int size() {
        return inventory.size();
    }

    public Map<String, Integer> getAll() {
        return Collections.unmodifiableMap(inventory);
    }
}$$,
  -- requirements_md:
  $$# Inventory Count Mismatch — Debug Challenge

## Objective
Find and fix **3 bugs** in the `InventoryTracker` class. The code compiles and runs without exceptions — but produces wrong results.

## Reported Issues
1. **Restock doubles quantity** — `restock("Widget", 10)` on an item with quantity 50 should give 60, but gives 10
2. **Quantity comparison fails for large numbers** — `hasExactQuantity("Widget", 200)` returns false even when Widget has exactly 200 units
3. **Total quantity is wrong** — `getTotalQuantity()` seems to skip counting one of the items

## Rules
- [ ] Fix all 3 bugs without changing method signatures
- [ ] All tests must pass after your fix
- [ ] Do not add new methods or fields

## Hints
- Think about Java's Integer caching behavior (values -128 to 127)
- Think about how `==` compares objects vs primitives
- Check loop boundaries carefully$$,
  -- test_suite_code:
  $$package com.challenge;

import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class ChallengeTest {

    private InventoryTracker tracker;

    @BeforeEach
    void setUp() {
        tracker = new InventoryTracker();
    }

    @Test
    void testAddAndFind() {
        tracker.addItem("Widget", 100);
        assertEquals(100, tracker.findItem("Widget"));
    }

    @Test
    void testRestockAddsToExisting() {
        tracker.addItem("Widget", 50);
        tracker.restock("Widget", 10);
        assertEquals(60, tracker.findItem("Widget"), "Restock should ADD 10 to existing 50");
    }

    @Test
    void testRestockMultipleTimes() {
        tracker.addItem("Bolt", 100);
        tracker.restock("Bolt", 25);
        tracker.restock("Bolt", 25);
        assertEquals(150, tracker.findItem("Bolt"));
    }

    @Test
    void testHasExactQuantitySmallNumber() {
        tracker.addItem("Nail", 50);
        assertTrue(tracker.hasExactQuantity("Nail", 50));
    }

    @Test
    void testHasExactQuantityLargeNumber() {
        tracker.addItem("Screw", 200);
        assertTrue(tracker.hasExactQuantity("Screw", 200),
            "Must use .equals() not == for Integer comparison above 127");
    }

    @Test
    void testHasExactQuantityWrongAmount() {
        tracker.addItem("Gear", 100);
        assertFalse(tracker.hasExactQuantity("Gear", 99));
    }

    @Test
    void testGetTotalQuantityAllItems() {
        tracker.addItem("A", 10);
        tracker.addItem("B", 20);
        tracker.addItem("C", 30);
        assertEquals(60, tracker.getTotalQuantity(), "Total must include ALL items");
    }

    @Test
    void testGetTotalQuantitySingleItem() {
        tracker.addItem("Solo", 42);
        assertEquals(42, tracker.getTotalQuantity(), "Single item must not be skipped");
    }

    @Test
    void testGetTotalQuantityEmpty() {
        assertEquals(0, tracker.getTotalQuantity());
    }

    @Test
    void testGetAllIsUnmodifiable() {
        tracker.addItem("X", 1);
        assertThrows(UnsupportedOperationException.class,
            () -> tracker.getAll().put("Y", 2));
    }
}$$
);

-- Debug Challenge 2 — Topic 6 (Collections)
INSERT INTO challenges (seed_id, topic_id, title, theme, difficulty, challenge_type, story, legacy_code, requirements_md, test_suite_code)
VALUES (NULL, 6,
  'The Leaking Cache',
  'API Response Cache',
  'hard',
  'debug',
  $$The ops team flagged a memory leak in the API gateway cache. The ResponseCache class grows without bound — after 48 hours it consumes 8GB of heap. Additionally, the cleanup() method throws ConcurrentModificationException in production under load, and clients report stale data because getEntries() returns the mutable internal list. There are 3 bugs. The code compiles fine and works perfectly in single-threaded unit tests — but fails under real conditions.$$,
  -- legacy_code (buggy):
  $$package com.challenge;

import java.util.*;

/**
 * DEBUG THIS CLASS — 3 bugs are hiding in the code.
 *
 * The code compiles and works in simple tests, but fails in production:
 * 1. Memory grows without bound (no eviction)
 * 2. ConcurrentModificationException during cleanup
 * 3. Callers can corrupt internal state via returned list
 *
 * Fix all three bugs.
 */
public class ResponseCache {

    private final int maxSize;
    // Bug #1: HashMap has no eviction — should use LinkedHashMap with removeEldestEntry
    private final Map<String, String> cache = new HashMap<>();
    private final List<String> accessLog = new ArrayList<>();

    public ResponseCache(int maxSize) {
        this.maxSize = maxSize;
    }

    public void put(String key, String value) {
        cache.put(key, value);
        accessLog.add(key);
    }

    public String get(String key) {
        accessLog.add(key);
        return cache.get(key);
    }

    /**
     * Bug #2: Modifying map while iterating over it
     */
    public void cleanup(Set<String> keysToRemove) {
        for (String key : cache.keySet()) {
            if (keysToRemove.contains(key)) {
                cache.remove(key);
            }
        }
    }

    /**
     * Bug #3: Returns mutable internal list — callers can corrupt state
     */
    public List<String> getAccessLog() {
        return accessLog;
    }

    public int size() {
        return cache.size();
    }

    public boolean containsKey(String key) {
        return cache.containsKey(key);
    }

    public Map<String, String> snapshot() {
        return Collections.unmodifiableMap(new HashMap<>(cache));
    }
}$$,
  -- requirements_md:
  $$# The Leaking Cache — Debug Challenge

## Objective
Find and fix **3 bugs** in the `ResponseCache` class.

## Reported Production Issues
1. **Memory leak** — cache grows without bound, consuming 8GB after 48 hours. Needs size eviction.
2. **ConcurrentModificationException** — `cleanup()` crashes when removing entries because it modifies the map during iteration
3. **Data corruption** — `getAccessLog()` returns the internal mutable list. Clients accidentally clear it.

## Rules
- [ ] Fix all 3 bugs without changing method signatures
- [ ] The cache must automatically evict the oldest entry when `maxSize` is exceeded
- [ ] `cleanup()` must safely remove entries without CME
- [ ] `getAccessLog()` must return a defensive copy
- [ ] All tests must pass after your fix

## Hints
- `LinkedHashMap` has a `removeEldestEntry` hook
- Iterator-based removal or `removeAll()` avoids ConcurrentModificationException
- Return `Collections.unmodifiableList(new ArrayList<>(...))` for safety$$,
  -- test_suite_code:
  $$package com.challenge;

import org.junit.jupiter.api.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class ChallengeTest {

    @Test
    void testPutAndGet() {
        ResponseCache cache = new ResponseCache(5);
        cache.put("k1", "v1");
        assertEquals("v1", cache.get("k1"));
    }

    @Test
    void testEvictionAtMaxSize() {
        ResponseCache cache = new ResponseCache(3);
        cache.put("a", "1");
        cache.put("b", "2");
        cache.put("c", "3");
        cache.put("d", "4");
        assertEquals(3, cache.size(), "Cache must evict oldest when exceeding maxSize");
        assertFalse(cache.containsKey("a"), "Oldest entry 'a' should be evicted");
        assertTrue(cache.containsKey("d"), "Newest entry 'd' should exist");
    }

    @Test
    void testEvictionKeepsNewest() {
        ResponseCache cache = new ResponseCache(2);
        cache.put("x", "1");
        cache.put("y", "2");
        cache.put("z", "3");
        assertFalse(cache.containsKey("x"));
        assertTrue(cache.containsKey("y"));
        assertTrue(cache.containsKey("z"));
    }

    @Test
    void testCleanupDoesNotThrowCME() {
        ResponseCache cache = new ResponseCache(10);
        cache.put("a", "1");
        cache.put("b", "2");
        cache.put("c", "3");
        assertDoesNotThrow(() -> cache.cleanup(Set.of("a", "c")),
            "cleanup must not throw ConcurrentModificationException");
        assertEquals(1, cache.size());
        assertTrue(cache.containsKey("b"));
    }

    @Test
    void testCleanupRemovesCorrectKeys() {
        ResponseCache cache = new ResponseCache(10);
        cache.put("keep", "yes");
        cache.put("remove1", "no");
        cache.put("remove2", "no");
        cache.cleanup(Set.of("remove1", "remove2"));
        assertFalse(cache.containsKey("remove1"));
        assertFalse(cache.containsKey("remove2"));
        assertTrue(cache.containsKey("keep"));
    }

    @Test
    void testGetAccessLogIsDefensiveCopy() {
        ResponseCache cache = new ResponseCache(10);
        cache.put("a", "1");
        cache.get("a");
        List<String> log = cache.getAccessLog();
        int sizeBefore = log.size();
        assertThrows(UnsupportedOperationException.class, () -> log.add("hack"),
            "Returned log must be unmodifiable");
    }

    @Test
    void testGetAccessLogContainsOperations() {
        ResponseCache cache = new ResponseCache(10);
        cache.put("x", "1");
        cache.get("x");
        cache.get("x");
        List<String> log = cache.getAccessLog();
        assertEquals(3, log.size(), "Should log put + 2 gets");
    }

    @Test
    void testSnapshotIsUnmodifiable() {
        ResponseCache cache = new ResponseCache(5);
        cache.put("s", "1");
        assertThrows(UnsupportedOperationException.class,
            () -> cache.snapshot().put("hack", "bad"));
    }
}$$
);
