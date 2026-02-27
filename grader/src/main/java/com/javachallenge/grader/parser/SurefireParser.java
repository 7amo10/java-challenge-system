package com.javachallenge.grader.parser;

import com.javachallenge.grader.model.TestResult;
import org.springframework.stereotype.Component;
import org.w3c.dom.*;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Component
public class SurefireParser {

    public List<TestResult> parse(Path surefireReportsDir) {
        List<TestResult> results = new ArrayList<>();
        if (!Files.exists(surefireReportsDir)) return results;

        File[] xmlFiles = surefireReportsDir.toFile()
                .listFiles(f -> f.getName().endsWith(".xml"));
        if (xmlFiles == null) return results;

        for (File xmlFile : xmlFiles) {
            try {
                Document doc = DocumentBuilderFactory.newInstance()
                        .newDocumentBuilder().parse(xmlFile);
                NodeList testcases = doc.getElementsByTagName("testcase");

                for (int i = 0; i < testcases.getLength(); i++) {
                    Element tc = (Element) testcases.item(i);
                    String name = tc.getAttribute("classname") + "#" + tc.getAttribute("name");
                    double time = parseDouble(tc.getAttribute("time"));

                    NodeList failures = tc.getElementsByTagName("failure");
                    NodeList errors = tc.getElementsByTagName("error");

                    if (failures.getLength() > 0) {
                        results.add(new TestResult(name, false,
                                failures.item(0).getTextContent().strip(), time));
                    } else if (errors.getLength() > 0) {
                        results.add(new TestResult(name, false,
                                errors.item(0).getTextContent().strip(), time));
                    } else {
                        results.add(new TestResult(name, true, null, time));
                    }
                }
            } catch (Exception e) {
                results.add(new TestResult(xmlFile.getName(), false, e.getMessage(), 0));
            }
        }
        return results;
    }

    private double parseDouble(String s) {
        try { return Double.parseDouble(s); } catch (Exception e) { return 0.0; }
    }
}
