package com.concierge.apiconcierge.services.parts;

import com.concierge.apiconcierge.exceptions.parts.PartsException;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.Part;
import com.concierge.apiconcierge.repositories.parts.IPartRepository;
import com.concierge.apiconcierge.repositories.parts.interfaces.IFilterPart;
import com.concierge.apiconcierge.services.parts.interfaces.IPartListAll;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.parts.IPartValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
public class PartService implements IPartService {
    @Autowired
    private IPartRepository repository;
    @Autowired
    private IPartValidation validation;
    @Value("${local.image.upload}")
    private String UPLOAD_DIR;

    @SneakyThrows
    @Override
    public MessageResponse save(Part part) {
        try {
            MessageResponse response = this.validation.save(part);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                part.setId(null);
                part.setDateRegister(new Date());
                Part resultPart = this.repository.save(part);
                response.setData(resultPart);
            }
            return response;
        } catch (Exception ex) {
            throw new PartsException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse update(Part part) {
        try {
            MessageResponse response = this.validation.update(part);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                Part resultPart = this.repository.save(part);
                response.setData(resultPart);
            }
            return response;
        } catch (Exception ex) {
            throw new PartsException(ex.getMessage());
        }
    }

    @SneakyThrows
    public List<Map<String, Object>> listAll(Integer companyId, Integer resaleId) {
        try {
            MessageResponse response = this.validation.listAll(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                List<IPartListAll> list = this.repository.listAll(companyId, resaleId);
                List<Map<String, Object>> maps = new ArrayList<>();
                for (IPartListAll i : list) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", i.getId());
                    map.put("status", i.getStatus() == 0 ? StatusEnableDisable.Habilitado : StatusEnableDisable.Desabilitado);
                    map.put("code", i.getCode());
                    map.put("description", i.getDescription());
                    map.put("brand", i.getBrand());
                    map.put("group", i.getGroup());
                    map.put("category", i.getCategory());
                    maps.add(map);
                }
                return maps;
            }
            return List.of();
        } catch (Exception ex) {
            throw new PartsException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id) {
        try {
            MessageResponse response = this.validation.filterId(companyId, resaleId, id);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                Part result = this.repository.filterId(companyId, resaleId, id);
                response.setData(result);
            }
            return response;
        } catch (Exception ex) {
            throw new PartsException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse filterCode(Integer companyId, Integer resaleId, String code) {
        try {
            MessageResponse response = this.validation.filterCode(companyId, resaleId, code);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                List<IFilterPart> result = this.repository.filterCode(companyId, resaleId, code);
                List<Map<String, Object>> list = new ArrayList<>();
                for(IFilterPart p : result){
                    Map<String, Object> map = new HashMap<>();
                    map.put("companyId",companyId);
                    map.put("resaleId",resaleId);
                    map.put("id",p.getId());
                    map.put("code",p.getCode());
                    map.put("description",p.getDescription());
                    map.put("available",p.getAvailable());
                    map.put("price",p.getPrice());
                    map.put("unit",p.getUnit());
                    map.put("brand",p.getBrand());
                    map.put("group",p.getGroup());
                    map.put("category",p.getCategory());
                    list.add(map);
                }
                response.setData(list);
            }
            return response;
        } catch (Exception ex) {
            throw new PartsException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse filterDesc(Integer companyId, Integer resaleId, String desc) {
        try {
            MessageResponse response = this.validation.filterDesc(companyId, resaleId, desc);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                List<IFilterPart> result = this.repository.filterDesc(companyId, resaleId, desc);
                List<Map<String, Object>> list = new ArrayList<>();
                for(IFilterPart p : result){
                    Map<String, Object> map = new HashMap<>();
                    map.put("companyId",companyId);
                    map.put("resaleId",resaleId);
                    map.put("id",p.getId());
                    map.put("code",p.getCode());
                    map.put("description",p.getDescription());
                    map.put("available",p.getAvailable());
                    map.put("price",p.getPrice());
                    map.put("unit",p.getUnit());
                    map.put("brand",p.getBrand());
                    map.put("group",p.getGroup());
                    map.put("category",p.getCategory());
                    list.add(map);
                }
                response.setData(list);
            }
            return response;
        } catch (Exception ex) {
            throw new PartsException(ex.getMessage());
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


}
