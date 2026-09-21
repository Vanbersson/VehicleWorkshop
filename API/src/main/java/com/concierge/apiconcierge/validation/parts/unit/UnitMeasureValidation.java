package com.concierge.apiconcierge.validation.parts.unit;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.unit.UnitMeasure;
import com.concierge.apiconcierge.repositories.parts.unit.IUnitMeasureRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UnitMeasureValidation implements IUnitMeasureValidation {
    @Autowired
    private IUnitMeasureRepository repository;
    @Override
    public MessageResponse save(UnitMeasure un) {
        MessageResponse response = new MessageResponse();
        if (un.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (un.getUnitMeasure().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Sigla");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (un.getDescription().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Descrição");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Unidade de Medida");
        response.setMessage("Cadastrada com sucesso.");
        return response;
    }

    @Override
    public MessageResponse update(UnitMeasure un) {
        MessageResponse response = new MessageResponse();
        if (un.getId() == null || un.getId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (un.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (un.getUnitMeasure().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Sigla");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (un.getDescription().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Descrição");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if(un.getStatus() == StatusEnableDisable.Desabilitado){
            Integer total = this.repository.filterIsUsed(un.getId());
            if(total > 0){
                response.setStatus(ConstantsMessage.ERROR);
                response.setHeader("Unidade de Medida");
                response.setMessage("Não pode ser desabilitado.");
                return response;
            }
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Unidade de Medida");
        response.setMessage("Atualizada com sucesso.");
        return response;
    }
}
