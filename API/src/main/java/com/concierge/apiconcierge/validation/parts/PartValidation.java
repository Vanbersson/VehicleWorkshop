package com.concierge.apiconcierge.validation.parts;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.Part;
import com.concierge.apiconcierge.repositories.parts.IPartRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PartValidation implements IPartValidation {

    @Autowired
    private IPartRepository repository;

    @Override
    public MessageResponse save(Part part) {
        MessageResponse response = new MessageResponse();
        if (part.getCompanyId() == null || part.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getResaleId() == null || part.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getCode().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código da Peça");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getDescription().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Descrição");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getUnitMeasureId() == null || part.getUnitMeasureId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Unidade de Medida");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getPriceNow().compareTo(BigDecimal.ZERO) < 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Valor Atual");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getPriceOld().compareTo(BigDecimal.ZERO) < 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Valor Anterior");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getPriceWarranty().compareTo(BigDecimal.ZERO) < 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Valor Garantia");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getBrandId() == null || part.getBrandId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Marca");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getGroupId() == null || part.getGroupId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Grupo");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getCategoryId() == null || part.getCategoryId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Categoria");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        Part resultPart = this.repository.filterCodeUnique(part.getCompanyId(), part.getResaleId(), part.getCode());
        if (resultPart != null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código da Peça");
            response.setMessage("Já Cadastrado - " + resultPart.getId());
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Peça");
        response.setMessage("Cadastrada com sucesso.");
        return response;
    }

    @Override
    public MessageResponse update(Part part) {
        MessageResponse response = new MessageResponse();
        if (part.getCompanyId() == null || part.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getResaleId() == null || part.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getDateRegister() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Data de Cadastro");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getId() == null || part.getId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getCode().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código da Peça");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getDescription().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Descrição");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getUnitMeasureId() == null || part.getUnitMeasureId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Unidade de Medida");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getPriceNow().compareTo(BigDecimal.ZERO) < 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Valor Atual");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getPriceOld().compareTo(BigDecimal.ZERO) < 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Valor Anterior");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getPriceWarranty().compareTo(BigDecimal.ZERO) < 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Valor Garantia");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getBrandId() == null || part.getBrandId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Marca");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getGroupId() == null || part.getGroupId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Grupo");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (part.getCategoryId() == null || part.getCategoryId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Categoria");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Peça");
        response.setMessage("Atualizada com sucesso.");
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
        response.setHeader("Peças");
        response.setMessage("Encontrada com sucesso.");
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
        response.setHeader("Peça");
        response.setMessage("Encontrada com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterCode(Integer companyId, Integer resaleId, String code) {
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
        if (code.isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Peça");
        response.setMessage("Encontrada com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterDesc(Integer companyId, Integer resaleId, String desc) {
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
        if (desc.isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Descrição");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Peça");
        response.setMessage("Encontrada com sucesso.");
        return response;
    }
}
