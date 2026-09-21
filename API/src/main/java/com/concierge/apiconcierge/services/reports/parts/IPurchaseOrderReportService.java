package com.concierge.apiconcierge.services.reports.parts;

import com.concierge.apiconcierge.dtos.reports.parts.PurchaseOrderReportDto;

import java.util.List;
import java.util.Map;

public interface IPurchaseOrderReportService {
    public List<Map<String,Object>> filterPurchase(PurchaseOrderReportDto purchase);
}
