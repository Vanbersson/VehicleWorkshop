package com.concierge.apiconcierge.services.salesperson.person;

import com.concierge.apiconcierge.dtos.salesperson.ResponseSalespersonDto;
import com.concierge.apiconcierge.dtos.salesperson.SalespersonTypeDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.salesperson.Salesperson;

import java.util.List;

public interface ISalespersonService {
    MessageResponse save(Salesperson person, String emailUser);

    MessageResponse update(Salesperson person);

    Salesperson filterId(Integer id, String emailUser);

    List<ResponseSalespersonDto> all(String emailUser);

    List<Salesperson> filterType(SalespersonTypeDto type, String emailUser);
}
