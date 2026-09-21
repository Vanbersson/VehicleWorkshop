package com.concierge.apiconcierge.validation.purchase.item;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.purchase.item.PurchaseOrderItem;

public interface IPurchaseOrderItemValidation {
    public MessageResponse save(PurchaseOrderItem item);

    public MessageResponse update(PurchaseOrderItem item);

    public MessageResponse delete(PurchaseOrderItem item);

    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer purchaseId);
}
