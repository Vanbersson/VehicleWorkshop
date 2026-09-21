package com.concierge.apiconcierge.services.purchase.item;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.purchase.item.PurchaseOrderItem;

import java.util.List;

public interface IPurchaseOrderItemService {
    MessageResponse save(PurchaseOrderItem item);

    MessageResponse update(PurchaseOrderItem item);
    MessageResponse delete(PurchaseOrderItem item);

     List<PurchaseOrderItem> filterId(Integer companyId, Integer resaleId, Integer purchaseId);
}
