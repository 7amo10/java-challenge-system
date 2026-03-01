package com.javachallenge.grader.docker;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.model.*;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.zerodep.ZerodepDockerHttpClient;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Component
public class DockerSandbox {

    private static final String MAVEN_IMAGE = "maven:3.9-eclipse-temurin-21-alpine";
    private static final long MEMORY_LIMIT = 512 * 1024 * 1024L; // 512 MB
    private static final int TIMEOUT_SECONDS = 300;

    public record ExecutionResult(int exitCode, String output) {}

    public ExecutionResult runMavenTests(Path workDir) throws Exception {
        DefaultDockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder()
                .withDockerHost("unix:///var/run/docker.sock")
                .build();

        ZerodepDockerHttpClient httpClient = new ZerodepDockerHttpClient.Builder()
                .dockerHost(URI.create("unix:///var/run/docker.sock"))
                .maxConnections(10)
                .connectionTimeout(Duration.ofSeconds(30))
                .responseTimeout(Duration.ofSeconds(TIMEOUT_SECONDS))
                .build();

        try (DockerClient docker = DockerClientImpl.getInstance(config, httpClient)) {
            // Pull image if not present (silent)
            try {
                docker.pullImageCmd(MAVEN_IMAGE).start().awaitCompletion(60, TimeUnit.SECONDS);
            } catch (Exception ignored) { /* image likely already present */ }

            // Create container with resource limits + shared Maven cache
            HostConfig hostConfig = HostConfig.newHostConfig()
                    .withMemory(MEMORY_LIMIT)
                    .withCpuCount(1L)
                    .withBinds(
                            new Bind(workDir.toAbsolutePath().toString(),
                                    new Volume("/workspace"), AccessMode.rw),
                            new Bind("javachallenge-m2-cache",
                                    new Volume("/root/.m2/repository"), AccessMode.rw)
                    );

            CreateContainerResponse container = docker.createContainerCmd(MAVEN_IMAGE)
                    .withCmd("mvn", "-B", "--no-transfer-progress", "test", "checkstyle:check",
                             "-f", "/workspace/pom.xml")
                    .withWorkingDir("/workspace")
                    .withHostConfig(hostConfig)
                    .exec();

            String containerId = container.getId();
            try {
                docker.startContainerCmd(containerId).exec();

                // Wait with timeout
                Integer exitCode = docker.waitContainerCmd(containerId)
                        .start()
                        .awaitStatusCode(TIMEOUT_SECONDS, TimeUnit.SECONDS);

                // Collect logs
                ByteArrayOutputStream logStream = new ByteArrayOutputStream();
                docker.logContainerCmd(containerId)
                        .withStdOut(true)
                        .withStdErr(true)
                        .withFollowStream(false)
                        .exec(new com.github.dockerjava.api.async.ResultCallbackTemplate<>() {
                            @Override
                            public void onNext(Frame frame) {
                                try { logStream.write(frame.getPayload()); }
                                catch (Exception ignored) {}
                            }
                        }).awaitCompletion();

                return new ExecutionResult(exitCode != null ? exitCode : 1,
                        logStream.toString(StandardCharsets.UTF_8));
            } finally {
                try { docker.removeContainerCmd(containerId).withForce(true).exec(); }
                catch (Exception ignored) {}
            }
        }
    }
}
