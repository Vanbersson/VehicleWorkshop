package com.concierge.apiconcierge.validation.purchase.item;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.purchase.item.PurchaseOrderItem;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PurchaseOrderItemValidation implements IPurchaseOrderItemValidation {
    @Override
    public MessageResponse save(PurchaseOrderItem item) {
        MessageResponse response = new MessageResponse();
        if (item.getId().getCompanyId() == null || item.getId().getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getId().getResaleId() == null || item.getId().getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getId().getPurchaseId() == null || item.getId().getPurchaseId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Pedido de Compra");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getItemOrder() == null || item.getItemOrder() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Ordem");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getId().getItemId() == null || item.getId().getItemId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Peça");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getItemCode().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código da Peça");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getItemDescription().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Descrição da Peça");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getQuantity() == null || item.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Quantidade");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getPrice() == null || item.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Valor");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getDiscount() == null || item.getDiscount().compareTo(BigDecimal.ZERO) < 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Disconto");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Item");
        response.setMessage("Cadastrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse update(PurchaseOrderItem item) {
        MessageResponse response = new MessageResponse();
        if (item.getId().getCompanyId() == null || item.getId().getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getId().getResaleId() == null || item.getId().getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getId().getPurchaseId() == null || item.getId().getPurchaseId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Pedido de Compra");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getItemOrder() == null || item.getItemOrder() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Ordem");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getId().getItemId() == null || item.getId().getItemId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Peça");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getItemCode().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código da Peça");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getItemDescription().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Descrição da Peça");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getQuantity() == null || item.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Quantidade");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getPrice() == null || item.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Valor");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (item.getDiscount() == null || item.getDiscount().compareTo(BigDecimal.ZERO) < 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Disconto");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Item");
        response.setMessage("Atualizado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse delete(PurchaseOrderItem item) {
        MessageResponse response = new MessageResponse();
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Item");
        response.setMessage("Excluído com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer purchaseId) {
        MessageResponse response = new MessageResponse();
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Item");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }
}
