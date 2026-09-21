package com.concierge.apiconcierge.services.reports.parts;

import com.concierge.apiconcierge.dtos.reports.parts.PurchaseOrderReportDto;
import com.concierge.apiconcierge.exceptions.purchase.PurchaseOrderException;
import com.concierge.apiconcierge.models.purchase.PurchaseOrder;
import com.concierge.apiconcierge.repositories.reports.parts.PurchaseOrderReportRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PurchaseOrderReportService implements IPurchaseOrderReportService {

    @Autowired
    PurchaseOrderReportRepository repository;

    @SneakyThrows
    @Override
    public List<Map<String,Object>> filterPurchase(PurchaseOrderReportDto purchase) {
        try {
            if (purchase.companyId() == null || purchase.companyId() == 0)
                throw new PurchaseOrderException(ConstantsMessage.ERROR_COMPANY);
            if (purchase.resaleId() == null || purchase.resaleId() == 0)
                throw new PurchaseOrderException(ConstantsMessage.ERROR_RESALE);
            List<PurchaseOrder> result = this.repository.filterPurchase(purchase);
            List<Map<String,Object>> list = new ArrayList<>();
            for (PurchaseOrder item : result){
                Map<String,Object> map = new HashMap<>();
                map.put("id",item.getId());
                map.put("status",item.getStatus());
                map.put("dateDelivery",item.getDateDelivery());
                map.put("dateReceived",item.getDateReceived());
                map.put("nfNum",item.getNfNum());
                map.put("clientCompanyName",item.getClientCompanyName());
                map.put("responsibleUserName",item.getResponsibleUserName());
                map.put("type",item.getType());
                list.add(map);
            }
            return list;
        } catch (Exception ex) {
            throw new PurchaseOrderException(ex.getMessage());
        }
    }
}
