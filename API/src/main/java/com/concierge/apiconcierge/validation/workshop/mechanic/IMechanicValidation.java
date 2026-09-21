package com.concierge.apiconcierge.validation.workshop.mechanic;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.workshop.mechanic.Mechanic;

import java.util.List;
import java.util.Map;

public interface IMechanicValidation {
    MessageResponse save(Mechanic mec);

    MessageResponse update(Mechanic mec);

    MessageResponse listAll(Integer companyId, Integer resaleId);

    MessageResponse filterCodePass(Mechanic mec);

    MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);
}
