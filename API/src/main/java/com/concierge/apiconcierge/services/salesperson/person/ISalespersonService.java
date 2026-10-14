package com.concierge.apiconcierge.services.salesperson.person;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.salesperson.Salesperson;

import java.util.List;

public interface ISalespersonService {
    MessageResponse save(Salesperson person, String emailUser);

    MessageResponse update(Salesperson person);

    Salesperson filterId(Integer id, String emailUser);

    List<Salesperson> all(String emailUser);

    List<Salesperson> allEnabled(String emailUser);
}
