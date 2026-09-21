package com.concierge.apiconcierge.services.workshop.toolcontrol.request;

import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlRequest;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.StatusRequest;

import java.util.List;
import java.util.Map;

public interface IToolControlRequestService {

    ToolControlRequest newRequest(ToolControlRequest req);

    ToolControlRequest updateRequest(ToolControlRequest req);

    Map<String, Object> loanReturn(ToolControlRequest req);

    ToolControlRequest filterId(Integer companyId, Integer resaleId, Integer requestId);

    List<ToolControlRequest> filterMechanicId(Integer companyId, Integer resaleId, Integer mechanicId);

    List<ToolControlRequest> listAllStatus(Integer companyId, Integer resaleId, StatusRequest status);


}
