package com.concierge.apiconcierge.validation.clientcompany.region;

import com.concierge.apiconcierge.models.clientcompany.ClientCompanyRegion;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.stereotype.Service;

@Service
public class ClientCompanyRegionValidation implements IClientCompanyRegionValidation {
    @Override
    public MessageResponse save(ClientCompanyRegion r) {
        MessageResponse response = new MessageResponse();
        if (r.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (r.getDescription().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Descriçao");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (r.getUf().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("UF");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Região");
        response.setMessage("Cadastrada com sucesso.");
        return response;
    }

    @Override
    public MessageResponse update(ClientCompanyRegion r) {
        MessageResponse response = new MessageResponse();
        if (r.getCompanyId() == null || r.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (r.getResaleId() == null || r.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (r.getId() == null || r.getId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (r.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (r.getDescription().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Descriçao");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (r.getUf().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("UF");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Região");
        response.setMessage("Atualizada com sucesso.");
        return response;
    }
}
