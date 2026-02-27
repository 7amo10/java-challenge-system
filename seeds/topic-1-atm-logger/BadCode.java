package com.challenge;

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
