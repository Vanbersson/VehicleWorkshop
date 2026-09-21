package com.concierge.apiconcierge.services.purchase.consumption;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.purchase.PurchaseOrderItemConsumption;

import java.util.List;

public interface IPurchaseOrderItemConsService {
    MessageResponse save(PurchaseOrderItemConsumption item);

    MessageResponse update(PurchaseOrderItemConsumption item);

    MessageResponse delete(PurchaseOrderItemConsumption item);

    List<PurchaseOrderItemConsumption> filter(Integer companyId, Integer resaleId, Integer purchaseId);
}
