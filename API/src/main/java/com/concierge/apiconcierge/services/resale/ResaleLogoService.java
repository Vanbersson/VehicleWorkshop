package com.concierge.apiconcierge.services.resale;

import com.concierge.apiconcierge.exceptions.BusinessException;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.resales.Resale;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.ResaleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.MemoryCacheImageInputStream;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ResaleLogoService {
    private static final Logger logger = LoggerFactory.getLogger(ResaleLogoService.class);
    private final ResaleRepository repository;
    private final Path uploadDirectory;

    public ResaleLogoService(ResaleRepository repository, @Value("${local.image.upload}") String uploadDirectory) {
        this.repository = repository;
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    public Resale save(Integer companyId, Integer resaleId, MultipartFile file, User user) {
        Resale resale = authorizedResale(companyId, resaleId, user);
        BufferedImage image = readImage(file);
        Path directory = logoDirectory(companyId, resaleId);
        Path target = directory.resolve("logo-" + UUID.randomUUID() + ".png");
        String previous = resale.getLogoUrl();
        try {
            Files.createDirectories(directory);
            try (var output = Files.newOutputStream(target)) {
                if (!ImageIO.write(image, "png", output)) throw new IOException("PNG encoder unavailable");
            }
            resale.setLogoUrl(prefix(companyId, resaleId) + target.getFileName());
            Resale saved = repository.saveAndFlush(resale);
            cleanPrevious(previous, companyId, resaleId);
            return saved;
        } catch (IOException | RuntimeException exception) {
            resale.setLogoUrl(previous);
            try { Files.deleteIfExists(target); } catch (IOException cleanup) { logger.warn("Could not clean failed resale logo upload", cleanup); }
            if (exception instanceof RuntimeException runtime) throw runtime;
            throw new BusinessException("Não foi possível salvar a logo da revenda. Tente novamente.");
        }
    }

    public Resale remove(Integer companyId, Integer resaleId, User user) {
        Resale resale = authorizedResale(companyId, resaleId, user);
        String previous = resale.getLogoUrl();
        resale.setLogoUrl(null);
        try {
            Resale saved = repository.saveAndFlush(resale);
            cleanPrevious(previous, companyId, resaleId);
            return saved;
        } catch (RuntimeException exception) {
            resale.setLogoUrl(previous);
            throw exception;
        }
    }

    private Resale authorizedResale(Integer companyId, Integer resaleId, User user) {
        if (user == null || user.getStatus() != StatusEnableDisable.Habilitado || !Objects.equals(user.getCompanyId(), companyId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        Resale resale = repository.findByCompanyIdAndId(companyId, resaleId);
        if (resale == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return resale;
    }

    private BufferedImage readImage(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > 5L * 1024 * 1024) {
            throw new BusinessException("Selecione uma imagem PNG ou JPEG de até 5 MB.");
        }
        try (var input = file.getInputStream(); var imageInput = new MemoryCacheImageInputStream(input)) {
            var readers = ImageIO.getImageReaders(imageInput);
            if (!readers.hasNext()) throw new BusinessException("A imagem selecionada não é válida.");
            ImageReader reader = readers.next();
            try {
                String format = reader.getFormatName().toLowerCase(Locale.ROOT);
                if (!format.equals("png") && !format.equals("jpeg") && !format.equals("jpg")) throw new BusinessException("Formatos permitidos: PNG e JPEG.");
                reader.setInput(imageInput);
                int width = reader.getWidth(0), height = reader.getHeight(0);
                if (width < 1 || height < 1 || width > 4096 || height > 2048) throw new BusinessException("A logo deve ter no máximo 4096 × 2048 pixels.");
                BufferedImage image = reader.read(0);
                if (image == null) throw new BusinessException("A imagem selecionada não é válida.");
                return image;
            } finally { reader.dispose(); }
        } catch (IOException exception) {
            throw new BusinessException("Não foi possível ler a imagem selecionada.");
        }
    }

    private Path logoDirectory(Integer companyId, Integer resaleId) {
        return uploadDirectory.resolve(companyId.toString()).resolve(resaleId.toString()).resolve("branding");
    }

    private String prefix(Integer companyId, Integer resaleId) {
        return "/images/" + companyId + "/" + resaleId + "/branding/";
    }

    private void cleanPrevious(String url, Integer companyId, Integer resaleId) {
        String prefix = prefix(companyId, resaleId);
        if (url == null || !url.startsWith(prefix)) return;
        String filename = url.substring(prefix.length());
        if (!filename.matches("logo-[a-f0-9-]{36}\\.png")) return;
        try { Files.deleteIfExists(logoDirectory(companyId, resaleId).resolve(filename)); }
        catch (IOException exception) { logger.warn("Could not remove previous logo for resale {}", resaleId, exception); }
    }
}
