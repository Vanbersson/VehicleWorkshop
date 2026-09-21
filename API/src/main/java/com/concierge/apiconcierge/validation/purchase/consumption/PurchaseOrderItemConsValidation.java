package com.concierge.apiconcierge.validation.purchase.consumption;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.purchase.PurchaseOrderItemConsumption;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.stereotype.Service;

@Service
public class PurchaseOrderItemConsValidation implements IPurchaseOrderItemConsValidation {
    @Override
    public MessageResponse save(PurchaseOrderItemConsumption item) {
        MessageResponse response = new MessageResponse();
        if (item.getCompanyId() == null || item.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getResaleId() == null || item.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getPurchaseId() == null || item.getPurchaseId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Número do pedido");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getItemOrder() == null || item.getItemOrder() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Item Order");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Item");
        response.setMessage("Cadastrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse update(PurchaseOrderItemConsumption item) {
        MessageResponse response = new MessageResponse();
        if (item.getCompanyId() == null || item.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getResaleId() == null || item.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getPurchaseId() == null || item.getPurchaseId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Número do pedido");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getItemOrder() == null || item.getItemOrder() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Item Order");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getId() == null ) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Item");
        response.setMessage("Atualizado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse delete(PurchaseOrderItemConsumption item) {
        MessageResponse response = new MessageResponse();
        if (item.getCompanyId() == null || item.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getResaleId() == null || item.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getPurchaseId() == null || item.getPurchaseId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Número do pedido");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getItemOrder() == null || item.getItemOrder() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Item Order");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getId() == null ) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Item");
        response.setMessage("Excluído com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filter(Integer companyId, Integer resaleId, Integer purchaseId) {
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
        if (purchaseId == null || purchaseId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Número do pedido");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Item");
        response.setMessage("Cadastrado com sucesso.");
        return response;
    }
}
