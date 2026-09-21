package com.concierge.apiconcierge.validation.workshop.toolcontrol.request;

import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlRequest;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.StatusRequest;

public interface IToolControlRequestValidation {

    String newRequest(ToolControlRequest req);

    String updateRequest(ToolControlRequest req);

    String loanReturn(ToolControlRequest req);

    String filterId(Integer companyId, Integer resaleId, Integer requestId);

    String filterMechanicId(Integer companyId, Integer resaleId, Integer mechanicId);

    String listAllStatus(Integer companyId, Integer resaleId, StatusRequest status);

}
