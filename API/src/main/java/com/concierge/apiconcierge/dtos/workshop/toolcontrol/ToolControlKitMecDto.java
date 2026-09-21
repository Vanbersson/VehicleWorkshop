package com.concierge.apiconcierge.dtos.workshop.toolcontrol;

import java.util.Date;
import java.util.UUID;

public record ToolControlKitMecDto(Integer companyId,
                                   Integer resaleId,
                                   UUID id,
                                   Integer requestId,
                                   float quantityReq,
                                   float quantityRet,
                                   Integer userIdRet,
                                   Date dateRet,
                                   String informationRet,
                                   Integer materialId) {
}
