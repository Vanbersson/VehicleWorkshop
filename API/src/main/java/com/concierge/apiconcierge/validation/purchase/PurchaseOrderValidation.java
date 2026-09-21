package com.concierge.apiconcierge.validation.purchase;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.purchase.PurchaseOrder;
import com.concierge.apiconcierge.models.purchase.statusEnum.PurchaseOrderStatus;
import com.concierge.apiconcierge.repositories.purchase.IPurchaseOrderRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.purchase.IPurchaseOrderValidation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PurchaseOrderValidation implements IPurchaseOrderValidation {
    @Autowired
    private IPurchaseOrderRepository repository;

    @Override
    public MessageResponse save(PurchaseOrder pu) {
        MessageResponse response = new MessageResponse();
        if (pu.getCompanyId() == null || pu.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getResaleId() == null || pu.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getStatus() == PurchaseOrderStatus.FECHADO) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage("Status errado.");
            return response;
        }
        if (pu.getType() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Tipo");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getDateDelivery() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Data Entrega");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Pedido de Compra");
        response.setMessage("Cadastrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse update(PurchaseOrder pu) {
        MessageResponse response = new MessageResponse();
        if (pu.getCompanyId() == null || pu.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getResaleId() == null || pu.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getId() == null || pu.getId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getStatus() == PurchaseOrderStatus.FECHADO) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage("Status errado.");
            return response;
        }
        if (pu.getType() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Tipo");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getDateDelivery() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Data Entrega");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getClientCompanyId() == null || pu.getClientCompanyId() == 0 || pu.getClientCompanyName().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Fornecedor");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }

        PurchaseOrder result = this.repository.filterId(pu.getCompanyId(), pu.getResaleId(), pu.getId());
        if (result.getStatus() == PurchaseOrderStatus.FECHADO) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Pedido de compa");
            response.setMessage("Já encerrado!");
            return response;
        }

        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Pedido de Compra");
        response.setMessage("Atualizado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse close(PurchaseOrder pu){
        MessageResponse response = new MessageResponse();
        if (pu.getCompanyId() == null || pu.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getResaleId() == null || pu.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getId() == null || pu.getId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getStatus() == PurchaseOrderStatus.ABERTO) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage("Status Errado.");
            return response;
        }
        if (pu.getType() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Tipo");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getDateDelivery() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Data Entrega");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getDateReceived() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Data Recebimento");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (pu.getClientCompanyId() == null || pu.getClientCompanyId() == 0 || pu.getClientCompanyName().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Fornecedor");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        PurchaseOrder result = this.repository.filterId(pu.getCompanyId(), pu.getResaleId(), pu.getId());
        if (result.getStatus() == PurchaseOrderStatus.FECHADO) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Pedido de compa");
            response.setMessage("Já encerrado!");
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Pedido de Compra");
        response.setMessage("Encerrado com sucesso.");
        return response;
    }
    @Override
    public MessageResponse filterOpen(Integer companyId, Integer resaleId) {
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
        response.setHeader("Pedido de Compra");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }

    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer purchaseId) {
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
            response.setHeader("Pedido de Compra");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Pedido de Compra");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }
}
