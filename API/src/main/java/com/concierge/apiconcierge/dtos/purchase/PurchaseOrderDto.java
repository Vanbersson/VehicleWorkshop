package com.concierge.apiconcierge.dtos.purchase;

import com.concierge.apiconcierge.models.purchase.statusEnum.PurchaseOrderStatus;
import com.concierge.apiconcierge.models.purchase.statusEnum.TypePurchaseOrder;

import java.util.Date;

public record PurchaseOrderDto(
        Integer companyId,
        Integer resaleId,
        Integer id,
        PurchaseOrderStatus status,
        TypePurchaseOrder type,
        Integer generationUserId,
        String generationUserName,
        Date generationDate,
        Integer responsibleUserId,
        String responsibleUserName,
        Integer paymentTypeId,
        String paymentTypeDesc,
        Date dateDelivery,
        Date dateReceived,
        String information,
        Integer clientCompanyId,
        String clientCompanyName,
        String attendantName,
        String attendantEmail,
        String attendantDddCellphone,
        String attendantCellphone,
        String attendantDddPhone,
        String attendantPhone,
        String paymentType,
        Integer nfNum,
        String nfSerie,
        Date nfDate,
        String nfKey

) {
}
