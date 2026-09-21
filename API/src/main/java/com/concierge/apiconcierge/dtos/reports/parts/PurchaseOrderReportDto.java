package com.concierge.apiconcierge.dtos.reports.parts;



import com.concierge.apiconcierge.models.purchase.statusEnum.PurchaseOrderStatus;

import java.util.Date;

public record PurchaseOrderReportDto(Integer companyId,
                                     Integer resaleId,
                                     Integer id,
                                     PurchaseOrderStatus status,
                                     Date dateInit,
                                     Date dateFinal,
                                     Integer responsibleId,
                                     Integer clientCompanyId,
                                     Integer nfNum) {
}
