package com.concierge.apiconcierge.services.workshop.department;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.workshop.mechanic.MechanicDepartment;

import java.util.List;

public interface IMechanicDepartmentService {
    MessageResponse save(MechanicDepartment data);

    MessageResponse update(MechanicDepartment data);

    List<MechanicDepartment> listAll(Integer companyId, Integer resaleId);

    List<MechanicDepartment> listAllEnabled(Integer companyId, Integer resaleId);


}
