package com.concierge.apiconcierge.services.purchase.item;

import com.concierge.apiconcierge.exceptions.purchase.PurchaseOrderException;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.purchase.item.PurchaseOrderItem;
import com.concierge.apiconcierge.repositories.purchase.IPurchaseOrderItemRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.purchase.item.IPurchaseOrderItemValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PurchaseOrderItemService implements IPurchaseOrderItemService {

    @Autowired
    IPurchaseOrderItemRepository repository;

    @Autowired
    IPurchaseOrderItemValidation validation;

    @SneakyThrows
    @Override
    public MessageResponse save(PurchaseOrderItem item) {
        try {
            MessageResponse response = this.validation.save(item);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                PurchaseOrderItem result = this.repository.save(item);
                response.setData(result);
            }
            return response;
        } catch (Exception ex) {
            throw new PurchaseOrderException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse update(PurchaseOrderItem item) {
        try {
            MessageResponse response = this.validation.update(item);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                PurchaseOrderItem result = this.repository.save(item);
                response.setData(result);
            }
            return response;
        } catch (Exception ex) {
            throw new PurchaseOrderException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse delete(PurchaseOrderItem item) {
        try {
            MessageResponse response = this.validation.delete(item);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                this.repository.deleteItem(
                        item.getId().getCompanyId(),
                        item.getId().getResaleId(),
                        item.getId().getPurchaseId(),
                        item.getItemOrder(),
                        item.getId().getItemId());
            }
            return response;
        } catch (Exception ex) {
            throw new PurchaseOrderException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<PurchaseOrderItem> filterId(Integer companyId, Integer resaleId, Integer purchaseId) {
        try {
            MessageResponse response = this.validation.filterId(companyId, resaleId, purchaseId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                return this.repository.filterPurchaseOrderId(companyId, resaleId, purchaseId);
            }
            return List.of();
        } catch (Exception ex) {
            throw new PurchaseOrderException(ex.getMessage());
        }
    }
}
