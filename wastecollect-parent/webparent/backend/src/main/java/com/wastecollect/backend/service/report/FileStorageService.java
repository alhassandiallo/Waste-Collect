package com.wastecollect.backend.service.report;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Service for handling file storage operations.
 * This implementation saves files to the local file system.
 * It can be swapped with another implementation (e.g., S3StorageService)
 * without changing the services that use it.
 */
public interface FileStorageService {
    String saveFile(byte[] content, String fileName) throws IOException;
    byte[] downloadFile(String filePath) throws IOException;
}

@Service
class LocalFileStorageService implements FileStorageService {
    private static final Logger logger = LoggerFactory.getLogger(LocalFileStorageService.class);
    private final Path fileStorageLocation;

    public LocalFileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    public String saveFile(byte[] content, String fileName) throws IOException {
        Path targetLocation = this.fileStorageLocation.resolve(fileName);
        Files.write(targetLocation, content);
        logger.info("Saved file to local path: {}", targetLocation.toString());
        return targetLocation.toString();
    }

    @Override
    public byte[] downloadFile(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        if (!Files.exists(path) || !Files.isReadable(path)) {
            throw new IOException("File not found or is not readable: " + filePath);
        }
        logger.info("Reading file from local path: {}", filePath);
        return Files.readAllBytes(path);
    }
}
