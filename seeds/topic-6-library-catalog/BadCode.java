package com.challenge;

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
