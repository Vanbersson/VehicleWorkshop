package com.concierge.apiconcierge.services.workshop.matmec;

import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlMatMec;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface IToolControlMatMecService {
    String saveMaterial(ToolControlMatMec matMec);

    String returnMaterial(ToolControlMatMec matMec);

    ToolControlMatMec  filterId(Integer companyId, Integer resaleId, UUID id);

    List<ToolControlMatMec> filterRequestId(Integer companyId, Integer resaleId, Integer requestId);

}
