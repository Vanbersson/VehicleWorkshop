package com.concierge.apiconcierge.services.purchase;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.purchase.PurchaseOrder;

import java.util.List;
import java.util.Map;

public interface IPurchaseOrderService {

    MessageResponse save(PurchaseOrder purchase);

    MessageResponse update(PurchaseOrder purchase);

    MessageResponse close(PurchaseOrder purchase);

    List<Map<String, Object>> filterOpen(Integer companyId, Integer resaleId);

    MessageResponse filterId(Integer companyId, Integer resaleId, Integer purchaseId);
}
