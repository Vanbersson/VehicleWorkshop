package com.concierge.apiconcierge.validation.workshop.toolcontrol.material;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlCategory;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlMaterial;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.TypeCategory;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.TypeRequest;
import com.concierge.apiconcierge.repositories.workshop.toolcontrol.IToolControlCategoryRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ToolControlMaterialValidation implements IToolControlMaterialValidation {

    @Autowired
    IToolControlCategoryRepository categoryRepository;

    @Override
    public MessageResponse save(ToolControlMaterial mat) {
        MessageResponse response = new MessageResponse();
        if (mat.getCompanyId() == null || mat.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mat.getResaleId() == null || mat.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mat.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mat.getDescription().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Nome");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mat.getCategoryId() == null || mat.getCategoryId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Categoria");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mat.getType() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Tipo Requisição");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mat.getQuantityAccountingLoan().compareTo(BigDecimal.ZERO) < 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Qtd. Contabil");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mat.getQuantityAvailableLoan().compareTo(BigDecimal.ZERO) < 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Qtd. Disponivel");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mat.getQuantityAvailableLoan().compareTo(BigDecimal.ZERO) > mat.getQuantityAccountingLoan().compareTo(BigDecimal.ZERO)) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Qtd. Disponivel");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Material");
        response.setMessage("Cadastrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse update(ToolControlMaterial mat) {
        MessageResponse response = new MessageResponse();
        if (mat.getCompanyId() == null || mat.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mat.getResaleId() == null || mat.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mat.getId() == null || mat.getId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mat.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mat.getDescription().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Nome");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mat.getCategoryId() == null || mat.getCategoryId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Categoria");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mat.getType() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Tipo Requisição");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }

        if (mat.getStatus() == StatusEnableDisable.Desabilitado) {
            if (mat.getType() == TypeRequest.Loan || mat.getType() == TypeRequest.Ambos) {
                if (!mat.getQuantityAccountingLoan().equals(mat.getQuantityAvailableLoan()) ) {
                    response.setStatus(ConstantsMessage.ERROR);
                    response.setHeader("Status");
                    response.setMessage("Não de ser alterado.");
                    return response;
                }
            }
        }
        if (mat.getQuantityAccountingLoan() == null || mat.getQuantityAccountingLoan().compareTo(BigDecimal.ZERO) < 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empréstimo - Quantidade Contabil");
            response.setMessage("Menor que zero.");
            return response;
        }
        if (mat.getQuantityAvailableLoan() == null || mat.getQuantityAvailableLoan().compareTo(BigDecimal.ZERO) < 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empréstimo - Quantidade Disponível");
            response.setMessage("Menor que zero.");
            return response;
        }
        ToolControlCategory category = this.categoryRepository.filterId(mat.getCompanyId(), mat.getResaleId(), mat.getCategoryId());
        if (category.getType() == TypeCategory.EPI || category.getType() == TypeCategory.Uniforme) {
            if (mat.getType() != TypeRequest.Loan) {
                response.setStatus(ConstantsMessage.ERROR);
                response.setHeader("Tipo Requisição");
                response.setMessage("Tem que ser empréstimo.");
                return response;
            }
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Material");
        response.setMessage("Atualizado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (id == null || id == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Material");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse listAll(Integer companyId, Integer resaleId) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Material");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse listAllEnabled(Integer companyId, Integer resaleId) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Material");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }
}
