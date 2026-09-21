package com.concierge.apiconcierge.services.user;

import com.concierge.apiconcierge.config.security.WebSecurityConfig;
import com.concierge.apiconcierge.exceptions.user.UserException;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.user.UserValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService implements IUserService {
    @Value("${local.image.upload}")
    private String UPLOAD_DIR;

    @Autowired
    private IUserRepository repository;

    @Autowired
    private UserValidation validation;

    @Autowired
    private WebSecurityConfig security;

    @SneakyThrows
    @Override
    public MessageResponse save(User user) {
        try {
            MessageResponse response = this.validation.save(user);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                String encryptedPass = this.security.passwordEncoder().encode(user.getPassword());
                user.setId(null);
                user.setPassword(encryptedPass);

                User result = this.repository.save(user);
                response.setData(result);
                return response;
            } else {
                return response;
            }
        } catch (Exception ex) {
            throw new UserException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse update(User user) {
        try {
            MessageResponse response = this.validation.update(user);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                User userResult = this.repository.filterId(user.getCompanyId(), user.getResaleId(), user.getId());

                user.setEmail(userResult.getEmail());
                user.setPassword(userResult.getPassword());

                User result = this.repository.save(user);
                response.setData(this.loadUser(result));
                return response;
            } else {
                return response;
            }
        } catch (Exception ex) {
            throw new UserException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse updatePass(Integer companyId, Integer resaleId, Integer id, String pass) {
        try {
            User user = this.repository.filterId(companyId, resaleId, id);
            String encryptedPass = this.security.passwordEncoder().encode(pass);
            user.setPassword(encryptedPass);
            this.repository.save(user);

            MessageResponse response = new MessageResponse();
            response.setStatus(ConstantsMessage.SUCCESS);
            response.setHeader("Senha");
            response.setMessage("Atualizado com sucesso.");
            return response;
        } catch (Exception ex) {
            throw new UserException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse listAll(Integer companyId, Integer resaleId) {
        try {
            MessageResponse response = this.validation.listAll(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                List<User> usersResult = this.repository.listAll(companyId, resaleId);
                List<Map<String, Object>> list = new ArrayList<>();
                for (User user : usersResult) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("companyId", user.getCompanyId());
                    map.put("resaleId", user.getResaleId());
                    map.put("id", user.getId());
                    map.put("status", user.getStatus());
                    map.put("name", user.getName());
                    map.put("email", user.getEmail());
                    map.put("roleDesc", user.getRoleDesc());
                    map.put("photoUrl", user.getPhotoUrl());
                    list.add(map);
                }
                response.setData(list);
            }
            return response;
        } catch (Exception ex) {
            throw new UserException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id) {
        try {
            MessageResponse response = this.validation.filterId(companyId, resaleId, id);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                User user = this.repository.filterId(companyId, resaleId, id);
                if (user == null) {
                    response.setStatus(ConstantsMessage.ERROR);
                    response.setHeader("Usuário");
                    response.setMessage("Usuário não encontrado.");
                    return response;
                }
                response.setData(this.loadUser(user));
            }
            return response;
        } catch (Exception ex) {
            throw new UserException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse filterRoleId(Integer companyId, Integer resaleId, Integer roleId) {
        try {
            MessageResponse response = this.validation.filterRoleId(companyId, resaleId, roleId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                List<User> usersResult = this.repository.filterRoleId(companyId, resaleId, StatusEnableDisable.Habilitado, roleId);
                List<Map<String, Object>> list = new ArrayList<>();
                for (User user : usersResult) {
                    list.add(this.loadUser(user));
                }
                response.setData(list);
            }
            return response;
        } catch (Exception ex) {
            throw new UserException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse filterEmail(Integer companyId, Integer resaleId, String email) {
        try {
            MessageResponse response = this.validation.filterEmail(companyId, resaleId, email);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                User user = this.repository.filterEmail(companyId, resaleId, email);
                if (user == null) {
                    response.setStatus(ConstantsMessage.ERROR);
                    response.setHeader("Usuário");
                    response.setMessage("Usuário não encontrado.");
                    return response;
                }
                response.setData(this.loadUser(user));
            }
            return response;
        } catch (Exception ex) {
            throw new UserException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse saveImage(MultipartFile file, String local) {
        try {
            MessageResponse response = new MessageResponse();
            response.setStatus(ConstantsMessage.SUCCESS);
            response.setHeader("Imagem");
            response.setMessage("Salvo com sucesso.");

            // Segurança básica
            if (local.contains("..")) {
                response.setStatus(ConstantsMessage.ERROR);
                response.setMessage("Caminho inválido.");
                return response;
            }

            // Nome do arquivo
            Path filePath = Paths.get(UPLOAD_DIR + local + file.getOriginalFilename());

            // Cria diretórios se necessário
            Files.createDirectories(filePath.getParent());

            // Salva ou substitui se existir)
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // URL pública
            String url = "/images/" + local + file.getOriginalFilename();

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
    public MessageResponse deleteImage(String local) {
        try {
            MessageResponse response = new MessageResponse();
            response.setStatus(ConstantsMessage.SUCCESS);
            response.setHeader("Imagem");
            response.setMessage("Excluída com sucesso.");

            Path basePath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
            Path filePath = basePath.resolve(local).normalize();

            // Proteção contra path traversal
            if (!filePath.startsWith(basePath)) {
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

    private Map<String, Object> loadUser(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("companyId", user.getCompanyId());
        map.put("resaleId", user.getResaleId());
        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("status", user.getStatus());
        map.put("email", user.getEmail());
        map.put("cellphone", user.getCellphone());
        map.put("limitDiscount", user.getLimitDiscount());
        map.put("roleId", user.getRoleId());
        map.put("roleDesc", user.getRoleDesc());
        map.put("roleFunc", user.getRoleFunc());
        map.put("photoUrl", user.getPhotoUrl());
        return map;
    }
}
