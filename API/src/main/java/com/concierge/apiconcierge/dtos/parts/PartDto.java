package com.concierge.apiconcierge.dtos.parts;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.part.enums.AdditionDiscount;

import java.math.BigDecimal;
import java.util.Date;

public record PartDto(Integer companyId,
                      Integer resaleId,
                      Integer id,
                      StatusEnableDisable status,
                      Date dateRegister,
                      String code,
                      String description,
                      Integer unitMeasureId,
                      BigDecimal priceNow,
                      BigDecimal priceOld,
                      BigDecimal priceWarranty,
                      AdditionDiscount additionDiscount,
                      Integer brandId,
                      Integer groupId,
                      Integer categoryId,
                      String locationPriArea,
                      String locationPriStreet,
                      String locationPriBookcase,
                      String locationPriShelf,
                      String locationPriPosition,
                      String locationSecArea,
                      String locationSecStreet,
                      String locationSecBookcase,
                      String locationSecShelf,
                      String locationSecPosition,
                      String photoUrlFront,
                      String photoUrlVerse) {
}
