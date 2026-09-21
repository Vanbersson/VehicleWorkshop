package com.concierge.apiconcierge.validation.workshop.toolcontrol.material;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlMaterial;

public interface IToolControlMaterialValidation {
    MessageResponse save(ToolControlMaterial mat);

    MessageResponse update(ToolControlMaterial mat);

    MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);

    MessageResponse listAll(Integer companyId, Integer resaleId);

    MessageResponse listAllEnabled(Integer companyId, Integer resaleId);
}
