package com.concierge.apiconcierge.dtos.workshop.toolcontrol;

import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.StatusRequest;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.TypeCategory;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.TypeRequest;

import java.util.Date;

public record ToolControlRequestDto(Integer companyId,
                                    Integer resaleId,
                                    Integer id,
                                    StatusRequest status,
                                    TypeRequest requestType,
                                    Date requestDate,
                                    String requestInformation,
                                    Integer requestUserId,
                                    String requestUserName,
                                    TypeCategory categoryType,
                                    Integer mechanicId) {
}
