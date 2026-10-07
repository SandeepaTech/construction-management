package backend.client;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FileStorageService {
	private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
	private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "pdf");
	private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
			"image/jpeg",
			"image/jpg",
			"image/pjpeg",
			"image/png",
			"application/pdf");

	private final Path baseUploadDir;

	public FileStorageService() {
		this.baseUploadDir = Paths.get("uploads", "project-requests").toAbsolutePath().normalize();
		try {
			Files.createDirectories(this.baseUploadDir);
		} catch (IOException e) {
			throw new IllegalStateException("Could not initialize upload storage location", e);
		}
	}

	public void validateFile(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty.");
		}
		if (file.getSize() > MAX_FILE_SIZE) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File " + file.getOriginalFilename() + " exceeds the 10MB limit.");
		}

		String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed");
		if (originalFileName.contains("..") || originalFileName.contains("/") || originalFileName.contains("\\")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name: " + originalFileName);
		}

		String extension = getFileExtension(originalFileName).toLowerCase(Locale.ROOT);
		if (!ALLOWED_EXTENSIONS.contains(extension)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File extension '." + extension + "' is not supported. Supported: JPG, JPEG, PNG, PDF.");
		}

		String contentType = file.getContentType();
		if (contentType != null && !contentType.isBlank()) {
			String lowerMime = contentType.toLowerCase(Locale.ROOT);
			if (!ALLOWED_MIME_TYPES.contains(lowerMime)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file type: " + contentType);
			}
		}
	}

	public ProjectRequestAttachment storeFile(ProjectRequest projectRequest, MultipartFile file) {
		validateFile(file);

		String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
		String extension = getFileExtension(originalFileName).toLowerCase(Locale.ROOT);
		String uniqueId = UUID.randomUUID().toString();
		String storedFileName = uniqueId + (extension.isEmpty() ? "" : "." + extension);

		try {
			Path targetDir = this.baseUploadDir.resolve(String.valueOf(projectRequest.getId())).normalize();
			Files.createDirectories(targetDir);

			Path targetLocation = targetDir.resolve(storedFileName).normalize();
			// Path traversal check
			if (!targetLocation.startsWith(targetDir)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path traversal.");
			}

			try (InputStream inputStream = file.getInputStream()) {
				Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
			}

			String fileType = file.getContentType() != null && !file.getContentType().isBlank()
					? file.getContentType()
					: (extension.equals("pdf") ? "application/pdf" : "image/" + extension);

			return new ProjectRequestAttachment(
					projectRequest,
					originalFileName,
					storedFileName,
					fileType,
					file.getSize(),
					targetLocation.toString());
		} catch (IOException ex) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file: " + originalFileName, ex);
		}
	}

	public Resource loadFileAsResource(ProjectRequestAttachment attachment) {
		try {
			Path filePath = Paths.get(attachment.getFilePath()).normalize();
			Resource resource = new UrlResource(filePath.toUri());
			if (resource.exists() && resource.isReadable()) {
				return resource;
			}
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found: " + attachment.getOriginalFileName());
		} catch (MalformedURLException ex) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File path is invalid: " + attachment.getOriginalFileName(), ex);
		}
	}

	private String getFileExtension(String filename) {
		int dotIndex = filename.lastIndexOf('.');
		return (dotIndex == -1 || dotIndex == filename.length() - 1) ? "" : filename.substring(dotIndex + 1);
	}
}
