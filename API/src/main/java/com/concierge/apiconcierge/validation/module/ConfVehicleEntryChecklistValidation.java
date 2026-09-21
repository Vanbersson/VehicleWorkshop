package com.concierge.apiconcierge.validation.module;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.module.ConfVehicleEntryChecklist;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.stereotype.Service;

@Service
public class ConfVehicleEntryChecklistValidation implements IConfVehicleEntryChecklistValidation {
    @Override
    public MessageResponse update(ConfVehicleEntryChecklist mod) {
        MessageResponse response = new MessageResponse();
        if (mod.getCompanyId() == null || mod.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mod.getResaleId() == null || mod.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (mod.getId() == null || mod.getId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Módulo");
        response.setMessage("Atualizado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterCompanyResale(Integer companyId, Integer resaleId) {
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
        response.setHeader("Módulo");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }
}
