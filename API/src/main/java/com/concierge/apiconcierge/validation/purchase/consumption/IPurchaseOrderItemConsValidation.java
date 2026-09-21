package com.concierge.apiconcierge.validation.purchase.consumption;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.purchase.PurchaseOrderItemConsumption;

public interface IPurchaseOrderItemConsValidation {
    MessageResponse save(PurchaseOrderItemConsumption item);

    MessageResponse update(PurchaseOrderItemConsumption item);

    MessageResponse delete(PurchaseOrderItemConsumption item);

    MessageResponse filter(Integer companyId, Integer resaleId, Integer purchaseId);
}
