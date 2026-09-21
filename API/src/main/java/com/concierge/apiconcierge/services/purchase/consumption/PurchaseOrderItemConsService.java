package com.concierge.apiconcierge.services.purchase.consumption;

import com.concierge.apiconcierge.exceptions.purchase.PurchaseOrderException;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.purchase.PurchaseOrderItemConsumption;
import com.concierge.apiconcierge.models.purchase.item.PurchaseOrderItem;
import com.concierge.apiconcierge.repositories.purchase.IPurchaseOrderItemConsRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.purchase.consumption.IPurchaseOrderItemConsValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PurchaseOrderItemConsService implements IPurchaseOrderItemConsService {

    @Autowired
    private IPurchaseOrderItemConsRepository repository;

    @Autowired
    private IPurchaseOrderItemConsValidation validation;

    @SneakyThrows
    @Override
    public MessageResponse save(PurchaseOrderItemConsumption item) {
        try {
            MessageResponse response = this.validation.save(item);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                PurchaseOrderItemConsumption result = this.repository.save(item);
                response.setData(result);
            }
            return response;
        } catch (Exception ex) {
            throw new PurchaseOrderException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse update(PurchaseOrderItemConsumption item) {
        try {
            MessageResponse response = this.validation.update(item);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                PurchaseOrderItemConsumption result = this.repository.save(item);
                response.setData(result);
            }
            return response;
        } catch (Exception ex) {
            throw new PurchaseOrderException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse delete(PurchaseOrderItemConsumption item) {
        try {
            MessageResponse response = this.validation.delete(item);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                this.repository.deleteItem(
                        item.getCompanyId(),
                        item.getResaleId(),
                        item.getPurchaseId(),
                        item.getItemOrder(),
                        item.getId());
            }
            return response;
        } catch (Exception ex) {
            throw new PurchaseOrderException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<PurchaseOrderItemConsumption> filter(Integer companyId, Integer resaleId, Integer purchaseId) {
        try {
            MessageResponse response = this.validation.filter(companyId, resaleId, purchaseId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                return this.repository.filter(companyId, resaleId, purchaseId);
            }
            return List.of();
        } catch (Exception ex) {
            throw new PurchaseOrderException(ex.getMessage());
        }

    }
}
