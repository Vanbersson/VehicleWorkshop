package com.concierge.apiconcierge.validation.salesperson.person;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.salesperson.Salesperson;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.stereotype.Service;

@Service
public class SalespersonValidation implements ISalespersonValidation {
    @Override
    public MessageResponse save(Salesperson p) {
        MessageResponse response = new MessageResponse();
        if (p.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (p.getTypeSales() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Vendedor");
            response.setMessage("Interno ou Externo " + ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (p.getName().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Nome");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (p.getCpf().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("CPF");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Vendedor");
        response.setMessage("Cadastrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse update(Salesperson p) {
        return null;
    }
}
