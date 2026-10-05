package com.concierge.apiconcierge.services.salesperson.group;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.salesperson.SalespersonGroup;

import java.util.List;

public interface ISalespersonGroupService {
    MessageResponse save(SalespersonGroup g,String emailUser);

    MessageResponse update(SalespersonGroup g);

    List<SalespersonGroup> listAll(String emailUser);

    List<SalespersonGroup> listAllEnabled(String emailUser);
}
