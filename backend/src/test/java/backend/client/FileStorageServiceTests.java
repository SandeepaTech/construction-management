package backend.client;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

class FileStorageServiceTests {
	private FileStorageService storageService;

	@BeforeEach
	void setUp() {
		storageService = new FileStorageService();
	}

	@Test
	void validImageIsAccepted() {
		MockMultipartFile file = new MockMultipartFile(
				"file",
				"plan.png",
				"image/png",
				new byte[]{1, 2, 3, 4});

		storageService.validateFile(file);
	}

	@Test
	void validPdfIsAccepted() {
		MockMultipartFile file = new MockMultipartFile(
				"file",
				"contract.pdf",
				"application/pdf",
				new byte[]{1, 2, 3, 4});

		storageService.validateFile(file);
	}

	@Test
	void unsupportedExtensionIsRejected() {
		MockMultipartFile file = new MockMultipartFile(
				"file",
				"virus.exe",
				"application/octet-stream",
				new byte[]{1, 2, 3, 4});

		assertThrows(ResponseStatusException.class, () -> storageService.validateFile(file));
	}

	@Test
	void pathTraversalIsRejected() {
		MockMultipartFile file = new MockMultipartFile(
				"file",
				"../secret.pdf",
				"application/pdf",
				new byte[]{1, 2, 3, 4});

		assertThrows(ResponseStatusException.class, () -> storageService.validateFile(file));
	}
}
