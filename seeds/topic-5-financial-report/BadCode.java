package com.challenge;

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
