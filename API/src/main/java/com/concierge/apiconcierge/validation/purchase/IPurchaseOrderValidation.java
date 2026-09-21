package com.concierge.apiconcierge.validation.purchase;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.purchase.PurchaseOrder;


public interface IPurchaseOrderValidation {

    MessageResponse save(PurchaseOrder pu);

    MessageResponse update(PurchaseOrder pu);

    MessageResponse close(PurchaseOrder pu);

    MessageResponse filterOpen(Integer companyId, Integer resaleId);

    MessageResponse filterId(Integer companyId, Integer resaleId, Integer purchaseId);
}
