package com.concierge.apiconcierge.services.workshop.matmec;

import com.concierge.apiconcierge.exceptions.workshop.toolcontrol.ToolControlException;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlCategory;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlMatMec;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlMaterial;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlRequest;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.StatusRequest;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.TypeCategory;
import com.concierge.apiconcierge.repositories.workshop.toolcontrol.IToolControlCategoryRepository;
import com.concierge.apiconcierge.repositories.workshop.toolcontrol.IToolControlMatMecRepository;
import com.concierge.apiconcierge.repositories.workshop.toolcontrol.IToolControlMaterialRepository;
import com.concierge.apiconcierge.services.workshop.toolcontrol.request.IToolControlRequestService;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.workshop.toolcontrol.matmec.IToolControlMatMecValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;


@Service
public class ToolControlMatMecService implements IToolControlMatMecService {

    @Autowired
    private IToolControlMatMecRepository repository;

    @Autowired
    private IToolControlMatMecValidation validation;

    @Autowired
    private IToolControlCategoryRepository categoryRepository;

    @Autowired
    private IToolControlMaterialRepository materialRepository;

    @Autowired
    private IToolControlRequestService requestService;

    @SneakyThrows
    @Override
    public String saveMaterial(ToolControlMatMec matMec) {
        try {
            String message = this.validation.saveMaterial(matMec);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                Integer quant = matMec.getDeliveryQuantity().intValue();
                for (int i = 0; i < quant; i++) {
                    ToolControlMatMec newMatMec = new ToolControlMatMec();
                    newMatMec.setCompanyId(matMec.getCompanyId());
                    newMatMec.setResaleId(matMec.getResaleId());
                    newMatMec.setRequestId(matMec.getRequestId());
                    newMatMec.setDeliveryUserId(matMec.getDeliveryUserId());
                    newMatMec.setDeliveryUserName(matMec.getDeliveryUserName());
                    newMatMec.setDeliveryDate(matMec.getDeliveryDate());
                    newMatMec.setDeliveryQuantity(new BigDecimal(1));
                    newMatMec.setDeliveryInformation(matMec.getDeliveryInformation());
                    newMatMec.setReturnUserId(null);
                    newMatMec.setReturnUserName("");
                    newMatMec.setReturnDate(null);
                    newMatMec.setReturnQuantity(new BigDecimal(0));
                    newMatMec.setReturnInformation("");
                    newMatMec.setMaterialId(matMec.getMaterialId());
                    newMatMec.setMaterialDescription(matMec.getMaterialDescription());
                    newMatMec.setMaterialNumberCA(matMec.getMaterialNumberCA());

                    this.repository.save(newMatMec);
                    this.updateMatQuantityAccounting(matMec);
                }
                this.updateMatQuantityAvailable(matMec);
                return ConstantsMessage.SUCCESS;
            }
            return message;
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public String returnMaterial(ToolControlMatMec matMec) {
        try {
            String message = this.validation.returnMaterial(matMec);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                ToolControlMatMec result = this.repository.filterId(matMec.getCompanyId(), matMec.getResaleId(), matMec.getId());
                if (result.getReturnDate() != null || result.getReturnUserId() != null) {
                    throw new ToolControlException("Material já devolvido.");
                }
                result.setReturnInformation(matMec.getReturnInformation());
                result.setReturnQuantity(result.getDeliveryQuantity());
                result.setReturnDate(new Date());
                result.setReturnUserId(matMec.getReturnUserId());
                result.setReturnUserName(matMec.getReturnUserName());
                this.repository.save(result);

                this.updateMatQuantityAvailable(result);
                this.updateStatusRequest(result.getCompanyId(), result.getResaleId(), result.getRequestId());
                return ConstantsMessage.SUCCESS;
            } else {
                throw new ToolControlException(message);
            }
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    private void updateStatusRequest(Integer companyId, Integer resaleId, Integer requestId) {
        List<ToolControlMatMec> result = this.repository.filterMatAvailableForReturn(companyId, resaleId, requestId);
        if (!result.isEmpty()) {
            return;
        }
        //Atualiza o status da requisição se não tiver material para ser devolvido
        ToolControlRequest request = this.requestService.filterId(companyId, resaleId, requestId);
        request.setStatus(StatusRequest.Returned);
        this.requestService.updateRequest(request);
    }

    @SneakyThrows
    @Override
    public ToolControlMatMec filterId(Integer companyId, Integer resaleId, UUID id) {
        try {
            String message = this.validation.filterId(companyId, resaleId, id);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                return this.repository.filterId(companyId, resaleId, id);
            }
            throw new ToolControlException(message);
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<ToolControlMatMec> filterRequestId(Integer companyId, Integer resaleId, Integer requestId) {
        try {
            String message = this.validation.filterRequestId(companyId, resaleId, requestId);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                return this.repository.filterRequestId(companyId, resaleId, requestId);
            }
            throw new ToolControlException(message);
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    //Verifica se o material entregue é EPI ou Uniforme
    private void updateMatQuantityAccounting(ToolControlMatMec matMec) {
        ToolControlMaterial material = this.materialRepository.filterId(matMec.getCompanyId(), matMec.getResaleId(), matMec.getMaterialId());
        ToolControlCategory category = this.categoryRepository.filterId(matMec.getCompanyId(), matMec.getResaleId(), material.getCategoryId());
        if (category.getType() == TypeCategory.EPI || category.getType() == TypeCategory.Uniforme) {
            material.setQuantityAccountingLoan(material.getQuantityAccountingLoan().subtract(new BigDecimal(1)));
            this.materialRepository.save(material);
        }
    }

    private void updateMatQuantityAvailable(ToolControlMatMec matMec) {
        BigDecimal quantityLoan = this.repository.filterMatIdDevPend(matMec.getCompanyId(), matMec.getResaleId(), matMec.getMaterialId())
                .stream()
                .map(ToolControlMatMec::getDeliveryQuantity)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        ToolControlMaterial material = this.materialRepository.filterId(matMec.getCompanyId(), matMec.getResaleId(), matMec.getMaterialId());
        ToolControlCategory category = this.categoryRepository.filterId(material.getCompanyId(), material.getResaleId(), material.getCategoryId());
        if (category.getType() == TypeCategory.EPI || category.getType() == TypeCategory.Uniforme) {
            material.setQuantityAvailableLoan(material.getQuantityAccountingLoan());
        } else {
            material.setQuantityAvailableLoan(material.getQuantityAccountingLoan().subtract(quantityLoan));
        }
        this.materialRepository.save(material);
    }

}
