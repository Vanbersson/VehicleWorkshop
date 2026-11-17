package com.concierge.apiconcierge.services.resale;

import com.concierge.apiconcierge.exceptions.BusinessException;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.resales.Resale;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.ResaleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ResaleLogoServiceTest {
    @TempDir Path uploads;
    ResaleRepository repository;
    ResaleLogoService service;
    Resale resale;
    User user;

    @BeforeEach void setup() {
        repository = mock(ResaleRepository.class);
        service = new ResaleLogoService(repository, uploads.toString());
        resale = new Resale(); resale.setCompanyId(1); resale.setId(8);
        user = new User(); user.setCompanyId(1); user.setStatus(StatusEnableDisable.Habilitado);
        when(repository.findByCompanyIdAndId(1, 8)).thenReturn(resale);
        when(repository.saveAndFlush(resale)).thenReturn(resale);
    }

    private MockMultipartFile image() throws Exception {
        return image(40, 20);
    }

    private MockMultipartFile image(int width, int height) throws Exception {
        var bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB), "png", bytes);
        return new MockMultipartFile("file", "logo.png", "image/png", bytes.toByteArray());
    }

    @Test void uploadsAndReplacesLogoWithoutChangingTheOldFileBeforeSave() throws Exception {
        service.save(1, 8, image(), user);
        String old = resale.getLogoUrl();
        Path oldFile = uploads.resolve(old.substring("/images/".length()));
        assertTrue(Files.exists(oldFile));
        service.save(1, 8, image(), user);
        assertNotEquals(old, resale.getLogoUrl());
        assertFalse(Files.exists(oldFile));
        assertTrue(Files.exists(uploads.resolve(resale.getLogoUrl().substring("/images/".length()))));
    }

    @Test void removesTheStoredLogoAndFile() throws Exception {
        service.save(1, 8, image(), user);
        Path file = uploads.resolve(resale.getLogoUrl().substring("/images/".length()));
        service.remove(1, 8, user);
        assertNull(resale.getLogoUrl()); assertFalse(Files.exists(file));
    }

    @Test void keepsOldLogoAndCleansTheNewFileWhenDatabaseSaveFails() throws Exception {
        service.save(1, 8, image(), user);
        String old = resale.getLogoUrl();
        when(repository.saveAndFlush(resale)).thenThrow(new IllegalStateException("database"));
        assertThrows(IllegalStateException.class, () -> service.save(1, 8, image(), user));
        assertEquals(old, resale.getLogoUrl());
        try (var files = Files.list(uploads.resolve("1/8/branding"))) { assertEquals(1, files.count()); }
    }

    @Test void rejectsInvalidFilesAndOtherCompanyAccess() throws Exception {
        assertThrows(BusinessException.class, () -> service.save(1, 8, new MockMultipartFile("file", "logo.png", "image/png", "not an image".getBytes()), user));
        assertThrows(BusinessException.class, () -> service.save(1, 8, new MockMultipartFile("file", "large.png", "image/png", new byte[5 * 1024 * 1024 + 1]), user));
        user.setCompanyId(2);
        assertThrows(ResponseStatusException.class, () -> service.save(1, 8, image(), user));
        assertThrows(ResponseStatusException.class, () -> service.remove(1, 8, user));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test void removingAnExternalLogoDoesNotDeleteArbitraryFiles() throws Exception {
        Path other = uploads.resolve("other.png"); Files.writeString(other, "keep");
        resale.setLogoUrl("/images/1/8/branding/../../../other.png");
        service.remove(1, 8, user);
        assertTrue(Files.exists(other));
        assertNull(resale.getLogoUrl());
    }
    @Test void accepts4096By2048AndRejectsImagesBeyondEitherLimit() throws Exception {
        service.save(1, 8, image(4096, 2048), user);
        String saved = resale.getLogoUrl();
        assertNotNull(saved);
        assertThrows(BusinessException.class, () -> service.save(1, 8, image(4097, 10), user));
        assertThrows(BusinessException.class, () -> service.save(1, 8, image(10, 2049), user));
        assertEquals(saved, resale.getLogoUrl());
    }
}
