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
                ToolControlMaterial existing = repository.filterId(mat.getCompanyId(),mat.getResaleId(),mat.getId());
                if(existing==null) return failure("Material não encontrado nesta revenda.");
                ToolControlCategory category = categoryRepository.filterId(mat.getCompanyId(),mat.getResaleId(),mat.getCategoryId());
                BigDecimal loan = (category.getType()==TypeCategory.EPI || category.getType()==TypeCategory.Uniforme)
                    ? mat.getQuantityAccountingLoan() : calQuantityAvailableMatMec(mat);
                BigDecimal kitPending = repositoryKitMec.filterMatIdDevPend(mat.getCompanyId(),mat.getResaleId(),mat.getId()).stream()
                    .map(item -> BigDecimal.valueOf((double)item.getQuantityReq()).subtract(BigDecimal.valueOf((double)item.getQuantityRet())))
                    .reduce(BigDecimal.ZERO,BigDecimal::add);
                BigDecimal kit = mat.getQuantityAccountingKit().subtract(kitPending);
                if(loan.signum()<0 || kit.signum()<0) return failure("Quantidade contábil menor que a quantidade em uso.");
                if((mat.getType()==TypeRequest.Kit && mat.getQuantityAccountingLoan().subtract(loan).signum()>0)
                    || (mat.getType()==TypeRequest.Loan && kitPending.signum()>0)) return failure("Existem materiais em uso no tipo de requisição que está sendo removido.");
                if(mat.getStatus()==com.concierge.apiconcierge.models.enums.StatusEnableDisable.Desabilitado
                    && (mat.getQuantityAccountingLoan().subtract(loan).signum()>0 || kitPending.signum()>0)) return failure("Não é possível desabilitar material em uso.");
                mat.setQuantityAvailableLoan(loan); mat.setQuantityAvailableKit(kit);
                response.setData(repository.save(mat));
            }
            return response;
        } catch(Exception ex) {throw new ToolControlException(ex.getMessage());}
    }
    @Override
    public MessageResponse filterId(Integer companyId,Integer resaleId,Integer id) {
        MessageResponse response=validation.filterId(companyId,resaleId,id);
        if(ConstantsMessage.SUCCESS.equals(response.getStatus())) {
            ToolControlMaterial material=repository.filterId(companyId,resaleId,id);
            if(material==null) return failure("Material não encontrado nesta revenda.");response.setData(material);
        } return response;
    }
    private BigDecimal calQuantityAvailableMatMec(ToolControlMaterial mat) {
        BigDecimal pending=repositoryMatMec.filterMatIdDevPend(mat.getCompanyId(),mat.getResaleId(),mat.getId()).stream()
            .map(ToolControlMatMec::getDeliveryQuantity).reduce(BigDecimal.ZERO,BigDecimal::add);
        return mat.getQuantityAccountingLoan().subtract(pending);
    }
    @Override
    public List<Map<String,Object>> listAll(Integer companyId,Integer resaleId) {
        if(!ConstantsMessage.SUCCESS.equals(validation.listAll(companyId,resaleId).getStatus())) return List.of();
        return repository.listAll(companyId,resaleId).stream().map(this::loadMat).toList();
    }
    @Override
    public List<Map<String,Object>> listAllEnabled(Integer companyId,Integer resaleId) {
        if(!ConstantsMessage.SUCCESS.equals(validation.listAllEnabled(companyId,resaleId).getStatus())) return List.of();
        return repository.listAllEnabled(companyId,resaleId).stream().map(this::loadMat).toList();
    }
    @Override
    public MessageResponse saveImage(MultipartFile file,String local) {
        try {
            Path target=imagePath(local);
            if(file==null || file.isEmpty() || file.getSize()>5L*1024*1024) return failure("Imagem vazia ou maior que 5 MB.");
            java.awt.image.BufferedImage image;
            try(java.io.InputStream input=file.getInputStream()){image=javax.imageio.ImageIO.read(input);}
            if(image==null) return failure("Arquivo de imagem inválido.");
            java.awt.image.BufferedImage jpeg=new java.awt.image.BufferedImage(image.getWidth(),image.getHeight(),java.awt.image.BufferedImage.TYPE_INT_RGB);
            java.awt.Graphics2D graphics=jpeg.createGraphics();
            try{graphics.setColor(java.awt.Color.WHITE);graphics.fillRect(0,0,jpeg.getWidth(),jpeg.getHeight());graphics.drawImage(image,0,0,null);}finally{graphics.dispose();}
            Files.createDirectories(target.getParent());
            if(!javax.imageio.ImageIO.write(jpeg,"jpg",target.toFile())) return failure("Falha ao gravar a imagem.");
            MessageResponse response=success("Imagem salva com sucesso.");response.setData(Map.of("url","/images/"+local));return response;
        } catch(Exception ex) {return failure("Não foi possível salvar a imagem.");}
    }
    @Override
    public MessageResponse deleteImage(String local) {
        try {Path target=imagePath(local);Files.deleteIfExists(target);return success("Imagem excluída com sucesso.");}
        catch(Exception ex){return failure("Não foi possível excluir a imagem.");}
    }
    private MessageResponse success(String message){MessageResponse response=new MessageResponse();response.setStatus(ConstantsMessage.SUCCESS);response.setHeader("Material");response.setMessage(message);return response;}
    private MessageResponse failure(String message){MessageResponse response=success(message);response.setStatus(ConstantsMessage.ERROR);return response;}
    private Path imagePath(String local) {
        if(local==null || !local.matches("[1-9][0-9]*/[1-9][0-9]*/workshop/equipment/reg/material/[1-9][0-9]*/image1\\.jpg")) throw new IllegalArgumentException("Caminho inválido.");
        String[] parts=local.split("/");
        if(repository.filterId(Integer.valueOf(parts[0]),Integer.valueOf(parts[1]),Integer.valueOf(parts[6]))==null) throw new IllegalArgumentException("Material não encontrado.");
        Path base=Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();Path target=base.resolve(local).normalize();
        if(!target.startsWith(base)) throw new IllegalArgumentException("Caminho inválido.");return target;
    }
    private Map<String,Object> loadMat(ToolControlMaterial mat) {
        Map<String,Object> map=new HashMap<>();map.put("companyId",mat.getCompanyId());map.put("resaleId",mat.getResaleId());map.put("id",mat.getId());map.put("status",mat.getStatus());map.put("type",mat.getType());map.put("description",mat.getDescription());map.put("categoryId",mat.getCategoryId());map.put("photoUrl",mat.getPhotoUrl());map.put("numberCA",mat.getNumberCA());map.put("quantityAccountingLoan",mat.getQuantityAccountingLoan());map.put("quantityAvailableLoan",mat.getQuantityAvailableLoan());map.put("quantityAccountingKit",mat.getQuantityAccountingKit());map.put("quantityAvailableKit",mat.getQuantityAvailableKit());map.put("validityDay",mat.getValidityDay());return map;
    }
}
