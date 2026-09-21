package com.concierge.apiconcierge.services.workshop.mechanic;

import com.concierge.apiconcierge.exceptions.workshop.mechanic.MechanicException;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.workshop.mechanic.Mechanic;
import com.concierge.apiconcierge.repositories.workshop.mechanic.IMechanicRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.workshop.mechanic.IMechanicValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MechanicService implements IMechanicService {

    @Value("${local.image.upload}")
    private String UPLOAD_DIR;

    @Autowired
    private IMechanicRepository repository;

    @Autowired
    private IMechanicValidation validation;

    @SneakyThrows
    @Override
    public MessageResponse save(Mechanic mec) {
        try {
            MessageResponse response = this.validation.save(mec);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                mec.setId(null);
                Mechanic resultMec = this.repository.save(mec);
                response.setData(resultMec);
                return response;
            }
            return response;
        } catch (Exception ex) {
            throw new MechanicException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse update(Mechanic mec) {
        try {
            MessageResponse response = this.validation.update(mec);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                Mechanic resultMec = this.repository.save(mec);
                response.setData(resultMec);
                return response;
            }
            return response;
        } catch (Exception ex) {
            throw new MechanicException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<Mechanic> listAll(Integer companyId, Integer resaleId) {
        try {
            MessageResponse response = this.validation.listAll(companyId, resaleId);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                return this.repository.listAll(companyId, resaleId);
            }
            return List.of();
        } catch (Exception ex) {
            throw new MechanicException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<Mechanic> listAllEnabled(Integer companyId, Integer resaleId) {
        try {
            MessageResponse response = this.validation.listAll(companyId, resaleId);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                return this.repository.listAllEnabled(companyId, resaleId);
            }
            return List.of();
        } catch (Exception ex) {
            throw new MechanicException(ex.getMessage());
        }
    }

    @Override
    public MessageResponse filterCodePass(Mechanic mec) {
        return null;
    }

    @SneakyThrows
    @Override
    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id) {
        try {
            MessageResponse response = this.validation.filterId(companyId, resaleId, id);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                Mechanic resultMec = this.repository.filterId(companyId, resaleId, id);
                response.setData(resultMec);
                return response;
            }
            return response;
        } catch (Exception ex) {
            throw new MechanicException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse savePhoto(MultipartFile file, String local) {
        try {
            MessageResponse response = new MessageResponse();
            response.setStatus(ConstantsMessage.SUCCESS);
            response.setHeader("Imagem");
            response.setMessage("Salvo com sucesso.");
            // Segurança básica
            if (local.contains("..") || local.isBlank()) {
                response.setStatus(ConstantsMessage.ERROR);
                response.setMessage("Caminho inválido.");
                return response;
            }
            // Nome do arquivo
            Path filePath = Paths.get(UPLOAD_DIR + local);
            // Cria diretórios se necessário
            Files.createDirectories(filePath.getParent());
            // Salva ou substitui se existir)
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            // URL pública
            String url = "/images/" + local;
            // Retornar o caminho do arquivo salvo
            Map<String, String> map = new HashMap<>();
            map.put("url", url);
            response.setData(map);
            return response;
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse deletePhoto(String local) {
        try {
            MessageResponse response = new MessageResponse();
            response.setStatus(ConstantsMessage.SUCCESS);
            response.setHeader("Imagem");
            response.setMessage("Excluído com sucesso.");

            Path basePath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
            Path filePath = basePath.resolve(local).normalize();

            // Proteção contra path traversal
            if (!filePath.startsWith(basePath) || local.isBlank()) {
                response.setStatus(ConstantsMessage.ERROR);
                response.setMessage("Caminho inválido.");
                return response;
            }
            if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
                response.setStatus(ConstantsMessage.ERROR);
                response.setMessage("Imagem não encontrada.");
                return response;
            }
            Files.delete(filePath);
            return response;
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }


}
