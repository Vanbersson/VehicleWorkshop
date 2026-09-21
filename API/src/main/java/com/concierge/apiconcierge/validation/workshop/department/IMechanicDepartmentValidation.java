package com.concierge.apiconcierge.validation.workshop.department;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.workshop.mechanic.MechanicDepartment;

public interface IMechanicDepartmentValidation {
    MessageResponse save(MechanicDepartment data);

    MessageResponse update(MechanicDepartment data);

    MessageResponse listAll(Integer companyId, Integer resaleId);
}
