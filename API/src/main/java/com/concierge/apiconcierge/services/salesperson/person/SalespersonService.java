package com.concierge.apiconcierge.services.salesperson.person;

import com.concierge.apiconcierge.dtos.salesperson.ResponseSalespersonDto;
import com.concierge.apiconcierge.exceptions.BusinessException;
import com.concierge.apiconcierge.exceptions.ResourcesNotFoundException;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.salesperson.Salesperson;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.salesperson.ISalespersonRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.*;

@Service
public class SalespersonService implements ISalespersonService {
    @Value("${local.image.upload}")
    private String UPLOAD_DIR;

    @Autowired
    private ISalespersonRepository repository;

    @Autowired
    private IUserRepository userRepository;

    @Override
    public MessageResponse save(Salesperson person, String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        if (userResult.getStatus() == StatusEnableDisable.Desabilitado) {
            throw new BusinessException("Usuário Bloqueado.");
        }
        person.setCompanyId(userResult.getCompanyId());
        person.setResaleId(userResult.getResaleId());
        person.setId(null);
        Salesperson saveResult = this.repository.save(person);
        MessageResponse response = new MessageResponse();
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Usuário");
        response.setMessage("Cadastrado com sucesso.");
        response.setData(saveResult);
        return response;
    }

    @Override
    public MessageResponse update(Salesperson person) {
        Salesperson saveResult = this.repository.save(person);
        MessageResponse response = new MessageResponse();
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Usuário");
        response.setMessage("Atualizado com sucesso.");
        response.setData(saveResult);
        return response;
    }

    @Override
    public Salesperson filterId(Integer id, String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        Salesperson personResult = this.repository.findByCompanyIdAndResaleIdAndId(userResult.getCompanyId(), userResult.getResaleId(), id);
        if (personResult == null) {
            throw new ResourcesNotFoundException("Vendedor não encontrado.");
        }
        return personResult;
    }

    @Override
    public List<ResponseSalespersonDto> all(String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        return this.repository.findByCompanyIdAndResaleId(userResult.getCompanyId(), userResult.getResaleId())
                .stream()
                .map(p -> new ResponseSalespersonDto(p.getId(), p.getStatus(), p.getName()))
                .toList();
    }

    @Override
    public List<Salesperson> allEnabled(String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        return this.repository.findByCompanyIdAndResaleId(userResult.getCompanyId(), userResult.getResaleId())
                .stream()
                .filter(p -> p.getStatus() == StatusEnableDisable.Habilitado)
                .toList();
    }


    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png");


    @Override
    public Map<String, String> saveImage(MultipartFile file, String local, String emailUser) {
        try {
            // 1. Validar usuário
            User userResult = this.userRepository.loginEmail(emailUser);
            if (userResult == null) {
                throw new BusinessException("Usuário não encontrado.");
            }
            // 2. Validar arquivo
            if (file == null || file.isEmpty()) {
                throw new BusinessException("Selecione uma imagem válida.");
            }
            if (file.getSize() > MAX_IMAGE_SIZE) {
                throw new BusinessException("A imagem não pode ultrapassar 5 MB.");
            }
            // 3. Validar caminho recebido
            if (local == null || local.isBlank()) {
                throw new BusinessException("Caminho inválido.");
            }
            String normalizedLocal = local.replace('\\', '/');
            // Remover barras iniciais para tratar como caminho relativo
            normalizedLocal = normalizedLocal.replaceFirst("^/+", "");
            Path localPath = Paths.get(normalizedLocal).normalize();
            if (localPath.isAbsolute()
                    || localPath.startsWith("..")
                    || localPath.toString().isBlank()
                    || normalizedLocal.contains(":")
                    || normalizedLocal.chars()
                    .anyMatch(Character::isISOControl)) {
                throw new BusinessException("Caminho inválido.");
            }
            // 4. Montar caminho com empresa e revenda
            Path relative = Paths.get(
                            userResult.getCompanyId().toString(),
                            userResult.getResaleId().toString())
                    .resolve(localPath).normalize();

            if (relative.isAbsolute() || relative.startsWith("..") || relative.toString().isBlank()) {
                throw new BusinessException("Caminho inválido.");
            }
            // 5. Validar extensão
            Path filenamePath = relative.getFileName();
            if (filenamePath == null) {
                throw new BusinessException("Nome de arquivo inválido.");
            }
            String filename = filenamePath.toString();
            int dotIndex = filename.lastIndexOf('.');
            if (dotIndex <= 0 || dotIndex == filename.length() - 1) {
                throw new BusinessException("Formato de imagem inválido.");
            }
            String extension = filename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                throw new BusinessException("Formatos permitidos: JPG, JPEG e PNG.");
            }
            // 6. Resolver caminho físico
            Path basePath = Paths.get(UPLOAD_DIR)
                    .toAbsolutePath()
                    .normalize();
            Path filePath = basePath.resolve(relative).normalize();
            if (!filePath.startsWith(basePath) || filePath.equals(basePath)) {
                throw new BusinessException("Caminho inválido.");
            }
            // 7. Criar diretório e salvar/substituir arquivo
            Files.createDirectories(filePath.getParent());
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            }
            // 8. Retornar URL pública
            String url = "/images/" + relative.toString().replace('\\', '/');
            return Map.of("url", url);
        } catch (BusinessException e) {
            throw e;
        } catch (InvalidPathException e) {
            throw new BusinessException("Caminho inválido.");
        } catch (IOException e) {
            // Registrar a exceção no logger em produção
            throw new BusinessException("Não foi possível salvar a imagem.");
        }
    }


}
