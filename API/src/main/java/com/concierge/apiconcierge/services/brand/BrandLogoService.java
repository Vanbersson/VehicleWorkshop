package com.concierge.apiconcierge.services.brand;

import com.concierge.apiconcierge.exceptions.BusinessException;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.brand.Brand;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.brand.IBrandRepository;
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
public class BrandLogoService {
    private static final Logger logger = LoggerFactory.getLogger(BrandLogoService.class);
    private final IBrandRepository repository;
    private final Path uploadDirectory;

    public BrandLogoService(IBrandRepository repository, @Value("${local.image.upload}") String uploadDirectory) {
        this.repository = repository;
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    public Brand save(Integer brandId, MultipartFile file, User user) {
        Brand brand = authorizedBrand(brandId, user);
        BufferedImage image = readImage(file);
        Path directory = logoDirectory(brandId);
        Path target = directory.resolve("logo-" + UUID.randomUUID() + ".png");
        String previous = brand.getLogoUrl();
        try {
            Files.createDirectories(directory);
            try (var output = Files.newOutputStream(target)) {
                if (!ImageIO.write(image, "png", output)) throw new IOException("PNG encoder unavailable");
            }
            brand.setLogoUrl(prefix(brandId) + target.getFileName());
            Brand saved = repository.saveAndFlush(brand);
            cleanPrevious(previous, brandId);
            return saved;
        } catch (IOException | RuntimeException exception) {
            brand.setLogoUrl(previous);
            try { Files.deleteIfExists(target); } catch (IOException cleanup) { logger.warn("Could not clean failed brand logo upload", cleanup); }
            if (exception instanceof RuntimeException runtime) throw runtime;
            throw new BusinessException("Não foi possível salvar a logo da marca. Tente novamente.");
        }
    }

    public Brand remove(Integer brandId, User user) {
        Brand brand = authorizedBrand(brandId, user);
        String previous = brand.getLogoUrl();
        brand.setLogoUrl(null);
        try {
            Brand saved = repository.saveAndFlush(brand);
            cleanPrevious(previous, brandId);
            return saved;
        } catch (RuntimeException exception) {
            brand.setLogoUrl(previous);
            throw exception;
        }
    }

    private Brand authorizedBrand(Integer brandId, User user) {
        if (user == null || user.getStatus() != StatusEnableDisable.Habilitado) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        Brand brand = repository.findById(brandId).orElse(null);
        if (brand == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return brand;
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

    private Path logoDirectory(Integer brandId) {
        return uploadDirectory.resolve("brands").resolve(brandId.toString()).resolve("branding");
    }

    private String prefix(Integer brandId) {
        return "/images/brands/" + brandId + "/branding/";
    }

    private void cleanPrevious(String url, Integer brandId) {
        String prefix = prefix(brandId);
        if (url == null || !url.startsWith(prefix)) return;
        String filename = url.substring(prefix.length());
        if (!filename.matches("logo-[a-f0-9-]{36}\\.png")) return;
        try { Files.deleteIfExists(logoDirectory(brandId).resolve(filename)); }
        catch (IOException exception) { logger.warn("Could not remove previous logo for brand {}", brandId, exception); }
    }
}
