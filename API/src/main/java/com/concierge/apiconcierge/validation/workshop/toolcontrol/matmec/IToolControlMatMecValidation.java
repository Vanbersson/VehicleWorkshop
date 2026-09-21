package com.concierge.apiconcierge.validation.workshop.toolcontrol.matmec;

import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlMatMec;

import java.util.UUID;

public interface IToolControlMatMecValidation {
    String saveMaterial(ToolControlMatMec matMec);

    String returnMaterial(ToolControlMatMec matMec);

    String filterId(Integer companyId, Integer resaleId, UUID id);

    String filterRequestId(Integer companyId, Integer resaleId, Integer requestId);

}
