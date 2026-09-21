package com.concierge.apiconcierge.services.workshop.toolcontrol.material;

import com.concierge.apiconcierge.exceptions.workshop.toolcontrol.ToolControlException;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlCategory;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlMatMec;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlMaterial;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.TypeCategory;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.TypeRequest;
import com.concierge.apiconcierge.repositories.workshop.toolcontrol.IToolControlCategoryRepository;
import com.concierge.apiconcierge.repositories.workshop.toolcontrol.IToolControlKitMecRepository;
import com.concierge.apiconcierge.repositories.workshop.toolcontrol.IToolControlMatMecRepository;
import com.concierge.apiconcierge.repositories.workshop.toolcontrol.IToolControlMaterialRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.workshop.toolcontrol.material.IToolControlMaterialValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ToolControlMaterialService implements IToolControlMaterialService {
    @Value("${local.image.upload}")
    private String UPLOAD_DIR;

    @Autowired
    private IToolControlMaterialRepository repository;

    @Autowired
    private IToolControlMaterialValidation validation;

    @Autowired
    private IToolControlMatMecRepository repositoryMatMec;

    @Autowired
    private IToolControlKitMecRepository repositoryKitMec;

    @Autowired
    private IToolControlCategoryRepository categoryRepository;

    @SneakyThrows
    @Override
    public MessageResponse save(ToolControlMaterial mat) {
        try {
            MessageResponse response = this.validation.save(mat);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                mat.setId(null);
                mat.setQuantityAvailableLoan(mat.getQuantityAccountingLoan());
                mat.setQuantityAvailableKit(mat.getQuantityAccountingKit());
                ToolControlMaterial resultMat = this.repository.save(mat);
                response.setData(resultMat);
            }
            return response;
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse update(ToolControlMaterial mat) {
        try {
            MessageResponse response = this.validation.update(mat);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                ToolControlMaterial resultSaveMat;
                ToolControlCategory category = this.categoryRepository.filterId(mat.getCompanyId(), mat.getResaleId(), mat.getCategoryId());
                if (category.getType() == TypeCategory.Ferramenta) {
                    if (mat.getType() == TypeRequest.Loan) {
                        //Emprestimo
                        mat.setQuantityAvailableLoan(this.calQuantityAvailableMatMec(mat));
                        this.repository.save(mat);
                        response.setData(mat);
                    } else if (mat.getType() == TypeRequest.Kit) {
                        //Kit mecânico
                    } else if (mat.getType() == TypeRequest.Ambos) {
                        //Ambos
                        mat.setQuantityAvailableLoan(this.calQuantityAvailableMatMec(mat));
                        this.repository.save(mat);
                        response.setData(mat);
                    }
                } else if (category.getType() == TypeCategory.EPI) {
                    //Epi não alterar a quantidade disponivel
                    mat.setQuantityAvailableLoan(mat.getQuantityAccountingLoan());
                    this.repository.save(mat);
                    response.setData(mat);
                } else if (category.getType() == TypeCategory.Uniforme) {
                    //Uniforme não altera a quantidade disponivel
                    mat.setQuantityAvailableLoan(mat.getQuantityAccountingLoan());
                    this.repository.save(mat);
                    response.setData(mat);
                } else if (category.getType() == TypeCategory.Outro) {
                    mat.setQuantityAvailableLoan(this.calQuantityAvailableMatMec(mat));
                    this.repository.save(mat);
                    response.setData(mat);
                }
            }
            return response;
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id) {
        try {
            MessageResponse response = this.validation.filterId(companyId, resaleId, id);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                ToolControlMaterial resultMat = this.repository.filterId(companyId, resaleId, id);
                response.setData(resultMat);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @SneakyThrows
    private BigDecimal calQuantityAvailableMatMec(ToolControlMaterial mat) {
        BigDecimal quantityLoan = this.repositoryMatMec.filterMatIdDevPend(mat.getCompanyId(), mat.getResaleId(), mat.getId())
                .stream()
                .map(ToolControlMatMec::getDeliveryQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return mat.getQuantityAccountingLoan().subtract(quantityLoan);

//        return quantityAvailable;
//
//        if (quantityAvailable.compareTo(BigDecimal.ZERO) < 0) {
//            throw new ToolControlException("Quantidade contabil menor que a requisitada.");
//        }
//        mat.setQuantityAvailableLoan(quantityAvailable);
//        return mat;
//        BigDecimal quantityLoan = this.repositoryMatMec.filterMatIdDevPend(mat.getCompanyId(), mat.getResaleId(), mat.getId())
//                .stream()
//                .mapToDouble(ToolControlMatMec::getDeliveryQuantity)
//                .sum();
//        BigDecimal qtd = mat.getQuantityAccountingLoan() - quantityLoan;
//        if (qtd < 0.0) {
//            throw new ToolControlException("Quantidade contabil menor que a requisitada.");
//        }
//        mat.setQuantityAvailableLoan(mat.getQuantityAccountingLoan() - quantityLoan);
//        return mat;
    }

    @SneakyThrows
    @Override
    public List<Map<String, Object>> listAll(Integer companyId, Integer resaleId) {
        try {
            MessageResponse response = this.validation.listAll(companyId, resaleId);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                List<ToolControlMaterial> list = this.repository.listAll(companyId, resaleId);
                List<Map<String, Object>> result = new ArrayList<>();
                for (ToolControlMaterial item : list) {
                    result.add(this.loadMat(item));
                }
                return result;
            }
            return List.of();
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<Map<String, Object>> listAllEnabled(Integer companyId, Integer resaleId) {
        try {
            MessageResponse response = this.validation.listAllEnabled(companyId, resaleId);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                List<ToolControlMaterial> resultList = this.repository.listAllEnabled(companyId, resaleId);
                List<Map<String, Object>> responseList = new ArrayList<>();
                for (ToolControlMaterial mat : resultList) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", mat.getId());
                    map.put("description", mat.getDescription());
                    map.put("categoryId", mat.getCategoryId());
                    map.put("quantityAvailableLoan", mat.getQuantityAvailableLoan());
                    map.put("quantityAvailableKit", mat.getQuantityAvailableKit());
                    map.put("validityDay", mat.getValidityDay());
                    map.put("photoUrl", mat.getPhotoUrl());
                    map.put("type",mat.getType());
                    map.put("numberCA",mat.getNumberCA());
                    responseList.add(map);
                }
                return responseList;
            }
            return List.of();
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
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
    public MessageResponse deleteImage(String local) {
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

    private Map<String, Object> loadMat(ToolControlMaterial mat) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", mat.getId());
        map.put("status", mat.getStatus());
        map.put("description", mat.getDescription());
        map.put("categoryId", mat.getCategoryId());
        map.put("quantityAvailableLoan", mat.getQuantityAvailableLoan());
        map.put("quantityAvailableKit", mat.getQuantityAvailableKit());
        map.put("validityDay", mat.getValidityDay());
        return map;
    }
}
