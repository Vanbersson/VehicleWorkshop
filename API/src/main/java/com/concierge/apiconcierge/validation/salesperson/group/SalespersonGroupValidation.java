package com.concierge.apiconcierge.validation.salesperson.group;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.salesperson.SalespersonGroup;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.stereotype.Service;

@Service
public class SalespersonGroupValidation implements ISalespersonGroupValidation{
    @Override
    public MessageResponse save(SalespersonGroup g) {
        MessageResponse response = new MessageResponse();
        if (g.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (g.getDescription().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Descriçao");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Grupo");
        response.setMessage("Cadastrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse update(SalespersonGroup g) {
        MessageResponse response = new MessageResponse();
        if (g.getCompanyId() == null || g.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (g.getResaleId() == null || g.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (g.getId() == null || g.getId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (g.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (g.getDescription().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Descriçao");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Grupo");
        response.setMessage("Atualizado com sucesso.");
        return response;
    }
}
