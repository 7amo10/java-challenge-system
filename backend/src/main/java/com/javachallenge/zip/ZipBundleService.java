package com.javachallenge.zip;

import com.javachallenge.challenge.Challenge;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@Service
public class ZipBundleService {

    public void writeBundle(Challenge challenge, OutputStream out) throws IOException {
        String slug = challenge.getTheme().toLowerCase().replaceAll("[^a-z0-9]+", "-");

        try (ZipArchiveOutputStream zip = new ZipArchiveOutputStream(out)) {
            // pom.xml
            addEntry(zip, slug + "/pom.xml", buildPom(slug));
            // README.md
            addEntry(zip, slug + "/README.md", buildReadme(challenge));
            // Requirements.md
            addEntry(zip, slug + "/Requirements.md", challenge.getRequirementsMd());
            // BadCode.java (the legacy file to refactor)
            addEntry(zip, slug + "/src/main/java/com/challenge/BadCode.java", challenge.getLegacyCode());
            // Visible test suite
            addEntry(zip, slug + "/src/test/java/com/challenge/ChallengeTest.java", challenge.getTestSuiteCode());
            // checkstyle.xml
            addEntry(zip, slug + "/checkstyle.xml", buildCheckstyleXml(challenge.getCheckstyleRulesJson()));
        }
    }

    private void addEntry(ZipArchiveOutputStream zip, String name, String content) throws IOException {
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        ZipArchiveEntry entry = new ZipArchiveEntry(name);
        entry.setSize(bytes.length);
        zip.putArchiveEntry(entry);
        zip.write(bytes);
        zip.closeArchiveEntry();
    }

    private String buildPom(String artifactId) {
        return """
            <?xml version="1.0" encoding="UTF-8"?>
            <project xmlns="http://maven.apache.org/POM/4.0.0"
                     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
              <modelVersion>4.0.0</modelVersion>
              <groupId>com.challenge</groupId>
              <artifactId>%s</artifactId>
              <version>1.0-SNAPSHOT</version>
              <properties>
                <maven.compiler.source>21</maven.compiler.source>
                <maven.compiler.target>21</maven.compiler.target>
                <junit.version>5.10.0</junit.version>
              </properties>
              <dependencies>
                <dependency>
                  <groupId>org.junit.jupiter</groupId>
                  <artifactId>junit-jupiter</artifactId>
                  <version>${junit.version}</version>
                  <scope>test</scope>
                </dependency>
              </dependencies>
              <build>
                <plugins>
                  <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-surefire-plugin</artifactId>
                    <version>3.2.5</version>
                  </plugin>
                  <plugin>
                    <groupId>org.checkstyle</groupId>
                    <artifactId>checkstyle-maven-plugin</artifactId>
                    <version>3.3.1</version>
                    <configuration>
                      <configLocation>checkstyle.xml</configLocation>
                      <failsOnError>true</failsOnError>
                    </configuration>
                  </plugin>
                </plugins>
              </build>
            </project>
            """.formatted(artifactId);
    }

    private String buildReadme(Challenge challenge) {
        return "# " + challenge.getTitle() + "\n\n" + challenge.getStory() +
               "\n\n## Getting Started\n\nSee `Requirements.md` for the full refactoring checklist.\n\n" +
               "Run tests: `mvn test`\nRun Checkstyle: `mvn checkstyle:check`\n";
    }

    private String buildCheckstyleXml(String rulesJson) {
        // Basic Checkstyle config - rules injected from seed metadata
        return """
            <?xml version="1.0"?>
            <!DOCTYPE module PUBLIC
                "-//Checkstyle//DTD Checkstyle Configuration 1.3//EN"
                "https://checkstyle.org/dtds/configuration_1_3.dtd">
            <module name="Checker">
              <module name="TreeWalker">
                <module name="IllegalType">
                  <property name="illegalClassNames" value="java.util.Hashtable, java.util.Vector"/>
                </module>
                <module name="GenericWhitespace"/>
                <module name="MethodTypeParameterName"/>
              </module>
            </module>
            """;
    }
}
