package com.javachallenge.grader.parser;

import com.javachallenge.grader.model.CheckstyleViolation;
import org.springframework.stereotype.Component;
import org.w3c.dom.*;

import javax.xml.parsers.DocumentBuilderFactory;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Component
public class CheckstyleParser {

    public List<CheckstyleViolation> parse(Path checkstyleResultXml) {
        List<CheckstyleViolation> violations = new ArrayList<>();
        if (!Files.exists(checkstyleResultXml)) return violations;

        try {
            Document doc = DocumentBuilderFactory.newInstance()
                    .newDocumentBuilder().parse(checkstyleResultXml.toFile());
            NodeList files = doc.getElementsByTagName("file");

            for (int i = 0; i < files.getLength(); i++) {
                Element file = (Element) files.item(i);
                String fileName = file.getAttribute("name");
                NodeList errors = file.getElementsByTagName("error");

                for (int j = 0; j < errors.getLength(); j++) {
                    Element err = (Element) errors.item(j);
                    violations.add(new CheckstyleViolation(
                            fileName,
                            parseInt(err.getAttribute("line")),
                            err.getAttribute("severity"),
                            err.getAttribute("message"),
                            err.getAttribute("source")
                    ));
                }
            }
        } catch (Exception e) {
            violations.add(new CheckstyleViolation("parse-error", 0, "error", e.getMessage(), ""));
        }
        return violations;
    }

    private int parseInt(String s) {
        try { return Integer.parseInt(s); } catch (Exception e) { return 0; }
    }
}
